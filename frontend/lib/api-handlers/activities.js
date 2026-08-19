import { requireAuth } from "./_lib/auth.js";
import { cached } from "./_lib/cache.js";
import { listActivities } from "./_lib/activity.js";

export default requireAuth(async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { limit, user, action, targetType } = req.query;

  const size = Math.min(Number(limit) || 100, 500);
  const key = `activities:${user || "all"}:${action || "all"}:${targetType || "all"}:${size}`;
  const activities = await cached(key, 10_000, () =>
    listActivities({ limit: size, user, action, targetType })
  );

  return res.status(200).json(activities);
});
