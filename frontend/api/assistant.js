import { requireAuth } from "./_lib/auth.js";
import { generateReply, GeminiServiceError } from "./_lib/gemini.js";

const MAX_HISTORY = 40;
const MAX_MESSAGE_LENGTH = 4000;

function sanitizeMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return null;

  const clean = [];
  for (const m of messages.slice(-MAX_HISTORY)) {
    const role = m?.role === "user" || m?.role === "assistant" ? m.role : null;
    const content = typeof m?.content === "string" ? m.content.trim() : "";
    if (!role || !content) continue;
    clean.push({ role, content: content.slice(0, MAX_MESSAGE_LENGTH) });
  }

  return clean.length > 0 ? clean : null;
}

export default requireAuth(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const messages = sanitizeMessages(req.body?.messages);
  if (!messages || messages[messages.length - 1].role !== "user") {
    return res.status(400).json({ error: "A message is required" });
  }

  try {
    const { reply, tools } = await generateReply({ messages, user: req.user });
    return res.status(200).json(tools && tools.length > 0 ? { reply, tools } : { reply });
  } catch (err) {
    if (err instanceof GeminiServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    return res.status(500).json({ error: "Something went wrong" });
  }
});