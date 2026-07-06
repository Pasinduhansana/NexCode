// src/hooks/useAdModal.js
import { useEffect, useState } from "react";

export default function useAdModal() {
  const [open, setOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem("ad_seen");
    const manualOpen = sessionStorage.getItem("ad_modal_open");

    if (manualOpen) {
      const idx = Number(sessionStorage.getItem("ad_modal_index"));
      setStartIndex(Number.isFinite(idx) && idx >= 0 ? idx : 0);
      setOpen(true);
      sessionStorage.removeItem("ad_modal_open");
      sessionStorage.removeItem("ad_modal_index");
      return;
    }

    if (!hasSeen) {
      const timer = setTimeout(() => {
        setOpen(true);
        sessionStorage.setItem("ad_seen", "true");
      }, 800); // small delay for smooth entry

      return () => clearTimeout(timer);
    }
  }, []);

  return { open, setOpen, startIndex };
}
