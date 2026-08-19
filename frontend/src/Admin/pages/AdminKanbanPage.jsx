"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  HiOutlinePlus,
  HiOutlineViewBoards,
  HiOutlineCalendar,
  HiOutlineDocumentText,
  HiOutlineFolder,
  HiOutlineTable,
} from "react-icons/hi";
import adminApi from "../utils/adminApi";
import usePageTitle from "../../utils/usePageTitle";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import PremiumSelect from "../components/PremiumSelect";
import TaskCard from "../components/TaskCard";
import TaskFormModal from "../components/TaskFormModal";
import TaskNotesModal from "../components/TaskNotesModal";
import TaskTableView from "../components/TaskTableView";
import TaskDetailModal from "../components/TaskDetailModal";
import ConfirmDialog from "../components/ConfirmDialog";
import KanbanGantt from "../components/KanbanGantt";
import { TASK_STATUSES } from "../data/constants";
import { usePagination } from "../hooks/usePagination";
import Pagination from "../components/Pagination";

export default function AdminKanbanPage() {
  const [data, setData] = useState({ projects: [], tasks: [] });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("board");
  const [zoom, setZoom] = useState("week");
  const [projectFilter, setProjectFilter] = useState("all");
  const [draggedId, setDraggedId] = useState(null);
  const [overColumn, setOverColumn] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formProject, setFormProject] = useState(null);
  const [formStatus, setFormStatus] = useState(null);
  const [editing, setEditing] = useState(null);

  const [notesTask, setNotesTask] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [viewTask, setViewTask] = useState(null);

  usePageTitle("Kanban Board");

  const fetchData = async () => {
    try {
      const { data: res } = await adminApi.get("/kanban");
      setData(res);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load board");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const projects = useMemo(() => {
    const list = data.projects || [];
    const counts = {};
    for (const t of data.tasks || []) {
      counts[String(t.projectId)] = (counts[String(t.projectId)] || 0) + 1;
    }
    return list.map((p) => ({ ...p, count: counts[String(p._id)] || 0 }));
  }, [data]);

  const visibleProjectIds = useMemo(() => {
    if (projectFilter === "all") return new Set(projects.map((p) => String(p._id)));
    return new Set([projectFilter]);
  }, [projectFilter, projects]);

  const projectOptions = useMemo(
    () => [
      { value: "all", label: "All projects" },
      ...projects.map((p) => ({ value: String(p._id), label: `${p.name} (${p.count})` })),
    ],
    [projects]
  );

  const columns = useMemo(() => {
    return TASK_STATUSES.map((s) => {
      const tasks = (data.tasks || [])
        .filter((t) => t.status === s.value && visibleProjectIds.has(String(t.projectId)))
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      return { ...s, tasks };
    });
  }, [data, visibleProjectIds]);

  const visibleTasks = useMemo(() => {
    return (data.tasks || [])
      .filter((t) => visibleProjectIds.has(String(t.projectId)))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [data, visibleProjectIds]);

  const { page, setPage, pageSize, setPageSize, total, slice: pagedTasks } = usePagination(visibleTasks);

  const handleStatusChange = async (task, status) => {
    const previous = data.tasks;
    setData((d) => ({ ...d, tasks: d.tasks.map((t) => (String(t._id) === String(task._id) ? { ...t, status } : t)) }));
    try {
      await adminApi.put(`/tasks/${task._id}`, { status });
      toast.success(`Moved to ${TASK_STATUSES.find((s) => s.value === status)?.label || status}`);
    } catch (err) {
      setData((d) => ({ ...d, tasks: previous }));
      toast.error(err.response?.data?.error || "Failed to update task");
    }
  };

  const handleDrop = async (status) => {
    setOverColumn(null);
    if (!draggedId) return;
    const task = (data.tasks || []).find((t) => String(t._id) === String(draggedId));
    setDraggedId(null);
    if (!task) return;
    if (task.status === status) return;
    await handleStatusChange(task, status);
  };

  const handleSaveNotes = async (text) => {
    try {
      await adminApi.put(`/tasks/${notesTask._id}`, { notes: text });
      toast.success("Notes saved");
      setData((d) => ({ ...d, tasks: d.tasks.map((t) => (String(t._id) === String(notesTask._id) ? { ...t, notes: text } : t)) }));
      setNotesTask(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save notes");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeletingLoading(true);
    try {
      await adminApi.delete(`/tasks/${deleting._id}`);
      toast.success("Task deleted");
      setData((d) => ({ ...d, tasks: d.tasks.filter((t) => String(t._id) !== String(deleting._id)) }));
      setDeleting(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete task");
    } finally {
      setDeletingLoading(false);
    }
  };

  const openCreate = (status) => {
    setEditing(null);
    setFormStatus(status || null);
    setFormProject(projectFilter !== "all" ? projectFilter : projects[0]?._id || null);
    setFormOpen(true);
  };

  const openEdit = (task) => {
    setEditing(task);
    setFormProject(task.projectId);
    setFormStatus(task.status);
    setFormOpen(true);
  };

  if (loading) return <Spinner label="Loading board..." />;

  const hasTasks = (data.tasks || []).length > 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">Board</h1>
          <p className="mt-1 text-sm text-text_secondary">Drag tasks between columns, add notes, and manage your timeline.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setView("board")}
              className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors ${
                view === "board" ? "bg-primary text-white" : "text-text_secondary hover:text-foreground"
              }`}
            >
              <HiOutlineViewBoards size={16} />
              Board
            </button>
            <button
              type="button"
              onClick={() => setView("table")}
              className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors ${
                view === "table" ? "bg-primary text-white" : "text-text_secondary hover:text-foreground"
              }`}
            >
              <HiOutlineTable size={16} />
              Table
            </button>
            <button
              type="button"
              onClick={() => setView("gantt")}
              className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors ${
                view === "gantt" ? "bg-primary text-white" : "text-text_secondary hover:text-foreground"
              }`}
            >
              <HiOutlineCalendar size={16} />
              Timeline
            </button>
          </div>

          <PremiumSelect
            className="w-full sm:w-56"
            value={projectFilter}
            onChange={setProjectFilter}
            options={projectOptions}
            icon={HiOutlineFolder}
            placeholder="All projects"
          />

          <button
            type="button"
            onClick={() => openCreate(null)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary_hover"
          >
            <HiOutlinePlus size={16} />
            New Task
          </button>
        </div>
      </div>

      {view === "board" ? (
        hasTasks ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((col) => (
              <div
                key={col.value}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverColumn(col.value);
                }}
                onDragLeave={() => setOverColumn((v) => (v === col.value ? null : v))}
                onDrop={() => handleDrop(col.value)}
                className={`flex flex-col rounded-2xl border bg-muted/30 p-3 transition-colors ${
                  overColumn === col.value ? "border-primary/60 bg-primary/5" : "border-border"
                }`}
              >
                <div className="flex items-center justify-between px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                    <span className="text-sm font-semibold text-foreground">{col.label}</span>
                    <span className="rounded-md bg-card px-1.5 py-0.5 text-[11px] font-medium text-text_muted">
                      {col.tasks.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openCreate(col.value)}
                    className="rounded-md p-1 text-text_secondary transition-colors hover:bg-card hover:text-primary"
                    aria-label={`Add task to ${col.label}`}
                  >
                    <HiOutlinePlus size={15} />
                  </button>
                </div>

                <div className="flex flex-1 flex-col gap-2 min-h-[120px]">
                  {col.tasks.map((task) => (
                    <TaskCard
                      key={String(task._id)}
                      task={task}
                      onEdit={openEdit}
                      onDelete={setDeleting}
                      onStatusChange={handleStatusChange}
                      onNotes={setNotesTask}
                      onView={setViewTask}
                      draggable
                      onDragStart={(e) => {
                        setDraggedId(String(task._id));
                        e.dataTransfer.effectAllowed = "move";
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={HiOutlineFolder}
            title="No tasks yet"
            description="Create tasks to populate your board, or use the timeline to schedule work."
            action={
              <button
                type="button"
                onClick={() => openCreate(null)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary_hover"
              >
                <HiOutlinePlus size={16} />
                Create Task
              </button>
            }
          />
        )
      ) : view === "table" ? (
        <TaskTableView
          tasks={pagedTasks}
          projects={data.projects || []}
          onEdit={openEdit}
          onDelete={setDeleting}
          onStatusChange={handleStatusChange}
          onNotes={setNotesTask}
          onView={setViewTask}
        />
      ) : (
        <KanbanGantt projects={data.projects || []} zoom={zoom} setZoom={setZoom} onEditTask={openEdit} />
      )}

      {view === "table" && visibleTasks.length > 0 && (
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}

      <TaskFormModal
        open={formOpen}
        projectId={formProject}
        task={editing}
        defaultStatus={formStatus}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={fetchData}
      />

      <TaskNotesModal open={Boolean(notesTask)} task={notesTask} onClose={() => setNotesTask(null)} onSave={handleSaveNotes} />

      <TaskDetailModal
        open={Boolean(viewTask)}
        task={viewTask}
        projects={data.projects || []}
        onClose={() => setViewTask(null)}
        onEdit={openEdit}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete task?"
        message={deleting ? `This will permanently delete "${deleting.title}". This action cannot be undone.` : ""}
        loading={deletingLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />

      {view === "board" && (
        <div className="flex items-center gap-2 text-xs text-text_muted">
          <HiOutlineDocumentText size={14} />
          Tip: drag tasks between columns, click the eye icon to view details, click the notes icon to add context, and switch to Table or Timeline for other views.
        </div>
      )}
    </div>
  );
}
