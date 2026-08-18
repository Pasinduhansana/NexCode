import { useState } from "react";
import {
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineGlobeAlt,
  HiOutlineExternalLink,
  HiOutlineArrowLeft,
} from "react-icons/hi";
import { domainFromUrl, formatDateTime } from "../../utils/designerApi";

export default function DesignerNotesPanel({
  title,
  subtitle,
  notes,
  onAdd,
  onEdit,
  onDelete,
  reference,
  onClearReference,
  onOpenReference,
  busy = false,
}) {
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const submitAdd = async () => {
    const text = draft.trim();
    if (!text || busy) return;
    setAdding(true);
    try {
      await onAdd(text);
      setDraft("");
    } finally {
      setAdding(false);
    }
  };

  const submitEdit = async (note) => {
    const text = editText.trim();
    if (!text || busy) return;
    try {
      await onEdit(note, text);
      setEditingId(null);
      setEditText("");
    } finally {
      // keep local editing state until success path clears it
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        {reference ? (
          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onClearReference}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-text_secondary hover:text-primary"
              >
                <HiOutlineArrowLeft size={12} />
                Back to {subtitle || "notes"}
              </button>
              <a
                href={reference.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-1 text-text_secondary transition-colors hover:bg-primary/10 hover:text-primary"
                title="Open reference"
              >
                <HiOutlineExternalLink size={14} />
              </a>
            </div>
            <div className="truncate font-display text-sm font-bold text-foreground" title={reference.title}>
              {reference.title}
            </div>
            <div className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-text_muted">
              <HiOutlineGlobeAlt size={11} className="shrink-0" />
              <span className="truncate">{domainFromUrl(reference.url)}</span>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-[11px] uppercase tracking-wider text-text_muted">Notes</div>
            <div className="truncate font-display text-sm font-bold text-foreground" title={title}>
              {title}
            </div>
            {subtitle && <div className="truncate text-[11px] text-text_secondary">{subtitle}</div>}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {notes.length === 0 && !reference && (
          <p className="text-center text-sm text-text_muted">No notes yet. Add one below.</p>
        )}

        {notes.length === 0 && reference && (
          <p className="text-center text-sm text-text_muted">No notes on this reference.</p>
        )}

        <div className="space-y-2.5">
          {notes.map((note) => (
            <div key={String(note._id)} className="rounded-xl border border-border bg-background/60 p-3">
              {editingId === String(note._id) ? (
                <div className="space-y-2">
                  <textarea
                    className="input-field min-h-[64px] resize-y text-xs"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    autoFocus
                  />
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setEditText("");
                      }}
                      className="rounded-lg p-1.5 text-text_secondary hover:bg-muted"
                      aria-label="Cancel edit"
                    >
                      <HiOutlineX size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => submitEdit(note)}
                      disabled={busy}
                      className="rounded-lg bg-primary p-1.5 text-white hover:bg-primary_hover disabled:opacity-60"
                      aria-label="Save note"
                    >
                      <HiOutlineCheck size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="whitespace-pre-wrap break-words text-sm text-foreground">{note.text}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-text_muted">{formatDateTime(note.updatedAt)}</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(String(note._id));
                          setEditText(note.text);
                        }}
                        className="rounded-lg p-1 text-text_secondary hover:bg-muted hover:text-foreground"
                        aria-label="Edit note"
                      >
                        <HiOutlinePencilAlt size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(note)}
                        className="rounded-lg p-1 text-text_secondary hover:bg-rose-500/10 hover:text-rose-500"
                        aria-label="Delete note"
                      >
                        <HiOutlineTrash size={13} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2">
          <textarea
            className="input-field min-h-[44px] flex-1 resize-none text-xs"
            placeholder="Add a note..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submitAdd();
              }
            }}
          />
          <button
            type="button"
            onClick={submitAdd}
            disabled={busy || !draft.trim()}
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-primary px-3 text-white transition-colors hover:bg-primary_hover disabled:opacity-50"
            aria-label="Add note"
          >
            <HiOutlinePlus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}