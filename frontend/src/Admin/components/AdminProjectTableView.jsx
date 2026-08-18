"use client";

import Link from "next/link";
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
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40 font-semibold uppercase tracking-wider text-text_muted">
              <th className="px-3 py-2.5">Project</th>
              <th className="px-3 py-2.5">Client</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Priority</th>
              <th className="px-3 py-2.5">Tasks</th>
              <th className="px-3 py-2.5">Due Date</th>
              <th className="px-3 py-2.5 text-right">Actions</th>
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
                      <Link href={`/admin/projects/${p._id}`} className="truncate font-semibold text-foreground hover:text-primary transition-colors">
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
                    <div className="flex items-center gap-1 text-text_secondary">
                      <HiOutlineClipboardList size={13} />
                      <span>{p.taskCount ?? 0}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    {p.dueDate ? (
                      <div className="flex items-center gap-1 text-text_secondary">
                        <HiOutlineCalendar size={13} />
                        <span>{formatDate(p.dueDate)}</span>
                        {due !== null && due <= 3 && due >= 0 && (
                          <span className="rounded bg-amber-500/10 px-1 py-0.2 text-[10px] font-semibold text-amber-500">
                            {due === 0 ? "Today" : `${due}d`}
                          </span>
                        )}
                        {due !== null && due < 0 && (
                          <span className="rounded bg-rose-500/10 px-1 py-0.2 text-[10px] font-semibold text-rose-500">
                            Overdue
                          </span>
                        )}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/projects/${p._id}`}
                        className="rounded-lg p-1.5 text-text_muted hover:bg-muted hover:text-foreground"
                        title="View details"
                      >
                        <HiOutlineFolder size={15} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => onEdit(p)}
                        className="rounded-lg p-1.5 text-text_muted hover:bg-muted hover:text-foreground"
                        title="Edit project"
                      >
                        <HiOutlinePencilAlt size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(p)}
                        className="rounded-lg p-1.5 text-text_muted hover:bg-rose-500/10 hover:text-rose-500"
                        title="Delete project"
                      >
                        <HiOutlineTrash size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
