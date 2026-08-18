import { HiOutlineUser, HiOutlineCalendar, HiOutlineClock, HiOutlineDocumentText, HiOutlinePencilAlt } from "react-icons/hi";
import Modal from "./Modal";
import StatusBadge from "./StatusBadge";
import { TASK_STATUSES, PRIORITIES } from "../data/constants";
import { formatDate } from "../utils/date";

export default function TaskDetailModal({ open, task, projects, onClose, onEdit }) {
  if (!task) return null;

  const projectMap = {};
  for (const p of projects) {
    projectMap[String(p._id)] = p.name;
  }

  return (
    <Modal open={open} onClose={onClose} title="Task Details" subtitle="View task information" size="max-w-xl">
      <div className="space-y-5">
        <div>
          <h4 className="font-display text-lg font-bold text-foreground">{task.title}</h4>
          {task.description && <p className="mt-2 text-sm text-text_secondary leading-relaxed">{task.description}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-xs font-medium text-text_muted uppercase tracking-wider">Status</span>
            <div><StatusBadge list={TASK_STATUSES} value={task.status} /></div>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-text_muted uppercase tracking-wider">Priority</span>
            <div><StatusBadge list={PRIORITIES} value={task.priority} /></div>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-text_muted uppercase tracking-wider">Project</span>
            <p className="text-sm text-foreground">{projectMap[String(task.projectId)] || "—"}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-text_muted uppercase tracking-wider">Assignee</span>
            <p className="flex items-center gap-1.5 text-sm text-foreground">
              <HiOutlineUser size={14} className="text-text_muted" />
              {task.assignee || "Unassigned"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <span className="text-xs font-medium text-text_muted uppercase tracking-wider">Start Date</span>
            <p className="flex items-center gap-1.5 text-sm text-foreground">
              <HiOutlineCalendar size={14} className="text-text_muted" />
              {formatDate(task.startDate)}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-text_muted uppercase tracking-wider">End Date</span>
            <p className="flex items-center gap-1.5 text-sm text-foreground">
              <HiOutlineCalendar size={14} className="text-text_muted" />
              {formatDate(task.endDate)}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-text_muted uppercase tracking-wider">Due Date</span>
            <p className="flex items-center gap-1.5 text-sm text-foreground">
              <HiOutlineCalendar size={14} className="text-text_muted" />
              {formatDate(task.dueDate)}
            </p>
          </div>
        </div>

        {task.estimatedHours != null && (
          <div className="space-y-1">
            <span className="text-xs font-medium text-text_muted uppercase tracking-wider">Estimated Hours</span>
            <p className="flex items-center gap-1.5 text-sm text-foreground">
              <HiOutlineClock size={14} className="text-text_muted" />
              {task.estimatedHours}h
            </p>
          </div>
        )}

        {task.notes && (
          <div className="space-y-1">
            <span className="text-xs font-medium text-text_muted uppercase tracking-wider">Notes</span>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="whitespace-pre-wrap text-sm text-text_secondary leading-relaxed">{task.notes}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="text-xs text-text_muted">
            {task.createdAt && <span>Created {formatDate(task.createdAt)}</span>}
            {task.updatedAt && task.updatedAt !== task.createdAt && (
              <span className="ml-3">Updated {formatDate(task.updatedAt)}</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => { onClose(); onEdit(task); }}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary_hover"
            >
              <HiOutlinePencilAlt size={14} />
              Edit
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
