"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineClock,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineCurrencyDollar,
  HiOutlineCash,
  HiOutlineUserGroup,
} from "react-icons/hi";
import adminApi from "../utils/adminApi";
import usePageTitle from "../../utils/usePageTitle";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import TransactionFormModal, { FINANCE_TYPES } from "../components/TransactionFormModal";
import SettlementSummary from "../components/SettlementSummary";
import { MonthlyBars, CategoryBreakdown } from "../components/FinanceCharts";
import PremiumSelect from "../components/PremiumSelect";
import { formatDate } from "../utils/date";
import { usePagination } from "../hooks/usePagination";
import Pagination from "../components/Pagination";

const TYPE_META = {
  income: { label: "Income", badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30", dot: "bg-emerald-400" },
  expense: { label: "Expense", badge: "bg-rose-500/10 text-rose-500 border-rose-500/30", dot: "bg-rose-400" },
  payment: { label: "Payment", badge: "bg-violet-500/10 text-violet-500 border-violet-500/30", dot: "bg-violet-400" },
  advance: { label: "Advance", badge: "bg-blue-500/10 text-blue-500 border-blue-500/30", dot: "bg-blue-400" },
  balance: { label: "Balance", badge: "bg-amber-500/10 text-amber-500 border-amber-500/30", dot: "bg-amber-400" },
};

const PAYMENT_STATUS_META = {
  paid: { label: "Paid", badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" },
  pending: { label: "Pending", badge: "bg-amber-500/10 text-amber-500 border-amber-500/30" },
  overdue: { label: "Overdue", badge: "bg-rose-500/10 text-rose-500 border-rose-500/30" },
};

const PAID_BY_COLORS = {
  Pasindu: "bg-blue-500 text-white",
  Chamara: "bg-violet-500 text-white",
  NexCode: "bg-emerald-500 text-white",
};

export default function AdminFinancePage() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  usePageTitle("Finance");

  const fetchRows = async () => {
    try {
      const [rowsRes, summaryRes, projectsRes] = await Promise.all([
        adminApi.get("/finance"),
        adminApi.get("/finance?summary=true"),
        adminApi.get("/projects"),
      ]);
      setRows(rowsRes.data);
      setSummary(summaryRes.data);
      setProjects(projectsRes.data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load finance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const projectName = useMemo(() => {
    const map = {};
    for (const p of projects) map[String(p._id)] = p.name;
    return map;
  }, [projects]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesType = typeFilter === "all" || r.type === typeFilter;
      const matchesSearch =
        !q ||
        (r.description || "").toLowerCase().includes(q) ||
        (r.category || "").toLowerCase().includes(q) ||
        (projectName[r.projectId] || "").toLowerCase().includes(q) ||
        (r.paidBy || "").toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [rows, search, typeFilter, projectName]);

  const { page, setPage, pageSize, setPageSize, total, slice: paged } = usePagination(filtered);

  const handleDelete = async () => {
    if (!deleting) return;
    setDeletingLoading(true);
    try {
      await adminApi.delete(`/finance/${deleting._id}`);
      toast.success("Transaction deleted");
      setRows((prev) => prev.filter((r) => String(r._id) !== String(deleting._id)));
      setDeleting(null);
      fetchRows();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete transaction");
    } finally {
      setDeletingLoading(false);
    }
  };

  if (loading) return <Spinner label="Loading finance..." />;

  const cards = [
    {
      label: "Total Income",
      value: summary?.totals?.income ?? 0,
      icon: HiOutlineTrendingUp,
      tone: "text-emerald-500 bg-emerald-500/10",
      sub: "All income",
    },
    {
      label: "Total Expenses",
      value: summary?.totals?.expense ?? 0,
      icon: HiOutlineTrendingDown,
      tone: "text-rose-500 bg-rose-500/10",
      sub: "All costs & spend",
    },
    {
      label: "Net Profit",
      value: summary?.totals?.net ?? 0,
      icon: HiOutlineCurrencyDollar,
      tone: summary?.totals?.net >= 0 ? "text-primary bg-primary/10" : "text-rose-500 bg-rose-500/10",
      sub: "Income + payments − expenses",
    },
    {
      label: "Pending Payments",
      value: summary?.totals?.pendingPayments ?? 0,
      icon: HiOutlineClock,
      tone: "text-amber-500 bg-amber-500/10",
      sub: `${summary?.totals?.pendingCount ?? 0} awaiting payment`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">Finance</h1>
          <p className="mt-1 text-sm text-text_secondary">Track income, expenses, and settlements.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary_hover"
        >
          <HiOutlinePlus size={16} />
          Add Transaction
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone, sub }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
                <Icon size={20} />
              </div>
              <span className="text-xs text-text_muted">{sub}</span>
            </div>
            <div className="mt-3 text-2xl font-extrabold text-foreground">Rs. {Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <div className="mt-0.5 text-sm font-medium text-text_secondary">{label}</div>
          </div>
        ))}
      </div>

      {summary?.byPaidBy && summary.byPaidBy.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-bold text-foreground">
            <HiOutlineUserGroup size={16} className="text-primary" />
            Expenses by Person
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {summary.byPaidBy.map((p, i) => (
              <div key={`${p.name}-${i}`} className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white ${PAID_BY_COLORS[p.name] || "bg-gray-400"}`}>
                  {p.name[0]}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">{p.name}</div>
                  <div className="text-xs text-text_muted">Total expenses</div>
                </div>
                <div className="text-right text-sm font-bold text-foreground">Rs. {p.amount.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {summary?.settlement && <SettlementSummary settlement={summary.settlement} byPaidBy={summary?.byPaidBy} />}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-3">
          <h3 className="mb-4 font-display font-bold text-foreground">Monthly Cash Flow</h3>
          <MonthlyBars series={summary?.monthlySeries} />
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <h3 className="mb-4 font-display font-bold text-foreground">Category Breakdown</h3>
          <CategoryBreakdown rows={summary?.categoryBreakdown} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <HiOutlineSearch size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text_muted" />
            <input
              className="input-field pl-10"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <PremiumSelect
            value={typeFilter}
            onChange={setTypeFilter}
            options={[{ value: "all", label: "All types" }, ...FINANCE_TYPES.map((t) => ({ value: t.value, label: t.label }))]}
            className="sm:w-44"
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={HiOutlineCash}
            title={rows.length === 0 ? "No transactions yet" : "No matching transactions"}
            description={rows.length === 0 ? "Record your first income, expense, or payment to start tracking." : "Try adjusting your filters."}
            action={
              rows.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setFormOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary_hover"
                >
                  <HiOutlinePlus size={16} />
                  Add Transaction
                </button>
              ) : null
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-text_muted">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Paid By</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {paged.map((r) => {
                  const meta = TYPE_META[r.type] || TYPE_META.income;
                  const amount = Number(r.amount || 0);
                  return (
                    <tr key={String(r._id)} className="group border-b border-border/60 transition-colors hover:bg-muted/40">
                      <td className="whitespace-nowrap px-4 py-3 text-text_secondary">{formatDate(r.date)}</td>
                      <td className="max-w-[240px] truncate px-4 py-3 font-medium text-foreground">
                        {r.description || "Untitled"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium ${meta.badge}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text_secondary">{r.category || "—"}</td>
                      <td className="max-w-[160px] truncate px-4 py-3 text-text_secondary">
                        {projectName[r.projectId] || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {r.paidBy ? (
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium text-white ${PAID_BY_COLORS[r.paidBy] || "bg-gray-400"}`}>
                            {r.paidBy}
                          </span>
                        ) : (
                          <span className="text-text_muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {r.type === "payment" ? (
                          <span className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium ${PAYMENT_STATUS_META[r.paymentStatus]?.badge || ""}`}>
                            {PAYMENT_STATUS_META[r.paymentStatus]?.label || r.paymentStatus}
                          </span>
                        ) : (
                          <span className="text-text_muted">—</span>
                        )}
                      </td>
                      <td className={`whitespace-nowrap px-4 py-3 text-right font-bold ${r.type === "expense" ? "text-rose-500" : "text-emerald-500"}`}>
                        {r.type === "expense" ? "-" : "+"}Rs. {amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        {r.skipDistribution && (
                          <span className="ml-1 inline-flex items-center rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-medium text-amber-500 border border-amber-500/30" title="Skipped from distribution">
                            No Split
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(r);
                              setFormOpen(true);
                            }}
                            className="rounded-md p-1.5 text-text_secondary hover:bg-muted hover:text-foreground"
                            aria-label="Edit transaction"
                          >
                            <HiOutlinePencilAlt size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(r)}
                            className="rounded-md p-1.5 text-text_secondary hover:bg-rose-500/10 hover:text-rose-500"
                            aria-label="Delete transaction"
                          >
                            <HiOutlineTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
          </>
        )}
      </div>

      <TransactionFormModal
        open={formOpen}
        transaction={editing}
        projects={projects}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={fetchRows}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete transaction?"
        message={deleting ? `This will permanently delete "${deleting.description || "this transaction"}" (${deleting.type}).` : ""}
        loading={deletingLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
