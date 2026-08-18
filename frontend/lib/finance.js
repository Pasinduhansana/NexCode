import { ObjectId } from "mongodb";
import { getCollection, unwrap } from "./mongodb.js";
import { invalidate } from "./cache.js";
import { logActivity } from "./activity.js";

export const TRANSACTION_TYPES = ["income", "expense", "payment", "advance", "balance"];
export const PAID_BY_OPTIONS = ["Pasindu", "Chamara", "NexCode"];
export const TRANSACTION_CATEGORIES = {
  income: ["Design", "Development", "Retainer", "Consulting", "Other"],
  expense: ["Software", "Hardware", "Marketing", "Salaries", "Hosting", "Domain", "Third Party", "Other"],
  payment: ["Deposit", "Milestone", "Final", "Refund", "Other"],
  advance: ["Project Advance", "Client Advance", "Other"],
  balance: ["Project Balance", "Client Balance", "Other"],
};

export class FinanceServiceError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "FinanceServiceError";
    this.status = status;
    this.expose = true;
  }
}

function asTrimmed(value) {
  return value ? String(value).trim() : "";
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseDate(value) {
  if (value === undefined || value === null || value === "") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new FinanceServiceError("Invalid date", 400);
  }
  return date;
}

function toBoundary(value, endOfDay) {
  const date = value instanceof Date ? new Date(value) : parseDate(value);
  if (endOfDay) date.setHours(23, 59, 59, 999);
  else date.setHours(0, 0, 0, 0);
  return date;
}

export function parseTransaction(body) {
  const type = TRANSACTION_TYPES.includes(body.type) ? body.type : "income";
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new FinanceServiceError("Valid amount is required", 400);
  }
  const date = parseDate(body.date) || new Date();
  return {
    type,
    amount: Math.round(amount * 100) / 100,
    category: body.category ? String(body.category).trim() : "Other",
    description: body.description ? String(body.description).trim() : "",
    projectId: body.projectId ? String(body.projectId) : null,
    paidBy: body.paidBy ? String(body.paidBy).trim() : "",
    paymentStatus: body.paymentStatus ? String(body.paymentStatus) : "paid",
    date,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function createTransaction(input = {}, user) {
  const transaction = parseTransaction(input || {});

  try {
    const collection = await getCollection("transactions");
    const { insertedId } = await collection.insertOne(transaction);

    invalidate("finance");

    await logActivity(user, {
      action: "create",
      targetType: "finance",
      target: transaction.description || `${transaction.type} ${transaction.amount}`,
      details: { type: transaction.type, amount: transaction.amount },
    }).catch(() => {});

    return { ...transaction, _id: insertedId };
  } catch (err) {
    if (err instanceof FinanceServiceError) throw err;
    throw new FinanceServiceError("Could not record the transaction. Please try again.", 500);
  }
}

export async function getTransactionById(id) {
  if (!ObjectId.isValid(id)) {
    throw new FinanceServiceError("Invalid transaction id", 400);
  }

  try {
    const transaction = await (await getCollection("transactions")).findOne({ _id: new ObjectId(id) });
    if (!transaction) {
      throw new FinanceServiceError("Transaction not found", 404);
    }
    return transaction;
  } catch (err) {
    if (err instanceof FinanceServiceError) throw err;
    throw new FinanceServiceError("Could not load the transaction. Please try again.", 500);
  }
}

export async function listTransactions({ type, category, projectId, dateFrom, dateTo } = {}) {
  const filter = {};
  if (type && TRANSACTION_TYPES.includes(type)) filter.type = type;
  if (category) filter.category = String(category);
  if (projectId) filter.projectId = String(projectId);
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = toBoundary(dateFrom, false);
    if (dateTo) filter.date.$lte = toBoundary(dateTo, true);
  }

  try {
    return await (await getCollection("transactions"))
      .find(filter)
      .sort({ date: -1 })
      .limit(200)
      .toArray();
  } catch (err) {
    if (err instanceof FinanceServiceError) throw err;
    throw new FinanceServiceError("Could not load the transactions. Please try again.", 500);
  }
}

