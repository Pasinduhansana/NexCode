"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineDocumentText,
  HiOutlineSparkles,
  HiOutlineEye,
  HiOutlineDownload,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineArchive,
  HiOutlineArrowUp,
  HiOutlineArrowDown,
  HiOutlineChatAlt2,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentReport,
  HiOutlineBookOpen,
  HiOutlineClipboardList,
} from "react-icons/hi";
import usePageTitle from "../../utils/usePageTitle";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import PremiumSelect from "../components/PremiumSelect";
import GenerateReportModal from "../components/Reporting/GenerateReportModal";
import ReportPreviewModal from "../components/Reporting/ReportPreviewModal";
import {
  listReports,
  deleteReport,
  setReportStatus,
  generateReportPdf,
  fetchReportFile,
  REPORT_TYPE_LABELS,
  STATUS_LABELS,
  formatAmount,
  formatDate,
} from "../utils/reportingApi";
import { listProjects } from "../utils/designerApi";

const GENERATORS = [
  { type: "invoice", label: "Payment Invoice", desc: "Bill a client for completed work", icon: HiOutlineCurrencyDollar },
  { type: "quotation", label: "Price Quotation", desc: "Quote a price before starting work", icon: HiOutlineDocumentReport },
  { type: "proposal", label: "Project Proposal", desc: "Scope, timeline & investment plan", icon: HiOutlineBookOpen },
  { type: "manual", label: "Project Manual", desc: "Handover documentation for the client", icon: HiOutlineClipboardList },
  { type: "other", label: "Other Report", desc: "Any other professional document", icon: HiOutlineDocumentText },
];

const STATUS_STYLES = {
  draft: "bg-muted text-text_secondary",
  generating: "bg-amber-500/10 text-amber-600",
  generated: "bg-emerald-500/10 text-emerald-600",
  failed: "bg-rose-500/10 text-rose-500",
  archived: "bg-muted text-text_muted",
};

const TYPE_COLORS = {
  invoice: "bg-blue-500/10 text-blue-500",
  quotation: "bg-violet-500/10 text-violet-500",
  proposal: "bg-emerald-500/10 text-emerald-600",
  manual: "bg-amber-500/10 text-amber-600",
  other: "bg-muted text-text_secondary",
};

