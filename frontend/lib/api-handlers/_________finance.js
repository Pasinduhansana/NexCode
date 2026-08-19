import { requireAuth } from "./_lib/auth.js";
import { cached } from "./_lib/cache.js";
import {
  buildFinanceSummary,
  createTransaction,
  listTransactions,
  FinanceServiceError,
} from "./_lib/finance.js";

export default requireAuth(async (req, res) => {
  try {
    if (req.method === "GET") {
      const { type, category, summary, projectId, dateFrom, dateTo } = req.query;

      if (summary === "true" || summary === "1") {
        const data = await cached("finance:summary", 30_000, buildFinanceSummary);
        return res.status(200).json(data);
      }

      const rows = await listTransactions({ type, category, projectId, dateFrom, dateTo });
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      const transaction = await createTransaction(req.body || {}, req.user);
      return res.status(201).json(transaction);
    }
  } catch (err) {
    if (err instanceof FinanceServiceError) return res.status(err.status).json({ error: err.message });
    return res.status(500).json({ error: "Something went wrong" });
  }

  return res.status(405).json({ error: "Method not allowed" });
});
