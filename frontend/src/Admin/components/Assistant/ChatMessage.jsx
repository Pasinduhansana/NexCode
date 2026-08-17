import { memo } from "react";
import { HiOutlineSparkles, HiOutlineUserCircle, HiOutlineExclamation, HiOutlineCog } from "react-icons/hi";

const TOOL_LABELS = {
  createProject: "Project created",
  getProject: "Project loaded",
  updateProject: "Project updated",
  createTask: "Task created",
  getTask: "Task loaded",
  updateTask: "Task updated",
  completeTask: "Task completed",
  createIssue: "Issue created",
  getIssue: "Issue loaded",
  updateIssue: "Issue updated",
  resolveIssue: "Issue resolved",
  addDesignReference: "Reference added",
  getDesignReferences: "References loaded",
  updateDesignReference: "Reference updated",
  deleteDesignReference: "Reference deleted",
  createExpense: "Expense recorded",
  getExpense: "Expense loaded",
  getExpenses: "Expenses loaded",
  updateExpense: "Expense updated",
  deleteExpense: "Expense deleted",
  getAIHealthStatus: "Health check",
  deleteProject: "Project deleted",
  deleteTask: "Task deleted",
  deleteIssue: "Issue deleted",
  getDashboardStats: "Dashboard stats",
  getProjectSummary: "Project summary",
  getPendingTasks: "Pending tasks",
  getOpenIssues: "Open issues",
  getExpenseSummary: "Expense summary",
  getRecentActivity: "Recent activity",
};

function ChatMessage({ message }) {
  const isUser = message.role === "user";
  const isError = !isUser && message.isError;
  const tools = isUser || isError ? [] : Array.isArray(message.tools) ? message.tools : [];

  return (
    <div
      data-role={isUser ? "user" : "assistant"}
      className={`animate-fade-slide flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        aria-hidden="true"
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
            {tools.map((tool) => {
              const label = TOOL_LABELS[tool.name] || tool.name;
              const detail = tool.ok
                ? `${label} — completed`
                : `${label} — ${tool.status === "duplicate" ? "already handled" : "failed"}`;
              return (
                <span
                  key={tool.name}
                  title={detail}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                    tool.ok
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                      : "border-rose-500/30 bg-rose-500/10 text-rose-600"
                  }`}
                >
                  <HiOutlineCog size={10} />
                  {label}
                </span>
              );
            })}
          </div>
        )}
        <div className="mt-1 text-[11px] text-text_muted">
          {isUser ? "You" : isError ? "AI Assistant · Error" : "AI Assistant"}
        </div>
      </div>
    </div>
  );
}

export default memo(ChatMessage);
