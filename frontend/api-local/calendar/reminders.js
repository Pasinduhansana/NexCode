import { requireAuth } from "../_lib/auth.js";
import {
  listReminders,
  createReminder,
  cancelReminder,
} from "../_lib/reminders.js";

export default requireAuth(async (req, res) => {
  const userId = req.user?.uid || req.user?.id;

  if (req.method === "GET") {
    try {
      const reminders = await listReminders({ userId, eventId: req.query?.eventId });
      return res.status(200).json({ reminders });
    } catch (err) {
      return res.status(500).json({ error: "Something went wrong" });
    }
  }

  if (req.method === "POST") {
    try {
      const result = await createReminder({ user: req.user, input: req.body || {} });
      return res.status(201).json(result);
    } catch (err) {
      return res.status(400).json({ error: err.message || "Could not schedule reminder" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const result = await cancelReminder(req.query?.id, userId);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ error: "Something went wrong" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
});
