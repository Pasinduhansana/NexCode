import { requireAuth } from "./_lib/auth.js";
import { generateReply, GeminiServiceError } from "./_lib/gemini.js";
import { checkAiRateLimit } from "./_lib/ratelimit.js";

const MAX_HISTORY = 40;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_CONTEXT_CHARS = 30000;
const GENERATE_TIMEOUT_MS = 55000;

export function sanitizeMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return null;

  const clean = [];
  for (const m of messages.slice(-MAX_HISTORY)) {
    const role = m?.role === "user" || m?.role === "assistant" ? m.role : null;
    const content = typeof m?.content === "string" ? m.content.trim() : "";
    if (!role || !content) continue;
    clean.push({ role, content: content.slice(0, MAX_MESSAGE_LENGTH) });
  }

  if (clean.length === 0) return null;

  let total = clean.reduce((sum, m) => sum + m.content.length, 0);
  let from = 0;
  while (total > MAX_CONTEXT_CHARS && from < clean.length - 1) {
    total -= clean[from].content.length;
    from += 1;
  }

  return clean.slice(from);
}

export default requireAuth(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const pages = Array.isArray(req.user?.access?.pages) ? req.user.access.pages : [];
  const allowed = req.user?.superAdmin === true || pages.includes("assistant");
  if (!allowed) {
    return res.status(403).json({ error: "Access denied" });
  }

  const messages = sanitizeMessages(req.body?.messages);
  if (!messages || messages[messages.length - 1].role !== "user") {
    return res.status(400).json({ error: "A message is required" });
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

  let timer;
  try {
    const { reply, tools } = await Promise.race([
      generateReply({ messages, user: req.user }),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new GeminiServiceError(
          "TIMEOUT",
          "The AI service is taking too long to respond. Please try again.",
          504
        )), GENERATE_TIMEOUT_MS);
      }),
    ]);
    return res.status(200).json(tools && tools.length > 0 ? { reply, tools } : { reply });
  } catch (err) {
    if (err instanceof GeminiServiceError) {
      return res.status(err.status).json({ error: err.message });
    }
    return res.status(500).json({ error: "Something went wrong" });
  } finally {
    clearTimeout(timer);
  }
});