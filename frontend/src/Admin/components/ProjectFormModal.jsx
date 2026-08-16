import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlineX } from "react-icons/hi";
import PremiumSelect from "./PremiumSelect";
import adminApi from "../utils/adminApi";
import Modal from "./Modal";
import { PROJECT_STATUSES, PRIORITIES, PROJECT_COLORS, DEFAULT_PROJECT_STATUS, DEFAULT_PRIORITY } from "../data/constants";
import { toDateInput } from "../utils/date";

const PAID_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
];

const emptyForm = () => ({
  name: "",
  client: "",
  description: "",
  status: DEFAULT_PROJECT_STATUS,
  priority: DEFAULT_PRIORITY,
  startDate: "",
  dueDate: "",
  budget: "",
  projectCost: "",
  domainCost: "",
  advanceAmount: "",
  paidStatus: "pending",
  features: [],
  featureInput: "",
  notes: "",
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
            projectCost: project.projectCost != null ? String(project.projectCost) : "",
            domainCost: project.domainCost != null ? String(project.domainCost) : "",
            advanceAmount: project.advanceAmount != null ? String(project.advanceAmount) : "",
            paidStatus: project.paidStatus || "pending",
            features: Array.isArray(project.features) ? project.features : [],
            featureInput: "",
            notes: project.notes || "",
            tags: Array.isArray(project.tags) ? project.tags.join(", ") : "",
            color: project.color || PROJECT_COLORS[0],
          }
        : emptyForm(),
    );
  }, [open, project]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const addFeature = () => {
    const val = form.featureInput.trim();
    if (!val) return;
    if (form.features.includes(val)) {
      toast.error("Feature already added");
      return;
    }
    setForm((f) => ({ ...f, features: [...f.features, val], featureInput: "" }));
  };

  const removeFeature = (idx) => {
    setForm((f) => ({ ...f, features: f.features.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        client: form.client.trim(),
        description: form.description.trim(),
        status: form.status,
        priority: form.priority,
        startDate: form.startDate || null,
        dueDate: form.dueDate || null,
        budget: form.budget === "" ? null : Number(form.budget),
        projectCost: form.projectCost === "" ? null : Number(form.projectCost),
        domainCost: form.domainCost === "" ? null : Number(form.domainCost),
        advanceAmount: form.advanceAmount === "" ? null : Number(form.advanceAmount),
        paidStatus: form.paidStatus,
        features: form.features,
        notes: form.notes.trim(),
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        color: form.color,
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
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Project" : "New Project"}
      subtitle={isEdit ? "Update project details" : "Create a new project for your team"}
      size="max-w-2xl"
    >
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
            <label className="label">Accent Color</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className={`h-7 w-7 rounded-full transition-transform ${
                    form.color === c ? "ring-2 ring-offset-1 ring-border scale-110" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text_muted">Financial Details</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Project Cost (LKR)</label>
              <input className="input-field" type="number" min="0" placeholder="Total cost" value={form.projectCost} onChange={set("projectCost")} />
            </div>
            <div>
              <label className="label">Budget (LKR)</label>
              <input className="input-field" type="number" min="0" placeholder="Budget" value={form.budget} onChange={set("budget")} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-4">
            <div>
              <label className="label">Domain & 3rd Party Cost (LKR)</label>
              <input className="input-field" type="number" min="0" placeholder="0" value={form.domainCost} onChange={set("domainCost")} />
            </div>
            <div>
              <label className="label">Advance Amount (LKR)</label>
              <input className="input-field" type="number" min="0" placeholder="0" value={form.advanceAmount} onChange={set("advanceAmount")} />
            </div>
            <div>
              <label className="label">Paid Status</label>
              <PremiumSelect
                value={form.paidStatus}
                onChange={(val) => setForm((f) => ({ ...f, paidStatus: val }))}
                options={PAID_STATUS_OPTIONS}
                placeholder="Select paid status"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Status</label>
            <PremiumSelect
              value={form.status}
              onChange={(val) => setForm((f) => ({ ...f, status: val }))}
              options={PROJECT_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
              placeholder="Select status"
            />
          </div>
          <div>
            <label className="label">Priority</label>
            <PremiumSelect
              value={form.priority}
              onChange={(val) => setForm((f) => ({ ...f, priority: val }))}
              options={PRIORITIES.map((p) => ({ value: p.value, label: p.label }))}
              placeholder="Select priority"
            />
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
          <label className="label">Features</label>
          <div className="flex gap-2">
            <input
              className="input-field flex-1"
              placeholder="Add a feature and press Enter"
              value={form.featureInput}
              onChange={set("featureInput")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addFeature();
                }
              }}
            />
            <button type="button" onClick={addFeature} className="rounded-lg border border-border px-3 text-text_secondary hover:bg-muted hover:text-foreground">
              <HiOutlinePlus size={18} />
            </button>
          </div>
          {form.features.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {form.features.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {f}
                  <button type="button" onClick={() => removeFeature(i)} className="rounded-full p-0.5 hover:bg-primary/20">
                    <HiOutlineX size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="label">Tags (comma separated)</label>
          <input className="input-field" placeholder="web, mobile, redesign" value={form.tags} onChange={set("tags")} />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input-field resize-none h-20" placeholder="What is this project about?" value={form.description} onChange={set("description")} />
        </div>

        <div>
          <label className="label">Important Notes</label>
          <textarea className="input-field resize-none h-20" placeholder="Key notes, constraints, client requirements..." value={form.notes} onChange={set("notes")} />
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
