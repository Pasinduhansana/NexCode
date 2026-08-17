import { HiOutlineSparkles } from "react-icons/hi";

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-text_secondary">
        <HiOutlineSparkles size={16} />
      </div>
      <div className="flex flex-col items-start">
        <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3">
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:300ms]" />
        </div>
        <div className="mt-1 text-[11px] text-text_muted">AI Assistant is typing…</div>
      </div>
    </div>
  );
}