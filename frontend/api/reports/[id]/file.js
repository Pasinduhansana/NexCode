import { requireReportingAccess } from "../../_lib/auth.js";
import {
  getReportFile,
  ReportServiceError,
} from "../../_lib/reports.js";

export default requireReportingAccess(async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { buffer, report } = await getReportFile({
      user: req.user,
      id: String(req.query.id || ""),
    });
    const filename = `${report.docNumber || "report"}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.setHeader("Content-Length", String(buffer.length));
    return res.status(200).send(buffer);
  } catch (err) {
    if (err instanceof ReportServiceError) return res.status(err.status).json({ error: err.message });
    return res.status(500).json({ error: "Something went wrong" });
  }
});