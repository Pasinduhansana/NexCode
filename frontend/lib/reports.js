// Reports service — professional document generation, storage, versioning,
// numbering, and per-user authorization. Reports are stored as metadata plus
// the generated PDF binary in the reports collection (the persistent storage
// available in this Vercel serverless + MongoDB architecture).

import crypto from "node:crypto";
import { getCollection, unwrap } from "./mongodb.js";
import { logActivity } from "./activity.js";
import { getProjectById, resolveProjectId } from "./projects.js";
import { listTasksByProject } from "./tasks.js";
import { listIssuesByProject } from "./issues.js";
import { listTransactions } from "./finance.js";
import { listPlannedExpenses } from "./projectplanner.js";
import { listDesignSectionsByProject } from "./designsections.js";
import { listDesignReferencesByProject } from "./designreferences.js";
import { buildReportPdf } from "./pdf/buildReportPdf.js";
import { docTypeLabel } from "./pdf/components.js";

export const REPORT_TYPES = ["invoice", "quotation", "proposal", "manual", "other"];
export const REPORT_TYPE_LABELS = {
  invoice: "Payment Invoice",
  quotation: "Price Quotation",
  proposal: "Project Proposal",
  manual: "Project Manual",
  other: "Report",
};
export const REPORT_STATUSES = ["draft", "generating", "generated", "failed", "archived"];
export const REPORT_NUMBER_PREFIX = { invoice: "INV", quotation: "QUO", proposal: "PRO", manual: "MAN", other: "RPT" };

const MAX_PDF_BYTES = 10 * 1024 * 1024;
const REPORT_PROJECTION = { file: 0 };

export class ReportServiceError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "ReportServiceError";
    this.status = status;
  }
}

function userId(user) {
  return String(user?.uid || user?.id || user?.name || "anon");
}

function nowIso() {
  return new Date().toISOString();
}

function str(value) {
  return typeof value === "string" ? value.trim() : "";
}

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function strArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((v) => str(v)).filter(Boolean);
}

function strObj(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value;
}

// ---------------------------------------------------------------------------
// Sensitive-data redaction. Applied to stored content and to data sent to the
// AI so credentials, tokens and keys can never end up in a report.
// ---------------------------------------------------------------------------

const KEY_ASSIGN_RE =
  /((?:api[_-]?key|password|passwd|client[_-]?secret|access[_-]?token|refresh[_-]?token|auth[_-]?token|secret|token|private[_-]?key|credential|db[_-]?uri|connection[_-]?string)\s*[:=]\s*)(["']?)[^"'\s,;]+/gi;

function redactString(value) {
  let out = String(value ?? "");
  out = out.replace(/mongodb(\+srv)?:\/\/[^\s]+/gi, "mongodb://[REDACTED]");
  out = out.replace(/([a-z][a-z0-9+.-]*:\/\/)([^/\s@]+)@/gi, "$1[REDACTED]@");
  out = out.replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "[REDACTED KEY]");
  out = out.replace(KEY_ASSIGN_RE, "$1[REDACTED]");
  return out;
}

function redactDeep(value) {
  if (typeof value === "string") return redactString(value);
  if (Array.isArray(value)) return value.map(redactDeep);
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, v] of Object.entries(value)) out[key] = redactDeep(v);
    return out;
  }
  return value;
}

export function sanitizeReportContent(content) {
  return redactDeep(content);
}

// ---------------------------------------------------------------------------
// Content normalization — validate the structured JSON schema per document type.
// ---------------------------------------------------------------------------

