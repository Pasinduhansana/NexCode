import adminApi from "./adminApi";

function buildQuery(filters = {}) {
  const params = new URLSearchParams();
  const map = {
    eventType: filters.eventType,
    projectId: filters.projectId,
    priority: filters.priority,
    status: filters.status,
    search: filters.search,
    range: filters.range,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  };
  for (const [key, value] of Object.entries(map)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const calendarApi = {
  listEvents: (filters = {}) => adminApi.get(`/calendar${buildQuery(filters)}`).then((r) => r.data.events || []),
  getEvent: (id) => adminApi.get(`/calendar/${id}`).then((r) => r.data),
  createEvent: (data) => adminApi.post("/calendar", data).then((r) => r.data),
  updateEvent: (id, data) => adminApi.put(`/calendar/${id}`, data).then((r) => r.data),
  deleteEvent: (id) => adminApi.delete(`/calendar/${id}`).then((r) => r.data),

  listReminders: (eventId) =>
    adminApi.get(`/calendar/reminders${eventId ? `?eventId=${eventId}` : ""}`).then((r) => r.data.reminders || []),
  createReminder: (data) => adminApi.post("/calendar/reminders", data).then((r) => r.data),
  cancelReminder: (id) => adminApi.delete(`/calendar/reminders?id=${id}`).then((r) => r.data),

  // Manual trigger for the reminder scheduler (admin only).
  processReminders: () => adminApi.post("/calendar/reminders/process", {}).then((r) => r.data),

  listProjects: () => adminApi.get("/projects").then((r) => r.data || []),
};

export default calendarApi;