export async function findExpense({ id, searchDescription, projectId, type }) {
  if (id !== undefined && id !== null && String(id).trim() !== "") {
    return { kind: "single", transaction: await getTransactionById(String(id).trim()) };
  }

  const scope = {};
  if (projectId) scope.projectId = String(projectId);
  if (type) scope.type = type;
  const description = asTrimmed(searchDescription);

  if (!description) {
    throw new FinanceServiceError("Please provide a transaction id or an expense description", 400);
  }

  try {
    const collection = await getCollection("transactions");
    const pattern = escapeRegex(description);

    const exact = await collection.findOne({
      description: { $regex: new RegExp(`^${pattern}$`, "i") },
      ...scope,
    });
    if (exact) return { kind: "single", transaction: exact };

    const matches = await collection
      .find({ description: { $regex: new RegExp(pattern, "i") }, ...scope })
      .sort({ date: -1 })
      .limit(5)
      .toArray();

    if (matches.length === 0) {
      throw new FinanceServiceError(`Expense "${description}" not found`, 404);
    }
    if (matches.length > 1) {
      const names = matches.map((t) => `"${t.description || `${t.type} ${t.amount}`}"`).join(", ");
      throw new FinanceServiceError(`Multiple expenses match "${description}". Please specify one: ${names}.`, 400);
    }
    return { kind: "single", transaction: matches[0] };
  } catch (err) {
    if (err instanceof FinanceServiceError) throw err;
    throw new FinanceServiceError("Could not find the expense. Please try again.", 500);
  }
}

export async function updateTransaction(id, body = {}, user) {
  if (!ObjectId.isValid(id)) {
    throw new FinanceServiceError("Invalid transaction id", 400);
  }

  const patch = { updatedAt: new Date() };

  if (body.type !== undefined) {
    if (!TRANSACTION_TYPES.includes(body.type)) throw new FinanceServiceError("Invalid type", 400);
    patch.type = body.type;
  }
  if (body.amount !== undefined) {
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount < 0) throw new FinanceServiceError("Valid amount is required", 400);
    patch.amount = Math.round(amount * 100) / 100;
  }
  if (body.category !== undefined) patch.category = String(body.category).trim();
  if (body.description !== undefined) patch.description = String(body.description).trim();
  if (body.projectId !== undefined) patch.projectId = body.projectId ? String(body.projectId) : null;
  if (body.paidBy !== undefined) patch.paidBy = String(body.paidBy).trim();
  if (body.paymentStatus !== undefined) patch.paymentStatus = String(body.paymentStatus);
  if (body.date !== undefined) {
    const date = parseDate(body.date);
    patch.date = date || new Date();
  }

  try {
    const collection = await getCollection("transactions");
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: patch },
      { returnDocument: "after" }
    );

    const transaction = unwrap(result);
    if (!transaction) {
      throw new FinanceServiceError("Transaction not found", 404);
    }

    invalidate("finance");

    await logActivity(user, {
      action: "update",
      targetType: "finance",
      target: transaction.description || id,
      details: { type: transaction.type, amount: transaction.amount },
    }).catch(() => {});

    return transaction;
  } catch (err) {
    if (err instanceof FinanceServiceError) throw err;
    throw new FinanceServiceError("Could not update the transaction. Please try again.", 500);
  }
}

export async function deleteTransaction(id, user) {
  if (!ObjectId.isValid(id)) {
    throw new FinanceServiceError("Invalid transaction id", 400);
  }

  try {
    const collection = await getCollection("transactions");
    const result = await collection.findOneAndDelete({ _id: new ObjectId(id) });

    const transaction = unwrap(result);
    if (!transaction) {
      throw new FinanceServiceError("Transaction not found", 404);
    }

    invalidate("finance");

    await logActivity(user, {
      action: "delete",
      targetType: "finance",
      target: transaction.description || id,
      details: { type: transaction.type, amount: transaction.amount },
    }).catch(() => {});

    return { deleted: true, id };
  } catch (err) {
    if (err instanceof FinanceServiceError) throw err;
    throw new FinanceServiceError("Could not delete the transaction. Please try again.", 500);
  }
}

export function resolveDateRangeToken(token) {
  const value = String(token || "").trim().toLowerCase();
  const now = new Date();
  const startOfDay = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };
  const endOfDay = (d) => {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
  };

  switch (value) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "yesterday": {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return { from: startOfDay(y), to: endOfDay(y) };
    }
    case "this week": {
      const d = new Date(now);
      const day = (d.getDay() + 6) % 7;
      d.setDate(d.getDate() - day);
      return { from: startOfDay(d), to: endOfDay(now) };
    }
    case "this month":
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: endOfDay(now) };
    case "last month": {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: startOfDay(from), to: endOfDay(to) };
    }
    default:
      return null;
  }
}

