import { requireAuth } from "../_lib/auth.js";
import { getTaskById, updateTask, deleteTask, TaskServiceError } from "../_lib/tasks.js";

export default requireAuth(async (req, res) => {
  const { id } = req.query;

  try {
    if (req.method === "GET") {
      return res.status(200).json(await getTaskById(id));
    }

    if (req.method === "PUT") {
      return res.status(200).json(await updateTask(id, req.body || {}, req.user));
    }

    if (req.method === "DELETE") {
      return res.status(200).json(await deleteTask(id, req.user));
    }
  } catch (err) {
    if (err instanceof TaskServiceError) return res.status(err.status).json({ error: err.message });
    return res.status(500).json({ error: "Something went wrong" });
  }

  return res.status(405).json({ error: "Method not allowed" });
});
