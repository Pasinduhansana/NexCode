import { MongoClient } from "mongodb";
import { perfEnabled, startTimer, endTimer, logPerf, roundMs, safeCommandTarget } from "./perf.js";

const uri = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || "nexcode";

// After a serverless function freezes, pooled sockets silently die. The driver
// re-detects them, but an operation can then block for serverSelectionTimeoutMS.
// We bound that wait (configurable) and proactively re-ping after an idle gap.
const SERVER_SELECTION_TIMEOUT_MS = Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 4000;
const IDLE_RECONNECT_MS = Number(process.env.MONGO_IDLE_RECONNECT_MS) || 45000;
const PING_TIMEOUT_MS = Number(process.env.MONGO_PING_TIMEOUT_MS) || 1000;

if (!uri) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

let cached = globalThis.__mongo;

if (!cached) {
  cached = globalThis.__mongo = { conn: null, promise: null, indexesEnsured: false, lastActivityAt: Date.now() };
}

// Bounded liveness probe. Returns true only if the server answered within the
// timeout. Never throws; a slow/failed probe simply reports the connection as
// stale so the next request re-establishes it instead of stalling.
async function isConnectionAlive(client) {
  if (!client || typeof client.db !== "function") return false;
  const probe = async () => {
    try {
      await client.db(DB_NAME).command({ ping: 1 });
      return true;
    } catch {
      return false;
    }
  };
  const timeout = new Promise((resolve) => setTimeout(() => resolve(false), PING_TIMEOUT_MS));
  return Promise.race([probe(), timeout]);
}

async function attachCommandMonitor(client) {
  if (!perfEnabled()) return;
  try {
    const inFlight = new Map();
    client.on("commandStarted", (event) => {
      inFlight.set(event.requestId, startTimer());
    });
    const finish = (event) => {
      const start = inFlight.get(event.requestId);
      inFlight.delete(event.requestId);
      if (!start) return;
      logPerf(`[DB] collection=${safeCommandTarget(event)} op=${event.commandName} duration=${roundMs(endTimer(start))}`);
    };
    client.on("commandSucceeded", finish);
    client.on("commandFailed", finish);
  } catch {
    // Monitoring must never break the connection.
  }
}

function tearDown() {
  cached.promise = null;
  const conn = cached.conn;
  cached.conn = null;
  if (conn && typeof conn.close === "function") {
    conn.close().catch(() => {});
  }
}

export default async function connectDB() {
  const freshConnection = !cached.conn;
  const connectStart = startTimer();
  logPerf("DB_CONNECT_START");

  if (cached.conn) {
    // If the cached client has been idle long enough that a serverless freeze
    // could have killed its sockets, probe it. A failed probe tears the stale
    // client down so the pool is rebuilt rather than letting the next operation
    // hang for serverSelectionTimeoutMS.
    const idleMs = Date.now() - (cached.lastActivityAt || 0);
    if (idleMs > IDLE_RECONNECT_MS && !(await isConnectionAlive(cached.conn))) {
      logPerf(`DB_RECONNECT stale-after-idle=${roundMs(idleMs)}`);
      tearDown();
    }
  }

  if (!cached.promise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 30000,
      maxIdleTimeMS: 30000,
      waitQueueTimeoutMS: 5000,
    });
    attachCommandMonitor(client);
    cached.promise = client
      .connect()
      .then((connected) => {
        cached.conn = connected;
        // Fire-and-forget: don't block the first request of a cold start on
        // index creation round-trips (indexes almost always already exist).
        ensureIndexes(connected).catch(() => {});
        return connected;
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    logPerf(`DB_CONNECT_FAILED ${roundMs(endTimer(connectStart))}`);
    throw err;
  }

  cached.lastActivityAt = Date.now();
  logPerf(`DB_CONNECT_END ${freshConnection ? "fresh" : "reused"} ${roundMs(endTimer(connectStart))}`);

  return cached.conn;
}

