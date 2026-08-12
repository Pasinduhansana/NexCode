import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import adminApi from "../utils/adminApi";
import Modal from "./Modal";
import { PROJECT_STATUSES, TASK_STATUSES, PRIORITIES, PROJECT_COLORS, DEFAULT_PROJECT_STATUS, DEFAULT_PRIORITY } from "../data/constants";
import { toDateInput } from "../utils/date";

const emptyForm = () => ({
  name: "",
  client: "",
  description: "",
  status: DEFAULT_PROJECT_STATUS,
  priority: DEFAULT_PRIORITY,
  startDate: "",
  dueDate: "",
  budget: "",
  tags: "",
  color: PROJECT_COLORS[0],
});

export default function ProjectFormModal({ open, project, onClose, onSaved }) {
  const isEdit = Boolean(project);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      project
        ? {
            name: project.name || "",
            client: project.client || "",
            description: project.description || "",
            status: project.status || DEFAULT_PROJECT_STATUS,
            priority: project.priority || DEFAULT_PRIORITY,
            startDate: toDateInput(project.startDate),
            dueDate: toDateInput(project.dueDate),
            budget: project.budget != null ? String(project.budget) : "",
            tags: Array.isArray(project.tags) ? project.tags.join(", ") : "",
            color: project.color || PROJECT_COLORS[0],
          }
        : emptyForm()
    );
  }, [open, project]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        budget: form.budget === "" ? null : Number(form.budget),
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (isEdit) {
        await adminApi.put(`/projects/${project._id}`, payload);
        toast.success("Project updated");
      } else {
        await adminApi.post("/projects", payload);
        toast.success("Project created");
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
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Project" : "New Project"} subtitle={isEdit ? "Update project details" : "Create a new project for your team"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Project Name *</label>
          <input className="input-field" placeholder="Website redesign for Acme" value={form.name} onChange={set("name")} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Client</label>
            <input className="input-field" placeholder="Client or company name" value={form.client} onChange={set("client")} />
          </div>
          <div>
            <label className="label">Budget (USD)</label>
            <input className="input-field" type="number" min="0" placeholder="5000" value={form.budget} onChange={set("budget")} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Status</label>
            <select className="input-field" value={form.status} onChange={set("status")}>
              {PROJECT_STATUSES.map((s) => (
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
            <label className="label">Due Date</label>
            <input className="input-field" type="date" value={form.dueDate} onChange={set("dueDate")} />
          </div>
        </div>

        <div>
          <label className="label">Tags (comma separated)</label>
          <input className="input-field" placeholder="web, mobile, redesign" value={form.tags} onChange={set("tags")} />
        </div>

        <div>
          <label className="label">Accent Color</label>
          <div className="flex flex-wrap gap-2">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm((f) => ({ ...f, color: c }))}
                className={`h-8 w-8 rounded-full transition-transform ${
                  form.color === c ? "ring-2 ring-offset-2 ring-border scale-110" : "hover:scale-105"
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input-field resize-none h-28" placeholder="What is this project about?" value={form.description} onChange={set("description")} />
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
            {isEdit ? "Save Changes" : "Create Project"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
