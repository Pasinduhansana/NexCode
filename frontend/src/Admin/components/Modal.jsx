import { useEffect } from "react";
import { HiX } from "react-icons/hi";

let openModalCount = 0;

export default function Modal({ open, title, subtitle, onClose, children, size = "max-w-lg" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    openModalCount += 1;
    if (openModalCount === 1) document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      openModalCount = Math.max(0, openModalCount - 1);
      if (openModalCount === 0) document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`w-full ${size} max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-card px-6 py-4">
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
            {subtitle && <p className="mt-0.5 text-sm text-text_secondary">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-text_secondary hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <HiX size={20} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
