import { memo } from "react";
import { HiOutlineSparkles, HiOutlineUserCircle, HiOutlineExclamation, HiOutlineCog, HiOutlineCheckCircle } from "react-icons/hi";
import RichText from "./RichText";
import PlanPreview from "./PlanPreview";

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
  generateProjectPlan: "Project plan generated",
  createProjectFromPlan: "Project plan confirmed",
};

function ToolResultBlocks({ tools, onConfirmPlan, onModifyPlan, planCreating }) {
  const previews = [];
  const confirmations = [];
  for (const tool of tools || []) {
    const result = tool?.result;
    if (!tool?.ok || !result) continue;
    if (tool.name === "generateProjectPlan" && result?.plan) {
      previews.push(result);
    } else if (tool.name === "createProjectFromPlan" && result?.created) {
      confirmations.push(result);
    }
  }
  return (
    <>
      {previews.map((result, i) => (
        <div key={`preview-${i}`} className="mt-2 w-full">
          <PlanPreview
            plan={result.plan}
            input={result.input}
            onConfirm={onConfirmPlan ? () => onConfirmPlan(result.input) : undefined}
            onModify={onModifyPlan}
            creating={planCreating}
          />
        </div>
      ))}
      {confirmations.map((result, i) => (
        <div
          key={`confirm-${i}`}
          className="mt-2 flex items-start gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2.5 text-xs text-emerald-700"
        >
          <HiOutlineCheckCircle size={16} className="mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold">Project created successfully</div>
            <div className="mt-0.5">
              {result.project?.name} · {result.tasksCreated} task{result.tasksCreated === 1 ? "" : "s"} ·{" "}
              {result.plannedExpenses} estimated expense{result.plannedExpenses === 1 ? "" : "s"} planned.
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function ChatMessage({ message, onConfirmPlan, onModifyPlan, planCreating }) {
  const isUser = message.role === "user";
  const isError = !isUser && message.isError;
  const tools = isUser || isError ? [] : Array.isArray(message.tools) ? message.tools : [];
  const content = isUser ? message.content : String(message.content || "");

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

      <div className={`flex min-w-0 max-w-[85%] flex-col sm:max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        {content ? (
          <div
            className={`w-full rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              isUser
                ? "rounded-br-md bg-primary text-white"
                : isError
                  ? "rounded-bl-md border border-rose-500/30 bg-rose-500/5 text-rose-600"
                  : "rounded-bl-md border border-border bg-card text-foreground"
            }`}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap">{content}</p>
            ) : (
              <RichText text={content} />
            )}
          </div>
        ) : (
          !isUser && !isError && <div className="h-2 w-8 rounded bg-muted" />
        )}
        <ToolResultBlocks
          tools={tools}
          onConfirmPlan={onConfirmPlan}
          onModifyPlan={onModifyPlan}
          planCreating={planCreating}
        />
        {tools.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {tools.map((tool, idx) => {
              const label = TOOL_LABELS[tool.name] || tool.name;
              const detail = tool.ok
                ? `${label} — completed`
                : `${label} — ${tool.status === "duplicate" ? "already handled" : "failed"}`;
              return (
                <span
                  key={`${tool.name}-${idx}`}
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