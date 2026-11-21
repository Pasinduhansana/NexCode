import { requireAuth } from "./_lib/auth.js";
import { buildDashboardStats } from "./_lib/stats.js";

export default requireAuth(async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const data = await buildDashboardStats();

  return res.status(200).json(data);
});
