import { requireDesignerAccess } from "./_lib/auth.js";
import {
  createDesignSection,
  listDesignSectionsByProject,
  DesignSectionServiceError,
} from "./_lib/designsections.js";

export default requireDesignerAccess(async (req, res) => {
  try {
    if (req.method === "GET") {
      const { projectId } = req.query;
      if (!projectId) {
        return res.status(400).json({ error: "projectId is required" });
      }
      const sections = await listDesignSectionsByProject(projectId);
      return res.status(200).json(sections);
    }

    if (req.method === "POST") {
      const section = await createDesignSection(
        { ...(req.body || {}), projectId: req.body?.projectId },
        req.user
      );
      return res.status(201).json(section);
    }
  } catch (err) {
    if (err instanceof DesignSectionServiceError) return res.status(err.status).json({ error: err.message });
    return res.status(500).json({ error: "Something went wrong" });
  }

  return res.status(405).json({ error: "Method not allowed" });
});