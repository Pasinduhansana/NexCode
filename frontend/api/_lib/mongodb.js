import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || "nexcode";

if (!uri) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

let cached = globalThis.__mongo;

if (!cached) {
  cached = globalThis.__mongo = { conn: null, promise: null, indexesEnsured: false };
}

export default async function connectDB() {
  if (cached.conn) {
    // Cheap reconnect check — if the connection silently dropped (serverless
    // freeze/sleep), re-establish instead of failing the request.
    try {
      if (cached.conn && typeof cached.conn.db === "function") {
        return cached.conn;
      }
    } catch {
      cached.conn = null;
    }
  }

  if (!cached.promise) {
    cached.promise = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 30000,
      maxIdleTimeMS: 30000,
      waitQueueTimeoutMS: 5000,
    })
      .connect()
      .then((client) => {
        cached.conn = client;
        // Fire-and-forget: don't block the first request of a cold start on
        // index creation round-trips (indexes almost always already exist).
        ensureIndexes(client).catch(() => {});
        return client;
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
    throw err;
  }

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
    db.collection("transactions").createIndex({ date: -1 }).catch(() => {}),
    db.collection("transactions").createIndex({ type: 1 }).catch(() => {}),
    db.collection("aiconversations").createIndex({ userId: 1 }).catch(() => {}),
    db.collection("aiconversations").createIndex({ userId: 1, updatedAt: -1 }).catch(() => {}),
  ]);
  cached.indexesEnsured = true;
}

export async function pingDB() {
  const client = await connectDB();
  await client.db(DB_NAME).command({ ping: 1 });
}

export async function getCollection(name) {
  const client = await connectDB();
  return client.db(DB_NAME).collection(name);
}

export function unwrap(result) {
  if (!result) return null;
  return result.value !== undefined ? result.value : result;
}
