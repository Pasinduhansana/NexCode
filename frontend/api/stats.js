import { requireAuth } from "./_lib/auth.js";
import { getCollection } from "./_lib/mongodb.js";
import { cached } from "./_lib/cache.js";
import { buildFinanceSummary } from "./finance.js";

const DEFAULT_PROJECT_STATUS = "planning";
const DEFAULT_TASK_STATUS = "todo";

export default requireAuth(async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 60s TTL: stats are invalidated on every write, so a longer TTL only affects
  // cross-client freshness, never post-edit freshness.
  const data = await cached("stats:all", 60_000, async () => {
    const projects = await getCollection("projects");
    const tasks = await getCollection("tasks");

    const now = new Date();

    // Aggregate/limit instead of shipping every project + task document to the
    // browser just to compute counts (this was the biggest source of slow loads).
    const [projectCounts, taskCounts, budgetRes, recentProjects, overdueCount, overdueList, finance] =
      await Promise.all([
        projects
          .aggregate([
            { $group: { _id: { $ifNull: ["$status", DEFAULT_PROJECT_STATUS] }, n: { $sum: 1 } } },
          ])
          .toArray(),
        tasks
          .aggregate([
            { $group: { _id: { $ifNull: ["$status", DEFAULT_TASK_STATUS] }, n: { $sum: 1 } } },
          ])
          .toArray(),
        projects
          .aggregate([{ $group: { _id: null, total: { $sum: "$budget" } } }])
          .toArray(),
        projects
          .find({})
          .sort({ updatedAt: -1 })
          .limit(6)
          .project({ name: 1, client: 1, status: 1, dueDate: 1 })
          .toArray(),
        tasks.countDocuments({ status: { $ne: "done" }, dueDate: { $lt: now } }),
        tasks
          .find({ status: { $ne: "done" }, dueDate: { $lt: now } })
          .sort({ dueDate: 1 })
          .limit(5)
          .project({ _id: 1, title: 1, dueDate: 1, projectId: 1 })
          .toArray(),
        buildFinanceSummary(),
      ]);

    const projectStatusCounts = {};
    let projectTotal = 0;
    for (const row of projectCounts) {
      projectStatusCounts[row._id] = row.n;
      projectTotal += row.n;
    }

    const taskStatusCounts = {};
    let taskTotal = 0;
    for (const row of taskCounts) {
      taskStatusCounts[row._id] = row.n;
      taskTotal += row.n;
    }

    const completedTasks = taskStatusCounts.done || 0;

    return {
      totals: {
        projects: projectTotal,
        tasks: taskTotal,
        openTasks: taskTotal - completedTasks,
        completedTasks,
        totalBudget: budgetRes[0]?.total || 0,
        overdueTasks: overdueCount,
      },
      projectStatusCounts,
      taskStatusCounts,
      recentProjects,
      overdueTasks: overdueList,
      finance,
    };
  });

  return res.status(200).json(data);
});
