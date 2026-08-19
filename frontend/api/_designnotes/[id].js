import { requireDesignerAccess } from "../_lib/auth.js";
import {
  getDesignNoteById,
  updateDesignNote,
  deleteDesignNote,
  DesignNoteServiceError,
} from "../_lib/designnotes.js";

export default requireDesignerAccess(async (req, res) => {
  const { id } = req.query;

  try {
    if (req.method === "GET") {
      return res.status(200).json(await getDesignNoteById(id));
    }

    if (req.method === "PUT") {
      return res.status(200).json(await updateDesignNote(id, req.body || {}, req.user));
    }

    if (req.method === "DELETE") {
      return res.status(200).json(await deleteDesignNote(id, req.user));
    }
  } catch (err) {
    if (err instanceof DesignNoteServiceError) return res.status(err.status).json({ error: err.message });
    return res.status(500).json({ error: "Something went wrong" });
  }

  return res.status(405).json({ error: "Method not allowed" });
});