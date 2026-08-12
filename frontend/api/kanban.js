import { requireAuth } from "./_lib/auth.js";
import { getCollection } from "./_lib/mongodb.js";
import { cached } from "./_lib/cache.js";

export default requireAuth(async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 30s TTL: board data is invalidated on every task/project write, so a longer
  // TTL only affects freshness across clients, not after edits.
  const data = await cached("kanban:all", 30_000, async () => {
    const projects = await getCollection("projects");
    const tasks = await getCollection("tasks");

    const [projectDocs, taskDocs] = await Promise.all([
      // The board + timeline only need name/color per project (full project docs
      // carry large description bodies that are never rendered here).
      projects
        .find({}, { projection: { name: 1, color: 1 } })
        .sort({ updatedAt: -1 })
        .toArray(),
      // No global sort: `order` is per-project, so sorting the whole collection
      // forces a blocking in-memory sort (and throws past the 100MB sort limit).
      // Columns/Gantt re-sort client-side anyway.
      tasks.find({}).toArray(),
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
