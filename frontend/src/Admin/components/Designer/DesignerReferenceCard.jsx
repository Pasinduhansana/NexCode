import {
  HiOutlineExternalLink,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineArrowUp,
  HiOutlineArrowDown,
  HiOutlineGlobeAlt,
  HiOutlineCalendar,
  HiOutlineTag,
} from "react-icons/hi";
import { domainFromUrl, formatDateTime, DESIGN_REFERENCE_TYPES } from "../../utils/designerApi";

const TYPE_META = {
  website: { label: "Website", classes: "bg-primary/10 text-primary border-primary/20" },
  image: { label: "Image", classes: "bg-violet-500/10 text-violet-500 border-violet-500/30" },
  file: { label: "File", classes: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
  other: { label: "Other", classes: "bg-slate-500/10 text-slate-500 border-slate-500/30" },
};

export default function DesignerReferenceCard({
  reference,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  showReorder = false,
}) {
  const typeMeta = TYPE_META[reference.type] || TYPE_META.other;
  const domain = domainFromUrl(reference.url);
  const tags = Array.isArray(reference.tags) ? reference.tags : [];

  return (
    <button
      type="button"
      onClick={() => onSelect?.(reference)}
      className={`group relative flex flex-col rounded-2xl border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
        selected ? "border-primary/50 ring-2 ring-primary/10" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate font-display font-bold text-foreground">{reference.title}</div>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-text_muted">
            <HiOutlineGlobeAlt size={12} className="shrink-0" />
            <span className="truncate">{domain || reference.url}</span>
          </div>
        </div>
        <span className={`badge shrink-0 border ${typeMeta.classes}`}>{typeMeta.label}</span>
      </div>

      {reference.notes && <p className="mt-3 line-clamp-2 text-sm text-text_secondary">{reference.notes}</p>}

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.slice(0, 4).map((tag) => (
            <span key={tag} className="inline-flex items-center gap-0.5 rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-text_secondary">
              <HiOutlineTag size={10} />
              {tag}
            </span>
          ))}
          {tags.length > 4 && <span className="text-[11px] text-text_muted">+{tags.length - 4}</span>}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
        <span className="inline-flex items-center gap-1 text-[11px] text-text_muted">
          <HiOutlineCalendar size={11} />
          {formatDateTime(reference.updatedAt)}
        </span>
        <div className="flex items-center gap-1">
          {showReorder && (
            <>
              <button
                type="button"
                title="Move up"
                disabled={!canMoveUp}
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveUp?.();
                }}
                className="rounded-lg p-1 text-text_secondary transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Move reference up"
              >
                <HiOutlineArrowUp size={14} />
              </button>
              <button
                type="button"
                title="Move down"
                disabled={!canMoveDown}
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveDown?.();
                }}
                className="rounded-lg p-1 text-text_secondary transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Move reference down"
              >
                <HiOutlineArrowDown size={14} />
              </button>
            </>
          )}
          <a
            href={reference.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open reference"
            onClick={(e) => e.stopPropagation()}
            className="rounded-lg p-1.5 text-text_secondary transition-colors hover:bg-primary/10 hover:text-primary"
            aria-label="Open reference link"
          >
            <HiOutlineExternalLink size={15} />
          </a>
          <button
            type="button"
            title="Edit reference"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="rounded-lg p-1.5 text-text_secondary transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Edit reference"
          >
            <HiOutlinePencilAlt size={15} />
          </button>
          <button
            type="button"
            title="Delete reference"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            className="rounded-lg p-1.5 text-text_secondary transition-colors hover:bg-rose-500/10 hover:text-rose-500"
            aria-label="Delete reference"
          >
            <HiOutlineTrash size={15} />
          </button>
        </div>
      </div>
    </button>
  );
}