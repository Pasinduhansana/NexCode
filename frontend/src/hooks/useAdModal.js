// src/hooks/useAdModal.js
import { useEffect, useState } from "react";

export default function useAdModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem("ad_seen");

    if (!hasSeen) {
      const timer = setTimeout(() => {
        setOpen(true);
        sessionStorage.setItem("ad_seen", "true");
      }, 800); // small delay for smooth entry

      return () => clearTimeout(timer);
    }
  }, []);

  return { open, setOpen };
}