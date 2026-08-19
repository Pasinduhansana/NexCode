import { ObjectId } from "mongodb";
import { getCollection } from "./mongodb.js";
import { logActivity } from "./activity.js";
import {
  EVENT_TYPES,
  PRIORITIES,
  STATUSES,
  buildStartEnd,
  normalizeReminders,
  isValidEventInput,
  expandDateRange,
  isEventEligibleForReminders,
  defaultReminderLeads,
} from "../calendarLogic.js";
import { syncEventReminders, deleteEventReminders } from "./reminders.js";

const COLLECTION = "calendarevents";
const IMPORTANT_EXPENSE_CATEGORIES = new Set(["Hosting", "Domain"]);

export class CalendarServiceError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "CalendarServiceError";
    this.status = status;
    this.expose = true;
  }
}

export function getUserEmail(user) {
  if (user && user.email && String(user.email).includes("@")) return String(user.email).trim();
  if (process.env.DEFAULT_REMINDER_EMAIL && process.env.DEFAULT_REMINDER_EMAIL.includes("@")) {
    return process.env.DEFAULT_REMINDER_EMAIL;
  }
  return null;
}

function asTrimmed(value) {
  return value ? String(value).trim() : "";
}

function scrubInput(input = {}) {
  const out = { ...input };
  if (typeof out.title === "string") out.title = out.title.trim();
  if (typeof out.description === "string") out.description = out.description.trim();
  if (typeof out.location === "string") out.location = out.location.trim();
  if (typeof out.notes === "string") out.notes = out.notes.trim();
  if (out.participants && !Array.isArray(out.participants)) out.participants = [];
  return out;
}

function buildDoc(input, user) {
  const { startAt, endAt } = buildStartEnd(input);
  if (!startAt) {
    throw new CalendarServiceError("A valid date is required for the event.");
  }

  const check = isValidEventInput({
    eventType: input.eventType,
    priority: input.priority,
    status: input.status,
  });
  if (!check.ok) {
    throw new CalendarServiceError(check.errors.join("; "));
  }

  let reminders = Array.isArray(input.reminders)
    ? normalizeReminders(input.reminders)
    : [];
  if (reminders.length === 0 && isEventEligibleForReminders(input.eventType)) {
    reminders = defaultReminderLeads(input.eventType).map((m) => ({ leadMinutes: m }));
  }

  return {
    title: asTrimmed(input.title) || "Untitled event",
    description: asTrimmed(input.description),
    eventType: EVENT_TYPES.includes(input.eventType) ? input.eventType : "OTHER",
    allDay: Boolean(input.allDay),
    timezone: input.timezone || user?.timezone || "Asia/Colombo",
    startAt,
    endAt,
    projectId: input.projectId ? String(input.projectId) : null,
    sourceType: input.sourceType || "MANUAL",
    sourceId: input.sourceId ? String(input.sourceId) : null,
    priority: PRIORITIES.includes(input.priority) ? input.priority : "medium",
    status: STATUSES.includes(input.status) ? input.status : "upcoming",
    location: asTrimmed(input.location),
    participants: Array.isArray(input.participants)
      ? input.participants.map((p) => String(p).trim()).filter(Boolean)
      : [],
    reminders,
    notes: asTrimmed(input.notes),
  };
}

