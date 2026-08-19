"use client";

import { useEffect, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  HiOutlinePlus,
  HiOutlineShieldCheck,
  HiOutlineUser,
  HiOutlineTrash,
  HiOutlineKey,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineLockClosed,
  HiOutlineGlobeAlt,
  HiOutlineFolder,
  HiOutlineCurrencyDollar,
  HiOutlineChartBar,
  HiOutlineSparkles,
  HiOutlineHome,
  HiOutlineChatAlt2,
  HiOutlineDocumentReport,
  HiOutlineViewBoards,
  HiOutlineClipboardList,
  HiOutlineChevronDown,
  HiOutlineCalendar,
} from "react-icons/hi";
import adminApi from "../utils/adminApi";
import usePageTitle from "../../utils/usePageTitle";
import Spinner from "../components/Spinner";
import ConfirmDialog from "../components/ConfirmDialog";
import PremiumSelect from "../components/PremiumSelect";

const PAGE_OPTIONS = [
  { id: "dashboard", label: "Dashboard", icon: HiOutlineHome },
  { id: "projects", label: "Projects", icon: HiOutlineFolder },
  { id: "board", label: "Board", icon: HiOutlineViewBoards },
  { id: "designer", label: "Designer", icon: HiOutlineSparkles },
  { id: "finance", label: "Finance", icon: HiOutlineCurrencyDollar },
  { id: "reporting", label: "Reporting", icon: HiOutlineDocumentReport },
  { id: "calendar", label: "Calendar", icon: HiOutlineCalendar },
  { id: "activity", label: "Activity", icon: HiOutlineClipboardList },
  { id: "access", label: "Access", icon: HiOutlineShieldCheck },
  { id: "assistant", label: "Assistant", icon: HiOutlineChatAlt2 },
];

const DASHBOARD_COMPONENTS = [
  { id: "stats", label: "Stats Cards" },
  { id: "finance", label: "Finance Overview" },
  { id: "projects", label: "Project Status" },
  { id: "tasks", label: "Task Summary" },
];

const EXPENSE_ACCESS_OPTIONS = [
  { value: "none", label: "No Access" },
  { value: "view", label: "View Only" },
  { value: "edit", label: "Full Access" },
];

const PROJECT_ACCESS_OPTIONS = [
  { value: "none", label: "No Access" },
  { value: "assigned", label: "Assigned Only" },
  { value: "all", label: "All Projects" },
];

const emptyForm = () => ({
  id: "",
  name: "",
  accessKey: "",
  access: {
    pages: ["dashboard", "projects", "board"],
    dashboardComponents: ["stats", "finance", "projects", "tasks"],
    projectAccess: "all",
    projectIds: [],
    expenseAccess: "view",
  },
});

