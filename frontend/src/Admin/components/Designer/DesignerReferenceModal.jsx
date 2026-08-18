import { useEffect, useState } from "react";
import Modal from "../Modal";
import PremiumSelect from "../PremiumSelect";
import { DESIGN_REFERENCE_TYPES } from "../../utils/designerApi";

const TYPE_OPTIONS = DESIGN_REFERENCE_TYPES.map((t) => ({ value: t, label: t[0].toUpperCase() + t.slice(1) }));

const normalizeTagsInput = (value) =>
  value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 30);

export default function DesignerReferenceModal({
  open,
  reference,
  sections,
  defaultSectionId,
  onClose,
  onSaved,
}) {
  const isEdit = Boolean(reference);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState("website");
  const [sectionId, setSectionId] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(reference?.title || "");
    setUrl(reference?.url || "");
    setType(reference?.type || "website");
    setSectionId(reference?.sectionId || defaultSectionId || "");
    setTags((reference?.tags || []).join(", "));
    setNotes(reference?.notes || "");
    setError("");
    setSaving(false);
  }, [open, reference, defaultSectionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("A title is required.");
      return;
    }
    if (!url.trim()) {
      setError("A reference URL is required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        url: url.trim(),
        type,
        sectionId: sectionId || null,
        tags: normalizeTagsInput(tags),
        notes: notes.trim(),
      };
      await onSaved(payload, reference);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.error || "Could not save the reference. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={isEdit ? "Edit reference" : "Add reference"}
      subtitle="Save a design link under this project/section."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-600">
            {error}
          </div>
        )}

        <div>
          <label className="label">Title</label>
          <input
            className="input-field"
            placeholder="e.g. Modern Coffee Landing Page"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="label">URL</label>
          <input
            className="input-field"
            placeholder="https://example.com/design"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Type</label>
            <PremiumSelect value={type} onChange={setType} options={TYPE_OPTIONS} />
          </div>
          <div>
            <label className="label">Design section</label>
            <PremiumSelect
              value={sectionId || ""}
              onChange={setSectionId}
              options={[
                { value: "", label: "Uncategorized" },
                ...sections.map((s) => ({ value: String(s._id), label: s.name })),
              ]}
            />
          </div>
        </div>

        <div>
          <label className="label">Tags (comma separated)</label>
          <input
            className="input-field"
            placeholder="minimal, hero, coffee"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        <div>
          <label className="label">Notes / description</label>
          <textarea
            className="input-field min-h-[84px] resize-y"
            placeholder="Good hero section idea..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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
            {isEdit ? "Save changes" : "Add reference"}
          </button>
        </div>
      </form>
    </Modal>
  );
}