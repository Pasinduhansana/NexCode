import { getCollection } from "./mongodb.js";

const COLLECTION = "airatelimit";
const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * 60_000;
const DEFAULT_MINUTE_MAX = 30;
const DEFAULT_DAY_MAX = 500;

let indexesEnsured = false;

function intEnv(name, fallback) {
  const value = parseInt(process.env[name] || "", 10);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

async function rateLimitCollection() {
  const col = await getCollection(COLLECTION);
  if (!indexesEnsured) {
    indexesEnsured = true;
    col
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
      .catch(() => {});
    col
      .createIndex({ userId: 1, bucket: 1, windowStart: 1 })
      .catch(() => {});
  }
  return col;
}

// Fixed-window limiter backed by MongoDB so the count survives serverless
// cold starts and process restarts. Fails OPEN: if the DB is unreachable the
// request is allowed through, so rate limiting can never break the assistant.
async function checkWindow({ key, bucket, windowMs, max, now }) {
  if (!max || max <= 0) return { allowed: true, remaining: Infinity, resetAt: null };

  const windowStart = Math.floor(now / windowMs) * windowMs;
  const _id = `${bucket}:${key}:${windowStart}`;
  const expiresAt = new Date(windowStart + windowMs + 60_000);

  try {
    const col = await rateLimitCollection();
    const doc = await col.findOneAndUpdate(
      { _id },
      {
        $inc: { count: 1 },
        $setOnInsert: {
          userId: key,
          bucket,
          windowStart,
          createdAt: new Date(now),
          expiresAt,
        },
      },
      { upsert: true, returnDocument: "after" }
    );
    const used = doc?.count ?? 1;
    return {
      allowed: used <= max,
      remaining: Math.max(0, max - used),
      resetAt: new Date(windowStart + windowMs).toISOString(),
    };
  } catch {
    return { allowed: true, remaining: Infinity, resetAt: null };
  }
}

export async function checkAiRateLimit({ userId }) {
  const minuteMax = intEnv("AI_RATE_LIMIT_MINUTE_MAX", DEFAULT_MINUTE_MAX);
  const dayMax = intEnv("AI_RATE_LIMIT_DAY_MAX", DEFAULT_DAY_MAX);
  const now = Date.now();
  const key = String(userId || "anon");

  const minute = await checkWindow({ key, bucket: "minute", windowMs: MINUTE_MS, max: minuteMax, now });
  if (!minute.allowed) return minute;

  return checkWindow({ key, bucket: "day", windowMs: DAY_MS, max: dayMax, now });
}
