import { ObjectId } from "mongodb";
import { getCollection } from "./mongodb.js";
import { sendCalendarReminder, getUserEmailSafe } from "./email.js";
import { computeReminderTriggers, utcToZonedParts, EVENT_TYPE_LABELS } from "../../calendarLogic.js";

const COLLECTION = "calendarreminders";
const STATUSES = ["PENDING", "SENDING", "SENT", "FAILED", "CANCELLED"];

let indexesEnsured = false;
async function collection() {
  const col = await getCollection(COLLECTION);
  if (!indexesEnsured) {
    indexesEnsured = true;
    // Idempotency: the same reminder (event + lead) must never be scheduled twice.
    col
      .createIndex({ userId: 1, fingerprint: 1 }, { unique: true })
      .catch(() => {});
    col.createIndex({ userId: 1, triggerAt: 1, status: 1 }).catch(() => {});
    col.createIndex({ status: 1, triggerAt: 1 }).catch(() => {});
  }
  return col;
}

export function reminderFingerprint({ eventId, leadMinutes }) {
  return `${eventId || "standalone"}:${leadMinutes}`;
}

function formatWhen(startAt, timezone) {
  const parts = utcToZonedParts(startAt, timezone);
  if (!parts) return String(startAt);
  const d = new Date(startAt);
  const date = d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone });
  const time = `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
  return `${date} at ${time} (${timezone})`;
}

function accentColorForPriority(payload) {
  const p = String(payload && payload.priority ? payload.priority : "").toLowerCase();
  if (p === "high" || p === "urgent") return { pillBg: "#fff1f2", pillText: "#be123c" };
  if (p === "low") return { pillBg: "#f0fdfa", pillText: "#0f766e" };
  return { pillBg: "#eef2ff", pillText: "#4338ca" };
}

function buildEmailContent({ payload }) {
  const title = payload.title || "Calendar event";
  const when = formatWhen(payload.startAt, payload.timezone || "UTC");
  const typeLabel = EVENT_TYPE_LABELS[payload.eventType] || payload.eventType || "Event";
  const projectName = payload.projectName;
  const accent = accentColorForPriority(payload);
  const subject = `Reminder: ${title}`;
  const projectLine = projectName ? `\nProject: ${projectName}` : "";
  const text =
    `NexCode Calendar Reminder\n\n` +
    `${typeLabel}: ${title}${projectLine}\n` +
    `When: ${when}\n\n` +
    `This is an automated reminder from your NexCode calendar.`;
  const year = new Date().getFullYear();
  const html =
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f8;padding:32px 12px;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">` +
      `<tr><td align="center">` +
        `<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08);">` +
          `<tr><td style="background:linear-gradient(135deg,#6d28d9 0%,#4f46e5 50%,#2563eb 100%);padding:26px 32px;">` +
            `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>` +
              `<td style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.5px;">NexCode</td>` +
              `<td align="right" style="color:rgba(255,255,255,0.85);font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Calendar · Reminder</td>` +
            `</tr></table>` +
          `</td></tr>` +
          `<tr><td style="padding:32px 32px 8px;">` +
            `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:14px;"><tr>` +
              `<td style="background:${accent.pillBg};color:${accent.pillText};font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:6px 14px;border-radius:999px;">${escapeHtml(typeLabel)}</td>` +
            `</tr></table>` +
            `<h1 style="margin:0 0 6px;font-size:24px;line-height:1.3;color:#0f172a;font-weight:700;">${escapeHtml(title)}</h1>` +
            (projectName ? `<p style="margin:0 0 18px;font-size:15px;color:#64748b;">&#128193; ${escapeHtml(projectName)}</p>` : `<div style="height:10px;"></div>`) +
          `</td></tr>` +
          `<tr><td style="padding:0 32px 28px;">` +
            `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #eef2f7;border-radius:14px;">` +
              `<tr><td style="padding:18px 20px;">` +
                `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>` +
                  `<td width="34" valign="top" style="font-size:22px;line-height:1;">&#128338;</td>` +
                  `<td valign="top">` +
                    `<div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#94a3b8;margin-bottom:4px;">When</div>` +
                    `<div style="font-size:16px;font-weight:600;color:#0f172a;line-height:1.4;">${escapeHtml(when)}</div>` +
                  `</td>` +
                `</tr></table>` +
              `</td></tr>` +
            `</table>` +
          `</td></tr>` +
          `<tr><td style="background:#0f172a;padding:20px 32px;">` +
            `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>` +
              `<td style="color:#94a3b8;font-size:12px;line-height:1.5;">This is an automated reminder from your NexCode calendar.<br/>You received this because a reminder was set on one of your events.</td>` +
              `<td align="right" style="color:#e2e8f0;font-size:13px;font-weight:700;white-space:nowrap;">NexCode</td>` +
            `</tr></table>` +
          `</td></tr>` +
        `</table>` +
        `<table role="presentation" width="560" cellpadding="0" cellspacing="0"><tr>` +
          `<td align="center" style="padding:16px;font-size:11px;color:#94a3b8;">&copy; ${year} NexCode. All rights reserved.</td>` +
        `</tr></table>` +
      `</td></tr>` +
    `</table>`;
  return { subject, text, html };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Recomputes and upserts the scheduled reminder docs for a manual event.
