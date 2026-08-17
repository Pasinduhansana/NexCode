import { useEffect, useState } from "react";
import { HiOutlineSparkles } from "react-icons/hi";

export default function TypingIndicator() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  const seconds = elapsed >= 60 ? `${Math.floor(elapsed / 60)}m ${elapsed % 60}s` : `${elapsed}s`;

  return (
    <div role="status" aria-label={`AI Assistant is thinking. ${elapsed > 0 ? `Elapsed ${seconds}.` : ""}`} className="flex items-start gap-3">
      <div aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-text_secondary">
        <HiOutlineSparkles size={16} />
      </div>
      <div className="flex flex-col items-start">
        <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3">
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary/60 [animation-delay:300ms]" />
        </div>
        <div className="mt-1 text-[11px] text-text_muted">
          AI Assistant is thinking…{elapsed > 2 ? ` (${seconds})` : ""}
        </div>
      </div>
    </div>
  );
}
