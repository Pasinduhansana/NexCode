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
        <p className="text-xs text-text_secondary">No tasks match the current filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-3 py-2.5 font-semibold text-foreground">Title</th>
            <th className="px-3 py-2.5 font-semibold text-foreground">Project</th>
            <th className="px-3 py-2.5 font-semibold text-foreground">Priority</th>
            <th className="px-3 py-2.5 font-semibold text-foreground">Assignee</th>
            <th className="px-3 py-2.5 font-semibold text-foreground">Due Date</th>
            <th className="px-3 py-2.5 font-semibold text-foreground">Progress</th>
            <th className="px-3 py-2.5 font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            return (
              <tr key={String(task._id)} className="border-b border-border last:border-0 transition-colors hover:bg-muted/30">
                <td className="max-w-[280px] px-3 py-2.5">
                  <div className="mb-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onView(task)}
                      className="text-left text-[15px] font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {task.title}
                    </button>
                    <StatusBadge list={TASK_STATUSES} value={task.status} />
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    {task.description && <span className="line-clamp-1 text-text_muted">{task.description}</span>}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-text_secondary">{projectMap[String(task.projectId)] || "—"}</td>
                <td className="px-3 py-2.5">
                  <StatusBadge list={PRIORITIES} value={task.priority} />
                </td>
                <td className="px-3 py-2.5 text-text_secondary">
                  {task.assignee ? (
                    <span className="inline-flex items-center gap-1">
                      <HiOutlineUser size={11} />
                      {task.assignee}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-2.5 text-text_secondary">{formatDate(task.dueDate)}</td>
                <td className="px-3 py-2.5  text-text_secondary">
                  <select
                    className="rounded-lg border border-border bg-background px-2 py-1.5 text-[11px] text-foreground"
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
                </td>
                <td className="px-3 py-2.5 text-left">
                  <div className="flex items-center justify-start gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(task)}
                      className="rounded-lg p-2 text-text_secondary border hover:bg-muted hover:text-foreground"
                      aria-label="Edit task"
                    >
                      <HiOutlinePencilAlt size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(task)}
                      className="rounded-lg p-2 text-text_secondary border hover:bg-rose-500/10 hover:text-rose-500"
                      aria-label="Delete task"
                    >
                      <HiOutlineTrash size={15} />
                    </button>{" "}
                    {onNotes && (
                      <button
                        type="button"
                        onClick={() => onNotes(task)}
                        className="relative rounded-lg p-2 border flex gap-1.5 text-text_secondary hover:bg-primary/10 hover:text-primary"
                        aria-label="Task notes"
                      >
                        <span className="text-[12px]  ">Notes</span>
                        <HiOutlineDocumentText size={15} />
                        {task.notes && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-primary" />}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onView(task)}
                      className="rounded-lg flex gap-1.5 p-2 border text-text_secondary hover:bg-primary/10 hover:text-primary"
                      aria-label="View task"
                    >
                      <span className="text-[12px]  ">View</span>
                      <HiOutlineEye size={15} />
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