export default function AdminReportingPage() {
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("updated");

  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [generatorType, setGeneratorType] = useState("invoice");
  const [editing, setEditing] = useState(null);
  const [previewing, setPreviewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  usePageTitle("Reporting");

  const fetchProjects = useCallback(async () => {
    try {
      const data = await listProjects();
      setProjects(data);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to load projects");
    }
  }, []);

  const fetchReports = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setReportsLoading(true);
    try {
      const data = await listReports({
        documentType: typeFilter !== "all" ? typeFilter : undefined,
        projectId: projectFilter !== "all" ? projectFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: search.trim() || undefined,
        sort,
      });
      setReports(data);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to load reports");
    } finally {
      if (!silent) setReportsLoading(false);
      setLoading(false);
    }
  }, [typeFilter, projectFilter, statusFilter, search, sort]);

  useEffect(() => {
    fetchProjects();
    fetchReports({ silent: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchReports({ silent: true }), 350);
    return () => clearTimeout(timer);
  }, [search, typeFilter, projectFilter, statusFilter, sort, fetchReports]);

  const openGenerator = (type) => {
    setGeneratorType(type);
    setGeneratorOpen(true);
  };

  const handleRegenerate = async (report) => {
    try {
      const updated = await generateReportPdf(report._id);
      setReports((prev) => prev.map((r) => (String(r._id) === String(updated._id) ? updated : r)));
      toast.success("PDF regenerated");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Could not regenerate the PDF");
    }
  };

  const handleDownload = async (report) => {
    try {
      const blob = await fetchReportFile(report._id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.docNumber || "report"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Could not download the PDF");
    }
  };

  const handleToggleArchive = async (report) => {
    try {
      const updated = await setReportStatus(report._id, report.status === "archived" ? "draft" : "archived");
      setReports((prev) => prev.map((r) => (String(r._id) === String(updated._id) ? updated : r)));
      toast.success(report.status === "archived" ? "Report restored" : "Report archived");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Could not update the report");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeletingLoading(true);
    try {
      await deleteReport(deleting._id);
      setReports((prev) => prev.filter((r) => String(r._id) !== String(deleting._id)));
      toast.success("Report deleted");
      setDeleting(null);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Could not delete the report");
    } finally {
      setDeletingLoading(false);
    }
  };

  const projectName = useMemo(() => {
    const map = {};
    for (const p of projects) map[String(p._id)] = p.name;
    return (id) => map[String(id)] || null;
  }, [projects]);

  const filteredReports = useMemo(() => {
    let list = reports;
    if (sort === "created") {
      list = [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sort === "title") {
      list = [...list].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }
    return list;
  }, [reports, sort]);

  if (loading) return <Spinner label="Loading reporting..." />;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">Reporting</h1>
          <p className="mt-1 text-sm text-text_secondary">
            Generate professional invoices, quotations, proposals and manuals as downloadable PDFs.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/assistant"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <HiOutlineChatAlt2 size={16} className="text-primary" />
            <span className="hidden sm:inline">Ask AI</span>
          </Link>
          <button
            type="button"
            onClick={() => fetchReports({ silent: false })}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <HiOutlineRefresh size={16} className="text-primary" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Document generator */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <HiOutlineSparkles size={15} className="text-primary" />
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-text_muted">Document Generator</h2>
          <span className="h-px flex-1 bg-border" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {GENERATORS.map((gen) => {
            const Icon = gen.icon;
            return (
              <button
                key={gen.type}
                type="button"
                onClick={() => openGenerator(gen.type)}
                className="group relative flex flex-col items-start gap-3 overflow-hidden rounded-2xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Icon size={20} />
                </div>
                <div>
                  <div className="font-display text-sm font-bold text-foreground">{gen.label}</div>
                  <div className="mt-0.5 text-[11px] leading-snug text-text_secondary">{gen.desc}</div>
                </div>
                <span className="absolute right-3 top-3 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text_muted">
                  {gen.type}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Reports list */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <HiOutlineSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text_muted" />
              <input
                className="input-field pl-9"
                placeholder="Search title, document number, project..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <PremiumSelect
                compact
                className="min-w-[130px]"
                value={typeFilter}
                onChange={setTypeFilter}
                options={[
                  { value: "all", label: "All types" },
                  ...Object.entries(REPORT_TYPE_LABELS).map(([value, label]) => ({ value, label })),
                ]}
              />
              <PremiumSelect
                compact
                className="min-w-[150px]"
                value={projectFilter}
                onChange={setProjectFilter}
                options={[
                  { value: "all", label: "All projects" },
                  { value: "none", label: "Standalone" },
                  ...projects.map((p) => ({ value: String(p._id), label: p.name })),
                ]}
              />
              <PremiumSelect
                compact
                className="min-w-[120px]"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "all", label: "All statuses" },
                  ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
                ]}
              />
              <PremiumSelect
                compact
                className="min-w-[140px]"
                value={sort}
                onChange={setSort}
                options={[
                  { value: "updated", label: "Recently updated" },
                  { value: "created", label: "Recently created" },
                  { value: "title", label: "Title A–Z" },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="bg-page-alt/40 p-4 sm:p-5">
          {reportsLoading ? (
            <Spinner label="Loading reports..." />
          ) : filteredReports.length === 0 ? (
            <EmptyState
              icon={HiOutlineDocumentText}
              title="No reports yet"
              description={
                search || typeFilter !== "all" || projectFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your search or filters."
                  : "Generate your first invoice, quotation, proposal or manual above, or ask the AI Assistant to draft one."
              }
              action={
                !search && typeFilter === "all" && projectFilter === "all" && statusFilter === "all" ? (
                  <button
                    type="button"
                    onClick={() => openGenerator("invoice")}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary_hover"
                  >
                    <HiOutlinePlus size={16} />
                    Create a document
                  </button>
                ) : null
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
              {filteredReports.map((report) => {
                const Icon = GENERATORS.find((g) => g.type === report.documentType)?.icon || HiOutlineDocumentText;
                const status = report.status === "generating" ? (
                  <span className="inline-flex items-center gap-1.5 text-amber-600">
                    <span className="h-2.5 w-2.5 rounded-full border-2 border-amber-500/40 border-t-amber-500 animate-spin" />
                    Generating
                  </span>
                ) : (
                  STATUS_LABELS[report.status] || report.status
                );
                return (
                  <div
                    key={String(report._id)}
                    className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TYPE_COLORS[report.documentType] || "bg-muted text-text_secondary"}`}>
                        <Icon size={19} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-display text-sm font-bold text-foreground">
                            {report.title || REPORT_TYPE_LABELS[report.documentType]}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-text_muted">
                          <span className="font-mono font-medium text-text_secondary">{report.docNumber}</span>
                          {report.pdfVersion && <span>· v{report.pdfVersion}</span>}
                        </div>
                        <div className="mt-1 truncate text-xs text-text_secondary">
                          {projectName(report.projectId) || report.projectName || "Standalone document"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_STYLES[report.status] || "bg-muted text-text_secondary"}`}>
                        {status}
                      </span>
                      <span className="text-[11px] text-text_muted">{formatDate(report.updatedAt)}</span>
                    </div>

                    {report.status === "generated" && (
                      <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-text_secondary">
                        <span className="font-medium text-foreground">{formatAmount(report.content?.pricing?.total)}</span>
                        {report.content?.pricing?.balance != null && report.content.pricing.balance > 0 && (
                          <span className="text-rose-500"> · balance {formatAmount(report.content.pricing.balance)}</span>
                        )}
                        {report.fileSize > 0 && <span> · {Math.round(report.fileSize / 1024)} KB</span>}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
                      {report.status === "generated" && (
                        <>
                          <button
                            type="button"
                            onClick={() => setPreviewing(report)}
                            className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                          >
                            <HiOutlineEye size={13} /> Preview
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownload(report)}
                            className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary_hover"
                          >
                            <HiOutlineDownload size={13} /> Download
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditing(report)}
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                      >
                        <HiOutlinePencilAlt size={13} /> Edit
                      </button>
                      {report.status !== "archived" && (
                        <button
                          type="button"
                          onClick={() => handleRegenerate(report)}
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                          title="Generate a new PDF version"
                        >
                          <HiOutlineRefresh size={13} className="text-primary" /> Regenerate
                        </button>
                      )}
                      <div className="ml-auto flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleArchive(report)}
                          className="rounded-lg p-1.5 text-text_secondary transition-colors hover:bg-muted hover:text-foreground"
                          title={report.status === "archived" ? "Restore" : "Archive"}
                        >
                          {report.status === "archived" ? <HiOutlineArrowUp size={14} /> : <HiOutlineArchive size={14} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(report)}
                          className="rounded-lg p-1.5 text-text_secondary transition-colors hover:bg-rose-500/10 hover:text-rose-500"
                          title="Delete"
                        >
                          <HiOutlineTrash size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <GenerateReportModal
        open={generatorOpen}
        documentType={generatorType}
        projects={projects}
        onClose={() => setGeneratorOpen(false)}
        onSaved={() => fetchReports({ silent: false })}
      />

      <GenerateReportModal
        open={Boolean(editing)}
        documentType={editing?.documentType || "other"}
        projects={projects}
        initialReport={editing}
        onClose={() => setEditing(null)}
        onSaved={() => fetchReports({ silent: false })}
      />
      <ReportPreviewModal
        open={Boolean(previewing)}
        report={previewing}
        onClose={() => setPreviewing(null)}
        onRegenerate={(report) => {
          setPreviewing(null);
          handleRegenerate(report);
        }}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete report?"
        message={deleting ? `Permanently delete ${deleting.docNumber} (${REPORT_TYPE_LABELS[deleting.documentType]}) and its PDF? This cannot be undone.` : ""}
        loading={deletingLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}