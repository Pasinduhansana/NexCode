export const PROJECT_STATUSES = [
  { value: "planning", label: "Planning", badge: "bg-slate-500/10 text-slate-500 border-slate-500/30", dot: "bg-slate-400" },
  { value: "in_progress", label: "In Progress", badge: "bg-blue-500/10 text-blue-500 border-blue-500/30", dot: "bg-blue-500" },
  { value: "on_hold", label: "On Hold", badge: "bg-amber-500/10 text-amber-500 border-amber-500/30", dot: "bg-amber-500" },
  { value: "completed", label: "Completed", badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30", dot: "bg-emerald-500" },
  { value: "cancelled", label: "Cancelled", badge: "bg-rose-500/10 text-rose-500 border-rose-500/30", dot: "bg-rose-500" },
];

export const TASK_STATUSES = [
  { value: "todo", label: "To Do", badge: "bg-slate-500/10 text-slate-500 border-slate-500/30", dot: "bg-slate-400" },
  { value: "in_progress", label: "In Progress", badge: "bg-blue-500/10 text-blue-500 border-blue-500/30", dot: "bg-blue-500" },
  { value: "review", label: "Review", badge: "bg-violet-500/10 text-violet-500 border-violet-500/30", dot: "bg-violet-500" },
  { value: "done", label: "Done", badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30", dot: "bg-emerald-500" },
];

export const PRIORITIES = [
  { value: "low", label: "Low", badge: "bg-slate-500/10 text-slate-500 border-slate-500/30", dot: "bg-slate-400" },
  { value: "medium", label: "Medium", badge: "bg-amber-500/10 text-amber-500 border-amber-500/30", dot: "bg-amber-500" },
  { value: "high", label: "High", badge: "bg-orange-500/10 text-orange-500 border-orange-500/30", dot: "bg-orange-500" },
  { value: "urgent", label: "Urgent", badge: "bg-rose-500/10 text-rose-500 border-rose-500/30", dot: "bg-rose-500" },
];

export const PROJECT_COLORS = ["#3699f3", "#06b6d4", "#8b5cf6", "#6366f1", "#f43f5e", "#f59e0b", "#10b981", "#ec4899"];

export const getMeta = (list, value) => list.find((item) => item.value === value) || { value, label: value || "—", badge: "", dot: "" };

export const DEFAULT_PROJECT_STATUS = "planning";
export const DEFAULT_TASK_STATUS = "todo";
export const DEFAULT_PRIORITY = "medium";
