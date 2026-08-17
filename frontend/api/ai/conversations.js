import { requireAuth } from "../_lib/auth.js";
import {
  listConversations,
  createConversation,
  conversationUserId,
  hasAssistantAccess,
  AiConversationServiceError,
} from "../_lib/ai-conversations.js";

export default requireAuth(async (req, res) => {
  if (!hasAssistantAccess(req.user)) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    if (req.method === "GET") {
      const conversations = await listConversations(conversationUserId(req.user));
      return res.status(200).json({ conversations });
    }

    if (req.method === "POST") {
      const title = req.body && typeof req.body.title === "string" ? req.body.title : undefined;
      const conversation = await createConversation(conversationUserId(req.user), title);
      return res.status(201).json({ conversation });
    }
  } catch (err) {
    if (err instanceof AiConversationServiceError) return res.status(err.status).json({ error: err.message });
    return res.status(500).json({ error: "Something went wrong" });
  }

  return res.status(405).json({ error: "Method not allowed" });
});