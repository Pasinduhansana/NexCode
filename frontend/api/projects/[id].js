import { ObjectId } from "mongodb";
import { requireAuth } from "../_lib/auth.js";
import { getCollection, unwrap } from "../_lib/mongodb.js";
import { logActivity } from "../_lib/activity.js";
import { invalidate } from "../_lib/cache.js";

export default requireAuth(async (req, res) => {
  const { id } = req.query;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid project id" });
  }

  const projects = await getCollection("projects");
  const tasks = await getCollection("tasks");

  if (req.method === "GET") {
    const project = await projects.findOne({ _id: new ObjectId(id) });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const projectTasks = await tasks
      .find({ projectId: id })
      .sort({ order: 1, createdAt: 1 })
      .toArray();

    return res.status(200).json({ ...project, tasks: projectTasks });
  }

  if (req.method === "PUT") {
    const {
      name,
      client,
      description,
      status,
      priority,
      startDate,
      dueDate,
      budget,
      tags,
      color,
    } = req.body || {};

    const patch = { updatedAt: new Date() };

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({ error: "Project name cannot be empty" });
      }
      patch.name = String(name).trim();
    }
    if (client !== undefined) patch.client = String(client).trim();
    if (description !== undefined) patch.description = String(description).trim();
    if (status !== undefined) patch.status = status;
    if (priority !== undefined) patch.priority = priority;
    if (startDate !== undefined) patch.startDate = startDate ? new Date(startDate) : null;
    if (dueDate !== undefined) patch.dueDate = dueDate ? new Date(dueDate) : null;
    if (budget !== undefined)
      patch.budget = budget !== "" && budget !== null ? Number(budget) : null;
    if (tags !== undefined)
      patch.tags = Array.isArray(tags) ? tags.map((t) => String(t).trim()).filter(Boolean) : [];
    if (color !== undefined) patch.color = color;

    const result = await projects.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: patch },
      { returnDocument: "after" }
    );

    const project = unwrap(result);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    invalidate("kanban", "stats");

    await logActivity(req.user, {
      action: "update",
      targetType: "project",
      target: project.name || id,
      details: { status: patch.status || project.status, priority: patch.priority || project.priority },
    }).catch(() => {});

    return res.status(200).json(project);
  }

  if (req.method === "DELETE") {
    const result = await projects.findOneAndDelete({ _id: new ObjectId(id) });
    const project = unwrap(result);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    await tasks.deleteMany({ projectId: id });

    invalidate("kanban", "stats");

    await logActivity(req.user, {
      action: "delete",
      targetType: "project",
      target: project.name || id,
      details: {},
    }).catch(() => {});

    return res.status(200).json({ deleted: true, id });
  }

  return res.status(405).json({ error: "Method not allowed" });
});
