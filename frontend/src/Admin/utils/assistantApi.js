import adminApi from "./adminApi";

export async function sendAssistantMessage(message, history = []) {
  const messages = [...history, { role: "user", content: message }];

  let response;
  try {
    response = await adminApi.post("/assistant", { messages }, { timeout: 60000 });
  } catch (err) {
    throw new Error(getAssistantErrorMessage(err));
  }

  const reply = response?.data?.reply;
  if (typeof reply !== "string" || !reply.trim()) {
    throw new Error("The AI service returned an empty response. Please try again.");
  }
  const tools = Array.isArray(response?.data?.tools) ? response.data.tools : [];
  return { reply, tools };
}

export function getAssistantErrorMessage(err) {
  if (err?.response?.data?.error) return err.response.data.error;
  if (err?.code === "ECONNABORTED") {
    return "The AI service took too long to respond. Please try again.";
  }
  if (!err?.response) {
    return "Could not reach the AI service. Check your connection and try again.";
  }
  return "Sorry, something went wrong while generating a response. Please try again.";
}