import { NavLink, useNavigate } from "react-router-dom";
import { HiOutlineHome, HiOutlineFolder, HiOutlineLogout, HiX, HiGlobeAlt, HiOutlineClipboardList, HiOutlineViewBoards, HiOutlineCurrencyDollar, HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineSparkles, HiOutlineShieldCheck, HiOutlineChatAlt2, HiOutlineDocumentReport } from "react-icons/hi";
import { useAdminAuth } from "../context/AdminAuthContext";

const allLinks = [
  { to: "/admin", end: true, icon: HiOutlineHome, label: "Dashboard", pageId: "dashboard" },
  { to: "/admin/projects", end: false, icon: HiOutlineFolder, label: "Projects", pageId: "projects" },
  { to: "/admin/board", end: false, icon: HiOutlineViewBoards, label: "Board", pageId: "board" },
  { to: "/admin/designer", end: false, icon: HiOutlineSparkles, label: "Designer", pageId: "designer" },
  { to: "/admin/finance", end: false, icon: HiOutlineCurrencyDollar, label: "Finance", pageId: "finance" },
  { to: "/admin/reporting", end: false, icon: HiOutlineDocumentReport, label: "Reporting", pageId: "reporting" },
  { to: "/admin/activity", end: false, icon: HiOutlineClipboardList, label: "Activity", pageId: "activity" },
  { to: "/admin/access", end: false, icon: HiOutlineShieldCheck, label: "Access", pageId: "access" },
  { to: "/admin/assistant", end: false, icon: HiOutlineChatAlt2, label: "Assistant", pageId: "assistant" },
];

export default function AdminSidebar({ open, onClose, collapsed, onToggleCollapse }) {
  const { user, logout, hasAccess } = useAdminAuth();
  const navigate = useNavigate();

  const links = allLinks.filter((l) => hasAccess(l.pageId));

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      {/* Mobile overlay sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-display text-sm font-extrabold text-white">
              N
            </div>
            <div>
              <div className="font-display text-sm font-bold text-foreground">NexCode Admin</div>
              <div className="text-[11px] text-text_muted">Project Management</div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-text_secondary hover:bg-muted" aria-label="Close menu">
            <HiX size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-1 px-3 py-4">
          {links.map(({ to, end, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-text_secondary hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          <div className="mt-4 rounded-xl border border-border bg-muted/40 px-3 py-3">
            <div className="text-[11px] uppercase tracking-wider text-text_muted">Signed in as</div>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="truncate text-sm font-semibold text-foreground">{user?.name || "Admin"}</span>
              {user?.superAdmin && <HiOutlineShieldCheck size={12} className="shrink-0 text-primary" />}
            </div>
          </div>
        </div>

        <div className="border-t border-border px-3 py-4">
          <a
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text_secondary hover:bg-muted hover:text-foreground"
          >
            <HiGlobeAlt size={18} />
            View Site
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-500/10"
          >
            <HiOutlineLogout size={18} />
            Log out
          </button>
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-card transition-all duration-300 lg:flex ${
          collapsed ? "w-[68px]" : "w-64"
        }`}
      >
        <div className={`flex items-center border-b border-border px-4 py-4 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary font-display text-sm font-extrabold text-white">
                N
              </div>
              <div>
                <div className="font-display text-sm font-bold text-foreground">NexCode Admin</div>
                <div className="text-[11px] text-text_muted">Project Management</div>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-display text-sm font-extrabold text-white">
              N
            </div>
          )}
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`rounded-lg p-1.5 text-text_muted transition-colors hover:bg-muted hover:text-foreground ${collapsed ? "hidden" : ""}`}
            aria-label="Collapse sidebar"
          >
            <HiOutlineChevronLeft size={16} />
          </button>
        </div>

        <div className="flex-1 space-y-1 px-2 py-4">
          {links.map(({ to, end, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl text-sm font-medium transition-colors ${
                  collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-text_secondary hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}

          {!collapsed && (
            <div className="mt-4 rounded-xl border border-border bg-muted/40 px-3 py-3">
              <div className="text-[11px] uppercase tracking-wider text-text_muted">Signed in as</div>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="truncate text-sm font-semibold text-foreground">{user?.name || "Admin"}</span>
                {user?.superAdmin && <HiOutlineShieldCheck size={12} className="shrink-0 text-primary" />}
              </div>
            </div>
          )}

          {collapsed && (
            <div className="mt-4 flex justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary" title={user?.name || "Admin"}>
                {(user?.name || "A")[0]}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border px-2 py-4">
          {!collapsed ? (
            <>
              <a
                href="/"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text_secondary hover:bg-muted hover:text-foreground"
              >
                <HiGlobeAlt size={18} />
                View Site
              </a>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-500/10"
              >
                <HiOutlineLogout size={18} />
                Log out
              </button>
            </>
          ) : (
            <>
              <a
                href="/"
                title="View Site"
                className="flex justify-center rounded-xl px-2 py-2.5 text-text_secondary hover:bg-muted hover:text-foreground"
              >
                <HiGlobeAlt size={18} />
              </a>
              <button
                type="button"
                onClick={handleLogout}
                title="Log out"
                className="flex w-full justify-center rounded-xl px-2 py-2.5 text-rose-500 hover:bg-rose-500/10"
              >
                <HiOutlineLogout size={18} />
              </button>
            </>
          )}

          {collapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="mt-2 flex w-full justify-center rounded-xl px-2 py-2.5 text-text_muted transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Expand sidebar"
            >
              <HiOutlineChevronRight size={16} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
