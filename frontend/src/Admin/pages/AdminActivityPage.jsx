import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { HiOutlineClipboardList, HiOutlineUserCircle, HiRefresh, HiOutlineUser, HiOutlinePencilAlt } from "react-icons/hi";
import adminApi from "../utils/adminApi";
import usePageTitle from "../../utils/usePageTitle";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import PremiumSelect from "../components/PremiumSelect";

const ACTION_META = {
  login: { label: "Signed in", badge: "bg-primary/10 text-primary border-primary/30" },
  create: { label: "Created", badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" },
  update: { label: "Updated", badge: "bg-amber-500/10 text-amber-500 border-amber-500/30" },
  delete: { label: "Deleted", badge: "bg-rose-500/10 text-rose-500 border-rose-500/30" },
};

const ACTION_FILTERS = [
  { value: "all", label: "All actions" },
  { value: "login", label: "Sign-ins" },
  { value: "create", label: "Created" },
  { value: "update", label: "Updates" },
  { value: "delete", label: "Deletes" },
];

const formatTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d)) return "";
  return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function AdminActivityPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  usePageTitle("Activity Log");

  const fetchActivities = async () => {
    try {
      const params = new URLSearchParams({ limit: "200" });
      if (actionFilter !== "all") params.set("action", actionFilter);
      const { data } = await adminApi.get(`/activities?${params.toString()}`);
      setActivities(data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load activity log");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionFilter]);

  const users = useMemo(() => {
    const map = new Map();
    activities.forEach((a) => {
      if (a.userId && !map.has(a.userId)) map.set(a.userId, a.userName);
    });
    return [{ value: "all", label: "All users" }, ...[...map.entries()].map(([id, name]) => ({ value: id, label: name }))];
  }, [activities]);

  const filtered = useMemo(
    () => (userFilter === "all" ? activities : activities.filter((a) => a.userId === userFilter)),
    [activities, userFilter]
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchActivities();
    setRefreshing(false);
  };

  if (loading) return <Spinner label="Loading activity log..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">Activity Log</h1>
          <p className="mt-1 text-sm text-text_secondary">
            Every action performed in the admin panel, recorded with the user who did it.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PremiumSelect
            className="sm:w-56"
            value={userFilter}
            onChange={setUserFilter}
            options={users}
            icon={HiOutlineUser}
            placeholder="All users"
          />
          <PremiumSelect
            className="sm:w-44"
            value={actionFilter}
            onChange={setActionFilter}
            options={ACTION_FILTERS}
            icon={HiOutlinePencilAlt}
            placeholder="All actions"
          />
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-60"
          >
            <HiRefresh size={15} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={HiOutlineClipboardList}
          title="No activity recorded yet"
          description="Actions like creating projects, adding tasks, and signing in will appear here."
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-text_muted">
                  <th className="py-3 pl-5 pr-4 font-medium">User</th>
                  <th className="py-3 pr-4 font-medium">Action</th>
                  <th className="py-3 pr-4 font-medium">Details</th>
                  <th className="py-3 pr-5 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const meta = ACTION_META[a.action] || { label: a.action, badge: "bg-muted text-text_secondary border-border" };
                  return (
                    <tr key={String(a._id)} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
                      <td className="py-3 pl-5 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <HiOutlineUserCircle size={18} />
                          </div>
                          <span className="font-semibold text-foreground">{a.userName || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${meta.badge}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="font-medium text-foreground">{a.target || "—"}</div>
                        <div className="text-xs capitalize text-text_muted">{a.targetType || ""}</div>
                      </td>
                      <td className="py-3 pr-5 text-text_secondary">{formatTime(a.timestamp)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
