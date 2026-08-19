import { requireReportingAccess } from "../_lib/auth.js";
import {
  generateReportDraftFromAI,
  ReportServiceError,
  REPORT_TYPES,
} from "../_lib/reports.js";
import { checkAiRateLimit } from "../_lib/ratelimit.js";

export default requireReportingAccess(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const documentType = req.body?.documentType;
  if (!REPORT_TYPES.includes(documentType)) {
    return res.status(400).json({ error: "A valid documentType is required" });
  }

  const rate = await checkAiRateLimit({
    userId: String(req.user?.uid || req.user?.id || req.user?.name || "anon"),
  });
  if (!rate.allowed) {
    if (rate.resetAt) {
      const seconds = Math.max(1, Math.ceil((new Date(rate.resetAt).getTime() - Date.now()) / 1000));
      res.setHeader("Retry-After", String(seconds));
    }
    return res.status(429).json({
      error: "Too many AI requests. Please wait a moment and try again.",
    });
  }

  try {
    const report = await generateReportDraftFromAI({
      user: req.user,
      documentType,
      projectId: req.body?.projectId,
      projectName: req.body?.projectName,
      notes: req.body?.notes,
    });
    return res.status(201).json(report);
  } catch (err) {
    if (err instanceof ReportServiceError) return res.status(err.status).json({ error: err.message });
    return res.status(500).json({ error: "Something went wrong" });
  }
});