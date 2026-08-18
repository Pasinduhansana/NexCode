import adminApi from "./adminApi";

export const REPORT_TYPES = ["invoice", "quotation", "proposal", "manual", "other"];
export const REPORT_TYPE_LABELS = {
  invoice: "Payment Invoice",
  quotation: "Price Quotation",
  proposal: "Project Proposal",
  manual: "Project Manual",
  other: "Report",
};
export const REPORT_STATUSES = ["draft", "generating", "generated", "failed", "archived"];
export const STATUS_LABELS = {
  draft: "Draft",
  generating: "Generating",
  generated: "Generated",
  failed: "Failed",
  archived: "Archived",
};

export async function listReports(filters = {}) {
  const { data } = await adminApi.get("/reports", { params: filters });
  return Array.isArray(data) ? data : [];
}

export async function getReport(id) {
  const { data } = await adminApi.get(`/reports/${id}`);
  return data;
}

export async function createReport(payload) {
  const { data } = await adminApi.post("/reports", payload);
  return data;
}

export async function updateReportContent(id, content) {
  const { data } = await adminApi.patch(`/reports/${id}`, { content });
  return data;
}

export async function generateReportPdf(id) {
  const { data } = await adminApi.post(`/reports/${id}/generate`);
  return data;
}

export async function deleteReport(id) {
  const { data } = await adminApi.delete(`/reports/${id}`);
  return data;
}

export async function setReportStatus(id, status) {
  const { data } = await adminApi.put(`/reports/${id}`, { status });
  return data;
}

export async function generateReportDraft(payload) {
  const { data } = await adminApi.post("/reports/ai", payload);
  return data;
}

export function reportFileUrl(id) {
  return `/api/reports/${id}/file`;
}

export async function fetchReportFile(id) {
  const { data } = await adminApi.get(`/reports/${id}/file`, { responseType: "blob" });
  return data;
}

export function formatAmount(value) {
  const n = Number(value) || 0;
  return `LKR ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}