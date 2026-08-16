import { Link } from "react-router-dom";
import { HiOutlinePencilAlt, HiOutlineTrash, HiOutlineFolder, HiOutlineClipboardList, HiOutlineCalendar } from "react-icons/hi";
import { PROJECT_STATUSES, PRIORITIES } from "../data/constants";
import StatusBadge from "./StatusBadge";
import { formatDate, daysUntil } from "../utils/date";

export default function AdminProjectTableView({ projects, onEdit, onDelete }) {
  if (!projects.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-xs text-text_secondary">No projects match the current filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-3 py-2.5 font-semibold text-foreground">Project</th>
            <th className="px-3 py-2.5 font-semibold text-foreground">Client</th>
            <th className="px-3 py-2.5 font-semibold text-foreground">Status</th>
            <th className="px-3 py-2.5 font-semibold text-foreground">Priority</th>
            <th className="px-3 py-2.5 font-semibold text-foreground">Due Date</th>
            <th className="px-3 py-2.5 font-semibold text-foreground">Tags</th>
            <th className="px-3 py-2.5 font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => {
            const due = daysUntil(p.dueDate);
            return (
              <tr key={String(p._id)} className="border-b border-border last:border-0 transition-colors hover:bg-muted/30">
                <td className="max-w-[280px] px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
                      style={{ backgroundColor: p.color || "#3699f3" }}
                    >
                      <HiOutlineFolder size={14} />
                    </div>
                    <Link to={`/admin/projects/${p._id}`} className="truncate font-semibold text-foreground hover:text-primary transition-colors">
                      {p.name}
                    </Link>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-text_secondary">{p.client || "—"}</td>
                <td className="px-3 py-2.5">
                  <StatusBadge list={PROJECT_STATUSES} value={p.status} />
                </td>
                <td className="px-3 py-2.5">
                  <StatusBadge list={PRIORITIES} value={p.priority} />
                </td>
                <td className="px-3 py-2.5">
                  <span className={`inline-flex items-center gap-1 ${due !== null && due < 0 ? "text-rose-500 font-medium" : "text-text_secondary"}`}>
                    <HiOutlineCalendar size={11} />
                    {p.dueDate ? formatDate(p.dueDate) : "—"}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {(p.tags || []).slice(0, 2).map((tag) => (
                      <span key={tag} className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-text_secondary">
                        #{tag}
                      </span>
                    ))}
                    {(p.tags || []).length > 2 && (
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-text_muted">
                        +{p.tags.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1">
                    <Link
                      to={`/admin/projects/${p._id}`}
                      className="rounded-md p-1.5 text-text_secondary border hover:bg-primary/10 hover:text-primary"
                      aria-label="Manage project"
                    >
                      <HiOutlineClipboardList size={14} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onEdit(p)}
                      className="rounded-md p-1.5 text-text_secondary border hover:bg-muted hover:text-foreground"
                      aria-label="Edit project"
                    >
                      <HiOutlinePencilAlt size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(p)}
                      className="rounded-md p-1.5 text-text_secondary border hover:bg-rose-500/10 hover:text-rose-500"
                      aria-label="Delete project"
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
