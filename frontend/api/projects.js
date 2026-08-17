import { requireAuth } from "./_lib/auth.js";
import { listProjects, createProject, ProjectServiceError } from "./_lib/projects.js";

export default requireAuth(async (req, res) => {
  if (req.method === "GET") {
    try {
      return res.status(200).json(await listProjects());
    } catch (err) {
      if (err instanceof ProjectServiceError) return res.status(err.status).json({ error: err.message });
      return res.status(500).json({ error: "Something went wrong" });
    }
  }

  if (req.method === "POST") {
    try {
      const project = await createProject(req.body || {}, req.user);
      return res.status(201).json(project);
    } catch (err) {
      if (err instanceof ProjectServiceError) return res.status(err.status).json({ error: err.message });
      return res.status(500).json({ error: "Something went wrong" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
});