export function normalizeReportContent(documentType, raw) {
  if (!REPORT_TYPES.includes(documentType)) {
    throw new ReportServiceError(`Unknown document type "${documentType}"`, 400);
  }
  const input = strObj(raw);
  const meta = strObj(input.documentMeta);
  const client = strObj(input.client);
  const project = strObj(input.project);
  const pricing = strObj(input.pricing);

  const items = Array.isArray(input.items)
    ? input.items.map((item) => ({
        description: str(item.description) || str(item.name) || str(item.item) || "Item",
        qty: item.qty == null || item.qty === "" ? 1 : num(item.qty),
        unitPrice: item.unitPrice == null || item.unitPrice === "" ? num(item.cost) : num(item.unitPrice),
        amount: item.amount == null || item.amount === "" ? num(item.total) : num(item.amount),
      }))
    : [];

  const timeline = Array.isArray(input.timeline)
    ? input.timeline.map((t) => ({
        phase: str(t.phase) || str(t.name) || "Phase",
        description: str(t.description),
        timeline: str(t.timeline) || str(t.range) || "—",
      }))
    : [];

  const expenses = strObj(input.expenses);
  const estimated = Array.isArray(expenses.estimated)
    ? expenses.estimated.map((e) => ({
        item: str(e.item) || str(e.description) || str(e.name) || "Expense",
        cost: e.cost == null || e.cost === "" ? num(e.amount) : num(e.cost),
        category: str(e.category),
      }))
    : [];
  const actual = Array.isArray(expenses.actual)
    ? expenses.actual.map((e) => ({
        item: str(e.item) || str(e.description) || str(e.name) || "Expense",
        cost: e.cost == null || e.cost === "" ? num(e.amount) : num(e.cost),
        category: str(e.category),
      }))
    : [];

  const sections = Array.isArray(input.sections)
    ? input.sections
        .map((s) => {
          const section = strObj(s);
          if (!section.heading && !section.body) return null;
          return { heading: str(section.heading), body: section.body };
        })
        .filter(Boolean)
    : [];

  const itemsTotal = items.reduce((sum, item) => sum + num(item.amount || item.qty * item.unitPrice), 0);

  const normalized = {
    title: str(input.title) || docTypeLabel(documentType),
    subtitle: str(input.subtitle),
    documentMeta: {
      docNumber: str(meta.docNumber) || str(input.docNumber),
      date: str(meta.date) || str(meta.invoiceDate) || str(meta.issueDate),
      invoiceDate: str(meta.invoiceDate) || str(meta.date),
      dueDate: str(meta.dueDate),
      validUntil: str(meta.validUntil),
      currency: str(meta.currency) || str(pricing.currency) || "LKR",
      reference: str(meta.reference),
      preparedBy: str(meta.preparedBy) || "NexCode",
      approvedBy: str(meta.approvedBy),
      paymentStatus: str(meta.paymentStatus),
    },
    client: {
      name: str(client.name) || str(client.company),
      company: str(client.company),
      address: str(client.address),
      email: str(client.email),
      phone: str(client.phone),
    },
    project: {
      name: str(project.name) || str(input.projectLabel),
      client: str(project.client),
      status: str(project.status),
      startDate: str(project.startDate),
      dueDate: str(project.dueDate),
      budget: num(project.budget),
    },
    projectLabel: str(input.projectLabel) || str(project.name),
    introduction: str(input.introduction) || str(input.overview),
    objectives: strArray(input.objectives),
    features: strArray(input.features),
    items,
    itemsTotal: num(input.itemsTotal) || itemsTotal,
    timeline,
    expenses: {
      estimated,
      actual,
      estimatedTotal: num(expenses.estimatedTotal) || estimated.reduce((s, e) => s + num(e.cost), 0),
      actualTotal: num(expenses.actualTotal) || actual.reduce((s, e) => s + num(e.cost), 0),
    },
    pricing: {
      subtotal: num(pricing.subtotal) || itemsTotal,
      discount: num(pricing.discount),
      taxes: num(pricing.taxes),
      total: num(pricing.total) || itemsTotal,
      paid: num(pricing.paid),
      balance: num(pricing.balance),
      currency: str(pricing.currency) || str(meta.currency) || "LKR",
    },
    notes: strArray(input.notes),
    sections,
  };

  return sanitizeReportContent(normalized);
}

// ---------------------------------------------------------------------------
// Document numbering — database-safe atomic counters (no duplicate numbers).
// ---------------------------------------------------------------------------

export async function nextDocumentNumber(documentType) {
  if (!REPORT_NUMBER_PREFIX[documentType]) {
    throw new ReportServiceError(`Unknown document type "${documentType}"`, 400);
  }
  const year = new Date().getUTCFullYear();
  const prefix = `${REPORT_NUMBER_PREFIX[documentType]}-${year}`;
  const col = await getCollection("reportcounters");
  const result = await col.findOneAndUpdate(
    { _id: prefix },
    { $inc: { seq: 1 }, $setOnInsert: { createdAt: nowIso() } },
    { upsert: true, returnDocument: "after" }
  );
  const seq = num(result?.value?.seq || 1);
  return `${prefix}-${String(seq).padStart(3, "0")}`;
}

