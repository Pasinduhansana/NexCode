import { NavLink, useNavigate } from "react-router-dom";
import { HiOutlineHome, HiOutlineFolder, HiOutlineLogout, HiX, HiGlobeAlt, HiOutlineClipboardList, HiOutlineViewBoards, HiOutlineCurrencyDollar } from "react-icons/hi";
import { useAdminAuth } from "../context/AdminAuthContext";

const links = [
  { to: "/admin", end: true, icon: HiOutlineHome, label: "Dashboard" },
  { to: "/admin/projects", end: false, icon: HiOutlineFolder, label: "Projects" },
  { to: "/admin/board", end: false, icon: HiOutlineViewBoards, label: "Board" },
  { to: "/admin/finance", end: false, icon: HiOutlineCurrencyDollar, label: "Finance" },
  { to: "/admin/activity", end: false, icon: HiOutlineClipboardList, label: "Activity" },
];

export default function AdminSidebar({ open, onClose }) {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 lg:translate-x-0 ${
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
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-text_secondary hover:bg-muted lg:hidden" aria-label="Close menu">
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
            <div className="mt-0.5 truncate text-sm font-semibold text-foreground">{user?.name || "Admin"}</div>
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
    </>
  );
}
