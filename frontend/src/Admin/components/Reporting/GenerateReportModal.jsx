import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlineTrash, HiOutlineSparkles, HiOutlineDocumentText, HiOutlineCheck } from "react-icons/hi";
import Modal from "../Modal";
import PremiumSelect from "../PremiumSelect";
import {
  generateReportDraft,
  createReport,
  updateReportContent,
  generateReportPdf,
  formatAmount,
} from "../../utils/reportingApi";

const EMPTY_ITEMS = [{ description: "", qty: 1, unitPrice: 0 }];

function numOrZero(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function splitLines(value) {
  if (Array.isArray(value)) return value;
  return String(value || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function ReportContentForm({ report, content, onChange }) {
  const type = report?.documentType || "other";
  const isInvoiceOrQuotation = type === "invoice" || type === "quotation";
  const isManual = type === "manual";

  const setField = (path, value) => {
    const next = JSON.parse(JSON.stringify(content));
    const keys = path.split(".");
    let target = next;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!target[keys[i]] || typeof target[keys[i]] !== "object") target[keys[i]] = {};
      target = target[keys[i]];
    }
    target[keys[keys.length - 1]] = value;
    onChange(next);
  };

  const items = Array.isArray(content.items) && content.items.length ? content.items : EMPTY_ITEMS;
  const timeline = Array.isArray(content.timeline) ? content.timeline : [];
  const sections = Array.isArray(content.sections) ? content.sections : [];
  const pricing = content.pricing || {};

  const itemsTotal = useMemo(
    () => items.reduce((sum, item) => sum + numOrZero(item.amount || item.qty * item.unitPrice), 0),
    [items]
  );

  const updateItem = (index, patch) => {
    const next = items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    const total = next.reduce((sum, item) => sum + numOrZero(item.amount || item.qty * item.unitPrice), 0);
    const amount = numOrZero(pricing.total) || total;
    onChange({ ...content, items: next, pricing: { ...pricing, total: amount, subtotal: amount } });
  };

  const label = "input-field w-full";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Title</label>
          <input className={label} value={content.title || ""} onChange={(e) => setField("title", e.target.value)} />
        </div>
        <div>
          <label className="label">Subtitle</label>
          <input className={label} value={content.subtitle || ""} onChange={(e) => setField("subtitle", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="label">Date</label>
          <input className={label} value={content.documentMeta?.date || ""} onChange={(e) => setField("documentMeta.date", e.target.value)} placeholder="e.g. 2026-08-18" />
        </div>
        {isInvoiceOrQuotation && (
          <div>
            <label className="label">{type === "invoice" ? "Due Date" : "Valid Until"}</label>
            <input className={label} value={content.documentMeta?.dueDate || content.documentMeta?.validUntil || ""} onChange={(e) => setField(type === "invoice" ? "documentMeta.dueDate" : "documentMeta.validUntil", e.target.value)} />
          </div>
        )}
        <div>
          <label className="label">Currency</label>
          <input className={label} value={content.documentMeta?.currency || "LKR"} onChange={(e) => setField("documentMeta.currency", e.target.value)} />
        </div>
        <div>
          <label className="label">Prepared By</label>
          <input className={label} value={content.documentMeta?.preparedBy || ""} onChange={(e) => setField("documentMeta.preparedBy", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Client name</label>
          <input className={label} value={content.client?.name || ""} onChange={(e) => setField("client.name", e.target.value)} />
        </div>
        <div>
          <label className="label">Client company</label>
          <input className={label} value={content.client?.company || ""} onChange={(e) => setField("client.company", e.target.value)} />
        </div>
        <div>
          <label className="label">Client email</label>
          <input className={label} value={content.client?.email || ""} onChange={(e) => setField("client.email", e.target.value)} />
        </div>
        <div>
          <label className="label">Client phone</label>
          <input className={label} value={content.client?.phone || ""} onChange={(e) => setField("client.phone", e.target.value)} />
        </div>
      </div>

      <div>
        <label className="label">Introduction</label>
        <textarea
          className={`${label} min-h-[72px] resize-y`}
          value={content.introduction || ""}
          onChange={(e) => setField("introduction", e.target.value)}
        />
      </div>

      {isInvoiceOrQuotation && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="label mb-0">Line items</label>
            <button
              type="button"
              onClick={() => onChange({ ...content, items: [...items, { description: "", qty: 1, unitPrice: 0 }] })}
              className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20"
            >
              <HiOutlinePlus size={13} /> Add item
            </button>
          </div>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  className="input-field flex-1"
                  placeholder="Description"
                  value={item.description || ""}
                  onChange={(e) => updateItem(index, { description: e.target.value })}
                />
                <input
                  className="input-field w-16"
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={item.qty ?? 1}
                  onChange={(e) => updateItem(index, { qty: numOrZero(e.target.value) })}
                />
                <input
                  className="input-field w-32"
                  type="number"
                  min="0"
                  placeholder="Unit price"
                  value={item.unitPrice ?? 0}
                  onChange={(e) => updateItem(index, { unitPrice: numOrZero(e.target.value) })}
                />
                <span className="w-28 shrink-0 text-right text-xs text-text_muted">{formatAmount(numOrZero(item.amount || item.qty * item.unitPrice))}</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = items.filter((_, i) => i !== index);
                    onChange({ ...content, items: next.length ? next : EMPTY_ITEMS });
                  }}
                  className="rounded-lg p-1.5 text-text_secondary hover:bg-rose-500/10 hover:text-rose-500"
                  aria-label="Remove item"
                >
                  <HiOutlineTrash size={14} />
                </button>
              </div>
            ))}
            <div className="flex justify-end border-t border-border pt-2 text-sm font-semibold text-foreground">
              Total: {formatAmount(itemsTotal)}
            </div>
          </div>
        </div>
      )}

      {isInvoiceOrQuotation && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          <div>
            <label className="label">Paid</label>
            <input className={label} type="number" min="0" value={pricing.paid ?? 0} onChange={(e) => setField("pricing.paid", numOrZero(e.target.value))} />
          </div>
          <div>
            <label className="label">Discount</label>
            <input className={label} type="number" min="0" value={pricing.discount ?? 0} onChange={(e) => setField("pricing.discount", numOrZero(e.target.value))} />
          </div>
          <div>
            <label className="label">Taxes</label>
            <input className={label} type="number" min="0" value={pricing.taxes ?? 0} onChange={(e) => setField("pricing.taxes", numOrZero(e.target.value))} />
          </div>
          <div>
            <label className="label">Total</label>
            <input className={label} type="number" min="0" value={pricing.total ?? itemsTotal} onChange={(e) => setField("pricing.total", numOrZero(e.target.value))} />
          </div>
          <div>
            <label className="label">Balance</label>
            <input className={label} type="number" min="0" value={pricing.balance ?? 0} onChange={(e) => setField("pricing.balance", numOrZero(e.target.value))} />
          </div>
          <div>
            <label className="label">Currency</label>
            <input className={label} value={pricing.currency || "LKR"} onChange={(e) => setField("pricing.currency", e.target.value)} />
          </div>
        </div>
      )}

      <div>
        <label className="label">Features / scope (one per line)</label>
        <textarea
          className={`${label} min-h-[72px] resize-y`}
          value={(content.features || []).join("\n")}
          onChange={(e) => onChange({ ...content, features: splitLines(e.target.value) })}
        />
      </div>

      {(type === "proposal" || type === "manual") && (
        <div>
          <label className="label">Timeline (phase | description | timeline)</label>
          {timeline.length === 0 ? (
            <button
              type="button"
              onClick={() => onChange({ ...content, timeline: [{ phase: "", description: "", timeline: "" }] })}
              className="rounded-lg border border-dashed border-border px-3 py-2 text-xs font-medium text-text_secondary hover:bg-muted"
            >
              Add timeline row
            </button>
          ) : (
            <div className="space-y-2">
              {timeline.map((row, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input className="input-field flex-[1.4]" placeholder="Phase" value={row.phase || ""} onChange={(e) => onChange({ ...content, timeline: timeline.map((r, i) => (i === index ? { ...r, phase: e.target.value } : r)) })} />
                  <input className="input-field flex-[2]" placeholder="Description" value={row.description || ""} onChange={(e) => onChange({ ...content, timeline: timeline.map((r, i) => (i === index ? { ...r, description: e.target.value } : r)) })} />
                  <input className="input-field flex-1" placeholder="Timeline" value={row.timeline || ""} onChange={(e) => onChange({ ...content, timeline: timeline.map((r, i) => (i === index ? { ...r, timeline: e.target.value } : r)) })} />
                  <button type="button" onClick={() => onChange({ ...content, timeline: timeline.filter((_, i) => i !== index) })} className="rounded-lg p-1.5 text-text_secondary hover:bg-rose-500/10 hover:text-rose-500" aria-label="Remove"><HiOutlineTrash size={14} /></button>
                </div>
              ))}
              <button type="button" onClick={() => onChange({ ...content, timeline: [...timeline, { phase: "", description: "", timeline: "" }] })} className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20">
                <HiOutlinePlus size={13} /> Add row
              </button>
            </div>
          )}
        </div>
      )}

      {isManual && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="label mb-0">Manual sections</label>
            <button
              type="button"
              onClick={() => onChange({ ...content, sections: [...sections, { heading: "", body: "" }] })}
              className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20"
            >
              <HiOutlinePlus size={13} /> Add section
            </button>
          </div>
          <div className="space-y-3">
            {sections.map((section, index) => (
              <div key={index} className="rounded-xl border border-border bg-muted/40 p-3">
                <div className="flex items-center gap-2">
                  <input className="input-field flex-1" placeholder="Section heading" value={section.heading || ""} onChange={(e) => onChange({ ...content, sections: sections.map((s, i) => (i === index ? { ...s, heading: e.target.value } : s)) })} />
                  <button type="button" onClick={() => onChange({ ...content, sections: sections.filter((_, i) => i !== index) })} className="rounded-lg p-1.5 text-text_secondary hover:bg-rose-500/10 hover:text-rose-500" aria-label="Remove"><HiOutlineTrash size={14} /></button>
                </div>
                <textarea className={`${label} mt-2 min-h-[64px] resize-y`} placeholder="Section body" value={section.body || ""} onChange={(e) => onChange({ ...content, sections: sections.map((s, i) => (i === index ? { ...s, body: e.target.value } : s)) })} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="label">Notes (one per line)</label>
        <textarea
          className={`${label} min-h-[64px] resize-y`}
          value={(content.notes || []).join("\n")}
          onChange={(e) => onChange({ ...content, notes: splitLines(e.target.value) })}
        />
      </div>
    </div>
  );
}

export default function GenerateReportModal({ open, documentType, projects, onClose, onSaved, initialReport }) {
  const [step, setStep] = useState("setup");
  const [projectId, setProjectId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [content, setContent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(false);
      if (initialReport) {
        setReport(initialReport);
        setContent(initialReport.content || {});
        setStep("editor");
      } else {
        setStep("setup");
        setProjectId("");
        setNotes("");
        setReport(null);
        setContent(null);
      }
    }
  }, [open, initialReport]);

  const handleDraft = async (mode) => {
    setLoading(true);
    try {
      let created;
      if (mode === "ai") {
        created = await generateReportDraft({
          documentType,
          projectId: projectId || undefined,
          notes: notes.trim() || undefined,
        });
        toast.success("AI drafted the report");
      } else {
        created = await createReport({
          documentType,
          projectId: projectId || undefined,
          content: {},
        });
        toast.success("Blank draft created");
      }
      setReport(created);
      setContent(created.content || {});
      setStep("editor");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Could not create the report");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!report) return;
    setSaving(true);
    try {
      const updated = await updateReportContent(report._id, content);
      setReport(updated);
      toast.success("Report saved");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Could not save the report");
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!report) return;
    setGenerating(true);
    try {
      const updatedContent = await updateReportContent(report._id, content);
      const updated = await generateReportPdf(report._id);
      setReport(updated);
      setContent(updated.content || updatedContent.content || content);
      toast.success(`PDF generated (${updated.docNumber})`);
      onSaved?.(updated);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Could not generate the PDF");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="max-w-3xl"
      title={step === "setup" ? "Create new report" : `Edit ${report?.docNumber || "draft"}`}
      subtitle={step === "setup" ? "Draft the content with AI or start from scratch, then generate a professional PDF." : "Adjust the content, then generate the final PDF."}
    >
      {step === "setup" ? (
        <div className="space-y-4">
          <div>
            <label className="label">Project (optional)</label>
            <PremiumSelect
              className="w-full"
              value={projectId}
              onChange={setProjectId}
              options={[
                { value: "", label: "No project (standalone document)" },
                ...projects.map((p) => ({ value: String(p._id), label: p.name })),
              ]}
            />
          </div>
          <div>
            <label className="label">Instructions for the AI (optional)</label>
            <textarea
              className="input-field min-h-[72px] w-full resize-y"
              placeholder="e.g. Include a 20% advance, valid for 30 days, payment terms net 14..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleDraft("ai")}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary_hover disabled:opacity-50"
            >
              {loading ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <HiOutlineSparkles size={17} />}
              Generate with AI
            </button>
            <button
              type="button"
              onClick={() => handleDraft("manual")}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              {loading ? <span className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" /> : <HiOutlineDocumentText size={17} />}
              Start from scratch
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
            <HiOutlineCheck size={18} className="shrink-0 text-primary" />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">
                {report?.docNumber} <span className="font-normal text-text_secondary">· draft</span>
              </div>
              <div className="truncate text-xs text-text_secondary">
                {report?.projectName || "Standalone document"}
              </div>
            </div>
          </div>

          <ReportContentForm report={report} content={content || {}} onChange={setContent} />

          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || generating}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              {saving ? <span className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" /> : <HiOutlineDocumentText size={16} />}
              Save draft
            </button>
            <button
              type="button"
              onClick={handleGeneratePdf}
              disabled={saving || generating}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary_hover disabled:opacity-50"
            >
              {generating ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <HiOutlineSparkles size={16} />}
              Generate PDF
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}