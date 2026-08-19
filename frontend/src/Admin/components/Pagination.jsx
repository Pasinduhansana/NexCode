"use client";

import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";

const PAGE_SIZES = [10, 20, 50, 100];

// Builds a compact list of page numbers (keeps the current page centered).
function getPageItems(current, totalPages) {
  const max = 7;
  if (totalPages <= max) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  let start = Math.max(1, current - 3);
  let end = Math.min(totalPages, start + max - 1);
  start = Math.max(1, end - max + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, total);
  const pages = getPageItems(safePage, totalPages);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
      <div className="flex flex-wrap items-center gap-3 text-xs text-text_muted">
        <span>
          Showing{" "}
          <span className="font-medium text-foreground">{from}</span>–
          <span className="font-medium text-foreground">{to}</span> of{" "}
          <span className="font-medium text-foreground">{total}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          Rows
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground outline-none transition-colors focus:border-primary/50"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-2.5 text-xs font-medium text-text_secondary transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <HiOutlineChevronLeft size={14} />
          Prev
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`h-8 min-w-8 rounded-lg px-2 text-xs font-medium transition-colors ${
              p === safePage
                ? "bg-primary text-white"
                : "border border-border text-text_secondary hover:bg-muted hover:text-foreground"
            }`}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-2.5 text-xs font-medium text-text_secondary transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        >
          Next
          <HiOutlineChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
