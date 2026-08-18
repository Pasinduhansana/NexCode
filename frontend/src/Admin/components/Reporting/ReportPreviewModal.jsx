import { useEffect, useState } from "react";
import { HiOutlineDownload, HiOutlineRefresh } from "react-icons/hi";
import Modal from "../Modal";
import Spinner from "../Spinner";
import { fetchReportFile } from "../../utils/reportingApi";

export default function ReportPreviewModal({ open, report, onClose, onRegenerate }) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let objectUrl = null;
    if (open && report) {
      setLoading(true);
      setError("");
      setUrl(null);
      fetchReportFile(report._id)
        .then((blob) => {
          objectUrl = URL.createObjectURL(blob);
          setUrl(objectUrl);
        })
        .catch((err) => {
          setError(err?.response?.data?.error || "Could not load the PDF preview");
        })
        .finally(() => setLoading(false));
    }
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, report]);

  const handleDownload = () => {
    if (!url || !report) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.docNumber || "report"}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="max-w-4xl"
      title={report ? `${report.docNumber} · ${report.title || "Report"}` : "Preview"}
      subtitle={report ? `Version ${report.pdfVersion || report.version || "—"} · Generated ${new Date(report.generatedAt || report.updatedAt || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}` : ""}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={!url}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary_hover disabled:opacity-50"
        >
          <HiOutlineDownload size={16} />
          Download PDF
        </button>
        {onRegenerate && (
          <button
            type="button"
            onClick={() => onRegenerate(report)}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <HiOutlineRefresh size={16} className="text-primary" />
            Regenerate
          </button>
        )}
      </div>

      <div className="h-[70vh] overflow-hidden rounded-xl border border-border bg-muted/40">
        {loading ? (
          <Spinner label="Loading PDF preview..." />
        ) : error ? (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-rose-500">{error}</div>
        ) : url ? (
          <iframe title="Report preview" src={url} className="h-full w-full" />
        ) : null}
      </div>
    </Modal>
  );
}