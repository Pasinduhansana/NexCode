import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HiOutlineSparkles, HiOutlineTrash, HiOutlineChatAlt2 } from "react-icons/hi";
import usePageTitle from "../../utils/usePageTitle";
import { useAdminAuth } from "../context/AdminAuthContext";
import { sendAssistantMessage, AssistantAbortError } from "../utils/assistantApi";
import ChatMessage from "../components/Assistant/ChatMessage";
import ChatInput from "../components/Assistant/ChatInput";
import ChatEmptyState from "../components/Assistant/ChatEmptyState";
import TypingIndicator from "../components/Assistant/TypingIndicator";

const MAX_HISTORY = 40;
const MAX_CONTEXT_CHARS = 25000;
const STICKY_OFFSET = 80;

const createMessage = (role, content, isError = false, tools = []) => ({
  id: crypto.randomUUID(),
  role,
  content,
  isError,
  tools,
});

function buildContext(messages) {
  const history = messages
    .filter((m) => !m.isError)
    .map((m) => ({ role: m.role, content: m.content }))
    .slice(-MAX_HISTORY);

  let total = history.reduce((sum, m) => sum + m.content.length, 0);
  let from = 0;
  while (total > MAX_CONTEXT_CHARS && from < history.length - 1) {
    total -= history[from].content.length;
    from += 1;
  }
  return history.slice(from);
}

export default function AdminAssistantPage() {
  const { user } = useAdminAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [stickToBottom, setStickToBottom] = useState(true);
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const seqRef = useRef(0);
  usePageTitle("AI Assistant");

  useEffect(() => {
    if (!stickToBottom) return;
    const frame = requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });
    return () => cancelAnimationFrame(frame);
  }, [messages, isTyping, stickToBottom]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setStickToBottom(el.scrollHeight - el.scrollTop - el.clientHeight < STICKY_OFFSET);
  }, []);

  const handleSend = useCallback(
    (raw) => {
      const text = raw.trim();
      if (!text || isTyping) return;

      const history = buildContext(messages);
      const controller = new AbortController();
      abortRef.current = controller;
      seqRef.current += 1;
      const seq = seqRef.current;

      setMessages((prev) => [...prev, createMessage("user", text)]);
      setInput("");
      setStickToBottom(true);
      setIsTyping(true);

      sendAssistantMessage(text, history, { signal: controller.signal })
        .then(({ reply, tools }) => {
          if (seqRef.current !== seq) return;
          setMessages((prev) => [...prev, createMessage("assistant", reply, false, tools)]);
        })
        .catch((err) => {
          if (seqRef.current !== seq || err instanceof AssistantAbortError) return;
          setMessages((prev) => [
            ...prev,
            createMessage(
              "assistant",
              err?.message || "Sorry, something went wrong while generating a response. Please try again.",
              true
            ),
          ]);
        })
        .finally(() => {
          if (seqRef.current === seq) setIsTyping(false);
        });
    },
    [isTyping, messages]
  );

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleClear = useCallback(() => {
    seqRef.current += 1;
    abortRef.current?.abort();
    setMessages([]);
    setInput("");
    setIsTyping(false);
    setStickToBottom(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const hasMessages = messages.length > 0;

  const messageList = useMemo(
    () => messages.map((m) => <ChatMessage key={m.id} message={m} />),
    [messages]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">AI Assistant</h1>
          <p className="mt-1 text-sm text-text_secondary">
            Ask questions and get instant help with your projects, tasks, and finances.
          </p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          disabled={!hasMessages}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-text_secondary transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <HiOutlineTrash size={16} />
          New chat
        </button>
      </div>

      <div className="flex h-[calc(100dvh-15rem)] min-h-[22rem] flex-col overflow-hidden rounded-2xl border border-border bg-card sm:h-[calc(100dvh-16rem)] lg:h-[calc(100dvh-18rem)]">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HiOutlineSparkles size={16} />
            </div>
            <div>
              <div className="font-display text-sm font-bold text-foreground">AI Assistant</div>
              <div role="status" className="flex items-center gap-1.5 text-[11px] text-text_muted">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${isTyping ? "animate-pulse bg-amber-500" : "bg-emerald-500"}`}
                />
                {isTyping ? "Thinking…" : "Online · Powered by Gemini"}
              </div>
            </div>
          </div>
          {hasMessages && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-text_secondary transition-colors hover:bg-muted hover:text-rose-500"
              title="Clear conversation"
            >
              <HiOutlineChatAlt2 size={14} />
              Clear
            </button>
          )}
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          className="flex-1 overflow-y-auto bg-page-alt/50"
        >
          {!hasMessages ? (
            <ChatEmptyState userName={user?.name} onSuggestion={handleSend} isTyping={isTyping} />
          ) : (
            <div className="space-y-5 p-4 sm:p-6">
              {messageList}
              {isTyping && <TypingIndicator />}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <ChatInput
          ref={inputRef}
          value={input}
          onChange={setInput}
          onSend={handleSend}
          onStop={handleStop}
          isTyping={isTyping}
        />
      </div>
    </div>
  );
}
