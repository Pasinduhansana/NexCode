import { HiOutlineSparkles, HiOutlineUserCircle, HiOutlineExclamation } from "react-icons/hi";

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";
  const isError = !isUser && message.isError;

  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          isUser ? "bg-primary/10 text-primary" : isError ? "bg-rose-500/10 text-rose-500" : "bg-muted text-text_secondary"
        }`}
      >
        {isUser ? <HiOutlineUserCircle size={17} /> : isError ? <HiOutlineExclamation size={16} /> : <HiOutlineSparkles size={16} />}
      </div>

      <div className={`flex max-w-[85%] flex-col sm:max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "rounded-br-md bg-primary text-white"
              : isError
                ? "rounded-bl-md border border-rose-500/30 bg-rose-500/5 text-rose-600"
                : "rounded-bl-md border border-border bg-card text-foreground"
          }`}
        >
          {message.content}
        </div>
        <div className="mt-1 text-[11px] text-text_muted">
          {isUser ? "You" : isError ? "AI Assistant · Error" : "AI Assistant"}
        </div>
      </div>
    </div>
  );
}