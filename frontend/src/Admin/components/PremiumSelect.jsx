import { useEffect, useRef, useState } from "react";
import { HiChevronDown, HiCheck } from "react-icons/hi";

export default function PremiumSelect({ value, onChange, options, placeholder = "Select", icon: Icon, className = "" }) {
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
        className="flex w-full items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-left text-sm font-medium text-foreground shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {Icon && <Icon size={16} className="shrink-0 text-primary" />}
        <span className="flex-1 truncate">{selected ? selected.label : placeholder}</span>
        <HiChevronDown size={16} className={`shrink-0 text-text_muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 max-h-72 w-full min-w-[180px] overflow-y-auto rounded-xl border border-border bg-card p-1.5 shadow-xl">
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
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  active ? "bg-primary/10 font-semibold text-primary" : "text-foreground hover:bg-muted"
                }`}
              >
                {o.dot && <span className={`h-2 w-2 rounded-full ${o.dot}`} />}
                <span className="flex-1 truncate">{o.label}</span>
                {active && <HiCheck size={16} className="shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
