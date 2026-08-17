import adminApi from "./adminApi";
import { AssistantAbortError, getAssistantErrorMessage } from "./assistantApi";

export async function listConversations() {
  const { data } = await adminApi.get("/ai/conversations");
  return Array.isArray(data?.conversations) ? data.conversations : [];
}

export async function createConversation() {
  const { data } = await adminApi.post("/ai/conversations");
  return data?.conversation;
}

export async function getConversation(id) {
  const { data } = await adminApi.get(`/ai/conversations/${id}`);
  return data;
}

export async function renameConversation(id, title) {
  const { data } = await adminApi.patch(`/ai/conversations/${id}`, { title });
  return data;
}

export async function deleteConversation(id) {
  const { data } = await adminApi.delete(`/ai/conversations/${id}`);
  return data;
}

export async function clearConversation(id) {
  const { data } = await adminApi.post(`/ai/conversations/${id}/clear`);
  return data;
}

export async function sendConversationMessage(id, content, { signal } = {}) {
  let response;
  try {
    response = await adminApi.post(
      `/ai/conversations/${id}/messages`,
      { content },
      { timeout: 60000, signal }
    );
  } catch (err) {
    if (signal?.aborted || err?.code === "ERR_CANCELED") {
      throw new AssistantAbortError();
    }
    throw new Error(getAssistantErrorMessage(err));
  }

  const reply = response?.data?.reply;
  if (typeof reply !== "string" || !reply.trim()) {
    throw new Error("The AI service returned an empty response. Please try again.");
  }

  return {
    reply,
    tools: Array.isArray(response?.data?.tools) ? response.data.tools : [],
    title: typeof response?.data?.title === "string" ? response.data.title : undefined,
    messageCount: typeof response?.data?.messageCount === "number" ? response.data.messageCount : undefined,
  };
}