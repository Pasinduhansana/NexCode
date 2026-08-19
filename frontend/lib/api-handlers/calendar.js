import { requireAuth } from "./_lib/auth.js";
import {
  listEvents,
  createEvent,
  CalendarServiceError,
} from "./_lib/calendar.js";

function parseFilters(query = {}) {
  return {
    eventType: query.eventType || "",
    projectId: query.projectId || "",
    priority: query.priority || "",
    status: query.status || "",
    search: query.search || "",
    dateFrom: query.dateFrom || "",
    dateTo: query.dateTo || "",
    range: query.range || "",
  };
}

export default requireAuth(async (req, res) => {
  const userId = req.user?.uid || req.user?.id;

  if (req.method === "GET") {
    try {
      const events = await listEvents({ userId, filters: parseFilters(req.query) });
      return res.status(200).json({ events });
    } catch (err) {
      if (err instanceof CalendarServiceError) return res.status(err.status).json({ error: err.message });
      return res.status(500).json({ error: "Something went wrong" });
    }
  }

  if (req.method === "POST") {
    try {
      const event = await createEvent(req.body || {}, req.user);
      return res.status(201).json(event);
    } catch (err) {
      if (err instanceof CalendarServiceError) return res.status(err.status).json({ error: err.message });
      return res.status(500).json({ error: "Something went wrong" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
});