// ---------------------------------------------------------------------------
// Report data aggregation (for the AI and for manual builders).
// ---------------------------------------------------------------------------

export async function buildReportData({ user, projectId, projectName }) {
  let project = null;
  let resolvedProjectId = null;

  if (projectId && String(projectId).trim()) {
    try {
      project = await getProjectById(String(projectId).trim());
      resolvedProjectId = String(project._id);
    } catch (err) {
      throw new ReportServiceError(`Project "${projectId}" was not found`, 404);
    }
  } else if (projectName && String(projectName).trim()) {
    const resolved = await resolveProjectId({ searchName: String(projectName).trim() });
    if (!resolved) throw new ReportServiceError(`Project "${projectName}" was not found`, 404);
    resolvedProjectId = String(resolved._id ?? resolved);
    try {
      project = await getProjectById(resolvedProjectId);
    } catch (err) {
      throw new ReportServiceError(`Project "${projectName}" was not found`, 404);
    }
  }

  if (!project) return { project: null, resolvedProjectId: null, data: {} };

  const tasks = await listTasksByProject(resolvedProjectId).catch(() => []);
  const issues = await listIssuesByProject(resolvedProjectId).catch(() => []);
  const planned = await listPlannedExpenses(resolvedProjectId).catch(() => []);
  const transactions = await listTransactions({ projectId: resolvedProjectId }).catch(() => []);
  const sections = await listDesignSectionsByProject(resolvedProjectId).catch(() => []);
  const references = await listDesignReferencesByProject(resolvedProjectId).catch(() => []);

  const expenses = transactions.filter((t) => t.type === "expense");
  const income = transactions.filter((t) => t.type === "income" || t.type === "payment" || t.type === "advance");
  const expenseTotal = expenses.reduce((sum, t) => sum + num(t.amount), 0);
  const incomeTotal = income.reduce((sum, t) => sum + num(t.amount), 0);

  const data = {
    project: {
      name: project.name,
      client: project.client || null,
      description: str(project.description),
      status: project.status || "planning",
      priority: project.priority || null,
      startDate: project.startDate ? String(project.startDate) : null,
      dueDate: project.dueDate ? String(project.dueDate) : null,
      budget: num(project.budget),
      projectCost: num(project.projectCost),
      domainCost: num(project.domainCost),
      advanceAmount: num(project.advanceAmount),
      paidStatus: project.paidStatus || null,
      tags: Array.isArray(project.tags) ? project.tags.map(String) : [],
      features: Array.isArray(project.features) ? project.features.map(String) : [],
    },
    stats: {
      taskCount: tasks.length,
      openTasks: tasks.filter((t) => t.status !== "done").length,
      completedTasks: tasks.filter((t) => t.status === "done").length,
      issueCount: issues.length,
      openIssues: issues.filter((t) => t.status === "open" || t.status === "in_progress").length,
      sectionCount: sections.length,
      referenceCount: references.length,
    },
    plannedExpenses: planned.map((e) => ({
      item: str(e.item),
      cost: num(e.cost),
      category: str(e.category),
    })),
    expenses: {
      estimatedTotal: num(project.projectCost),
      actualTotal: expenseTotal,
      list: expenses.slice(0, 20).map((t) => ({
        description: str(t.description),
        amount: num(t.amount),
        category: str(t.category),
        date: t.date ? String(t.date) : null,
      })),
    },
    incomeTotal,
    tasks: tasks.slice(0, 30).map((t) => ({
      title: str(t.title),
      status: t.status || "todo",
      dueDate: t.dueDate ? String(t.dueDate) : null,
    })),
  };

  return { project, resolvedProjectId, data: sanitizeReportContent(data) };
}

// ---------------------------------------------------------------------------
// Persistence helpers.
// ---------------------------------------------------------------------------

function toSummary(report) {
  const { file, fileSize, ...rest } = report;
  const clean = unwrap(rest);
  clean.hasFile = Boolean(file);
  clean.fileSize = fileSize || (file ? file.length : 0) || 0;
  return clean;
}

function asBuffer(file) {
  if (!file) return null;
  if (Buffer.isBuffer(file)) return file;
  if (file?.buffer && typeof file.buffer.length === "number") return Buffer.from(file.buffer);
  return null;
}

