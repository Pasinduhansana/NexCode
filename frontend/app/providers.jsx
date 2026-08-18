"use client";

import { ThemeProvider } from "@/src/context/ThemeContext";
import { AdminAuthProvider } from "@/src/Admin/context/AdminAuthContext";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";

export default function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <AdminAuthProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: "12px", fontFamily: "DM Sans, sans-serif", fontSize: "14px" },
          }}
        />
      </AdminAuthProvider>
      <Analytics />
    </ThemeProvider>
  );
}
