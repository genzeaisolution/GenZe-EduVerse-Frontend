import { Plus, MessageSquare, Trash2, X, GraduationCap } from "lucide-react";

export default function ChatSidebar({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  open,
  onClose,
}) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed md:static z-50 top-0 left-0 h-full w-72 glass-strong md:glass p-4 flex flex-col gap-3
        transition-transform duration-300 md:translate-x-0 md:rounded-2xl md:h-[calc(100vh-2rem)] md:sticky md:top-4
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <span className="bg-gradient-to-br from-primary-600 to-purple-600 p-1.5 rounded-lg">
              <GraduationCap size={16} className="text-white" />
            </span>
            EduVerse
          </div>
          <button className="md:hidden p-1" onClick={onClose} aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        <button onClick={onNewChat} className="btn-primary w-full !py-2.5">
          <Plus size={16} /> New Chat
        </button>

        <div className="flex-1 overflow-y-auto flex flex-col gap-1 mt-2">
          {chats.length === 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
              No conversations yet. Start learning!
            </p>
          )}
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-colors ${
                activeChatId === chat.id
                  ? "bg-primary-600/10 text-primary-700 dark:text-primary-300"
                  : "hover:bg-white/50 dark:hover:bg-white/5"
              }`}
            >
              <MessageSquare size={14} className="shrink-0" />
              <span className="truncate flex-1">{chat.title || "New conversation"}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                aria-label="Delete chat"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-400 dark:text-gray-500 text-center pt-2 border-t border-white/10">
          GenZe EduVerse v1.0
        </div>
      </aside>
    </>
  );
}