async function ensureIndexes(client) {
  if (cached.indexesEnsured) return;
  const db = client.db(DB_NAME);
  await Promise.all([
    db.collection("projects").createIndex({ updatedAt: -1 }).catch(() => {}),
    db.collection("projects").createIndex({ status: 1 }).catch(() => {}),
    db.collection("tasks").createIndex({ projectId: 1, order: 1 }).catch(() => {}),
    db.collection("tasks").createIndex({ status: 1 }).catch(() => {}),
    db.collection("tasks").createIndex({ status: 1, dueDate: 1 }).catch(() => {}),
    db.collection("activities").createIndex({ timestamp: -1 }).catch(() => {}),
    db.collection("activities").createIndex({ userId: 1 }).catch(() => {}),
    // listActivities filters by userId and sorts by timestamp desc — a compound
    // index serves both instead of a scan + in-memory sort.
    db.collection("activities").createIndex({ userId: 1, timestamp: -1 }).catch(() => {}),
    db.collection("transactions").createIndex({ date: -1 }).catch(() => {}),
    db.collection("transactions").createIndex({ type: 1 }).catch(() => {}),
    // listTransactions filters by projectId and sorts by date desc.
    db.collection("transactions").createIndex({ projectId: 1, date: -1 }).catch(() => {}),
    db.collection("aiconversations").createIndex({ userId: 1 }).catch(() => {}),
    db.collection("aiconversations").createIndex({ userId: 1, updatedAt: -1 }).catch(() => {}),
    db.collection("plannedexpenses").createIndex({ projectId: 1 }).catch(() => {}),
    db.collection("designreferences").createIndex({ projectId: 1, sectionId: 1 }).catch(() => {}),
    db.collection("designreferences").createIndex({ projectId: 1, order: 1 }).catch(() => {}),
    db.collection("designsections").createIndex({ projectId: 1, order: 1 }).catch(() => {}),
    db.collection("designnotes").createIndex({ projectId: 1, parentType: 1, parentId: 1 }).catch(() => {}),
    db.collection("reports").createIndex({ userId: 1, updatedAt: -1 }).catch(() => {}),
    db.collection("reports").createIndex({ userId: 1, documentType: 1 }).catch(() => {}),
    db.collection("reports").createIndex({ userId: 1, projectId: 1 }).catch(() => {}),
    db.collection("reports").createIndex({ docNumber: 1 }, { unique: true }).catch(() => {}),
    // Calendar events: per-user timeline, type, and status queries, plus source
    // lookups so a derived event always maps back to its project/task/expense.
    db.collection("calendarevents").createIndex({ userId: 1, startAt: 1 }).catch(() => {}),
    db.collection("calendarevents").createIndex({ userId: 1, eventType: 1 }).catch(() => {}),
    db.collection("calendarevents").createIndex({ userId: 1, status: 1 }).catch(() => {}),
    db.collection("calendarevents").createIndex({ sourceType: 1, sourceId: 1 }).catch(() => {}),
    // Reminder scheduling: idempotent fingerprint + due-time scans.
    db.collection("calendarreminders").createIndex({ userId: 1, fingerprint: 1 }, { unique: true }).catch(() => {}),
    db.collection("calendarreminders").createIndex({ status: 1, triggerAt: 1 }).catch(() => {}),
    // Derived-event source scans.
    db.collection("projects").createIndex({ handoverDate: 1 }).catch(() => {}),
    db.collection("tasks").createIndex({ dueDate: 1 }).catch(() => {}),
    db.collection("transactions").createIndex({ showOnCalendar: 1 }).catch(() => {}),
    db.collection("transactions").createIndex({ category: 1 }).catch(() => {}),
  ]);
  cached.indexesEnsured = true;
}

export async function getCollection(name) {
  const client = await connectDB();
  return client.db(DB_NAME).collection(name);
}

export async function pingDB() {
  const client = await connectDB();
  await client.db(DB_NAME).command({ ping: 1 });
}

export function unwrap(result) {
  if (!result) return null;
  return result.value !== undefined ? result.value : result;
}
