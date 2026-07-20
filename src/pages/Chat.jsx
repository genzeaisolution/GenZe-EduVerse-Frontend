import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Square, ImagePlus, X, Trash2, Menu } from "lucide-react";
import ChatSidebar from "../components/ChatSidebar.jsx";
import ChatMessage from "../components/ChatMessage.jsx";
import TypingIndicator from "../components/TypingIndicator.jsx";
import { streamChat } from "../utils/api.js";

// Generates a lightweight unique id without extra dependencies.
const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const STORAGE_KEY = "genze-chats";

export default function Chat() {
  const [chats, setChats] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activeChatId, setActiveChatId] = useState(chats[0]?.id || null);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null); // base64 data URL
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const activeChat = chats.find((c) => c.id === activeChatId);
  const messages = activeChat?.messages || [];

  // Persist chats to localStorage — debounced so a streaming response (which updates
  // `chats` on every token) doesn't trigger a synchronous JSON.stringify + write on
  // every single token. That was the main cause of UI jank/freezing on large responses.
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
      } catch {
        // Storage quota exceeded or unavailable — non-fatal, chat still works in-memory.
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [chats]);

  // Auto-scroll to bottom, but only if the user is already near the bottom — otherwise
  // a long streaming response would keep yanking the view back down while someone is
  // scrolled up reading earlier messages. Uses instant scroll during streaming (smooth
  // scroll re-triggered on every token was the other source of visible jank).
  useEffect(() => {
    const container = bottomRef.current?.parentElement;
    if (!container) return;
    const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
    if (nearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: isStreaming ? "auto" : "smooth" });
    }
  }, [messages, isStreaming]);

  // Auto-resize the textarea as the user types.
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const updateChatMessages = useCallback((chatId, updater) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, messages: updater(c.messages) } : c))
    );
  }, []);

  const handleNewChat = () => {
    const newChat = { id: genId(), title: "New conversation", messages: [] };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setSidebarOpen(false);
  };

  const handleDeleteChat = (id) => {
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeChatId === id) setActiveChatId(null);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const sendMessage = async (overrideMessages = null) => {
    if (isStreaming) return;
    const trimmed = input.trim();
    if (!trimmed && !image && !overrideMessages) return;

    setError(null);

    let chatId = activeChatId;
    let baseMessages = messages;

    // Create a chat automatically if none is active.
    if (!chatId) {
      const newChat = { id: genId(), title: trimmed.slice(0, 40) || "New conversation", messages: [] };
      setChats((prev) => [newChat, ...prev]);
      chatId = newChat.id;
      setActiveChatId(chatId);
      baseMessages = [];
    }

    let newMessages;
    if (overrideMessages) {
      newMessages = overrideMessages;
    } else {
      const userMsg = { role: "user", content: trimmed, image };
      newMessages = [...baseMessages, userMsg];
    }

    // Add placeholder assistant message for streaming.
    updateChatMessages(chatId, () => [...newMessages, { role: "assistant", content: "" }]);

    // Update chat title from the first user message.
    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId && (c.title === "New conversation" || !c.title)
          ? { ...c, title: (newMessages.find((m) => m.role === "user")?.content || "New chat").slice(0, 40) }
          : c
      )
    );

    setInput("");
    const sentImage = image;
    setImage(null);
    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      let fullText = "";
      let pendingFlush = false;

      const flush = () => {
        pendingFlush = false;
        updateChatMessages(chatId, (msgs) => {
          const updated = [...msgs];
          updated[updated.length - 1] = { role: "assistant", content: fullText };
          return updated;
        });
      };

      await streamChat({
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        image: sentImage,
        signal: controller.signal,
        onChunk: (chunk) => {
          fullText += chunk;
          // Batch rapid token updates into one React state update per animation frame
          // instead of one per token — large responses stream dozens of tokens/sec,
          // and updating (and re-rendering + re-parsing Markdown for) the whole message
          // that often is what caused the UI to glitch/freeze on long answers.
          if (!pendingFlush) {
            pendingFlush = true;
            requestAnimationFrame(flush);
          }
        },
      });
      // Ensure the final chunk is always reflected even if it arrived after the last
      // scheduled animation frame flush.
      flush();
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Something went wrong. Please try again.");
        updateChatMessages(chatId, (msgs) => {
          const updated = [...msgs];
          if (updated[updated.length - 1]?.content === "") {
            updated[updated.length - 1] = {
              role: "assistant",
              content: "⚠️ Sorry, I couldn't generate a response. Please try again.",
            };
          }
          return updated;
        });
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  };

  const handleRegenerate = () => {
    if (isStreaming || messages.length < 2) return;
    // Drop the last assistant message and resend the conversation up to the last user message.
    const withoutLastAssistant = messages.slice(0, -1);
    updateChatMessages(activeChatId, () => withoutLastAssistant);
    sendMessage(withoutLastAssistant);
  };

  const handleClearChat = () => {
    if (activeChatId) updateChatMessages(activeChatId, () => []);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex gap-4 px-4 pb-4 h-[calc(100vh-5.5rem)]">
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={(id) => {
          setActiveChatId(id);
          setSidebarOpen(false);
        }}
        onDeleteChat={handleDeleteChat}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col glass-strong rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
              <Menu size={20} />
            </button>
            <h1 className="font-semibold truncate max-w-[50vw]">{activeChat?.title || "AI Chat"}</h1>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="text-xs flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} /> Clear
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 gap-3">
              <div className="bg-gradient-to-br from-primary-600 to-purple-600 w-14 h-14 rounded-2xl flex items-center justify-center">
                <Send size={22} className="text-white" />
              </div>
              <p className="font-medium">Ask me anything about your studies!</p>
              <p className="text-sm max-w-sm">
                Math, Science, Programming, History, or upload an image of your notes — I'm here to help.
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <ChatMessage
              key={i}
              role={m.role}
              content={m.content}
              image={m.image}
              isLast={i === messages.length - 1 && m.role === "assistant"}
              onRegenerate={handleRegenerate}
              isStreaming={isStreaming && i === messages.length - 1 && m.role === "assistant"}
            />
          ))}

          {isStreaming && messages[messages.length - 1]?.content === "" && <TypingIndicator />}

          {error && (
            <p className="text-sm text-red-500 text-center bg-red-500/10 rounded-xl py-2 px-4">{error}</p>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="p-3 sm:p-4 border-t border-white/10">
          {image && (
            <div className="relative inline-block mb-2 ml-2">
              <img src={image} alt="Preview" className="h-16 w-16 object-cover rounded-xl border border-white/20" />
              <button
                onClick={() => setImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-0.5 text-white"
                aria-label="Remove image"
              >
                <X size={12} />
              </button>
            </div>
          )}
          <div className="flex items-end gap-2 glass rounded-2xl p-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 transition-colors shrink-0"
              aria-label="Upload image"
              title="Upload an image (math problem, notes, diagram...)"
            >
              <ImagePlus size={20} className="text-gray-500" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask any educational question..."
              rows={1}
              className="flex-1 bg-transparent outline-none resize-none py-2.5 max-h-40 text-sm sm:text-base"
            />
            {isStreaming ? (
              <button
                onClick={handleStop}
                className="p-3 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors shrink-0"
                aria-label="Stop generation"
              >
                <Square size={16} fill="white" />
              </button>
            ) : (
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() && !image}
                className="p-3 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            )}
          </div>
          <p className="text-[11px] text-gray-400 text-center mt-2">
            GenZe EduVerse can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
