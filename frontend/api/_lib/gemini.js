import { GoogleGenAI, ApiError } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const DEFAULT_MODEL_CHAIN = ["gemini-3.6-flash", "gemini-3.7-flash", "gemini-3.5-flash-lite", "gemini-flash-latest"];
const RETRYABLE_STATUSES = new Set([404, 429, 503]);

const SYSTEM_INSTRUCTION = `You are the AI Assistant for the NexCode admin panel.

You help the NexCode team run their software agency: answering questions about projects, tasks, budgets, finance, and drafting text such as client updates.

Guidelines:
- Be concise, practical, and friendly.
- When figures are mentioned, present them as estimates unless you have real data.
- You do not have direct access to the NexCode database, tools, or live data. If you are asked to change or query live records, explain that capability is not available yet.
- If asked something outside your scope, say so briefly and suggest what you can help with.`;

export const GEMINI_ERROR = {
  MISSING_API_KEY: "MISSING_API_KEY",
  RATE_LIMITED: "RATE_LIMITED",
  NETWORK_ERROR: "NETWORK_ERROR",
  GEMINI_ERROR: "GEMINI_ERROR",
};

export class GeminiServiceError extends Error {
  constructor(code, message, status = 500) {
    super(message);
    this.name = "GeminiServiceError";
    this.code = code;
    this.status = status;
  }
}

function getModelChain() {
  const configured = (process.env.GEMINI_MODEL || "").trim();
  if (!configured) return DEFAULT_MODEL_CHAIN;
  return [configured, ...DEFAULT_MODEL_CHAIN.filter((m) => m !== configured)];
}

function toGeminiContents(messages) {
  const contents = [];
  for (const m of messages) {
    const role = m.role === "user" ? "user" : "model";
    const text = typeof m.content === "string" ? m.content : "";
    const last = contents[contents.length - 1];
    if (last && last.role === role) {
      last.parts[0].text += `\n\n${text}`;
    } else {
      contents.push({ role, parts: [{ text }] });
    }
  }
  return contents;
}

function errorMessage(err) {
  return err instanceof Error ? err.message : String(err);
}

function isRetryable(err) {
  if (err instanceof ApiError && RETRYABLE_STATUSES.has(err.status)) return true;
  const lower = errorMessage(err).toLowerCase();
  return /429|resource_exhausted|rate.?limit|quota|too many requests|no longer available|high demand|overloaded/i.test(lower);
}

function classifyError(err) {
  const lower = errorMessage(err).toLowerCase();

  if (err instanceof ApiError && err.status === 429) {
    return new GeminiServiceError(
      GEMINI_ERROR.RATE_LIMITED,
      "The AI service is temporarily overloaded. Please wait a moment and try again.",
      429
    );
  }
  if (/429|resource_exhausted|rate.?limit|quota|too many requests/i.test(lower)) {
    return new GeminiServiceError(
      GEMINI_ERROR.RATE_LIMITED,
      "The AI service is temporarily overloaded. Please wait a moment and try again.",
      429
    );
  }
  if (err instanceof ApiError && err.status === 503) {
    return new GeminiServiceError(
      GEMINI_ERROR.GEMINI_ERROR,
      "The AI service is temporarily overloaded. Please try again in a moment.",
      502
    );
  }
  if (
    err instanceof TypeError ||
    /fetch failed|enetrefused|enotfound|econnreset|econnaborted|network|socket|timed.?out/i.test(lower)
  ) {
    return new GeminiServiceError(
      GEMINI_ERROR.NETWORK_ERROR,
      "Could not reach the AI service. Please check your connection and try again.",
      502
    );
  }
  if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
    return new GeminiServiceError(
      GEMINI_ERROR.GEMINI_ERROR,
      "The AI service rejected the request. Check the API key configuration.",
      502
    );
  }
  if (/no longer available|not found|invalid argument|unknown model|NOT_FOUND/i.test(lower)) {
    return new GeminiServiceError(
      GEMINI_ERROR.GEMINI_ERROR,
      "The configured AI model is not available. Check the GEMINI_MODEL setting.",
      502
    );
  }
  return new GeminiServiceError(
    GEMINI_ERROR.GEMINI_ERROR,
    "The AI service returned an error. Please try again.",
    502
  );
}

async function generateWithModel(ai, model, messages) {
  const response = await ai.models.generateContent({
    model,
    contents: toGeminiContents(messages),
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  });

  const text = typeof response?.text === "string" ? response.text.trim() : "";
  if (!text) {
    throw new GeminiServiceError(
      GEMINI_ERROR.GEMINI_ERROR,
      "The AI service returned an empty response. Please try again.",
      502
    );
  }
  return text;
}

export async function generateReply({ messages }) {
  if (!GEMINI_API_KEY) {
    throw new GeminiServiceError(
      GEMINI_ERROR.MISSING_API_KEY,
      "The AI assistant is not configured. Add GEMINI_API_KEY to the server environment.",
      503
    );
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const chain = getModelChain();
  let lastRetryableError = null;

  for (const model of chain) {
    try {
      return await generateWithModel(ai, model, messages);
    } catch (err) {
      if (err instanceof GeminiServiceError) throw err;
      if (!isRetryable(err)) throw classifyError(err);
      lastRetryableError = err;
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  throw classifyError(lastRetryableError || new Error("AI service unavailable"));
}