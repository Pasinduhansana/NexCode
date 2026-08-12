import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { HiOutlineMenu, HiOutlineUserCircle } from "react-icons/hi";
import { useAdminAuth } from "../context/AdminAuthContext";
import AdminSidebar from "./AdminSidebar";
import Spinner from "./Spinner";

export default function AdminLayout() {
  const { isAuthenticated, ready, user } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner label="Checking session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
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
          <Outlet />
        </main>
      </div>
    </div>
  );
}
