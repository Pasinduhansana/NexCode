import { requireReportingAccess } from "./_lib/auth.js";
import {
  createReport,
  listReports,
  ReportServiceError,
  REPORT_TYPES,
} from "./_lib/reports.js";

export default requireReportingAccess(async (req, res) => {
  try {
    if (req.method === "GET") {
      const reports = await listReports({
        user: req.user,
        filters: {
          documentType: req.query.documentType,
          projectId: req.query.projectId,
          status: req.query.status,
          search: req.query.search,
          sort: req.query.sort,
        },
      });
      return res.status(200).json(reports);
    }

    if (req.method === "POST") {
      if (!REPORT_TYPES.includes(req.body?.documentType)) {
        return res.status(400).json({ error: "A valid documentType is required" });
      }
      const report = await createReport({ user: req.user, data: req.body });
      return res.status(201).json(report);
    }
  } catch (err) {
    if (err instanceof ReportServiceError) return res.status(err.status).json({ error: err.message });
    return res.status(500).json({ error: "Something went wrong" });
  }

  return res.status(405).json({ error: "Method not allowed" });
});