"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { HiOutlineArrowLeft, HiOutlinePlus, HiOutlinePencilAlt, HiOutlineTrash, HiOutlineFolder, HiOutlineUser, HiOutlineCalendar, HiOutlineCurrencyDollar, HiOutlineCheck, HiOutlineDocumentText, HiOutlineTag } from "react-icons/hi";
import adminApi from "../utils/adminApi";
import usePageTitle from "../../utils/usePageTitle";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import TaskCard from "../components/TaskCard";
import TaskFormModal from "../components/TaskFormModal";
import TaskNotesModal from "../components/TaskNotesModal";
import ProjectFormModal from "../components/ProjectFormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import { PROJECT_STATUSES, TASK_STATUSES, PRIORITIES } from "../data/constants";
import { formatDate, daysUntil } from "../utils/date";

const PAID_STATUS_META = {
  pending: { label: "Pending", badge: "bg-amber-500/10 text-amber-500 border-amber-500/30" },
  partial: { label: "Partial", badge: "bg-blue-500/10 text-blue-500 border-blue-500/30" },
  paid: { label: "Paid", badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" },
};

export default function AdminProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectModal, setProjectModal] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [notesTask, setNotesTask] = useState(null);
  const [deletingProject, setDeletingProject] = useState(false);
  const [deletingLoading, setDeletingLoading] = useState(false);

  usePageTitle(project ? `${project.name} | Admin` : "Project");

  const fetchProject = async () => {
    try {
      const { data } = await adminApi.get(`/projects/${id}`);
      setProject(data);
      setTasks(data.tasks || []);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load project");
      navigate("/admin/projects", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleDeleteProject = async () => {
    setDeletingLoading(true);
    try {
      await adminApi.delete(`/projects/${id}`);
      toast.success("Project deleted");
      navigate("/admin/projects", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete project");
      setDeletingLoading(false);
    }
  };

  const handleTaskStatus = async (task, status) => {
    const prev = tasks;
    setTasks((list) => list.map((t) => (t._id === task._id ? { ...t, status } : t)));
    try {
      const { data } = await adminApi.put(`/tasks/${task._id}`, { status });
      setTasks((list) => list.map((t) => (t._id === task._id ? data : t)));
    } catch (err) {
      setTasks(prev);
      toast.error(err.response?.data?.error || "Failed to update task");
    }
  };

  const handleSaveNotes = async (text) => {
    try {
      await adminApi.put(`/tasks/${notesTask._id}`, { notes: text });
      toast.success("Notes saved");
      setTasks((list) => list.map((t) => (String(t._id) === String(notesTask._id) ? { ...t, notes: text } : t)));
      setNotesTask(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save notes");
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    setDeletingLoading(true);
    try {
      await adminApi.delete(`/tasks/${deletingTask._id}`);
      toast.success("Task deleted");
      setTasks((list) => list.filter((t) => t._id !== deletingTask._id));
      setDeletingTask(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete task");
    } finally {
      setDeletingLoading(false);
    }
  };

  if (loading) return <Spinner label="Loading project..." />;

  const due = daysUntil(project.dueDate);
  const taskCountByStatus = (status) => tasks.filter((t) => t.status === status).length;
  const balanceAmount = (project.projectCost || 0) - (project.advanceAmount || 0);
  const paidMeta = PAID_STATUS_META[project.paidStatus] || PAID_STATUS_META.pending;

  return (
    <div className="space-y-6">
      <Link to="/admin/projects" className="inline-flex items-center gap-1.5 text-sm font-medium text-text_secondary hover:text-primary">
        <HiOutlineArrowLeft size={15} />
        Back to projects
      </Link>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white"
              style={{ backgroundColor: project.color || "#3699f3" }}
            >
              <HiOutlineFolder size={22} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">{project.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge list={PROJECT_STATUSES} value={project.status} />
                <StatusBadge list={PRIORITIES} value={project.priority} />
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${paidMeta.badge}`}>
                  {paidMeta.label}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setProjectModal(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              <HiOutlinePencilAlt size={15} />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setDeletingProject(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-rose-500/30 px-4 py-2 text-sm font-medium text-rose-500 hover:bg-rose-500/10"
            >
              <HiOutlineTrash size={15} />
              Delete
            </button>
          </div>
        </div>

        {project.description && (
          <p className="max-w-3xl text-sm leading-relaxed text-text_secondary">{project.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3 border-t border-border pt-4 sm:grid-cols-4 lg:grid-cols-6">
          <div className="flex items-center gap-2.5">
            <HiOutlineUser size={18} className="shrink-0 text-text_muted" />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-text_muted">Client</div>
              <div className="text-sm font-semibold text-foreground">{project.client || "—"}</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <HiOutlineCalendar size={18} className="shrink-0 text-text_muted" />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-text_muted">Due</div>
              <div className={`text-sm font-semibold ${due !== null && due < 0 ? "text-rose-500" : "text-foreground"}`}>
                {project.dueDate ? formatDate(project.dueDate) : "—"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <HiOutlineCurrencyDollar size={18} className="shrink-0 text-text_muted" />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-text_muted">Project Cost</div>
              <div className="text-sm font-semibold text-foreground">
                {project.projectCost != null ? `Rs. ${Number(project.projectCost).toLocaleString()}` : "—"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <HiOutlineCurrencyDollar size={18} className="shrink-0 text-text_muted" />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-text_muted">Advance</div>
              <div className="text-sm font-semibold text-emerald-500">
                {project.advanceAmount != null ? `Rs. ${Number(project.advanceAmount).toLocaleString()}` : "—"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <HiOutlineCurrencyDollar size={18} className="shrink-0 text-text_muted" />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-text_muted">Balance</div>
              <div className="text-sm font-semibold text-amber-500">
                {project.projectCost != null ? `Rs. ${Number(balanceAmount).toLocaleString()}` : "—"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <HiOutlineFolder size={18} className="shrink-0 text-text_muted" />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-text_muted">Tasks</div>
              <div className="text-sm font-semibold text-foreground">{tasks.length}</div>
            </div>
          </div>
        </div>
      </div>

      {project.features && project.features.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-bold text-foreground">
            <HiOutlineCheck size={16} className="text-primary" />
            Features
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {project.features.map((f, i) => (
              <span key={i} className="inline-flex items-center rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium text-text_secondary">
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {project.notes && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-2 flex items-center gap-2 font-display text-sm font-bold text-foreground">
            <HiOutlineDocumentText size={16} className="text-primary" />
            Important Notes
          </h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text_secondary">{project.notes}</p>
        </div>
      )}

      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <HiOutlineTag size={14} className="text-text_muted" />
          {project.tags.map((tag, i) => (
            <span key={i} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-text_secondary">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-foreground">Task Board</h2>
          <button
            type="button"
            onClick={() => {
              setEditingTask(null);
              setTaskModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary_hover"
          >
            <HiOutlinePlus size={15} />
            Add Task
          </button>
        </div>

        {tasks.length === 0 ? (
          <EmptyState
            icon={HiOutlineFolder}
            title="No tasks yet"
            description="Break this project into tasks and start tracking progress."
            action={
              <button
                type="button"
                onClick={() => {
                  setEditingTask(null);
                  setTaskModal(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary_hover"
              >
                <HiOutlinePlus size={16} />
                Add First Task
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {TASK_STATUSES.map((s) => {
              const columnTasks = tasks.filter((t) => t.status === s.value);
              return (
                <div key={s.value} className="flex flex-col rounded-2xl border border-border bg-muted/40 p-3">
                  <div className="mb-3 flex items-center justify-between px-1">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                      <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                      {s.label}
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-text_secondary">
                        {columnTasks.length}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTask(null);
                        setTaskModal(true);
                      }}
                      className="rounded-lg p-1.5 text-text_muted hover:bg-muted hover:text-primary"
                      aria-label={`Add task to ${s.label}`}
                    >
                      <HiOutlinePlus size={15} />
                    </button>
                  </div>

                  <div className="flex flex-1 flex-col gap-2">
                    {columnTasks.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-text_muted">
                        Drop new tasks here
                      </p>
                    ) : (
                      columnTasks.map((task) => (
                        <TaskCard
                          key={String(task._id)}
                          task={task}
                          onEdit={(t) => {
                            setEditingTask(t);
                            setTaskModal(true);
                          }}
                          onDelete={(t) => setDeletingTask(t)}
                          onStatusChange={handleTaskStatus}
                          onNotes={setNotesTask}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ProjectFormModal open={projectModal} project={project} onClose={() => setProjectModal(false)} onSaved={fetchProject} />
      <TaskFormModal
        open={taskModal}
        projectId={id}
        task={editingTask}
        onClose={() => {
          setTaskModal(false);
          setEditingTask(null);
        }}
        onSaved={fetchProject}
      />

      <TaskNotesModal open={Boolean(notesTask)} task={notesTask} onClose={() => setNotesTask(null)} onSave={handleSaveNotes} />

      <ConfirmDialog
        open={Boolean(deletingTask)}
        title="Delete task?"
        message={deletingTask ? `This will permanently delete "${deletingTask.title}".` : ""}
        loading={deletingLoading}
        onConfirm={handleDeleteTask}
        onCancel={() => setDeletingTask(null)}
      />

      <ConfirmDialog
        open={Boolean(deletingProject)}
        title="Delete project?"
        message={`This will permanently delete "${project.name}" and all of its ${tasks.length} task(s). This action cannot be undone.`}
        loading={deletingLoading}
        confirmLabel="Delete Project"
        onConfirm={handleDeleteProject}
        onCancel={() => setDeletingProject(false)}
      />
    </div>
  );
}
