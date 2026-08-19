import { requireAuth } from "../_lib/auth.js";
import { getIssueById, updateIssue, deleteIssue, IssueServiceError } from "../_lib/issues.js";

export default requireAuth(async (req, res) => {
  const { id } = req.query;

  try {
    if (req.method === "GET") {
      return res.status(200).json(await getIssueById(id));
    }

    if (req.method === "PUT") {
      return res.status(200).json(await updateIssue(id, req.body || {}, req.user));
    }

    if (req.method === "DELETE") {
      return res.status(200).json(await deleteIssue(id, req.user));
    }
  } catch (err) {
    if (err instanceof IssueServiceError) return res.status(err.status).json({ error: err.message });
    return res.status(500).json({ error: "Something went wrong" });
  }

  return res.status(405).json({ error: "Method not allowed" });
});
