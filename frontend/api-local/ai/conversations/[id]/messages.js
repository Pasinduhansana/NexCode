import { requireAuth } from "../../../_lib/auth.js";
import { GeminiServiceError } from "../../../_lib/gemini.js";
import {
  sendMessage,
  hasAssistantAccess,
  AiConversationServiceError,
} from "../../../_lib/ai-conversations.js";

export default requireAuth(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  if (!hasAssistantAccess(req.user)) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const result = await sendMessage({ user: req.user, conversationId: id, content: req.body?.content });
    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof AiConversationServiceError) {
      if (err.retryAfter) res.setHeader("Retry-After", String(err.retryAfter));
      return res.status(err.status).json({ error: err.message });
    }
    if (err instanceof GeminiServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    return res.status(500).json({ error: "Something went wrong" });
  }
});