import { requireAuth } from "../_lib/auth.js";
import { getProjectById, updateProject, deleteProject, ProjectServiceError } from "../_lib/projects.js";

export default requireAuth(async (req, res) => {
  const { id } = req.query;

  try {
    if (req.method === "GET") {
      return res.status(200).json(await getProjectById(id));
    }

    if (req.method === "PUT") {
      const project = await updateProject(id, req.body || {}, req.user);
      return res.status(200).json(project);
    }

    if (req.method === "DELETE") {
      return res.status(200).json(await deleteProject(id, req.user));
    }
  } catch (err) {
    if (err instanceof ProjectServiceError) return res.status(err.status).json({ error: err.message });
    return res.status(500).json({ error: "Something went wrong" });
  }

  return res.status(405).json({ error: "Method not allowed" });
});
