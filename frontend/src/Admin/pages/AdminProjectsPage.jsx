import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlineSearch, HiOutlineFolder, HiOutlinePencilAlt, HiOutlineTrash, HiOutlineClipboardList } from "react-icons/hi";
import adminApi from "../utils/adminApi";
import usePageTitle from "../../utils/usePageTitle";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import ProjectFormModal from "../components/ProjectFormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { PROJECT_STATUSES } from "../data/constants";
import { formatDate, daysUntil } from "../utils/date";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  usePageTitle("Projects");

  const fetchProjects = async () => {
    try {
      const { data } = await adminApi.get("/projects");
      setProjects(data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.client || "").toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q));
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const handleDelete = async () => {
    if (!deleting) return;
    setDeletingLoading(true);
    try {
      await adminApi.delete(`/projects/${deleting._id}`);
      toast.success("Project deleted");
      setProjects((prev) => prev.filter((p) => p._id !== deleting._id));
      setDeleting(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete project");
    } finally {
      setDeletingLoading(false);
    }
  };

  if (loading) return <Spinner label="Loading projects..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">Projects</h1>
          <p className="mt-1 text-sm text-text_secondary">{projects.length} project{projects.length !== 1 ? "s" : ""} in total.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary_hover"
        >
          <HiOutlinePlus size={16} />
          New Project
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <HiOutlineSearch size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text_muted" />
          <input
            className="input-field pl-10"
            placeholder="Search by name, client, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input-field sm:w-52" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {PROJECT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={HiOutlineFolder}
          title={projects.length === 0 ? "No projects yet" : "No matching projects"}
          description={
            projects.length === 0
              ? "Create your first project to start tracking tasks and progress."
              : "Try adjusting your search or filters."
          }
          action={
            projects.length === 0 ? (
              <button
                type="button"
                onClick={() => setFormOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary_hover"
              >
                <HiOutlinePlus size={16} />
                Create Project
              </button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const due = daysUntil(p.dueDate);
            return (
              <div key={String(p._id)} className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                      style={{ backgroundColor: p.color || "#3699f3" }}
                    >
                      <HiOutlineFolder size={18} />
                    </div>
                    <div className="min-w-0">
                      <Link to={`/admin/projects/${p._id}`} className="block truncate font-display font-bold text-foreground hover:text-primary">
                        {p.name}
                      </Link>
                      <div className="truncate text-xs text-text_muted">{p.client || "No client"}</div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(p);
                        setFormOpen(true);
                      }}
                      className="rounded-lg p-1.5 text-text_secondary hover:bg-muted hover:text-foreground"
                      aria-label="Edit project"
                    >
                      <HiOutlinePencilAlt size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(p)}
                      className="rounded-lg p-1.5 text-text_secondary hover:bg-rose-500/10 hover:text-rose-500"
                      aria-label="Delete project"
                    >
                      <HiOutlineTrash size={15} />
                    </button>
                  </div>
                </div>

                {p.description && <p className="mt-3 line-clamp-2 text-sm text-text_secondary">{p.description}</p>}

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <StatusBadge list={PROJECT_STATUSES} value={p.status} />
                </div>

                {(p.tags || []).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-text_secondary">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className=" flex items-center justify-between border-t border-border pt-3 text-xs text-text_muted mt-4">
                  <span className={due !== null && due < 0 ? "text-rose-500 font-medium" : ""}>
                    {p.dueDate ? `Due ${formatDate(p.dueDate)}` : "No due date"}
                  </span>
                  <Link to={`/admin/projects/${p._id}`} className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary_hover">
                    <HiOutlineClipboardList size={14} />
                    Manage
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ProjectFormModal
        open={formOpen}
        project={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={fetchProjects}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete project?"
        message={
          deleting
            ? `This will permanently delete "${deleting.name}" and all of its tasks. This action cannot be undone.`
            : ""
        }
        loading={deletingLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
