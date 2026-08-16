import { ObjectId } from "mongodb";
import { requireAuth } from "../_lib/auth.js";
import { getCollection, unwrap } from "../_lib/mongodb.js";
import { invalidate } from "../_lib/cache.js";
import { logActivity } from "../_lib/activity.js";
import { TRANSACTION_TYPES } from "../finance.js";

export default requireAuth(async (req, res) => {
  const { id } = req.query;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid transaction id" });
  }

  const collection = await getCollection("transactions");

  if (req.method === "PUT") {
    const body = req.body || {};
    const patch = { updatedAt: new Date() };

    if (body.type !== undefined) {
      if (!TRANSACTION_TYPES.includes(body.type)) return res.status(400).json({ error: "Invalid type" });
      patch.type = body.type;
    }
    if (body.amount !== undefined) {
      const amount = Number(body.amount);
      if (!Number.isFinite(amount) || amount < 0) return res.status(400).json({ error: "Valid amount is required" });
      patch.amount = Math.round(amount * 100) / 100;
    }
    if (body.category !== undefined) patch.category = String(body.category).trim();
    if (body.description !== undefined) patch.description = String(body.description).trim();
    if (body.projectId !== undefined) patch.projectId = body.projectId ? String(body.projectId) : null;
    if (body.paidBy !== undefined) patch.paidBy = String(body.paidBy).trim();
    if (body.paymentStatus !== undefined) patch.paymentStatus = String(body.paymentStatus);
    if (body.date !== undefined) patch.date = body.date ? new Date(body.date) : new Date();

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: patch },
      { returnDocument: "after" }
    );

    const transaction = unwrap(result);
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    invalidate("finance");
    await logActivity(req.user, {
      action: "update",
      targetType: "finance",
      target: transaction.description || id,
      details: { type: transaction.type, amount: transaction.amount },
    }).catch(() => {});

    return res.status(200).json(transaction);
  }

  if (req.method === "DELETE") {
    const result = await collection.findOneAndDelete({ _id: new ObjectId(id) });

    const transaction = unwrap(result);
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    invalidate("finance");
    await logActivity(req.user, {
      action: "delete",
      targetType: "finance",
      target: transaction.description || id,
      details: { type: transaction.type, amount: transaction.amount },
    }).catch(() => {});

    return res.status(200).json({ deleted: true, id });
  }

  return res.status(405).json({ error: "Method not allowed" });
});
