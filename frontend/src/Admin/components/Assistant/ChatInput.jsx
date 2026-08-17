import { useEffect, useRef } from "react";
import { HiOutlinePaperAirplane } from "react-icons/hi";

export default function ChatInput({ value, onChange, onSend, disabled }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) onSend(value);
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="border-t border-border bg-card/60 p-3 sm:p-4">
      <div className="flex items-end gap-2 rounded-2xl border border-border bg-background p-2 transition-colors focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the AI Assistant something…"
          className="max-h-[140px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-foreground placeholder:text-text_muted focus:outline-none"
        />
        <button
          type="button"
          onClick={() => onSend(value)}
          disabled={!canSend}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-colors hover:bg-primary_hover disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Send message"
        >
          <HiOutlinePaperAirplane size={16} className={disabled ? "" : "-rotate-45"} />
        </button>
      </div>
      <div className="mt-1.5 hidden text-center text-[11px] text-text_muted sm:block">
        Press Enter to send · Shift + Enter for a new line
      </div>
    </div>
  );
}