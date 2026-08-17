import { requireAuth } from "../_lib/auth.js";
import {
  getDesignReferenceById,
  updateDesignReference,
  deleteDesignReference,
  DesignReferenceServiceError,
} from "../_lib/designreferences.js";

export default requireAuth(async (req, res) => {
  const { id } = req.query;

  try {
    if (req.method === "GET") {
      return res.status(200).json(await getDesignReferenceById(id));
    }

    if (req.method === "PUT") {
      return res.status(200).json(await updateDesignReference(id, req.body || {}, req.user));
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
