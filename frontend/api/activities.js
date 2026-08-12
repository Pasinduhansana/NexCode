import { requireAuth } from "./_lib/auth.js";
import { getCollection } from "./_lib/mongodb.js";
import { cached } from "./_lib/cache.js";

export default requireAuth(async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { limit, user, action } = req.query;

  const filter = {};
  if (user) filter.userId = String(user);
  if (action) filter.action = String(action);
  const size = Math.min(Number(limit) || 100, 500);

  const key = `activities:${user || "all"}:${action || "all"}:${size}`;
  const activities = await cached(key, 10_000, async () => {
    const collection = await getCollection("activities");
    return collection.find(filter).sort({ timestamp: -1 }).limit(size).toArray();
  });

  return res.status(200).json(activities);
});
