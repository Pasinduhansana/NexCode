import { requireReportingAccess } from "../../_lib/auth.js";
import {
  getReport,
  updateReportContent,
  deleteReport,
  setReportStatus,
  ReportServiceError,
} from "../../_lib/reports.js";

export default requireReportingAccess(async (req, res) => {
  try {
    const id = String(req.query.id || "");

    if (req.method === "GET") {
      const report = await getReport({ user: req.user, id });
      return res.status(200).json(report);
    }

    if (req.method === "PATCH") {
      const report = await updateReportContent({
        user: req.user,
        id,
        content: req.body?.content,
      });
      return res.status(200).json(report);
    }

    if (req.method === "DELETE") {
      const result = await deleteReport({ user: req.user, id });
      return res.status(200).json(result);
    }

    if (req.method === "PUT") {
      const report = await setReportStatus({
        user: req.user,
        id,
        status: req.body?.status,
      });
      return res.status(200).json(report);
    }
  } catch (err) {
    if (err instanceof ReportServiceError) return res.status(err.status).json({ error: err.message });
    return res.status(500).json({ error: "Something went wrong" });
  }

  return res.status(405).json({ error: "Method not allowed" });
});