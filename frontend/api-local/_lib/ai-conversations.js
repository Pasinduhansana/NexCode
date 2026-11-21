import { ObjectId } from "mongodb";
import { getCollection, unwrap } from "./mongodb.js";
import { generateReply, GeminiServiceError } from "./gemini.js";
import { checkAiRateLimit } from "./ratelimit.js";

const LIST_LIMIT = 200;
const MAX_TITLE_LENGTH = 60;
const MAX_CONTEXT_MESSAGES = 40;
const MAX_CONTEXT_CHARS = 30000;
const MAX_MESSAGE_LENGTH = 4000;
const GENERATE_TIMEOUT_MS = 110000;

export class AiConversationServiceError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "AiConversationServiceError";
    this.status = status;
  }
}

export function conversationUserId(user) {
  return String(user?.uid || user?.id || user?.name || "anon");
}

export function hasAssistantAccess(user) {
  if (!user) return false;
  if (user.superAdmin === true) return true;
  const pages = Array.isArray(user?.access?.pages) ? user.access.pages : [];
  return pages.includes("assistant");
}

function toObjectId(id) {
  if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) return null;
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

function now() {
  return new Date().toISOString();
}

const MINOR_WORDS = new Set(["a", "an", "and", "as", "at", "but", "by", "for", "in", "of", "on", "or", "the", "to", "vs", "via", "with"]);

