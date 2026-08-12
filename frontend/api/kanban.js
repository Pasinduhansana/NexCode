import { requireAuth } from "./_lib/auth.js";
import { getCollection } from "./_lib/mongodb.js";
import { cached } from "./_lib/cache.js";

export default requireAuth(async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const data = await cached("kanban:all", 10_000, async () => {
    const projects = await getCollection("projects");
    const tasks = await getCollection("tasks");

    const [projectDocs, taskDocs] = await Promise.all([
      projects.find({}).sort({ updatedAt: -1 }).toArray(),
      tasks.find({}).sort({ order: 1, createdAt: 1 }).toArray(),
    ]);

    const byProject = new Map();
    for (const p of projectDocs) byProject.set(String(p._id), { ...p, tasks: [] });
    for (const t of taskDocs) {
      const bucket = byProject.get(String(t.projectId));
      if (bucket) bucket.tasks.push(t);
    }

    return {
      projects: [...byProject.values()],
      tasks: taskDocs,
    };
  });

  return res.status(200).json(data);
});
