import { requireAuth } from "./_lib/auth.js";
import { createIssue, listIssuesByProject, IssueServiceError } from "./_lib/issues.js";

export default requireAuth(async (req, res) => {
  try {
    if (req.method === "GET") {
      const { projectId, status } = req.query;
      const issues = await listIssuesByProject(projectId, status);
      return res.status(200).json(issues);
    }

    if (req.method === "POST") {
      const issue = await createIssue(req.body || {}, req.user);
      return res.status(201).json(issue);
    }
  } catch (err) {
    if (err instanceof IssueServiceError) return res.status(err.status).json({ error: err.message });
    return res.status(500).json({ error: "Something went wrong" });
  }

  return res.status(405).json({ error: "Method not allowed" });
});
