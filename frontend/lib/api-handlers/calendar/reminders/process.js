import { verifyToken, getToken } from "../../_lib/auth.js";
import { processDueReminders } from "../../_lib/reminders.js";

// Reminder processing entry point. Intentionally NOT wrapped in requireAuth so it
// can be triggered by the scheduled cron job (which authenticates with a secret)
// WITHOUT needing the website to be open. It also accepts a valid admin JWT so it
// can be triggered manually from the UI ("Process now").
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = req.headers["x-cron-secret"];
  const token = getToken(req);
  const cronSecret = process.env.CRON_SECRET;
  // Vercel cron sends `Authorization: Bearer $CRON_SECRET` automatically when a
  // CRON_SECRET env var is set. We also accept an explicit x-cron-secret header
  // and a valid admin JWT (manual "Process now" trigger from the UI).
  const authorizedBySecret = Boolean(cronSecret) && (secret === cronSecret || token === cronSecret);
  let authorizedByToken = false;
  try {
    if (token && token !== cronSecret) {
      verifyToken(token);
      authorizedByToken = true;
    }
  } catch {
    authorizedByToken = false;
  }

  if (!authorizedBySecret && !authorizedByToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const now = req.body && req.body.now ? new Date(req.body.now) : new Date();
    const summary = await processDueReminders({ now });
    return res.status(200).json({ ok: true, processedAt: now.toISOString(), summary });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Something went wrong" });
  }
}
