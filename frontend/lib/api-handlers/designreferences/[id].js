import { requireDesignerAccess } from "../_lib/auth.js";
import {
  getDesignReferenceById,
  updateDesignReference,
  deleteDesignReference,
  reorderDesignReference,
  DesignReferenceServiceError,
} from "../_lib/designreferences.js";

export default requireDesignerAccess(async (req, res) => {
  const { id } = req.query;

  try {
    if (req.method === "GET") {
      return res.status(200).json(await getDesignReferenceById(id));
    }

    if (req.method === "PUT") {
      const body = req.body || {};
      if (body.reorder) {
        return res.status(200).json(await reorderDesignReference(id, body.direction, req.user));
      }
      return res.status(200).json(await updateDesignReference(id, body, req.user));
    }

    if (req.method === "DELETE") {
      return res.status(200).json(await deleteDesignReference(id, req.user));
    }
  } catch (err) {
    if (err instanceof DesignReferenceServiceError) return res.status(err.status).json({ error: err.message });
    return res.status(500).json({ error: "Something went wrong" });
  }

  return res.status(405).json({ error: "Method not allowed" });
});