import { useEffect, useState } from "react";
import Modal from "../Modal";

export default function DesignerSectionModal({ open, section, onClose, onSaved }) {
  const isEdit = Boolean(section);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(section?.name || "");
    setError("");
    setSaving(false);
  }, [open, section]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("A section name is required.");
      return;
    }
    setSaving(true);
    try {
      await onSaved({ name: name.trim() }, section);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || "Could not save the section. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={isEdit ? "Rename section" : "New design section"}
      subtitle="Group references and notes under a page/section of the project."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-600">
            {error}
          </div>
        )}
        <div>
          <label className="label">Section name</label>
          <input
            className="input-field"
            placeholder="e.g. Landing Page"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary_hover disabled:opacity-60"
          >
            {saving && <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
            {isEdit ? "Save changes" : "Create section"}
          </button>
        </div>
      </form>
    </Modal>
  );
}