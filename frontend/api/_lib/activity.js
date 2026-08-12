import { getCollection } from "./mongodb.js";
import { invalidate } from "./cache.js";

export async function logActivity(user, entry) {
  if (!user || !entry) return null;
  const collection = await getCollection("activities");
  const { insertedId } = await collection.insertOne({
    userId: user.uid || user.id || null,
    userName: user.name || "Unknown",
    action: entry.action,
    targetType: entry.targetType || null,
    target: entry.target || null,
    details: entry.details || {},
    timestamp: new Date(),
  });
  invalidate("activities");
  return insertedId;
}
