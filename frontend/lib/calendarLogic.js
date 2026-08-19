// Pure, dependency-free calendar logic shared by the backend service, the AI
// tools, and the test suite. NO server-only imports (mongodb, next, etc.) live
// here so it is safe to import from anywhere, including Node's test runner.

export const EVENT_TYPES = [
  "MEETING",
  "TASK_DEADLINE",
  "PROJECT_DEADLINE",
  "MILESTONE",
  "PROJECT_HANDOVER",
  "REMINDER",
  "EXPENSE",
  "OTHER",
];

export const EVENT_TYPE_LABELS = {
  MEETING: "Meeting",
  TASK_DEADLINE: "Task Deadline",
  PROJECT_DEADLINE: "Project Deadline",
  MILESTONE: "Milestone",
  PROJECT_HANDOVER: "Project Handover",
  REMINDER: "Reminder",
  EXPENSE: "Expense",
  OTHER: "Other",
};

// Only these types are eligible for automatic email reminders by default.
// Task deadlines and expenses are NOT email-eligible unless the user enables
// reminders explicitly (they are noisy otherwise).
export const REMINDER_ELIGIBLE_TYPES = new Set([
  "MEETING",
  "PROJECT_DEADLINE",
  "MILESTONE",
  "PROJECT_HANDOVER",
  "REMINDER",
]);

// Default reminder lead times (minutes) applied when an eligible event is
// created without an explicit reminder config.
export const DEFAULT_REMINDER_LEADS = {
  MEETING: [1440, 120],
  PROJECT_DEADLINE: [1440, 120],
  MILESTONE: [2880, 1440],
  PROJECT_HANDOVER: [2880, 1440],
  REMINDER: [1440],
};

export const PRIORITIES = ["low", "medium", "high", "urgent"];

export const STATUSES = ["upcoming", "completed", "cancelled", "overdue"];

export const REMINDER_PRESETS = [
  { value: "30m", label: "30 minutes before", minutes: 30 },
  { value: "1h", label: "1 hour before", minutes: 60 },
  { value: "2h", label: "2 hours before", minutes: 120 },
  { value: "1d", label: "1 day before", minutes: 1440 },
  { value: "2d", label: "2 days before", minutes: 2880 },
  { value: "1w", label: "1 week before", minutes: 10080 },
];

export function isEventEligibleForReminders(eventType) {
  return REMINDER_ELIGIBLE_TYPES.has(eventType);
}

export function defaultReminderLeads(eventType) {
  return DEFAULT_REMINDER_LEADS[eventType] ? [...DEFAULT_REMINDER_LEADS[eventType]] : [];
}

export function isValidEventInput({ eventType, priority, status }) {
  const errors = [];
  if (eventType && !EVENT_TYPES.includes(eventType)) errors.push(`Unknown event type: ${eventType}`);
  if (priority && !PRIORITIES.includes(priority)) errors.push(`Unknown priority: ${priority}`);
  if (status && !STATUSES.includes(status)) errors.push(`Unknown status: ${status}`);
  return { ok: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Timezone helpers. We avoid external date libraries and compute the UTC
// instant for a wall-clock time in an arbitrary IANA timezone using the
// standard "guess + correct" algorithm built on Intl.DateTimeFormat.
// ---------------------------------------------------------------------------

export function tzOffsetMinutes(timeZone, date) {
  let dtf;
  try {
    dtf = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    // Invalid timezone → treat as UTC.
    return 0;
  }
  const parts = dtf.formatToParts(date);
  const map = {};
  for (const p of parts) map[p.type] = p.value;
  const hour = map.hour === "24" ? "00" : map.hour;
  const asUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(hour),
    Number(map.minute),
    Number(map.second)
  );
  return Math.round((asUTC - date.getTime()) / 60000);
}

export function zonedTimeToUtc({ year, month, day, hour = 0, minute = 0, second = 0 }, timeZone = "UTC") {
  const guess = Date.UTC(year, month - 1, day, hour, minute, second);
  // Correct the guess so the offset used matches the target wall-clock date.
  const offset = tzOffsetMinutes(timeZone, new Date(guess - tzOffsetMinutes(timeZone, new Date(guess)) * 60000));
  return new Date(guess - offset * 60000);
}

export function utcToZonedParts(date, timeZone = "UTC") {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return null;
  let dtf;
  try {
    dtf = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    dtf = new Intl.DateTimeFormat("en-US", {
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }
  const parts = dtf.formatToParts(d);
  const map = {};
  for (const p of parts) map[p.type] = p.value;
  const hour = map.hour === "24" ? "00" : map.hour;
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(hour),
    minute: Number(map.minute),
    second: Number(map.second),
  };
}

function parseDateParts(dateStr) {
  if (!dateStr) return null;
  if (typeof dateStr === "object" && dateStr instanceof Date) {
    const y = dateStr.getFullYear();
    const m = dateStr.getMonth() + 1;
    const d = dateStr.getDate();
    return { year: y, month: m, day: d };
  }
  const s = String(dateStr).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  }
  return null;
}

function parseTimeParts(timeStr) {
  if (!timeStr) return { hour: 0, minute: 0 };
  const s = String(timeStr).trim();
  const m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!m) return { hour: 0, minute: 0 };
  let hour = Number(m[1]);
  const minute = Number(m[2]);
  const sec = m[3] ? Number(m[3]) : 0;
  const mer = m[4] ? m[4].toLowerCase() : null;
  if (mer === "pm" && hour < 12) hour += 12;
  if (mer === "am" && hour === 12) hour = 0;
  return { hour, minute, second: sec };
}

