import { HiOutlinePencilAlt, HiOutlineTrash, HiOutlineUser, HiOutlineCalendar, HiOutlineDocumentText, HiOutlineEye } from "react-icons/hi";
import { TASK_STATUSES, PRIORITIES, getMeta } from "../data/constants";
import StatusBadge from "./StatusBadge";
import { formatDate, daysUntil } from "../utils/date";

export default function TaskCard({ task, onEdit, onDelete, onStatusChange, onNotes, onView, draggable = false, onDragStart }) {
  const priority = getMeta(PRIORITIES, task.priority);
  const due = daysUntil(task.dueDate);

  const dueLabel =
    due === null
      ? null
      : due < 0
      ? `${Math.abs(due)}d overdue`
      : due === 0
      ? "Due today"
      : `Due in ${due}d`;

  return (
    <div
      className="group rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
      draggable={draggable}
      onDragStart={onDragStart}
      style={draggable ? { cursor: "grab" } : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold leading-snug text-foreground">{task.title}</h4>
        <span className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full self-center mt-1.5" style={{ backgroundColor: priority.dot }} title={priority.label} />
      </div>

      {task.description && (
        <p className="mt-1.5 line-clamp-2 text-xs text-text_secondary">{task.description}</p>
      )}

      {task.notes && (
        <p className="mt-1.5 flex items-start gap-1.5 text-xs text-text_muted">
          <HiOutlineDocumentText size={13} className="mt-0.5 shrink-0 text-primary" />
          <span className="line-clamp-2">{task.notes}</span>
        </p>
      )}

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <StatusBadge list={TASK_STATUSES} value={task.status} dot={false} />
        <StatusBadge list={PRIORITIES} value={task.priority} dot={false} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-[11px] text-text_muted">
          {task.assignee && (
            <span className="inline-flex items-center gap-1">
              <HiOutlineUser size={12} />
              {task.assignee}
            </span>
          )}
          {dueLabel && (
            <span className={`inline-flex items-center gap-1 ${due < 0 ? "text-rose-500" : ""}`}>
              <HiOutlineCalendar size={12} />
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {onView && (
            <button
              type="button"
              onClick={() => onView(task)}
              className="rounded-md p-1.5 text-text_secondary hover:bg-primary/10 hover:text-primary"
              aria-label="View task"
            >
              <HiOutlineEye size={14} />
            </button>
          )}
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
          <button type="button" onClick={() => onEdit(task)} className="rounded-md p-1.5 text-text_secondary hover:bg-muted hover:text-foreground" aria-label="Edit task">
            <HiOutlinePencilAlt size={14} />
          </button>
          <button type="button" onClick={() => onDelete(task)} className="rounded-md p-1.5 text-text_secondary hover:bg-rose-500/10 hover:text-rose-500" aria-label="Delete task">
            <HiOutlineTrash size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
