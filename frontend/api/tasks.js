import { requireAuth } from "./_lib/auth.js";
import { getCollection } from "./_lib/mongodb.js";
import { logActivity } from "./_lib/activity.js";
import { invalidate } from "./_lib/cache.js";

export default requireAuth(async (req, res) => {
  if (req.method === "GET") {
    const { projectId } = req.query;

    const filter = projectId ? { projectId } : {};

    const tasks = await (await getCollection("tasks"))
      .find(filter)
      .sort({ order: 1, createdAt: 1 })
      .toArray();

    return res.status(200).json(tasks);
  }

  if (req.method === "POST") {
    const {
      projectId,
      title,
      description,
      status,
      priority,
      assignee,
      dueDate,
      startDate,
      endDate,
      estimatedHours,
      notes,
    } = req.body || {};

    if (!projectId) {
      return res.status(400).json({ error: "projectId is required" });
    }
    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: "Task title is required" });
    }

    const now = new Date();
    const tasks = await getCollection("tasks");
    const count = await tasks.countDocuments({ projectId });

    const task = {
      projectId,
      title: String(title).trim(),
      description: description ? String(description).trim() : "",
      status: status || "todo",
      priority: priority || "medium",
      assignee: assignee ? String(assignee).trim() : "",
      dueDate: dueDate ? new Date(dueDate) : null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      estimatedHours:
        estimatedHours !== undefined && estimatedHours !== "" && estimatedHours !== null
          ? Number(estimatedHours)
          : null,
      notes: notes ? String(notes).trim() : "",
      order: count,
      createdAt: now,
      updatedAt: now,
    };

    const { insertedId } = await tasks.insertOne(task);

    invalidate("kanban", "stats");

    await logActivity(req.user, {
      action: "create",
      targetType: "task",
      target: task.title,
      details: { projectId, status: task.status, priority: task.priority },
    }).catch(() => {});

    return res.status(201).json({ ...task, _id: insertedId });
  }

  return res.status(405).json({ error: "Method not allowed" });
});
