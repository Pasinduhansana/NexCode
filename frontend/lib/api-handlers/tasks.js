import { requireAuth } from "./_lib/auth.js";
import { createTask, listTasksByProject, TaskServiceError } from "./_lib/tasks.js";

export default requireAuth(async (req, res) => {
  try {
    if (req.method === "GET") {
      const { projectId } = req.query;
      const tasks = await listTasksByProject(projectId);
      return res.status(200).json(tasks);
    }

    if (req.method === "POST") {
      const task = await createTask({ ...(req.body || {}), projectId: req.body?.projectId }, req.user);
      return res.status(201).json(task);
    }
  } catch (err) {
    if (err instanceof TaskServiceError) return res.status(err.status).json({ error: err.message });
    return res.status(500).json({ error: "Something went wrong" });
  }

  return res.status(405).json({ error: "Method not allowed" });
});
