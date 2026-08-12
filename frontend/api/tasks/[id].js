import { ObjectId } from "mongodb";
import { requireAuth } from "../_lib/auth.js";
import { getCollection, unwrap } from "../_lib/mongodb.js";
import { logActivity } from "../_lib/activity.js";
import { invalidate } from "../_lib/cache.js";

export default requireAuth(async (req, res) => {
  const { id } = req.query;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid task id" });
  }

  const tasks = await getCollection("tasks");

  if (req.method === "PUT") {
    const {
      title,
      description,
      status,
      priority,
      assignee,
      dueDate,
      startDate,
      endDate,
      estimatedHours,
      order,
      notes,
    } = req.body || {};

    const patch = { updatedAt: new Date() };

    if (title !== undefined) {
      if (!String(title).trim()) {
        return res.status(400).json({ error: "Task title cannot be empty" });
      }
      patch.title = String(title).trim();
    }
    if (description !== undefined) patch.description = String(description).trim();
    if (status !== undefined) patch.status = status;
    if (priority !== undefined) patch.priority = priority;
    if (assignee !== undefined) patch.assignee = String(assignee).trim();
    if (dueDate !== undefined) patch.dueDate = dueDate ? new Date(dueDate) : null;
    if (startDate !== undefined) patch.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) patch.endDate = endDate ? new Date(endDate) : null;
    if (notes !== undefined) patch.notes = notes ? String(notes).trim() : "";
    if (estimatedHours !== undefined)
      patch.estimatedHours =
        estimatedHours !== "" && estimatedHours !== null ? Number(estimatedHours) : null;
    if (order !== undefined) patch.order = Number(order);

    const result = await tasks.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: patch },
      { returnDocument: "after" }
    );

    const task = unwrap(result);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    invalidate("kanban", "stats");

    await logActivity(req.user, {
      action: "update",
      targetType: "task",
      target: task.title || id,
      details: { status: patch.status || task.status, priority: patch.priority || task.priority },
    }).catch(() => {});

    return res.status(200).json(task);
  }

  if (req.method === "DELETE") {
    const result = await tasks.findOneAndDelete({ _id: new ObjectId(id) });
    const task = unwrap(result);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    invalidate("kanban", "stats");

    await logActivity(req.user, {
      action: "delete",
      targetType: "task",
      target: task.title || id,
      details: {},
    }).catch(() => {});

    return res.status(200).json({ deleted: true, id });
  }

  return res.status(405).json({ error: "Method not allowed" });
});