export async function buildFinanceSummary() {
  const collection = await getCollection("transactions");
  // Only the fields the reducer uses are needed — loading full transaction docs
  // (large description/notes bodies) balloons the transfer and memory on every
  // dashboard/stats build. Behavior is identical with a projection.
  const rows = await collection
    .find(
      {},
      { projection: { type: 1, amount: 1, paidBy: 1, paymentStatus: 1, category: 1, date: 1 } }
    )
    .sort({ date: 1 })
    .toArray();

  let totalIncome = 0;
  let totalExpense = 0;
  let totalPayments = 0;
  let totalAdvance = 0;
  let totalBalance = 0;
  let pendingPayments = 0;
  let pendingCount = 0;
  const byCategory = {};
  const byMonth = {};
  const byPaidBy = {};

  for (const r of rows) {
    const amount = r.amount || 0;
    if (r.type === "expense") {
      totalExpense += amount;
      const who = r.paidBy || "NexCode";
      byPaidBy[who] = (byPaidBy[who] || 0) + amount;
    } else if (r.type === "payment") {
      totalPayments += amount;
      if (r.paymentStatus === "pending") {
        pendingPayments += amount;
        pendingCount += 1;
      }
    } else if (r.type === "advance") {
      totalAdvance += amount;
      totalIncome += amount;
    } else if (r.type === "balance") {
      totalBalance += amount;
      totalIncome += amount;
    } else {
      totalIncome += amount;
    }

    byCategory[r.category || "Other"] = (byCategory[r.category || "Other"] || 0) + amount;

    const key = `${r.date.getFullYear()}-${String(r.date.getMonth() + 1).padStart(2, "0")}`;
    if (!byMonth[key]) byMonth[key] = { income: 0, expense: 0, payment: 0 };
    const bucket = byMonth[key];
    if (r.type === "expense") bucket.expense += amount;
    else if (r.type === "payment") bucket.payment += amount;
    else bucket.income += amount;
  }

  const monthlySeries = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([key, v]) => ({
      month: key,
      income: Math.round(v.income * 100) / 100,
      expense: Math.round(v.expense * 100) / 100,
      payment: Math.round(v.payment * 100) / 100,
    }));

  const categoryBreakdown = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({ category, amount: Math.round(amount * 100) / 100 }));

  const settlement = calculateSettlement(rows);

  return {
    totals: {
      income: Math.round(totalIncome * 100) / 100,
      expense: Math.round(totalExpense * 100) / 100,
      payment: Math.round(totalPayments * 100) / 100,
      advance: Math.round(totalAdvance * 100) / 100,
      balance: Math.round(totalBalance * 100) / 100,
      net: Math.round((totalIncome + totalPayments - totalExpense) * 100) / 100,
      pendingPayments: Math.round(pendingPayments * 100) / 100,
      pendingCount,
    },
    categoryBreakdown,
    monthlySeries,
    byPaidBy: Object.entries(byPaidBy)
      .map(([name, amount]) => ({ name, amount: Math.round(amount * 100) / 100 }))
      .sort((a, b) => b.amount - a.amount),
    settlement,
  };
}

function calculateSettlement(rows) {
  const expenses = rows.filter((r) => r.type === "expense");
  if (expenses.length === 0) return { balances: [], transfers: [] };

  const totals = {};
  for (const who of PAID_BY_OPTIONS) {
    totals[who] = 0;
  }

  for (const r of expenses) {
    const who = r.paidBy || "NexCode";
    if (!totals[who]) totals[who] = 0;
    totals[who] += r.amount || 0;
  }

  const totalExpenses = Object.values(totals).reduce((a, b) => a + b, 0);
  const perPerson = PAID_BY_OPTIONS.length > 0 ? totalExpenses / PAID_BY_OPTIONS.length : 0;

  const balances = PAID_BY_OPTIONS.map((name) => ({
    name,
    paid: Math.round((totals[name] || 0) * 100) / 100,
    fairShare: Math.round(perPerson * 100) / 100,
    balance: Math.round(((totals[name] || 0) - perPerson) * 100) / 100,
  }));

  const debtors = balances.filter((b) => b.balance < -0.01).map((b) => ({ ...b, remaining: Math.abs(b.balance) }));
  const creditors = balances.filter((b) => b.balance > 0.01).map((b) => ({ ...b, remaining: b.balance }));

  const transfers = [];
  let di = 0;
  let ci = 0;
  while (di < debtors.length && ci < creditors.length) {
    const amount = Math.min(debtors[di].remaining, creditors[ci].remaining);
    if (amount > 0.01) {
      transfers.push({
        from: debtors[di].name,
        to: creditors[ci].name,
        amount: Math.round(amount * 100) / 100,
      });
    }
    debtors[di].remaining -= amount;
    creditors[ci].remaining -= amount;
    if (debtors[di].remaining < 0.01) di++;
    if (creditors[ci].remaining < 0.01) ci++;
  }

  return { balances, transfers };
}
