import { useMemo, useState } from "react";
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePencilAlt, HiOutlineX } from "react-icons/hi";
import ConfirmDialog from "../ConfirmDialog";

const GROUPS = ["Today", "Yesterday", "Older"];

function groupConversations(conversations) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const buckets = { Today: [], Yesterday: [], Older: [] };

  for (const conv of conversations) {
    const d = new Date(conv.updatedAt);
    if (Number.isNaN(d.getTime())) {
      buckets.Older.push(conv);
      continue;
    }
    const that = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const days = Math.round((today - that) / 86400000);
    if (days <= 0) buckets.Today.push(conv);
    else if (days === 1) buckets.Yesterday.push(conv);
    else buckets.Older.push(conv);
  }
  return buckets;
}

function ConversationItem({ conversation, active, onSelect, onRename, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(conversation.title);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const startRename = () => {
    setDraft(conversation.title);
    setEditing(true);
  };

  const commitRename = () => {
    const clean = draft.trim();
    setEditing(false);
    if (clean && clean !== conversation.title) onRename(conversation.id, clean);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(conversation.id);
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <li>
      <div
        className={`group flex items-center gap-0.5 rounded-lg px-2 py-1.5 transition-colors ${
          active
            ? "bg-primary/10 text-primary"
            : "text-text_secondary hover:bg-muted hover:text-foreground"
        }`}
      >
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") setEditing(false);
            }}
            onBlur={commitRename}
            aria-label="Conversation title"
            className="min-w-0 flex-1 rounded border border-primary/30 bg-background px-1.5 py-0.5 text-sm text-foreground focus:outline-none"
          />
        ) : (
          <>
            <button
              type="button"
              onClick={() => onSelect(conversation.id)}
              title={conversation.title}
              className="min-w-0 flex-1 truncate text-left text-sm"
            >
              {conversation.title}
            </button>
            <button
              type="button"
              onClick={startRename}
              title="Rename conversation"
              aria-label={`Rename ${conversation.title}`}
              className={`rounded p-1 transition-opacity hover:bg-muted hover:text-foreground ${
                active ? "" : "opacity-0 group-hover:opacity-100 focus:opacity-100"
              }`}
            >
              <HiOutlinePencilAlt size={13} />
            </button>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              title="Delete conversation"
              aria-label={`Delete ${conversation.title}`}
              className={`rounded p-1 transition-opacity hover:bg-muted hover:text-rose-500 ${
                active ? "" : "opacity-0 group-hover:opacity-100 focus:opacity-100"
              }`}
            >
              <HiOutlineTrash size={13} />
            </button>
          </>
        )}
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete conversation?"
        message={`"${conversation.title}" and its messages will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </li>
  );
}

export default function ConversationSidebar({
  conversations,
  activeId,
  onNewChat,
  onSelect,
  onRename,
  onDelete,
  onCloseMobile,
}) {
  const grouped = useMemo(() => groupConversations(conversations), [conversations]);

  return (
    <div className="flex h-full w-full flex-col bg-card">
      <div className="flex flex-col items-center justify-between gap-2 p-3 text-left">
        <div>
        <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-2xl w-full">AI Assistant</h1>
          <p className="mt-1 text-[13px] text-text_secondary">
            Get instant help with your projects, tasks, and finances.
          </p></div>
        <button
          type="button"
          onClick={onNewChat}
          className="inline-flex flex-1 w-full items-center justify-center gap-2 pr-5 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary_hover"
        >
          <HiOutlinePlus size={16} />
          New Chat
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          className="rounded-lg p-2 text-text_secondary hover:bg-muted hover:text-foreground lg:hidden"
          aria-label="Close conversation list"
        >
          <HiOutlineX size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-2 pb-4" aria-label="Conversations">
        {conversations.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-text_muted">
            No conversations yet.
          </p>
        ) : (
          GROUPS.map((label) => {
            const items = grouped[label];
            if (!items || items.length === 0) return null;
            return (
              <div key={label}>
                <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-text_muted">
                  {label}
                </div>
                <ul className="space-y-0.5">
                  {items.map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      active={conv.id === activeId}
                      onSelect={onSelect}
                      onRename={onRename}
                      onDelete={onDelete}
                    />
                  ))}
                </ul>
              </div>
            );
          })
        )}
      </nav>
    </div>
  );
}