export default function AdminAccessPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);
  const [expanded, setExpanded] = useState({});
  usePageTitle("Access");

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const fetchUsers = async () => {
    try {
      const { data } = await adminApi.get("/users");
      setUsers(data.users || []);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const { data } = await adminApi.get("/auth/verify");
      if (data.user) setCurrentUser(data.user);
    } catch {}
  };

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser && !currentUser.superAdmin) {
      toast.error("Access denied");
      navigate("/admin");
    }
  }, [currentUser, navigate]);

  const isCallerSuperAdmin = currentUser?.superAdmin;

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!form.id.trim() || !form.name.trim() || !form.accessKey.trim()) {
      toast.error("All fields are required");
      return;
    }
    setSaving(true);
    try {
      await adminApi.post("/users", {
        id: form.id.trim().toLowerCase(),
        name: form.name.trim(),
        accessKey: form.accessKey,
        access: form.access,
      });
      toast.success("User created");
      setShowForm(false);
      setForm(emptyForm());
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAccess = async (userId, access) => {
    try {
      await adminApi.put(`/users/${userId}`, { access });
      toast.success("Access updated");
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, access } : u)));
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update access");
    }
  };

  const handleChangePassword = async (userId) => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    try {
      await adminApi.put(`/users/${userId}/password`, { newPassword });
      toast.success("Password changed");
      setShowPassword(null);
      setNewPassword("");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to change password");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeletingLoading(true);
    try {
      await adminApi.delete(`/users/${deleting.id}`);
      toast.success("User deleted");
      setUsers((prev) => prev.filter((u) => u.id !== deleting.id));
      setDeleting(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete user");
    } finally {
      setDeletingLoading(false);
    }
  };

  const togglePage = (userId, pageId) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const pages = user.access?.pages || [];
    const next = pages.includes(pageId) ? pages.filter((p) => p !== pageId) : [...pages, pageId];
    handleUpdateAccess(userId, { ...user.access, pages: next });
  };

  const toggleDashboardComponent = (userId, compId) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const comps = user.access?.dashboardComponents || [];
    const next = comps.includes(compId) ? comps.filter((c) => c !== compId) : [...comps, compId];
    handleUpdateAccess(userId, { ...user.access, dashboardComponents: next });
  };

  if (loading) return <Spinner label="Loading users..." />;

  const cellBase =
    "block px-4 py-3 align-top border-b border-border md:table-cell md:border-b-0 md:border-r md:border-border md:last:border-r-0 " +
    "before:mb-1.5 before:block before:text-[10px] before:font-semibold before:uppercase before:tracking-wider before:text-text_muted before:content-[attr(data-label)] md:before:hidden";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">Access Management</h1>
          <p className="mt-1 text-sm text-text_secondary">Manage user roles, permissions, and access levels.</p>
        </div>
        {isCallerSuperAdmin && (
          <button
            type="button"
            onClick={() => {
              setForm(emptyForm());
              setShowForm(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary_hover"
          >
            <HiOutlinePlus size={16} />
            Add User
          </button>
        )}
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-foreground">New User</h3>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-1.5 text-text_secondary hover:bg-muted">
              <HiOutlineX size={18} />
            </button>
          </div>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="label">User ID</label>
                <input
                  className="input-field"
                  placeholder="e.g. john"
                  value={form.id}
                  onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Display Name</label>
                <input
                  className="input-field"
                  placeholder="e.g. John Doe"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Access Key</label>
                <input
                  className="input-field"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={form.accessKey}
                  onChange={(e) => setForm((f) => ({ ...f, accessKey: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary_hover disabled:opacity-60">
                {saving && <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                Create User
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm md:min-w-[760px]">
          <thead className="hidden bg-muted/40 md:table-header-group">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text_muted">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text_muted">Page Access</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text_muted">Dashboard</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text_muted">Project Access</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text_muted">Expense Access</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text_muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSuper = u.superAdmin;
              const isMe = u.id === currentUser?.id;
              const pages = u.access?.pages || [];
              const dashComps = u.access?.dashboardComponents || [];
              const expenseAcc = u.access?.expenseAccess || "none";
              const projAccess = u.access?.projectAccess || "all";

              const isOpen = expanded[u.id];
              const detailCls = isOpen ? "" : "max-md:hidden";

              return (
                <Fragment key={u.id}>
                  <tr className="block border-b border-border last:border-0 md:table-row md:border-0">
                    {/* User */}
                    <td data-label="User" className={cellBase}>
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white ${isSuper ? "bg-primary" : "bg-muted text-foreground"}`}>
                          {isSuper ? <HiOutlineShieldCheck size={18} /> : u.name[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="truncate font-display font-bold text-foreground">{u.name}</span>
                            {isSuper && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                <HiOutlineShieldCheck size={10} />
                                Super Admin
                              </span>
                            )}
                            {isMe && (
                              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-text_muted">@{u.id}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleExpand(u.id)}
                          aria-label={isOpen ? "Collapse row" : "Expand row"}
                          aria-expanded={isOpen}
                          className="shrink-0 rounded-lg p-1.5 text-text_secondary hover:bg-muted md:hidden"
                        >
                          <HiOutlineChevronDown size={18} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>
                      </div>
                    </td>

                    {/* Page Access */}
                    <td data-label="Page Access" className={`${cellBase} ${detailCls}`}>
                      <div className="flex flex-wrap gap-1.5">
                        {PAGE_OPTIONS.map((p) => {
                          const has = pages.includes(p.id);
                          const locked = isSuper || (isMe && p.id === "access");
                          return (
                            <button
                              key={p.id}
                              type="button"
                              disabled={locked}
                              onClick={() => !locked && togglePage(u.id, p.id)}
                              className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium transition-all ${
                                has
                                  ? "bg-primary/10 text-primary border border-primary/20"
                                  : "bg-muted text-text_secondary border border-transparent hover:border-border"
                              } ${locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              <p.icon size={11} />
                              {p.label}
                              {has && <HiOutlineCheck size={9} />}
                            </button>
                          );
                        })}
                      </div>
                    </td>

                    {/* Dashboard Components */}
                    <td data-label="Dashboard" className={`${cellBase} ${detailCls}`}>
                      {pages.includes("dashboard") ? (
                        <div className="flex flex-wrap gap-1.5">
                          {DASHBOARD_COMPONENTS.map((c) => {
                            const has = dashComps.includes(c.id);
                            return (
                              <button
                                key={c.id}
                                type="button"
                                disabled={isSuper}
                                onClick={() => !isSuper && toggleDashboardComponent(u.id, c.id)}
                                className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium transition-all ${
                                  has
                                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                    : "bg-muted text-text_secondary border border-transparent hover:border-border"
                                } ${isSuper ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                              >
                                {c.label}
                                {has && <HiOutlineCheck size={9} />}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-xs text-text_muted">—</span>
                      )}
                    </td>

                    {/* Project Access */}
                    <td data-label="Project Access" className={`${cellBase} ${detailCls}`}>
                      <PremiumSelect
                        value={projAccess}
                        onChange={(val) => !isSuper && handleUpdateAccess(u.id, { ...u.access, projectAccess: val })}
                        options={PROJECT_ACCESS_OPTIONS}
                        compact
                        className="w-full max-w-[170px]"
                      />
                    </td>

                    {/* Expense Access */}
                    <td data-label="Expense Access" className={`${cellBase} ${detailCls}`}>
                      <PremiumSelect
                        value={expenseAcc}
                        onChange={(val) => !isSuper && handleUpdateAccess(u.id, { ...u.access, expenseAccess: val })}
                        options={EXPENSE_ACCESS_OPTIONS}
                        compact
                        className="w-full max-w-[170px]"
                      />
                    </td>

                    {/* Actions */}
                    <td data-label="Actions" className={`${cellBase} ${detailCls}`}>
                      {isCallerSuperAdmin ? (
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setShowPassword(u.id);
                              setNewPassword("");
                            }}
                            className="rounded-lg border border-border p-2 text-text_secondary hover:bg-muted hover:text-foreground"
                            title="Change password"
                          >
                            <HiOutlineKey size={15} />
                          </button>
                          {!isSuper && (
                            <button
                              type="button"
                              onClick={() => setDeleting(u)}
                              className="rounded-lg border border-border p-2 text-text_secondary hover:bg-rose-500/10 hover:text-rose-500"
                              title="Delete user"
                            >
                              <HiOutlineTrash size={15} />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-text_muted">—</span>
                      )}
                    </td>
                  </tr>

                  {/* Password Change */}
                  {showPassword === u.id && (
                    <tr className="block border-b border-border bg-muted/30 md:table-row md:border-0">
                      <td colSpan={6} className="block px-4 py-3 md:table-cell">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <HiOutlineLockClosed size={14} className="shrink-0 text-text_muted" />
                          <input
                            type="password"
                            className="input-field flex-1"
                            placeholder="New password (min 6 chars)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleChangePassword(u.id)}
                              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary_hover"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowPassword(null)}
                              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text_secondary hover:bg-muted"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete user?"
        message={deleting ? `Remove "${deleting.name}" (@${deleting.id}) from the admin panel?` : ""}
        loading={deletingLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
