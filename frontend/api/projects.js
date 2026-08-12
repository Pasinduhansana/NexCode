import { requireAuth } from "./_lib/auth.js";
import { getCollection } from "./_lib/mongodb.js";
import { logActivity } from "./_lib/activity.js";
import { invalidate } from "./_lib/cache.js";

export default requireAuth(async (req, res) => {
  if (req.method === "GET") {
    const projects = await (await getCollection("projects"))
      .find({})
      .sort({ updatedAt: -1 })
      .toArray();

    return res.status(200).json(projects);
  }

  if (req.method === "POST") {
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

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Project name is required" });
    }

    const now = new Date();
    const project = {
      name: String(name).trim(),
      client: client ? String(client).trim() : "",
      description: description ? String(description).trim() : "",
      status: status || "planning",
      priority: priority || "medium",
      startDate: startDate ? new Date(startDate) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      budget: budget !== undefined && budget !== "" && budget !== null ? Number(budget) : null,
      tags: Array.isArray(tags) ? tags.map((t) => String(t).trim()).filter(Boolean) : [],
      color: color || "#3699f3",
      createdAt: now,
      updatedAt: now,
    };

    const projects = await getCollection("projects");
    const { insertedId } = await projects.insertOne(project);

    invalidate("kanban", "stats");

    await logActivity(req.user, {
      action: "create",
      targetType: "project",
      target: project.name,
      details: { status: project.status, priority: project.priority },
    }).catch(() => {});

    return res.status(201).json({ ...project, _id: insertedId });
  }

  return res.status(405).json({ error: "Method not allowed" });
});
