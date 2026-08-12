import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import adminApi from "../utils/adminApi";
import Modal from "./Modal";
import { TASK_STATUSES, PRIORITIES, DEFAULT_TASK_STATUS, DEFAULT_PRIORITY } from "../data/constants";
import { toDateInput } from "../utils/date";

const emptyForm = () => ({
  title: "",
  description: "",
  status: DEFAULT_TASK_STATUS,
  priority: DEFAULT_PRIORITY,
  assignee: "",
  dueDate: "",
  startDate: "",
  endDate: "",
  estimatedHours: "",
  notes: "",
});

export default function TaskFormModal({ open, projectId, task, onClose, onSaved, defaultStatus }) {
  const isEdit = Boolean(task);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      task
        ? {
            title: task.title || "",
            description: task.description || "",
            status: task.status || DEFAULT_TASK_STATUS,
            priority: task.priority || DEFAULT_PRIORITY,
            assignee: task.assignee || "",
            dueDate: toDateInput(task.dueDate),
            startDate: toDateInput(task.startDate),
            endDate: toDateInput(task.endDate),
            estimatedHours: task.estimatedHours != null ? String(task.estimatedHours) : "",
            notes: task.notes || "",
          }
        : { ...emptyForm(), status: defaultStatus || DEFAULT_TASK_STATUS }
    );
  }, [open, task, defaultStatus]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        estimatedHours: form.estimatedHours === "" ? null : Number(form.estimatedHours),
      };

      if (isEdit) {
        await adminApi.put(`/tasks/${task._id}`, payload);
        toast.success("Task updated");
      } else {
        await adminApi.post("/tasks", { ...payload, projectId });
        toast.success("Task created");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Task" : "New Task"} subtitle={isEdit ? "Update task details" : "Break work down into a new task"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Task Title *</label>
          <input className="input-field" placeholder="Build landing page hero" value={form.title} onChange={set("title")} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Status</label>
            <select className="input-field" value={form.status} onChange={set("status")}>
              {TASK_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select className="input-field" value={form.priority} onChange={set("priority")}>
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Start Date</label>
            <input className="input-field" type="date" value={form.startDate} onChange={set("startDate")} />
          </div>
          <div>
            <label className="label">End Date</label>
            <input className="input-field" type="date" value={form.endDate} onChange={set("endDate")} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Assignee</label>
            <input className="input-field" placeholder="Team member name" value={form.assignee} onChange={set("assignee")} />
          </div>
          <div>
            <label className="label">Due Date</label>
            <input className="input-field" type="date" value={form.dueDate} onChange={set("dueDate")} />
          </div>
        </div>

        <div>
          <label className="label">Estimated Hours</label>
          <input className="input-field" type="number" min="0" placeholder="8" value={form.estimatedHours} onChange={set("estimatedHours")} />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input-field resize-none h-24" placeholder="Details about this task..." value={form.description} onChange={set("description")} />
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea className="input-field resize-none h-20" placeholder="Context, links, checklists..." value={form.notes} onChange={set("notes")} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary_hover disabled:opacity-60"
          >
            {saving && <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
            {isEdit ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
