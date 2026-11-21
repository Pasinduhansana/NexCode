import { requireAuth } from "../../../_lib/auth.js";
import {
  clearConversation,
  conversationUserId,
  hasAssistantAccess,
  AiConversationServiceError,
} from "../../../_lib/ai-conversations.js";

export default requireAuth(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  const userId = conversationUserId(req.user);

  if (!hasAssistantAccess(req.user)) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    return res.status(200).json(await clearConversation(userId, id));
  } catch (err) {
    if (err instanceof AiConversationServiceError) return res.status(err.status).json({ error: err.message });
    return res.status(500).json({ error: "Something went wrong" });
  }
});