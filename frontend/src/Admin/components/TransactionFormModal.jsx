import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import adminApi from "../utils/adminApi";
import Modal from "./Modal";
import PremiumSelect from "./PremiumSelect";
import { toDateInput } from "../utils/date";

export const FINANCE_TYPES = [
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
  { value: "payment", label: "Payment" },
  { value: "advance", label: "Advance Amount" },
  { value: "balance", label: "Balance Amount" },
];

export const FINANCE_CATEGORIES = {
  income: ["Design", "Development", "Retainer", "Consulting", "Other"],
  expense: ["Software", "Hardware", "Marketing", "Salaries", "Hosting", "Domain", "Third Party", "Other"],
  payment: ["Deposit", "Milestone", "Final", "Refund", "Other"],
  advance: ["Project Advance", "Client Advance", "Other"],
  balance: ["Project Balance", "Client Balance", "Other"],
};

export const PAID_BY_OPTIONS = [
  { value: "Pasindu", label: "Pasindu" },
  { value: "Chamara", label: "Chamara" },
  { value: "NexCode", label: "NexCode (Company Fund)" },
];

const PAYMENT_STATUSES = [
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
];

const emptyForm = () => ({
  type: "income",
  category: "",
  amount: "",
  description: "",
  date: toDateInput(new Date()),
  projectId: "",
  paidBy: "",
  paymentStatus: "paid",
  skipDistribution: false,
});

export default function TransactionFormModal({ open, transaction, projects = [], onClose, onSaved }) {
  const isEdit = Boolean(transaction);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      transaction
        ? {
            type: transaction.type || "income",
            category: transaction.category || "",
            amount: transaction.amount != null ? String(transaction.amount) : "",
            description: transaction.description || "",
            date: toDateInput(transaction.date),
            projectId: transaction.projectId || "",
            paidBy: transaction.paidBy || "",
            paymentStatus: transaction.paymentStatus || "paid",
            skipDistribution: transaction.skipDistribution || false,
          }
        : emptyForm()
    );
  }, [open, transaction]);

  const categories = useMemo(
    () => (FINANCE_CATEGORIES[form.type] || []).map((c) => ({ value: c, label: c })),
    [form.type]
  );

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (form.type === "payment" && !form.paymentStatus) {
      toast.error("Select a payment status");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        amount,
        description: form.description.trim(),
        category: form.category || (FINANCE_CATEGORIES[form.type]?.[0]?.value ?? "Other"),
        projectId: form.projectId || null,
        skipDistribution: form.skipDistribution,
      };

      if (isEdit) {
        await adminApi.put(`/finance/${transaction._id}`, payload);
        toast.success("Transaction updated");
      } else {
        await adminApi.post("/finance", payload);
        toast.success("Transaction added");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const showPaidBy = form.type === "expense";

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Transaction" : "Add Transaction"} subtitle={isEdit ? "Update this record" : "Record income, expense, or a client payment"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Type</label>
            <PremiumSelect
              value={form.type}
              onChange={(val) => setForm((f) => ({ ...f, type: val }))}
              options={FINANCE_TYPES}
              placeholder="Select type"
            />
          </div>
          <div>
            <label className="label">Amount (LKR) *</label>
            <input
              className="input-field"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={set("amount")}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Category</label>
            <PremiumSelect
              value={form.category}
              onChange={(val) => setForm((f) => ({ ...f, category: val }))}
              options={[{ value: "", label: "Select category..." }, ...categories]}
              placeholder="Select category..."
            />
          </div>
          <div>
            <label className="label">Date</label>
            <input className="input-field" type="date" value={form.date} onChange={set("date")} />
          </div>
        </div>

        {showPaidBy && (
          <div>
            <label className="label">Paid By</label>
            <PremiumSelect
              value={form.paidBy}
              onChange={(val) => setForm((f) => ({ ...f, paidBy: val }))}
              options={[{ value: "", label: "Select who paid..." }, ...PAID_BY_OPTIONS]}
              placeholder="Select who paid..."
            />
          </div>
        )}

        {form.type === "payment" && (
          <div>
            <label className="label">Payment Status</label>
            <PremiumSelect
              value={form.paymentStatus}
              onChange={(val) => setForm((f) => ({ ...f, paymentStatus: val }))}
              options={PAYMENT_STATUSES}
              placeholder="Select status"
            />
          </div>
        )}

        <div>
          <label className="label">Project</label>
          <PremiumSelect
            value={form.projectId}
            onChange={(val) => setForm((f) => ({ ...f, projectId: val }))}
            options={[{ value: "", label: "No project" }, ...projects.map((p) => ({ value: String(p._id), label: p.name }))]}
            placeholder="No project"
          />
        </div>

        <div>
          <label className="label">Description</label>
          <input
            className="input-field"
            placeholder={form.type === "expense" ? "e.g. Figma license" : form.type === "advance" ? "e.g. Client advance payment" : "e.g. Landing page deposit"}
            value={form.description}
            onChange={set("description")}
          />
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
          <input
            id="skipDistribution"
            type="checkbox"
            checked={form.skipDistribution}
            onChange={(e) => setForm((f) => ({ ...f, skipDistribution: e.target.checked }))}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <label htmlFor="skipDistribution" className="cursor-pointer text-sm">
            <span className="font-medium text-foreground">Skip Distribution</span>
            <span className="ml-2 text-text_muted">Amount will not be included in Chamara/Pasindu settlement calculations</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary_hover disabled:opacity-60"
          >
            {saving && <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
            {isEdit ? "Save Changes" : "Add Transaction"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
