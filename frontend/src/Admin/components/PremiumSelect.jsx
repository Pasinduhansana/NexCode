import { useEffect, useRef, useState } from "react";
import { HiChevronDown, HiCheck } from "react-icons/hi";

export default function PremiumSelect({
  value,
  onChange,
  options,
  placeholder = "Select",
  icon: Icon,
  compact = false,
  title,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title={title}
        className={
          compact
            ? "flex w-full items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-left text-[11px] font-medium text-foreground transition-colors hover:border-primary/40"
            : "flex h-10 w-full items-center gap-2 rounded-lg border border-border bg-background px-3.5 text-left text-sm font-medium text-foreground transition-colors hover:border-primary/40"
        }
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {Icon && <Icon size={compact ? 12 : 16} className={`shrink-0 ${compact ? "text-text_muted" : "text-primary"}`} />}
        <span className="flex-1 truncate">{selected ? selected.label : placeholder}</span>
        <HiChevronDown
          size={compact ? 12 : 16}
          className={`shrink-0 text-text_muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className={`absolute z-30 mt-2 w-full overflow-y-auto rounded-xl border border-border bg-card p-1.5 shadow-xl ${
            compact ? "max-h-60 min-w-[140px]" : "max-h-72 min-w-[180px]"
          }`}
        >
          {options.map((o) => {
            const active = o.value === value;
            return (
              <button
                key={String(o.value)}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg text-left transition-colors ${
                  compact ? "px-2 py-1.5 text-[11px]" : "px-3 py-2 text-sm"
                } ${active ? "bg-primary/10 font-semibold text-primary" : "text-foreground hover:bg-muted"}`}
              >
                {o.dot && <span className={`h-2 w-2 shrink-0 rounded-full ${o.dot}`} />}
                <span className="flex-1 truncate">{o.label}</span>
                {active && <HiCheck size={compact ? 12 : 16} className="shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
