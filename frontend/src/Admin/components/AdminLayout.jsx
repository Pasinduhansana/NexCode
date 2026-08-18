"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { HiOutlineMenu, HiOutlineUserCircle } from "react-icons/hi";
import { useAdminAuth } from "../context/AdminAuthContext";
import AdminSidebar from "./AdminSidebar";
import Spinner from "./Spinner";

const SIDEBAR_KEY = "nexcode_sidebar_collapsed";

export default function AdminLayout({ children }) {
  const { isAuthenticated, ready, user } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, String(collapsed));
    } catch {}
  }, [collapsed]);

  useEffect(() => {
    if (ready && !isAuthenticated && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [ready, isAuthenticated, pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner label="Checking session..." />
      </div>
    );
  }

  if (!isAuthenticated && pathname !== "/admin/login") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      <div className={`transition-all duration-300 ${collapsed ? "lg:pl-[68px]" : "lg:pl-64"}`}>
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-card/90 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-text_secondary hover:bg-muted hover:text-foreground lg:hidden"
              aria-label="Open menu"
            >
              <HiOutlineMenu size={20} />
            </button>
            <div className="font-display text-sm font-semibold text-text_secondary">
              Company Project Management
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-1.5">
            <HiOutlineUserCircle size={18} className="text-primary" />
            <span className="text-sm font-medium text-foreground">{user?.name || "Admin"}</span>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
