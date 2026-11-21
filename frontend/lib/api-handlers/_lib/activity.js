import { getCollection } from "./mongodb.js";
import { invalidate } from "./cache.js";

export async function listActivities({ limit = 100, user, action, targetType } = {}) {
  const filter = {};
  if (user) filter.userId = String(user);
  if (action) filter.action = String(action);
  if (targetType) filter.targetType = String(targetType);
  const size = Math.min(Number(limit) || 100, 500);

  try {
    const collection = await getCollection("activities");
    return await collection.find(filter).sort({ timestamp: -1 }).limit(size).toArray();
  } catch (err) {
    return [];
  }
}

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
