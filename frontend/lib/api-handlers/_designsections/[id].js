import { requireDesignerAccess } from "../_lib/auth.js";
import {
  getDesignSectionById,
  updateDesignSection,
  deleteDesignSection,
  DesignSectionServiceError,
} from "../_lib/designsections.js";

export default requireDesignerAccess(async (req, res) => {
  const { id } = req.query;

  try {
    if (req.method === "GET") {
      return res.status(200).json(await getDesignSectionById(id));
    }

    if (req.method === "PUT") {
      return res.status(200).json(await updateDesignSection(id, req.body || {}, req.user));
    }

    if (req.method === "DELETE") {
      return res.status(200).json(await deleteDesignSection(id, req.user));
    }
  } catch (err) {
    if (err instanceof DesignSectionServiceError) return res.status(err.status).json({ error: err.message });
    return res.status(500).json({ error: "Something went wrong" });
  }

  return res.status(405).json({ error: "Method not allowed" });
});