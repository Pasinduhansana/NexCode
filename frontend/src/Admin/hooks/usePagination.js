import { useState, useMemo, useEffect } from "react";

// Lightweight pagination state for client-filtered admin lists.
// Returns the current (clamped) page, page size, and a memoized slice of `items`.
export function usePagination(items = [], initialPageSize = 10) {
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Clamp the current page if it falls outside the valid range (e.g. after a filter/search).
  const safePage = Math.min(Math.max(1, page), totalPages);
  useEffect(() => {
    if (page !== safePage) setPageState(safePage);
  }, [page, safePage]);

  const slice = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  const setPage = (p) => setPageState(Math.min(Math.max(1, p), totalPages));
  const setPageSize = (size) => {
    setPageSizeState(size);
    setPageState(1);
  };

  return { page: safePage, setPage, pageSize, setPageSize, total, totalPages, slice };
}
