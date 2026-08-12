import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineFolder,
  HiOutlineClipboardList,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiChevronRight,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineCash,
  HiOutlineUserCircle,
  HiOutlineExclamation,
} from "react-icons/hi";import adminApi from "../utils/adminApi";
import usePageTitle from "../../utils/usePageTitle";
import StatCard from "../components/StatCard";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import { PROJECT_STATUSES, TASK_STATUSES } from "../data/constants";
import { formatDate } from "../utils/date";

const ACTION_META = {
  login: { label: "Signed in", badge: "bg-primary/10 text-primary border-primary/30" },
  create: { label: "Created", badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" },
  update: { label: "Updated", badge: "bg-amber-500/10 text-amber-500 border-amber-500/30" },
  delete: { label: "Deleted", badge: "bg-rose-500/10 text-rose-500 border-rose-500/30" },
};

const formatActivityTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d)) return "";
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  usePageTitle("Admin Dashboard");

  useEffect(() => {
    let cancelled = false;
    Promise.all([adminApi.get("/stats"), adminApi.get("/activities?limit=8")])
      .then(([statsRes, activitiesRes]) => {
        if (cancelled) return;
        setStats(statsRes.data);
        setActivities(activitiesRes.data);
      })
      .catch(() => {
        if (!cancelled) setStats(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Spinner label="Loading dashboard..." />;

  const totals = stats?.totals || {};
  const projectCounts = stats?.projectStatusCounts || {};
  const taskCounts = stats?.taskStatusCounts || {};
  const recentProjects = stats?.recentProjects || [];
  const finance = stats?.finance || {};

  const maxProjectCount = Math.max(1, ...PROJECT_STATUSES.map((s) => projectCounts[s.value] || 0));
  const maxTaskCount = Math.max(1, ...TASK_STATUSES.map((s) => taskCounts[s.value] || 0));

  const financeCards = [
    {
      label: "Income",
      value: finance.totals?.income ?? 0,
      icon: HiOutlineTrendingUp,
      tone: "text-emerald-500 bg-emerald-500/10",
    },
    {
      label: "Expenses",
      value: finance.totals?.expense ?? 0,
      icon: HiOutlineTrendingDown,
      tone: "text-rose-500 bg-rose-500/10",
    },
    {
      label: "Net Profit",
      value: finance.totals?.net ?? 0,
      icon: HiOutlineCash,
      tone: (finance.totals?.net ?? 0) >= 0 ? "text-primary bg-primary/10" : "text-rose-500 bg-rose-500/10",
    },
    {
      label: "Pending Payments",
      value: finance.totals?.pendingPayments ?? 0,
      icon: HiOutlineClock,
      tone: "text-amber-500 bg-amber-500/10",
    },
  ];

  const overdueTasks = (stats?.overdueTasks || []).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-32 top-10 hidden h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl md:block" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">NexCode Admin</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-foreground sm:text-3xl">Welcome back</h1>
          <p className="mt-1 max-w-xl text-sm text-text_secondary">
            Here's what's happening across your projects, tasks, and finances.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        <StatCard icon={HiOutlineFolder} label="Projects" value={totals.projects || 0} sub="Total projects" />
        <StatCard icon={HiOutlineClipboardList} label="Tasks" value={totals.tasks || 0} sub="All tasks" />
        <StatCard icon={HiOutlineClock} label="Open Tasks" value={totals.openTasks || 0} sub="Not yet done" accent="text-amber-500" />
        <StatCard icon={HiOutlineCheckCircle} label="Completed" value={totals.completedTasks || 0} sub="Done tasks" accent="text-emerald-500" />
        <StatCard
          icon={HiOutlineCurrencyDollar}
          label="Budget"
          value={totals.totalBudget ? `$${totals.totalBudget.toLocaleString()}` : "$0"}
          sub="Across projects"
          accent="text-cyan-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {financeCards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}>
                <Icon size={17} />
              </div>
              <div className="min-w-0">
                <div className="truncate text-lg font-bold text-foreground">
                  ${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                <div className="text-[11px] text-text_muted">{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {overdueTasks.length > 0 && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-rose-500">
            <HiOutlineExclamation size={16} />
            {overdueTasks.length} overdue task{overdueTasks.length > 1 ? "s" : ""} need attention
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {overdueTasks.map((t) => (
              <span key={String(t._id)} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground">
                {t.title}
                <span className="text-rose-500">due {formatDate(t.dueDate)}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-base font-bold text-foreground">Projects by Status</h2>
          <div className="mt-4 space-y-3">
            {PROJECT_STATUSES.map((s) => (
              <div key={s.value}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2 font-medium text-foreground">
                    <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                  <span className="font-semibold text-text_secondary">{projectCounts[s.value] || 0}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${((projectCounts[s.value] || 0) / maxProjectCount) * 100}%`, backgroundColor: "rgb(54 153 243 / 1)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-base font-bold text-foreground">Tasks by Status</h2>
          <div className="mt-4 space-y-3">
            {TASK_STATUSES.map((s) => (
              <div key={s.value}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2 font-medium text-foreground">
                    <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                  <span className="font-semibold text-text_secondary">{taskCounts[s.value] || 0}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${((taskCounts[s.value] || 0) / maxTaskCount) * 100}%`, backgroundColor: "rgb(6 182 212 / 1)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-foreground">Recent Projects</h2>
            <Link to="/admin/projects" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary_hover">
              View all
              <HiChevronRight size={16} />
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <div className="mt-4">
              <EmptyState icon={HiOutlineFolder} title="No projects yet" description="Create your first project to get started." />
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wider text-text_muted">
                    <th className="py-2.5 pr-4 font-medium">Project</th>
                    <th className="py-2.5 pr-4 font-medium">Client</th>
                    <th className="py-2.5 pr-4 font-medium">Status</th>
                    <th className="py-2.5 pr-4 font-medium">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProjects.map((p) => (
                    <tr key={String(p._id)} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
                      <td className="py-3 pr-4">
                        <Link to={`/admin/projects/${p._id}`} className="font-semibold text-foreground hover:text-primary">
                          {p.name}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-text_secondary">{p.client || "—"}</td>
                      <td className="py-3 pr-4">
                        <StatusBadge list={PROJECT_STATUSES} value={p.status} />
                      </td>
                      <td className="py-3 text-text_secondary">{formatDate(p.dueDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-foreground">Recent Activity</h2>
            <Link to="/admin/activity" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary_hover">
              View all
              <HiChevronRight size={16} />
            </Link>
          </div>

          {activities.length === 0 ? (
            <div className="mt-4">
              <EmptyState icon={HiOutlineUserCircle} title="No activity yet" description="Actions will show up here." />
            </div>
          ) : (
            <div className="mt-4 space-y-1">
              {activities.map((a) => {
                const meta = ACTION_META[a.action] || { label: a.action, badge: "bg-muted text-text_secondary border-border" };
                return (
                  <div key={String(a._id)} className="flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-muted/50">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <HiOutlineUserCircle size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${meta.badge}`}>
                          {meta.label}
                        </span>
                        <span className="text-[11px] text-text_muted">{formatActivityTime(a.timestamp)}</span>
                      </div>
                      <div className="mt-1 truncate text-sm text-foreground">
                        <span className="font-semibold">{a.userName || "Someone"}</span>{" "}
                        <span className="text-text_secondary">{a.target || ""}</span>
                      </div>
                      <div className="text-[11px] capitalize text-text_muted">{a.targetType || ""}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
