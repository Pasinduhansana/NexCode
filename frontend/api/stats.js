import { requireAuth } from "./_lib/auth.js";
import { getCollection } from "./_lib/mongodb.js";
import { cached } from "./_lib/cache.js";
import { buildFinanceSummary } from "./finance.js";

export default requireAuth(async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const data = await cached("stats:all", 10_000, async () => {
    const projects = await getCollection("projects");
    const tasks = await getCollection("tasks");

    const [projectDocs, taskDocs] = await Promise.all([
      projects.find({}).sort({ updatedAt: -1 }).toArray(),
      tasks.find({}).sort({ updatedAt: -1 }).toArray(),
    ]);

    const projectStatusCounts = {};
    const taskStatusCounts = {};
    let openTasks = 0;
    let completedTasks = 0;
    let totalBudget = 0;
    let overdueTasks = 0;
    const now = Date.now();
    const overdueList = [];

    for (const p of projectDocs) {
      projectStatusCounts[p.status || "planning"] = (projectStatusCounts[p.status || "planning"] || 0) + 1;
      if (p.budget) totalBudget += p.budget;
    }

    for (const t of taskDocs) {
      const status = t.status || "todo";
      taskStatusCounts[status] = (taskStatusCounts[status] || 0) + 1;
      if (status === "done") completedTasks += 1;
      else openTasks += 1;
      if (status !== "done" && t.dueDate && new Date(t.dueDate).getTime() < now) {
        overdueTasks += 1;
        if (overdueList.length < 5) overdueList.push({ _id: t._id, title: t.title, dueDate: t.dueDate, projectId: t.projectId });
      }
    }

    const finance = await buildFinanceSummary();

    return {
      totals: {
        projects: projectDocs.length,
        tasks: taskDocs.length,
        openTasks,
        completedTasks,
        totalBudget,
        overdueTasks,
      },
      projectStatusCounts,
      taskStatusCounts,
      recentProjects: projectDocs.slice(0, 6),
      overdueTasks: overdueList,
      finance,
    };
  });

  return res.status(200).json(data);
});