// Idempotent: same fingerprint → same doc (no duplicates).
export async function syncEventReminders(event, user) {
  if (!event || event.isDerived) return;
  const col = await collection();
  const triggers = computeReminderTriggers({ startAt: event.startAt, reminders: event.reminders });
  const recipient = getUserEmailSafe(user);

  const ops = triggers.map((t) => {
    const fingerprint = reminderFingerprint({ eventId: event.id, leadMinutes: t.leadMinutes });
    return {
      updateOne: {
        filter: { userId: String(user.uid || user.id), fingerprint },
        update: {
          $set: {
            userId: String(user.uid || user.id),
            eventId: event.id,
            sourceType: event.sourceType || "MANUAL",
            sourceId: event.sourceId || null,
            leadMinutes: t.leadMinutes,
            label: t.label,
            triggerAt: t.triggerAt,
            status: "PENDING",
            recipient,
            payload: {
              title: event.title,
              eventType: event.eventType,
              priority: event.priority,
              projectName: event.projectName || null,
              startAt: event.startAt,
              timezone: event.timezone || "UTC",
            },
          },
          $setOnInsert: { createdAt: new Date() },
        },
        upsert: true,
      },
    };
  });

  if (ops.length === 0) {
    // No reminders configured → clear any previously scheduled ones for this event.
    await col.deleteMany({ userId: String(user.uid || user.id), eventId: event.id });
    return;
  }
  await col.bulkWrite(ops);
}

export async function deleteEventReminders(eventId) {
  const col = await collection();
  await col.deleteMany({ eventId: String(eventId) });
}

// Creates a standalone reminder for a derived/source record (project, task,
// expense) without duplicating it as a manual calendar event.
export async function createReminder({ user, input = {} }) {
  const leadMinutes = Number(input.leadMinutes);
  if (!Number.isFinite(leadMinutes) || leadMinutes <= 0) {
    throw new Error("A positive lead time in minutes is required.");
  }
  const startAt = input.startAt instanceof Date ? input.startAt : new Date(input.startAt);
  if (isNaN(startAt.getTime())) {
    throw new Error("A valid source date is required.");
  }
  const triggerAt = new Date(startAt.getTime() - leadMinutes * 60000);
  const col = await collection();
  const fingerprint = reminderFingerprint({ eventId: `src:${input.sourceType}:${input.sourceId}`, leadMinutes });
  const recipient = getUserEmailSafe(user);
  const doc = {
    userId: String(user.uid || user.id),
    eventId: null,
    sourceType: input.sourceType,
    sourceId: String(input.sourceId),
    leadMinutes,
    label: input.label || `${leadMinutes} min before`,
    triggerAt,
    status: "PENDING",
    recipient,
    payload: {
      title: input.title || "Reminder",
      eventType: input.eventType || "REMINDER",
      priority: input.priority || "medium",
      projectName: input.projectName || null,
      startAt: startAt.toISOString(),
      timezone: input.timezone || "UTC",
    },
  };
  await col.updateOne(
    { userId: doc.userId, fingerprint },
    { $set: doc, $setOnInsert: { createdAt: new Date() } },
    { upsert: true }
  );
  return { success: true, message: "Reminder scheduled", triggerAt: triggerAt.toISOString() };
}

export async function listReminders({ userId, eventId } = {}) {
  const col = await collection();
  const filter = { userId: String(userId) };
  if (eventId) filter.eventId = String(eventId);
  return col.find(filter).sort({ triggerAt: 1 }).toArray();
}

export async function cancelReminder(id, userId) {
  const col = await collection();
  if (!ObjectId.isValid(id)) return { cancelled: false };
  const res = await col.updateOne(
    { _id: new ObjectId(id), userId: String(userId) },
    { $set: { status: "CANCELLED" } }
  );
  return { cancelled: res.modifiedCount > 0 };
}

// Scheduled job entry point. Finds all PENDING reminders whose trigger instant
// has arrived and sends them. Safe to run repeatedly: each reminder is atomically
// claimed (PENDING → SENDING) so concurrent runs never send it twice.
export async function processDueReminders({ now = new Date(), userId, lookbehindMs = 1000 * 60 * 60 * 24 } = {}) {
  const col = await collection();
  const filter = {
    status: "PENDING",
    triggerAt: { $lte: now, $gte: new Date(now.getTime() - lookbehindMs) },
  };
  if (userId) filter.userId = String(userId);

  const due = await col.find(filter).limit(200).toArray();
  const summary = { processed: 0, sent: 0, failed: 0, skipped: 0 };

  for (const r of due) {
    const claimed = await col.findOneAndUpdate(
      { _id: r._id, status: "PENDING" },
      { $set: { status: "SENDING" } }
    );
    if (!claimed) {
      summary.skipped += 1;
      continue;
    }

    summary.processed += 1;
    const { subject, text, html } = buildEmailContent({ payload: r.payload || {} });
    const result = await sendCalendarReminder({
      to: r.recipient,
      subject,
      text,
      html,
      meta: { eventId: r.eventId, sourceType: r.sourceType },
    });

    if (result.ok) {
      await col.updateOne(
        { _id: r._id },
        { $set: { status: "SENT", sentAt: new Date(), failureReason: null } }
      );
      summary.sent += 1;
    } else {
      await col.updateOne(
        { _id: r._id },
        { $set: { status: "FAILED", failureReason: result.error || "send_failed" } }
      );
      summary.failed += 1;
    }
  }

  return summary;
}