// Builds { startAt, endAt } UTC Dates from the event's wall-clock inputs,
// honoring the event timezone. Returns { startAt: null } if inputs are invalid.
export function buildStartEnd({ date, startTime, endTime, allDay, timezone = "UTC" }) {
  const dp = parseDateParts(date);
  if (!dp) return { startAt: null, endAt: null };

  if (allDay) {
    const startAt = zonedTimeToUtc({ ...dp, hour: 0, minute: 0 }, timezone);
    const endAt = new Date(startAt.getTime() + 24 * 60 * 60 * 1000);
    return { startAt, endAt };
  }

  const st = parseTimeParts(startTime);
  const startAt = zonedTimeToUtc({ ...dp, ...st }, timezone);
  let endAt = null;
  if (endTime) {
    const et = parseTimeParts(endTime);
    endAt = zonedTimeToUtc({ ...dp, ...et }, timezone);
    if (endAt.getTime() <= startAt.getTime()) {
      endAt = new Date(startAt.getTime() + 60 * 60 * 1000);
    }
  }
  return { startAt, endAt };
}

export function formatLeadLabel(minutes) {
  if (minutes >= 10080 && minutes % 10080 === 0) return `${minutes / 10080} week${minutes / 10080 > 1 ? "s" : ""} before`;
  if (minutes >= 1440 && minutes % 1440 === 0) return `${minutes / 1440} day${minutes / 1440 > 1 ? "s" : ""} before`;
  if (minutes >= 60 && minutes % 60 === 0) return `${minutes / 60} hour${minutes / 60 > 1 ? "s" : ""} before`;
  return `${minutes} minutes before`;
}

// Normalizes a reminders payload (array of lead minutes or {leadMinutes,label})
// into a consistent { leadMinutes, label }[] shape.
export function normalizeReminders(input) {
  if (!Array.isArray(input)) return [];
  const out = [];
  for (const r of input) {
    let lead;
    let label;
    if (typeof r === "number") {
      lead = r;
    } else if (r && typeof r === "object") {
      lead = typeof r.leadMinutes === "number" ? r.leadMinutes : Number(r.minutes);
      label = r.label;
    } else {
      lead = Number(r);
    }
    if (!Number.isFinite(lead) || lead <= 0) continue;
    out.push({ leadMinutes: Math.round(lead), label: label || formatLeadLabel(Math.round(lead)) });
  }
  return out;
}

// Computes the absolute trigger instants (UTC) for a set of reminder leads.
export function computeReminderTriggers({ startAt, reminders = [] }) {
  const start = startAt instanceof Date ? startAt : new Date(startAt);
  if (isNaN(start.getTime())) return [];
  return normalizeReminders(reminders)
    .map((r) => ({
      leadMinutes: r.leadMinutes,
      label: r.label,
      triggerAt: new Date(start.getTime() - r.leadMinutes * 60000),
    }))
    .sort((a, b) => a.triggerAt - b.triggerAt);
}

// ---------------------------------------------------------------------------
// Date-range expansion for filters ("today", "this week", "this month", etc.)
// ---------------------------------------------------------------------------

export function startOfDay(d) {
  const x = d instanceof Date ? new Date(d) : new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfDay(d) {
  const x = d instanceof Date ? new Date(d) : new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function expandDateRange({ dateFrom, dateTo, range } = {}) {
  const now = new Date();
  const rangeToken = String(range || "").trim().toLowerCase();
  const tokenRanges = {
    today: () => ({ from: startOfDay(now), to: endOfDay(now) }),
    tomorrow: () => {
      const t = new Date(now);
      t.setDate(t.getDate() + 1);
      return { from: startOfDay(t), to: endOfDay(t) };
    },
    "this week": () => {
      const d = new Date(now);
      const day = (d.getDay() + 6) % 7;
      d.setDate(d.getDate() - day);
      return { from: startOfDay(d), to: endOfDay(now) };
    },
    "next week": () => {
      const d = new Date(now);
      const day = (d.getDay() + 6) % 7;
      d.setDate(d.getDate() - day + 7);
      const end = new Date(d);
      end.setDate(end.getDate() + 6);
      return { from: startOfDay(d), to: endOfDay(end) };
    },
    "this month": () => ({ from: new Date(now.getFullYear(), now.getMonth(), 1), to: endOfDay(now) }),
    "next month": () => {
      const from = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth() + 2, 0);
      return { from: startOfDay(from), to: endOfDay(to) };
    },
  };

  if (tokenRanges[rangeToken]) return tokenRanges[rangeToken]();

  let from;
  let to;
  if (dateFrom) {
    const d = startOfDay(new Date(dateFrom));
    if (!isNaN(d.getTime())) from = d;
  }
  if (dateTo) {
    const d = endOfDay(new Date(dateTo));
    if (!isNaN(d.getTime())) to = d;
  }
  return { from, to };
}
