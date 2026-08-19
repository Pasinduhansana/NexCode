import { requireReportingAccess } from "../../_lib/auth.js";
import {
  generateReportPdf,
  ReportServiceError,
} from "../../_lib/reports.js";

export default requireReportingAccess(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const report = await generateReportPdf({
      user: req.user,
      id: String(req.query.id || ""),
    });
    return res.status(200).json(report);
  } catch (err) {
    if (err instanceof ReportServiceError) return res.status(err.status).json({ error: err.message });
    return res.status(500).json({ error: "Something went wrong" });
  }
});