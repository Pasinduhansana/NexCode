"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * ScrollToTop — scrolls the window to the top on every route change.
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
