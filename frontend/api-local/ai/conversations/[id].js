import { requireAuth } from "../../_lib/auth.js";
import {
  getConversation,
  renameConversation,
  deleteConversation,
  conversationUserId,
  hasAssistantAccess,
  AiConversationServiceError,
} from "../../_lib/ai-conversations.js";

export default requireAuth(async (req, res) => {
  const { id } = req.query;
  const userId = conversationUserId(req.user);

  if (!hasAssistantAccess(req.user)) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    if (req.method === "GET") {
      return res.status(200).json(await getConversation(userId, id));
    }

    if (req.method === "PATCH") {
      const title = req.body && typeof req.body.title === "string" ? req.body.title : "";
      return res.status(200).json(await renameConversation(userId, id, title));
    }

    if (req.method === "DELETE") {
      return res.status(200).json(await deleteConversation(userId, id));
    }
  } catch (err) {
    if (err instanceof AiConversationServiceError) return res.status(err.status).json({ error: err.message });
    return res.status(500).json({ error: "Something went wrong" });
  }

  return res.status(405).json({ error: "Method not allowed" });
});