function mapManual(doc) {
  return {
    id: String(doc._id),
    title: doc.title,
    description: doc.description || "",
    eventType: doc.eventType,
    startAt: doc.startAt,
    endAt: doc.endAt,
    allDay: Boolean(doc.allDay),
    timezone: doc.timezone || "Asia/Colombo",
    projectId: doc.projectId || null,
    sourceType: doc.sourceType || "MANUAL",
    sourceId: doc.sourceId || null,
    priority: doc.priority || "medium",
    status: doc.status || "upcoming",
    location: doc.location || "",
    participants: doc.participants || [],
    reminders: doc.reminders || [],
    notes: doc.notes || "",
    isDerived: false,
    readOnly: false,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function createEvent(input = {}, user) {
  const clean = scrubInput(input);
  const doc = buildDoc(clean, user);
  const now = new Date().toISOString();

  const events = await getCollection(COLLECTION);
  const record = { ...doc, userId: String(user.uid || user.id), createdAt: now, updatedAt: now };
  const { insertedId } = await events.insertOne(record);

  const created = { ...record, _id: insertedId };
  await syncEventReminders(mapManual(created), user).catch(() => {});
  await logActivity(user, {
    action: "create",
    targetType: "calendar",
    target: created.title,
    details: { eventType: created.eventType },
  }).catch(() => {});

  return mapManual(created);
}

export async function getEventById(id, userId) {
  if (!ObjectId.isValid(id)) {
    throw new CalendarServiceError("Invalid event id", 400);
  }
  const events = await getCollection(COLLECTION);
  const doc = await events.findOne({ _id: new ObjectId(id), userId: String(userId) });
  return doc ? mapManual(doc) : null;
}

export async function updateEvent(id, input = {}, user) {
  if (!ObjectId.isValid(id)) {
    throw new CalendarServiceError("Invalid event id", 400);
  }
  const events = await getCollection(COLLECTION);
  const existing = await events.findOne({ _id: new ObjectId(id), userId: String(user.uid || user.id) });
  if (!existing) {
    throw new CalendarServiceError("Event not found", 404);
  }

  const clean = scrubInput(input);
  const merged = {
    title: clean.title !== undefined ? clean.title : existing.title,
    description: clean.description !== undefined ? clean.description : existing.description,
    eventType: clean.eventType !== undefined ? clean.eventType : existing.eventType,
    allDay: clean.allDay !== undefined ? Boolean(clean.allDay) : Boolean(existing.allDay),
    timezone: clean.timezone !== undefined ? clean.timezone : existing.timezone,
    date: clean.date,
    startTime: clean.startTime,
    endTime: clean.endTime,
    projectId: clean.projectId !== undefined ? (clean.projectId ? String(clean.projectId) : null) : existing.projectId,
    sourceType: existing.sourceType,
    sourceId: existing.sourceId,
    priority: clean.priority !== undefined ? clean.priority : existing.priority,
    status: clean.status !== undefined ? clean.status : existing.status,
    location: clean.location !== undefined ? clean.location : existing.location,
    participants:
      clean.participants !== undefined
        ? Array.isArray(clean.participants)
          ? clean.participants.map((p) => String(p).trim()).filter(Boolean)
          : []
        : existing.participants,
    reminders: clean.reminders !== undefined ? clean.reminders : existing.reminders,
    notes: clean.notes !== undefined ? clean.notes : existing.notes,
  };

  const doc = buildDoc(merged, user);
  await events.updateOne({ _id: new ObjectId(id) }, { $set: { ...doc, updatedAt: new Date().toISOString() } });

  const updated = { ...doc, _id: new ObjectId(id), userId: String(user.uid || user.id) };
  await syncEventReminders(mapManual(updated), user).catch(() => {});
  await logActivity(user, {
    action: "update",
    targetType: "calendar",
    target: updated.title,
    details: { eventType: updated.eventType },
  }).catch(() => {});

  return mapManual(updated);
}

export async function deleteEvent(id, user) {
  if (!ObjectId.isValid(id)) {
    throw new CalendarServiceError("Invalid event id", 400);
  }
  const events = await getCollection(COLLECTION);
  const existing = await events.findOne({ _id: new ObjectId(id), userId: String(user.uid || user.id) });
  if (!existing) {
    throw new CalendarServiceError("Event not found", 404);
  }
  await events.deleteOne({ _id: new ObjectId(id) });
  await deleteEventReminders(id).catch(() => {});
  await logActivity(user, {
    action: "delete",
    targetType: "calendar",
    target: existing.title,
    details: {},
  }).catch(() => {});
  return { deleted: true, id };
}

// Builds the MongoDB filter for manual events from the request query.
function buildManualFilter({ userId, filters }) {
  const filter = { userId: String(userId) };
  const range = expandDateRange({
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    range: filters.range,
  });

  if (range.from || range.to) {
    filter.startAt = {};
    if (range.from) filter.startAt.$gte = range.from;
    if (range.to) filter.startAt.$lte = range.to;
  }

  if (filters.eventType && EVENT_TYPES.includes(filters.eventType)) {
    filter.eventType = filters.eventType;
  }
  if (filters.priority && PRIORITIES.includes(filters.priority)) {
    filter.priority = filters.priority;
  }
  if (filters.status && STATUSES.includes(filters.status)) {
    filter.status = filters.status;
  }
  if (filters.projectId) {
    filter.projectId = String(filters.projectId);
  }
  if (filters.search) {
    const rx = new RegExp(filters.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ title: rx }, { description: rx }, { location: rx }, { notes: rx }];
  }
  return { filter, range };
}

export async function listEvents({ userId, filters = {} } = {}) {
  const { filter, range } = buildManualFilter({ userId, filters });

  const events = await getCollection(COLLECTION);
  const manual = (await events.find(filter).sort({ startAt: 1 }).toArray()).map(mapManual);

  // Derived events (from projects / tasks / expenses) are shared company data,
  // not a specific user's private events. They are filtered the same way.
  const derived = await getDerivedEvents({ filters, range });

  const combined = [...manual, ...derived];

  // Project-name enrichment for both groups.
  const projectIds = new Set(
    combined.map((e) => e.projectId).filter(Boolean)
  );
  const names = await getProjectNames([...projectIds]);
  for (const e of combined) {
    if (e.projectId && names[e.projectId]) e.projectName = names[e.projectId];
  }

  return combined.sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
}

async function getProjectNames(ids) {
  const names = {};
  if (ids.length === 0) return names;
  const projects = await getCollection("projects");
  const docs = await projects
    .find({ _id: { $in: ids.map((id) => (ObjectId.isValid(id) ? new ObjectId(id) : id)) } }, { projection: { name: 1 } })
    .toArray();
  for (const d of docs) names[String(d._id)] = d.name;
  return names;
}

function matchesFilters(event, filters) {
  if (filters.eventType && event.eventType !== filters.eventType) return false;
  if (filters.priority && event.priority !== filters.priority) return false;
  if (filters.status && event.status !== filters.status) return false;
  if (filters.projectId && event.projectId !== String(filters.projectId)) return false;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    const hay = `${event.title} ${event.description || ""} ${event.location || ""} ${event.notes || ""}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

export async function getDerivedEvents({ filters = {}, range } = {}) {
  const window = range && (range.from || range.to)
    ? range
    : expandDateRange({ range: "this month" });
  const from = window.from || new Date(Date.now() - 1000 * 60 * 60 * 24 * 60);
  const to = window.to || new Date(Date.now() + 1000 * 60 * 60 * 24 * 60);

  const out = [];

  // Projects: deadlines + handovers
  const projects = await getCollection("projects");
  const projectDocs = await projects
    .find({
      $or: [
        { dueDate: { $gte: from, $lte: to } },
        { handoverDate: { $gte: from, $lte: to } },
      ],
    })
    .toArray();

  for (const p of projectDocs) {
    if (p.dueDate) {
      out.push({
        id: `PROJECT:${p._id}:due`,
        title: `${p.name} — Deadline`,
        description: p.description || "",
        eventType: "PROJECT_DEADLINE",
        startAt: p.dueDate,
        endAt: p.dueDate,
        allDay: true,
        timezone: "UTC",
        projectId: String(p._id),
        projectName: p.name,
        sourceType: "PROJECT",
        sourceId: String(p._id),
        priority: p.priority || "high",
        status: p.status === "completed" ? "completed" : "upcoming",
        location: "",
        participants: [],
        reminders: [],
        notes: "",
        isDerived: true,
        readOnly: true,
      });
    }
    if (p.handoverDate) {
      out.push({
        id: `PROJECT:${p._id}:handover`,
        title: `${p.name} — Handover`,
        description: "Project handover",
        eventType: "PROJECT_HANDOVER",
        startAt: p.handoverDate,
        endAt: p.handoverDate,
        allDay: true,
        timezone: "UTC",
        projectId: String(p._id),
        projectName: p.name,
        sourceType: "PROJECT",
        sourceId: String(p._id),
        priority: "high",
        status: p.status === "completed" ? "completed" : "upcoming",
        location: "",
        participants: [],
        reminders: [],
        notes: "",
        isDerived: true,
        readOnly: true,
      });
    }
  }

  // Tasks with due dates (exclude completed ones)
  const tasks = await getCollection("tasks");
  const taskDocs = await tasks
    .find({ dueDate: { $gte: from, $lte: to }, status: { $ne: "done" } })
    .toArray();
  for (const t of taskDocs) {
    out.push({
      id: `TASK:${t._id}`,
      title: t.title,
      description: t.description || "",
      eventType: "TASK_DEADLINE",
      startAt: t.dueDate,
      endAt: t.dueDate,
      allDay: true,
      timezone: "UTC",
      projectId: t.projectId ? String(t.projectId) : null,
      sourceType: "TASK",
      sourceId: String(t._id),
      priority: t.priority || "medium",
      status: "upcoming",
      location: "",
      participants: t.assignee ? [t.assignee] : [],
      reminders: [],
      notes: "",
      isDerived: true,
      readOnly: true,
    });
  }

  // Important expenses: explicit opt-in flag OR recurring-renewal categories.
  const transactions = await getCollection("transactions");
  const expenseDocs = await transactions
    .find({
      date: { $gte: from, $lte: to },
      $or: [{ showOnCalendar: true }, { category: { $in: [...IMPORTANT_EXPENSE_CATEGORIES] } }],
    })
    .toArray();
  for (const tx of expenseDocs) {
    out.push({
      id: `EXPENSE:${tx._id}`,
      title: `Expense: ${tx.description || `${tx.category} ${tx.amount}`}`,
      description: `${tx.category} • ${tx.amount} LKR`,
      eventType: "EXPENSE",
      startAt: tx.date,
      endAt: tx.date,
      allDay: true,
      timezone: "UTC",
      projectId: tx.projectId ? String(tx.projectId) : null,
      sourceType: "EXPENSE",
      sourceId: String(tx._id),
      priority: "medium",
      status: "upcoming",
      location: "",
      participants: [],
      reminders: [],
      notes: "",
      isDerived: true,
      readOnly: true,
    });
  }

  return out.filter((e) => matchesFilters(e, filters));
}
