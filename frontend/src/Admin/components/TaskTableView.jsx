import { HiOutlinePencilAlt, HiOutlineTrash, HiOutlineUser, HiOutlineDocumentText, HiOutlineEye } from "react-icons/hi";
import { TASK_STATUSES, PRIORITIES, getMeta } from "../data/constants";
import StatusBadge from "./StatusBadge";
import { formatDate } from "../utils/date";

export default function TaskTableView({ tasks, projects, onEdit, onDelete, onStatusChange, onNotes, onView }) {
  const projectMap = {};
  for (const p of projects) {
    projectMap[String(p._id)] = p.name;
  }

  if (!tasks.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-sm text-text_secondary">No tasks match the current filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 font-semibold text-foreground">Title</th>
            <th className="px-4 py-3 font-semibold text-foreground">Project</th>
            <th className="px-4 py-3 font-semibold text-foreground">Status</th>
            <th className="px-4 py-3 font-semibold text-foreground">Priority</th>
            <th className="px-4 py-3 font-semibold text-foreground">Assignee</th>
            <th className="px-4 py-3 font-semibold text-foreground">Due Date</th>
            <th className="px-4 py-3 font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const priority = getMeta(PRIORITIES, task.priority);
            return (
              <tr key={String(task._id)} className="border-b border-border last:border-0 transition-colors hover:bg-muted/30">
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onView(task)}
                    className="text-left font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {task.title}
                  </button>
                  {task.description && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-text_muted">{task.description}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-text_secondary">{projectMap[String(task.projectId)] || "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge list={TASK_STATUSES} value={task.status} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge list={PRIORITIES} value={task.priority} />
                </td>
                <td className="px-4 py-3 text-text_secondary">
                  {task.assignee ? (
                    <span className="inline-flex items-center gap-1">
                      <HiOutlineUser size={12} />
                      {task.assignee}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-text_secondary">{formatDate(task.dueDate)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onView(task)}
                      className="rounded-md p-1.5 text-text_secondary hover:bg-primary/10 hover:text-primary"
                      aria-label="View task"
                    >
                      <HiOutlineEye size={14} />
                    </button>
                    {onNotes && (
                      <button
                        type="button"
                        onClick={() => onNotes(task)}
                        className="relative rounded-md p-1.5 text-text_secondary hover:bg-primary/10 hover:text-primary"
                        aria-label="Task notes"
                      >
                        <HiOutlineDocumentText size={14} />
                        {task.notes && <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-primary" />}
                      </button>
                    )}
                    <select
                      className="rounded-md border border-border bg-background px-1.5 py-1 text-[11px] text-foreground"
                      value={task.status}
                      onChange={(e) => onStatusChange(task, e.target.value)}
                      title="Change status"
                    >
                      {TASK_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => onEdit(task)}
                      className="rounded-md p-1.5 text-text_secondary hover:bg-muted hover:text-foreground"
                      aria-label="Edit task"
                    >
                      <HiOutlinePencilAlt size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(task)}
                      className="rounded-md p-1.5 text-text_secondary hover:bg-rose-500/10 hover:text-rose-500"
                      aria-label="Delete task"
                    >
                      <HiOutlineTrash size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
