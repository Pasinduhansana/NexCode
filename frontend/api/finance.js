import { requireAuth } from "./_lib/auth.js";
import { getCollection } from "./_lib/mongodb.js";
import { cached, invalidate } from "./_lib/cache.js";
import { logActivity } from "./_lib/activity.js";

export const TRANSACTION_TYPES = ["income", "expense", "payment"];
export const TRANSACTION_CATEGORIES = {
  income: ["Design", "Development", "Retainer", "Consulting", "Other"],
  expense: ["Software", "Hardware", "Marketing", "Salaries", "Hosting", "Other"],
  payment: ["Deposit", "Milestone", "Final", "Refund", "Other"],
};

function parseTransaction(body) {
  const type = TRANSACTION_TYPES.includes(body.type) ? body.type : "income";
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount < 0) {
    const err = new Error("Valid amount is required");
    err.status = 400;
    throw err;
  }
  const date = body.date ? new Date(body.date) : new Date();
  return {
    type,
    amount: Math.round(amount * 100) / 100,
    category: body.category ? String(body.category).trim() : "Other",
    description: body.description ? String(body.description).trim() : "",
    projectId: body.projectId ? String(body.projectId) : null,
    paymentStatus: body.paymentStatus ? String(body.paymentStatus) : "paid",
    date,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function buildFinanceSummary() {
  const collection = await getCollection("transactions");
  const rows = await collection.find({}).sort({ date: 1 }).toArray();

  let totalIncome = 0;
  let totalExpense = 0;
  let totalPayments = 0;
  let pendingPayments = 0;
  let pendingCount = 0;
  const byCategory = {};
  const byMonth = {};

  for (const r of rows) {
    const amount = r.amount || 0;
    if (r.type === "expense") {
      totalExpense += amount;
    } else if (r.type === "payment") {
      totalPayments += amount;
      if (r.paymentStatus === "pending") {
        pendingPayments += amount;
        pendingCount += 1;
      }
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

  return {
    totals: {
      income: Math.round(totalIncome * 100) / 100,
      expense: Math.round(totalExpense * 100) / 100,
      payment: Math.round(totalPayments * 100) / 100,
      net: Math.round((totalIncome + totalPayments - totalExpense) * 100) / 100,
      pendingPayments: Math.round(pendingPayments * 100) / 100,
      pendingCount,
    },
    categoryBreakdown,
    monthlySeries,
  };
}

export default requireAuth(async (req, res) => {
  if (req.method === "GET") {
    const { type, category, summary } = req.query;

    if (summary === "true" || summary === "1") {
      const data = await cached("finance:summary", 10_000, buildFinanceSummary);
      return res.status(200).json(data);
    }

    const filter = {};
    if (type && TRANSACTION_TYPES.includes(type)) filter.type = type;
    if (category) filter.category = String(category);

    const rows = await (await getCollection("transactions"))
      .find(filter)
      .sort({ date: -1 })
      .limit(200)
      .toArray();

    return res.status(200).json(rows);
  }

  if (req.method === "POST") {
    let transaction;
    try {
      transaction = parseTransaction(req.body || {});
    } catch (err) {
      return res.status(err.status || 400).json({ error: err.message });
    }

    const collection = await getCollection("transactions");
    const { insertedId } = await collection.insertOne(transaction);

    invalidate("finance");
    await logActivity(req.user, {
      action: "create",
      targetType: "finance",
      target: transaction.description || `${transaction.type} ${transaction.amount}`,
      details: { type: transaction.type, amount: transaction.amount },
    }).catch(() => {});

    return res.status(201).json({ ...transaction, _id: insertedId });
  }

  return res.status(405).json({ error: "Method not allowed" });
});
