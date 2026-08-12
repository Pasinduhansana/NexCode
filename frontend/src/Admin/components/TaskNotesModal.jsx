import { useState } from "react";
import { HiX, HiPencil, HiCheck } from "react-icons/hi";

export default function TaskNotesModal({ open, task, onClose, onSave }) {
  const [text, setText] = useState(task?.notes || "");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSave = async () => {
    setSaving(true);
    await onSave(text.trim());
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/10 to-transparent px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <HiPencil size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Task Notes</h3>
              <p className="text-xs text-text_muted">{task?.title || "Task"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-text_muted transition-colors hover:bg-muted hover:text-foreground"
          >
            <HiX size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            autoFocus
            placeholder="Add detailed notes, links, or context about this task..."
            className="w-full resize-none rounded-xl border border-border bg-background p-3.5 text-sm leading-relaxed text-foreground placeholder:text-text_muted focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-text_muted">
              Notes are saved per task and shown in the board, list, and activity log.
            </p>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/25 transition-all hover:bg-primary_hover disabled:opacity-60"
            >
              <HiCheck size={16} />
              {saving ? "Saving..." : "Save Notes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