function toTitleCase(value) {
  return value
    .split(" ")
    .map((word, index) => {
      if (index > 0 && MINOR_WORDS.has(word.toLowerCase())) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export function deriveTitle(content) {
  const text = String(content || "").trim().replace(/\s+/g, " ").slice(0, 100);
  if (!text) return "New Chat";
  let title = text.split(" ").slice(0, 8).join(" ");
  if (title.length > MAX_TITLE_LENGTH) title = title.slice(0, MAX_TITLE_LENGTH).trim();
  title = title.replace(/[.!?,;:]+$/, "").trim();
  return title ? toTitleCase(title) : "New Chat";
}

export async function listConversations(userId) {
  const col = await getCollection("aiconversations");
  const docs = await col
    .find({ userId })
    .sort({ updatedAt: -1 })
    .limit(LIST_LIMIT)
    .project({ title: 1, createdAt: 1, updatedAt: 1, messageCount: { $size: "$messages" } })
    .toArray();
  return docs.map((d) => ({
    id: d._id,
    title: d.title || "New Chat",
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    messageCount: d.messageCount || 0,
  }));
}

export async function createConversation(userId, title) {
  const cleanTitle = typeof title === "string" ? title.trim().slice(0, MAX_TITLE_LENGTH) : "";
  const timestamp = now();
  const col = await getCollection("aiconversations");
  const { insertedId } = await col.insertOne({
    userId,
    title: cleanTitle || "New Chat",
    messages: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  return { id: insertedId, title: cleanTitle || "New Chat", createdAt: timestamp, updatedAt: timestamp, messageCount: 0 };
}

export async function getConversation(userId, conversationId) {
  const col = await getCollection("aiconversations");
  const doc = await col.findOne({ _id: toObjectId(conversationId), userId });
  if (!doc) throw new AiConversationServiceError("Conversation not found", 404);
  return {
    id: doc._id,
    title: doc.title || "New Chat",
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    messages: Array.isArray(doc.messages) ? doc.messages : [],
  };
}

export async function renameConversation(userId, conversationId, title) {
  const cleanTitle = typeof title === "string" ? title.trim().slice(0, MAX_TITLE_LENGTH) : "";
  if (!cleanTitle) throw new AiConversationServiceError("A title is required", 400);
  const col = await getCollection("aiconversations");
  const doc = unwrap(
    await col.findOneAndUpdate(
      { _id: toObjectId(conversationId), userId },
      { $set: { title: cleanTitle, updatedAt: now() } },
      { returnDocument: "after" }
    )
  );
  if (!doc) throw new AiConversationServiceError("Conversation not found", 404);
  return { id: doc._id, title: cleanTitle };
}

export async function clearConversation(userId, conversationId) {
  const col = await getCollection("aiconversations");
  const doc = unwrap(
    await col.findOneAndUpdate(
      { _id: toObjectId(conversationId), userId },
      { $set: { title: "New Chat", messages: [], updatedAt: now() } },
      { returnDocument: "after" }
    )
  );
  if (!doc) throw new AiConversationServiceError("Conversation not found", 404);
  return { id: doc._id, title: "New Chat", messageCount: 0 };
}

export async function deleteConversation(userId, conversationId) {
  const col = await getCollection("aiconversations");
  const result = await col.deleteOne({ _id: toObjectId(conversationId), userId });
  if (!result.deletedCount) throw new AiConversationServiceError("Conversation not found", 404);
  return { ok: true };
}

export async function appendMessage(userId, conversationId, role, content, tools) {
  const message = { role, content, timestamp: now() };
  if (role === "assistant" && Array.isArray(tools) && tools.length > 0) {
    message.tools = tools.map((t) => {
      const summary = {
        name: String(t?.name || "tool"),
        ok: Boolean(t?.ok),
        status: String(t?.status || (t?.ok ? "completed" : "error")),
        error: t?.ok ? undefined : String(t?.error || "Tool failed"),
      };
      if (t?.ok && t?.result && typeof t.result === "object") summary.result = t.result;
      return summary;
    });
  }
  const col = await getCollection("aiconversations");
  const doc = unwrap(
    await col.findOneAndUpdate(
      { _id: toObjectId(conversationId), userId },
      { $push: { messages: message }, $set: { updatedAt: now() } },
      { returnDocument: "after" }
    )
  );
  if (!doc) throw new AiConversationServiceError("Conversation not found", 404);
  return doc;
}

export function buildGeminiContext(messages) {
  const clean = [];
  for (const m of (Array.isArray(messages) ? messages : []).slice(-MAX_CONTEXT_MESSAGES)) {
    const role = m?.role === "user" || m?.role === "assistant" ? m.role : null;
    const content = typeof m?.content === "string" ? m.content.trim() : "";
    if (!role || !content) continue;
    clean.push({ role, content });
  }
  let total = clean.reduce((sum, m) => sum + m.content.length, 0);
  let from = 0;
  while (total > MAX_CONTEXT_CHARS && from < clean.length - 1) {
    total -= clean[from].content.length;
    from += 1;
  }
  return clean.slice(from);
}

export async function sendMessage({ user, conversationId, content }) {
  const userId = conversationUserId(user);
  const text = typeof content === "string" ? content.trim() : "";
  if (!text || text.length > MAX_MESSAGE_LENGTH) {
    throw new AiConversationServiceError("A message is required", 400);
  }

  const conversation = await getConversation(userId, conversationId);

  const rate = await checkAiRateLimit({ userId });
  if (!rate.allowed) {
    const err = new AiConversationServiceError(
      "Too many AI requests. Please wait a moment and try again.",
      429
    );
    err.retryAfter = rate.resetAt
      ? Math.max(1, Math.ceil((new Date(rate.resetAt).getTime() - Date.now()) / 1000))
      : undefined;
    throw err;
  }

  const afterUser = await appendMessage(userId, conversationId, "user", text);

  if ((afterUser.messages || []).length === 1 && (!conversation.title || conversation.title === "New Chat")) {
    const title = deriveTitle(text);
    if (title !== "New Chat") {
      await renameConversation(userId, conversationId, title).catch(() => {});
    }
  }

  const history = buildGeminiContext(
    (afterUser.messages || []).map((m) => ({ role: m.role, content: m.content }))
  );

  const { reply, tools } = await Promise.race([
    generateReply({ messages: history, user }),
    new Promise((_, reject) => {
      setTimeout(
        () =>
          reject(
            new GeminiServiceError(
              "TIMEOUT",
              "The AI service is taking too long to respond. Please try again.",
              504
            )
          ),
        GENERATE_TIMEOUT_MS
      );
    }),
  ]);

  const afterAssistant = await appendMessage(userId, conversationId, "assistant", reply, tools);
  return {
    reply,
    tools: Array.isArray(tools) ? tools : [],
    title: afterAssistant.title || conversation.title,
    messageCount: (afterAssistant.messages || []).length,
  };
}