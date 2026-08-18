import { forwardRef, memo, useEffect, useRef } from "react";
import { HiOutlinePaperAirplane, HiOutlineStop } from "react-icons/hi";

const ChatInput = forwardRef(function ChatInput({ value, onChange, onSend, onStop, isTyping }, inputRef) {
  const textareaRef = useRef(null);

  const ref = (node) => {
    textareaRef.current = node;
    if (typeof inputRef === "function") inputRef(node);
    else if (inputRef) inputRef.current = node;
  };

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isTyping && value.trim()) onSend(value);
    }
  };

  const canSend = value.trim().length > 0 && !isTyping;

  return (
    <div className="border-t border-border bg-card/60 p-3 sm:p-4">
      <div className="flex items-end gap-2 rounded-2xl border border-border bg-background p-2 transition-colors focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10">
        <textarea
          ref={ref}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the AI Assistant something…"
          aria-label="Message to the AI Assistant"
          aria-describedby="assistant-chat-hint"
          className="max-h-[140px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-foreground placeholder:text-text_muted focus:outline-none"
        />
        {isTyping ? (
          <button
            type="button"
            onClick={onStop}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 transition-colors hover:bg-rose-500/20"
            aria-label="Stop generating"
            title="Stop generating"
          >
            <HiOutlineStop size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSend(value)}
            disabled={!canSend}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-colors hover:bg-primary_hover disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send message"
          >
            <HiOutlinePaperAirplane size={16} className={canSend ? "-rotate-45" : ""} />
          </button>
        )}
      </div>
      <div id="assistant-chat-hint" className="mt-1.5 hidden text-center text-[11px] text-text_muted sm:block">
        {isTyping ? "The assistant is working — stop to interrupt" : "Press Enter to send · Shift + Enter for a new line"}
      </div>
    </div>
  );
});

export default memo(ChatInput);
