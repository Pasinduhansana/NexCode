import { HiOutlineSparkles, HiOutlineUserCircle, HiOutlineExclamation, HiOutlineCog } from "react-icons/hi";

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";
  const isError = !isUser && message.isError;
  const tools = isUser || isError ? [] : Array.isArray(message.tools) ? message.tools : [];

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
        {tools.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {tools.map((tool) => (
              <span
                key={tool.name}
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                  tool.ok
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-600"
                }`}
              >
                <HiOutlineCog size={10} />
                {tool.name}
              </span>
            ))}
          </div>
        )}
        <div className="mt-1 text-[11px] text-text_muted">
          {isUser ? "You" : isError ? "AI Assistant · Error" : "AI Assistant"}
        </div>
      </div>
    </div>
  );
}