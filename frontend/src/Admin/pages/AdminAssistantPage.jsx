"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HiOutlineSparkles, HiOutlineMenu, HiOutlineChatAlt2 } from "react-icons/hi";
import usePageTitle from "../../utils/usePageTitle";
import { useAdminAuth } from "../context/AdminAuthContext";
import { AssistantAbortError } from "../utils/assistantApi";
import {
  listConversations,
  getConversation,
  createConversation,
  renameConversation,
  deleteConversation,
  clearConversation,
  sendConversationMessage,
} from "../utils/aiConversationsApi";
import ChatMessage from "../components/Assistant/ChatMessage";
import ChatInput from "../components/Assistant/ChatInput";
import ChatEmptyState from "../components/Assistant/ChatEmptyState";
import TypingIndicator from "../components/Assistant/TypingIndicator";
import ConversationSidebar from "../components/Assistant/ConversationSidebar";

const STICKY_OFFSET = 80;

const createMessage = (role, content, isError = false, tools = []) => ({
  id: crypto.randomUUID(),
  role,
  content,
  isError,
  tools,
});

export default function AdminAssistantPage() {
  const { user } = useAdminAuth();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stickToBottom, setStickToBottom] = useState(true);
  const [planCreating, setPlanCreating] = useState(false);
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const seqRef = useRef(0);
  usePageTitle("AI Assistant");

  useEffect(() => {
    let cancelled = false;
    listConversations()
      .then((items) => {
        if (!cancelled) setConversations(items);
      })
      .catch((err) => {
        if (!cancelled) setLoadError("Could not load your conversations.");
      })
      .finally(() => {
        if (!cancelled) setLoadingList(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  const refreshListEntry = useCallback((id, patch) => {
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.id === id);
      const nowIso = new Date().toISOString();
      const item =
        idx >= 0
          ? { ...prev[idx], ...patch, updatedAt: nowIso }
          : { id, title: "New Chat", createdAt: nowIso, updatedAt: nowIso, messageCount: 0, ...patch };
      const next = idx >= 0 ? [...prev] : [item, ...prev];
      if (idx >= 0) next[idx] = item;
      return next.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
    });
  }, []);

  const handleNewChat = useCallback(() => {
    seqRef.current += 1;
    abortRef.current?.abort();
    setActiveId(null);
    setMessages([]);
    setInput("");
    setIsTyping(false);
    setLoadError("");
    setStickToBottom(true);
    setSidebarOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const loadConversation = useCallback((id) => {
    setLoadingConversation(true);
    setLoadError("");
    getConversation(id)
      .then((conv) => {
        setMessages(
          (Array.isArray(conv?.messages) ? conv.messages : []).map((m, index) => ({
            id: `${m.timestamp}-${m.role}-${index}`,
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content,
            isError: false,
            tools: Array.isArray(m.tools) ? m.tools : [],
          }))
        );
      })
      .catch(() => setLoadError("Could not load this conversation. Please try again."))
      .finally(() => setLoadingConversation(false));
  }, []);

  const handleSelect = useCallback(
    (id) => {
      if (id === activeId) {
        setSidebarOpen(false);
        return;
      }
      seqRef.current += 1;
      abortRef.current?.abort();
      setActiveId(id);
      setMessages([]);
      setInput("");
      setIsTyping(false);
      setStickToBottom(true);
      setSidebarOpen(false);
      loadConversation(id);
    },
    [activeId, loadConversation]
  );

  const handleRetry = useCallback(() => {
    if (activeId) {
      loadConversation(activeId);
      return;
    }
    setLoadingList(true);
    setLoadError("");
    listConversations()
      .then(setConversations)
      .catch(() => setLoadError("Could not load your conversations."))
      .finally(() => setLoadingList(false));
  }, [activeId, loadConversation]);

  const handleRename = useCallback(
    (id, title) => {
      renameConversation(id, title)
        .then(() => refreshListEntry(id, { title }))
        .catch(() => {});
    },
    [refreshListEntry]
  );

  const handleDelete = useCallback(
    (id) =>
      deleteConversation(id).then(() => {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (activeId === id) handleNewChat();
      }),
    [activeId, handleNewChat]
  );

  const handleClear = useCallback(() => {
    if (!activeId) {
      handleNewChat();
      return;
    }
    seqRef.current += 1;
    abortRef.current?.abort();
    setMessages([]);
    setInput("");
    setIsTyping(false);
    setStickToBottom(true);
    clearConversation(activeId)
      .then(() => refreshListEntry(activeId, { title: "New Chat", messageCount: 0 }))
      .catch(() => {});
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [activeId, handleNewChat, refreshListEntry]);

  const handleSend = useCallback(
    async (raw) => {
      const text = raw.trim();
      if (!text || isTyping) return;

      const controller = new AbortController();
      abortRef.current = controller;
      seqRef.current += 1;
      const seq = seqRef.current;

      setMessages((prev) => [...prev, createMessage("user", text)]);
      setInput("");
      setStickToBottom(true);
      setIsTyping(true);

      try {
        let conversationId = activeId;
        if (!conversationId) {
          const conv = await createConversation();
          conversationId = conv?.id;
          setActiveId(conversationId);
        }
        const result = await sendConversationMessage(conversationId, text, { signal: controller.signal });
        if (seqRef.current !== seq) return;
        setMessages((prev) => [...prev, createMessage("assistant", result.reply, false, result.tools)]);
        refreshListEntry(conversationId, {
          title: result.title || undefined,
          messageCount: result.messageCount || 0,
        });
      } catch (err) {
        if (seqRef.current !== seq || err instanceof AssistantAbortError) return;
        setMessages((prev) => [
          ...prev,
          createMessage(
            "assistant",
            err?.message || "Sorry, something went wrong while generating a response. Please try again.",
            true
          ),
        ]);
      } finally {
        if (seqRef.current === seq) setIsTyping(false);
      }
    },
    [activeId, isTyping, refreshListEntry]
  );

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const handleConfirmPlan = useCallback(
    (input) => {
      if (!input || isTyping || planCreating) return;
      setPlanCreating(true);
      const payload = JSON.stringify(input);
      const text = `Please create this project now. I confirm the plan with these exact inputs:\n${payload}`;
      handleSend(text).finally(() => setPlanCreating(false));
    },
    [handleSend, isTyping, planCreating]
  );

  const handleModifyPlan = useCallback(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const hasMessages = messages.length > 0;

  const messageList = useMemo(
    () =>
      messages.map((m) => (
        <ChatMessage
          key={m.id}
          message={m}
          onConfirmPlan={handleConfirmPlan}
          onModifyPlan={handleModifyPlan}
          planCreating={planCreating}
        />
      )),
    [messages, handleConfirmPlan, handleModifyPlan, planCreating]
  );

  return (
    <div className="space-y-6">


      <div className="flex h-[calc(100dvh-2rem)] min-h-[24rem] gap-4 sm:h-[calc(100dvh-3rem)] lg:h-[calc(100dvh-4rem)]">
        <aside className="hidden w-64 shrink-0 overflow-hidden rounded-2xl border border-border lg:block">
          <ConversationSidebar
            conversations={conversations}
            activeId={activeId}
            onNewChat={handleNewChat}
            onSelect={handleSelect}
            onRename={handleRename}
            onDelete={handleDelete}
            onCloseMobile={() => {}}
          />
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div
          className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85%] transform flex-col border-r border-border transition-transform duration-200 lg:hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <ConversationSidebar
            conversations={conversations}
            activeId={activeId}
            onNewChat={() => {
              handleNewChat();
              setSidebarOpen(false);
            }}
            onSelect={handleSelect}
            onRename={handleRename}
            onDelete={handleDelete}
            onCloseMobile={() => setSidebarOpen(false)}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card">
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
            {loadingConversation ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" role="status" aria-label="Loading conversation" />
              </div>
            ) : loadError && !hasMessages ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                <p className="text-sm text-text_secondary">{loadError}</p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  Try again
                </button>
              </div>
            ) : !hasMessages ? (
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
    </div>
  );
}