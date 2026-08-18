import { requireAuth } from "./_lib/auth.js";
import { cached } from "./_lib/cache.js";
import { buildDashboardStats } from "./_lib/stats.js";

export default requireAuth(async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 60s TTL: stats are invalidated on every write, so a longer TTL only affects
  // cross-client freshness, never post-edit freshness.
  const data = await cached("stats:all", 60_000, buildDashboardStats);

  return res.status(200).json(data);
});
