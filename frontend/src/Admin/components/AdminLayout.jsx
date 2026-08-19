"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { HiOutlineMenu } from "react-icons/hi";
import { useAdminAuth } from "../context/AdminAuthContext";
import AdminSidebar from "./AdminSidebar";
import Spinner from "./Spinner";

const SIDEBAR_KEY = "nexcode_sidebar_collapsed";

export default function AdminLayout({ children }) {
  const { isAuthenticated, ready, user } = useAdminAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
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
      navigate("/admin/login");
    }
  }, [ready, isAuthenticated, pathname, navigate]);

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

  // The login route is a standalone, centered screen — no sidebar or chrome.
  const isLoginPage = pathname === "/admin/login";

  return (
    <div className="admin-shell min-h-screen bg-background text-foreground">
      {!isLoginPage && (
        <AdminSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
      )}

      <div className={`transition-all duration-300 ${!isLoginPage && (collapsed ? "lg:pl-[68px]" : "lg:pl-64")}`}>
        {!isLoginPage && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="fixed left-4 top-4 z-30 rounded-lg p-2 text-text_secondary hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Open menu"
          >
            <HiOutlineMenu size={20} />
          </button>
        )}

        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