async function findOwnedReport(user, id) {
  const uid = userId(user);
  const col = await getCollection("reports");
  const report = await col.findOne({ _id: String(id), userId: uid });
  if (!report) throw new ReportServiceError("Report not found", 404);
  return report;
}

export async function createReport({ user, data = {} }) {
  const documentType = str(data.documentType);
  if (!REPORT_TYPES.includes(documentType)) {
    throw new ReportServiceError(`Unknown document type "${documentType}"`, 400);
  }
  const uid = userId(user);
  const projectId = data.projectId ? str(data.projectId) : null;
  let projectName = str(data.projectName);
  if (projectId && !projectName) {
    try {
      const project = await getProjectById(projectId);
      projectName = project.name;
    } catch {
      projectName = str(data.projectName);
    }
  }

  const content = normalizeReportContent(documentType, data.content || {});
  const docNumber = str(data.docNumber) || (await nextDocumentNumber(documentType));
  const id = crypto.randomUUID();
  const now = nowIso();
  const report = {
    _id: id,
    userId: uid,
    projectId,
    projectName,
    documentType,
    docNumber,
    title: content.title,
    status: "draft",
    content,
    version: 0,
    versionHistory: [],
    error: null,
    createdAt: now,
    updatedAt: now,
    generatedAt: null,
  };

  const col = await getCollection("reports");
  await col.insertOne(report);

  logActivity(uid, {
    action: "report.create",
    targetType: "report",
    targetId: id,
    target: docNumber,
    details: { documentType, projectId },
  }).catch(() => {});

  return toSummary(report);
}

export async function listReports({ user, filters = {} }) {
  const uid = userId(user);
  const filter = { userId: uid };
  if (filters.documentType && REPORT_TYPES.includes(filters.documentType)) {
    filter.documentType = filters.documentType;
  }
  if (filters.projectId) filter.projectId = String(filters.projectId);
  if (filters.status && REPORT_STATUSES.includes(filters.status)) {
    filter.status = filters.status;
  }
  const search = str(filters.search);
  if (search) {
    const pattern = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [
      { title: { $regex: pattern } },
      { docNumber: { $regex: pattern } },
      { projectName: { $regex: pattern } },
    ];
  }

  const col = await getCollection("reports");
  const sort = filters.sort === "created" ? { createdAt: -1 } : { updatedAt: -1 };
  const reports = await col.find(filter, { projection: REPORT_PROJECTION }).sort(sort).limit(200).toArray();
  return reports.map(toSummary);
}

export async function getReport({ user, id }) {
  const report = await findOwnedReport(user, id);
  return toSummary(report);
}

export async function getReportFile({ user, id }) {
  const report = await findOwnedReport(user, id);
  const buffer = asBuffer(report.file);
  if (!buffer) {
    throw new ReportServiceError("This report has no generated PDF yet. Generate the PDF first.", 400);
  }
  return { report: toSummary(report), buffer, mime: "application/pdf" };
}

export async function updateReportContent({ user, id, content }) {
  const report = await findOwnedReport(user, id);
  if (report.status === "archived") {
    throw new ReportServiceError("Archived reports cannot be edited", 400);
  }
  const documentType = report.documentType;
  const normalized = normalizeReportContent(documentType, content || {});
  const col = await getCollection("reports");
  const now = nowIso();
  const status = report.status === "failed" ? "draft" : report.status;
  await col.updateOne(
    { _id: report._id, userId: report.userId },
    {
      $set: {
        content: normalized,
        title: normalized.title,
        status,
        error: null,
        updatedAt: now,
      },
    }
  );
  logActivity(report.userId, {
    action: "report.update",
    targetType: "report",
    targetId: report._id,
    target: report.docNumber,
    details: { documentType },
  }).catch(() => {});
  return getReport({ user, id });
}

