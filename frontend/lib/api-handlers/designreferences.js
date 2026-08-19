import { requireDesignerAccess } from "./_lib/auth.js";
import {
  createDesignReference,
  listDesignReferencesByProject,
  DesignReferenceServiceError,
} from "./_lib/designreferences.js";

export default requireDesignerAccess(async (req, res) => {
  try {
    if (req.method === "GET") {
      const { projectId, type, sectionId } = req.query;
      const references = await listDesignReferencesByProject(projectId, type, sectionId);
      return res.status(200).json(references);
    }

    if (req.method === "POST") {
      const reference = await createDesignReference(
        { ...(req.body || {}), projectId: req.body?.projectId },
        req.user
      );
      return res.status(201).json(reference);
    }
  } catch (err) {
    if (err instanceof DesignReferenceServiceError) return res.status(err.status).json({ error: err.message });
    return res.status(500).json({ error: "Something went wrong" });
  }

  return res.status(405).json({ error: "Method not allowed" });
});