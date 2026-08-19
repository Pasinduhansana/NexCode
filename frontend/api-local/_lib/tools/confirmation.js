import crypto from "node:crypto";
import { getCollection } from "../mongodb.js";

const COLLECTION = "aiconfirmations";
const TTL_MS = 5 * 60 * 1000;

let indexesEnsured = false;

async function collection() {
  const col = await getCollection(COLLECTION);
  if (!indexesEnsured) {
    indexesEnsured = true;
    col
      .createIndex({ user: 1, tool: 1, fingerprint: 1 }, { unique: true })
      .catch(() => {});
    col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }).catch(() => {});
  }
  return col;
}

function log(level, payload) {
  const line = `[ai-tool:${level}] ${JSON.stringify(payload)}`;
  if (level === "error") console.error(line);
  else console.log(line);
}

function userId(user) {
  return String(user?.uid || user?.id || user?.name || "unknown");
}

export async function getConfirmation({ user, tool, fingerprint }) {
  const col = await collection();
  const entry = await col.findOne({ user: userId(user), tool, fingerprint: String(fingerprint) });
  if (!entry) return null;
  if (entry.expiresAt < new Date()) {
    await col.deleteOne({ _id: entry._id });
    return null;
  }
  return entry;
}

export async function createConfirmation({ user, tool, fingerprint, requestId, targetLabel }) {
  const col = await collection();
  const key = { user: userId(user), tool, fingerprint: String(fingerprint) };
  const expiresAt = new Date(Date.now() + TTL_MS);
  const now = new Date();

  const doc = await col.findOneAndUpdate(
    key,
    {
      $set: { expiresAt, targetLabel: String(targetLabel || tool) },
      $setOnInsert: { requestId: requestId || null, createdAt: now },
    },
    { upsert: true, returnDocument: "after" }
  );

  log("confirm", { event: "confirmation_requested", tool, user: key.user });
  return String(doc._id || crypto.randomUUID());
}

export async function resolveConfirmation({ user, tool, fingerprint, requestId }) {
  const col = await collection();
  const key = { user: userId(user), tool, fingerprint: String(fingerprint) };
  const entry = await col.findOne(key);

  if (!entry) return { ok: false, reason: "expired" };
  if (entry.expiresAt < new Date()) {
    await col.deleteOne({ _id: entry._id });
    log("confirm", { event: "confirmation_expired", tool, user: key.user });
    return { ok: false, reason: "expired" };
  }
  if (requestId && entry.requestId === requestId) return { ok: false, reason: "same_turn" };

  await col.deleteOne({ _id: entry._id });
  log("confirm", { event: "confirmation_accepted", tool, user: key.user });
  return { ok: true };
}

export async function cancelConfirmation({ user, tool, fingerprint }) {
  const col = await collection();
  const key = { user: userId(user), tool, fingerprint: String(fingerprint) };
  const entry = await col.findOne(key);

  if (!entry) return { ok: false };
  if (entry.expiresAt < new Date()) {
    await col.deleteOne({ _id: entry._id });
    log("confirm", { event: "confirmation_expired", tool, user: key.user });
    return { ok: false };
  }

  await col.deleteOne({ _id: entry._id });
  log("confirm", { event: "confirmation_rejected", tool, user: key.user });
  return { ok: true };
}

export const CONFIRMATION_TTL_MS = TTL_MS;