export async function generateReportPdf({ user, id }) {
  const report = await findOwnedReport(user, id);
  if (report.status === "archived") {
    throw new ReportServiceError("Archived reports cannot be regenerated", 400);
  }

  const col = await getCollection("reports");
  await col.updateOne(
    { _id: report._id, userId: report.userId },
    { $set: { status: "generating", error: null, updatedAt: nowIso() } }
  );

  let buffer;
  try {
    buffer = buildReportPdf(report);
  } catch (err) {
    await col.updateOne(
      { _id: report._id, userId: report.userId },
      { $set: { status: "failed", error: "Could not generate the PDF", updatedAt: nowIso() } }
    );
    throw new ReportServiceError("Could not generate the PDF. Please review the report content.", 500);
  }

  if (!buffer || buffer.length === 0 || buffer.length > MAX_PDF_BYTES) {
    await col.updateOne(
      { _id: report._id, userId: report.userId },
      { $set: { status: "failed", error: "Generated PDF is too large", updatedAt: nowIso() } }
    );
    throw new ReportServiceError("The generated PDF is too large", 413);
  }

  const nextVersion = Math.max(1, (report.version || 0) + 1);
  const history = Array.isArray(report.versionHistory) ? report.versionHistory : [];
  const now = nowIso();
  await col.updateOne(
    { _id: report._id, userId: report.userId },
    {
      $set: {
        status: "generated",
        file: buffer,
        fileSize: buffer.length,
        fileMime: "application/pdf",
        pdfVersion: nextVersion,
        version: nextVersion,
        generatedAt: now,
        lastGeneratedAt: now,
        error: null,
        updatedAt: now,
      },
      $push: {
        versionHistory: {
          version: nextVersion,
          generatedAt: now,
          generatedBy: userId(user),
          fileSize: buffer.length,
          docNumber: report.docNumber,
        },
      },
    }
  );

  logActivity(report.userId, {
    action: "report.generate",
    targetType: "report",
    targetId: report._id,
    target: report.docNumber,
    details: { documentType: report.documentType, version: nextVersion },
  }).catch(() => {});

  return getReport({ user, id });
}

export async function deleteReport({ user, id }) {
  const report = await findOwnedReport(user, id);
  const col = await getCollection("reports");
  await col.deleteOne({ _id: report._id, userId: report.userId });
  logActivity(report.userId, {
    action: "report.delete",
    targetType: "report",
    targetId: report._id,
    target: report.docNumber,
    details: { documentType: report.documentType },
  }).catch(() => {});
  return { ok: true, id: report._id };
}

export async function setReportStatus({ user, id, status }) {
  if (!REPORT_STATUSES.includes(status)) {
    throw new ReportServiceError(`Unknown status "${status}"`, 400);
  }
  const report = await findOwnedReport(user, id);
  const col = await getCollection("reports");
  const now = nowIso();
  const nextStatus = status === "archived" ? "archived" : report.file ? "generated" : "draft";
  await col.updateOne(
    { _id: report._id, userId: report.userId },
    { $set: { status: nextStatus, updatedAt: now } }
  );
  return getReport({ user, id });
}

// ---------------------------------------------------------------------------
// AI-assisted drafting.
// ---------------------------------------------------------------------------

export async function generateReportDraftFromAI({ user, documentType, projectId, projectName, notes, purpose }) {
  if (!REPORT_TYPES.includes(documentType)) {
    throw new ReportServiceError(`Unknown document type "${documentType}"`, 400);
  }
  const { resolvedProjectId, data } = await buildReportData({ user, projectId, projectName });

  const prompt = {
    documentType,
    notes: str(notes) || str(purpose),
    data,
  };

  let content;
  try {
    const { generateReportContent } = await import("./gemini.js");
    content = await generateReportContent({ user, prompt });
  } catch (err) {
    if (err instanceof ReportServiceError) throw err;
    throw new ReportServiceError(
      err?.message || "The AI could not generate this report. Please try again.",
      err?.status || 502
    );
  }

  const now = nowIso();
  const id = crypto.randomUUID();
  const docNumber = await nextDocumentNumber(documentType);
  const normalized = normalizeReportContent(documentType, content);
  normalized.documentMeta.docNumber = normalized.documentMeta.docNumber || docNumber;

  const report = {
    _id: id,
    userId: userId(user),
    projectId: resolvedProjectId,
    projectName: resolvedProjectId ? data.project?.name : null,
    documentType,
    docNumber: normalized.documentMeta.docNumber || docNumber,
    title: normalized.title,
    status: "draft",
    content: normalized,
    version: 0,
    versionHistory: [],
    error: null,
    createdAt: now,
    updatedAt: now,
    generatedAt: null,
  };

  const col = await getCollection("reports");
  await col.insertOne(report);

  logActivity(report.userId, {
    action: "report.create",
    targetType: "report",
    targetId: id,
    target: report.docNumber,
    details: { documentType, ai: true },
  }).catch(() => {});

  return toSummary(report);
}