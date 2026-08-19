import { requireAuth } from "../_lib/auth.js";
import {
  getEventById,
  updateEvent,
  deleteEvent,
  CalendarServiceError,
} from "../_lib/calendar.js";

export default requireAuth(async (req, res) => {
  const userId = req.user?.uid || req.user?.id;
  const id = req.query?.id;

  if (req.method === "GET") {
    try {
      const event = await getEventById(id, userId);
      if (!event) return res.status(404).json({ error: "Event not found" });
      return res.status(200).json(event);
    } catch (err) {
      if (err instanceof CalendarServiceError) return res.status(err.status).json({ error: err.message });
      return res.status(500).json({ error: "Something went wrong" });
    }
  }

  if (req.method === "PUT" || req.method === "PATCH") {
    try {
      const event = await updateEvent(id, req.body || {}, req.user);
      return res.status(200).json(event);
    } catch (err) {
      if (err instanceof CalendarServiceError) return res.status(err.status).json({ error: err.message });
      return res.status(500).json({ error: "Something went wrong" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const result = await deleteEvent(id, req.user);
      return res.status(200).json(result);
    } catch (err) {
      if (err instanceof CalendarServiceError) return res.status(err.status).json({ error: err.message });
      return res.status(500).json({ error: "Something went wrong" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
});
