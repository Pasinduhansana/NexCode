import { getTool } from "./registry.js";
import { validateArgs } from "./validate.js";

const MAX_LOGGED_ARGS_LENGTH = 400;

function summarizeArgs(args) {
  const json = JSON.stringify(args ?? {});
  return json.length > MAX_LOGGED_ARGS_LENGTH ? `${json.slice(0, MAX_LOGGED_ARGS_LENGTH)}…` : json;
}

function log(level, payload) {
  const line = `[ai-tool:${level}] ${JSON.stringify(payload)}`;
  if (level === "error") console.error(line);
  else console.log(line);
}

export async function executeToolCall({ name, args, user }) {
  const tool = getTool(name);
  if (!tool) {
    const error = `Unknown tool: ${name}`;
    log("error", { name, ok: false, error });
    return { ok: false, status: "error", error };
  }

  const check = validateArgs(tool.parameters, args);
  if (!check.ok) {
    const error = `Invalid arguments for ${name}: ${check.errors.join("; ")}`;
    log("error", { name, ok: false, errors: check.errors });
    return { ok: false, status: "error", error };
  }

  try {
    const result = await tool.handler(args ?? {}, { user });
    log("info", { name, ok: true, args: summarizeArgs(args) });
    return { ok: true, status: "completed", tool: name, result };
  } catch (err) {
    const error = `Tool ${name} failed: ${err instanceof Error ? err.message : String(err)}`;
    log("error", { name, ok: false, error });
    return { ok: false, status: "error", error };
  }
}
