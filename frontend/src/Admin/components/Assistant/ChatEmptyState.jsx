import { HiOutlineSparkles, HiOutlineChatAlt2, HiOutlineCalendar, HiOutlinePencilAlt, HiOutlineCurrencyDollar, HiOutlineFolder } from "react-icons/hi";

const SUGGESTIONS = [
  { icon: HiOutlineCalendar, label: "What's overdue?" },
  { icon: HiOutlineFolder, label: "Summarize project status" },
  { icon: HiOutlineCurrencyDollar, label: "How is the budget?" },
  { icon: HiOutlinePencilAlt, label: "Draft a client update email" },
];

export default function ChatEmptyState({ userName, onSuggestion, isTyping }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <div aria-hidden="true" className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <HiOutlineSparkles size={28} />
        </div>
      </div>

      <div className="max-w-md">
        <h2 className="font-display text-lg font-extrabold text-foreground sm:text-xl">
          Meet your AI Assistant
        </h2>
        <p className="mt-2 text-sm text-text_secondary">
          {userName ? `Hi ${userName}, ` : ""}ask me anything about your projects, tasks, finances, or
          drafts. Pick a suggestion below or type your own message to get started.
        </p>
      </div>

      <div className="grid w-full max-w-md grid-cols-1 gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map(({ icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            onClick={() => onSuggestion(label)}
            disabled={isTyping}
            className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-left text-sm font-medium text-text_secondary transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            <Icon size={16} className="shrink-0 text-primary" />
            {label}
          </button>
        ))}
      </div>

      <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-[11px] text-text_muted">
        <HiOutlineChatAlt2 size={12} />
        Powered by Google Gemini
      </div>
    </div>
  );
}
