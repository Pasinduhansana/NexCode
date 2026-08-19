import { getTool } from "./registry.js";
import { validateArgs } from "./validate.js";
import { getCollection } from "../mongodb.js";

const MAX_LOGGED_ARGS_LENGTH = 400;
const DEDUPE_WINDOW_MS = 60_000;
const DEDUPE_COLLECTION = "aidedupe";

let dedupeIndexesEnsured = false;

async function dedupeCollection() {
  const col = await getCollection(DEDUPE_COLLECTION);
  if (!dedupeIndexesEnsured) {
    dedupeIndexesEnsured = true;
    col
      .createIndex({ user: 1, tool: 1, argsKey: 1 }, { unique: true })
      .catch(() => {});
    col.createIndex({ createdAt: 1 }, { expireAfterSeconds: 120 }).catch(() => {});
  }
  return col;
}

function summarizeArgs(args) {
  const json = JSON.stringify(args ?? {});
  return json.length > MAX_LOGGED_ARGS_LENGTH ? `${json.slice(0, MAX_LOGGED_ARGS_LENGTH)}…` : json;
}

function log(level, payload) {
  const line = `[ai-tool:${level}] ${JSON.stringify(payload)}`;
  if (level === "error") console.error(line);
  else console.log(line);
}

function userId(user) {
  return String(user?.uid || user?.id || user?.name || "anon");
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

async function checkDuplicate(tool, args, user) {
  if (!tool.dedupe) return false;
  const col = await dedupeCollection();
  const key = { user: userId(user), tool: tool.name, argsKey: stableStringify(args || {}) };
  const hit = await col.findOne(key);
  return !!hit && Date.now() - new Date(hit.createdAt).getTime() < DEDUPE_WINDOW_MS;
}

async function recordDuplicate(tool, args, user) {
  if (!tool.dedupe) return;
  const col = await dedupeCollection();
  await col
    .updateOne(
      { user: userId(user), tool: tool.name, argsKey: stableStringify(args || {}) },
      { $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    )
    .catch(() => {});
}

export async function executeToolCall({ name, args, user, requestId }) {
  const tool = getTool(name);
  if (!tool) {
    const error = `Unknown tool: ${name}`;
    log("error", { name, ok: false, error, user: userId(user) });
    return { ok: false, status: "error", error };
  }

  const check = validateArgs(tool.parameters, args);
  if (!check.ok) {
    const error = `Invalid arguments for ${name}: ${check.errors.join("; ")}`;
    log("error", { name, ok: false, errors: check.errors, user: userId(user) });
    return { ok: false, status: "error", error };
  }

  try {
    if (await checkDuplicate(tool, args, user)) {
      log("info", { name, ok: true, duplicate: true, user: userId(user) });
      return {
        ok: true,
        status: "duplicate",
        tool: name,
        result: {
          success: true,
          status: "duplicate",
          message:
            "This looks like a duplicate submission, so the action was not performed again. Nothing was changed.",
        },
      };
    }

    const result = await tool.handler(args ?? {}, { user, requestId });
    await recordDuplicate(tool, args, user);
    log("info", { name, ok: true, args: summarizeArgs(args), user: userId(user) });
    return { ok: true, status: "completed", tool: name, result };
  } catch (err) {
    const message =
      err && err.expose === true ? err.message : "The action could not be completed. Please try again.";
    log("error", { name, ok: false, error: message, user: userId(user) });
    return { ok: false, status: "error", error: message };
  }
}
