import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, User, Sparkles, RotateCcw } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

// Renders a fenced code block with a copy button.
function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative group my-3 rounded-xl overflow-hidden border border-white/10">
      <div className="flex items-center justify-between bg-gray-800 dark:bg-black/40 px-4 py-2 text-xs text-gray-300">
        <span>{language || "code"}</span>
        <button onClick={handleCopy} className="flex items-center gap-1 hover:text-white transition-colors">
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={theme === "dark" ? oneDark : oneLight}
        customStyle={{ margin: 0, padding: "1rem", fontSize: "0.85rem" }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

export default function ChatMessage({ role, content, image, isLast, onRegenerate, isStreaming }) {
  const [copied, setCopied] = useState(false);
  const isUser = role === "user";

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`flex gap-3 animate-fade-in ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-gray-200 dark:bg-white/10"
            : "bg-gradient-to-br from-primary-600 to-purple-600"
        }`}
      >
        {isUser ? <User size={16} /> : <Sparkles size={16} className="text-white" />}
      </div>

      <div className={`max-w-[85%] sm:max-w-[75%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-tr-sm"
              : "glass rounded-tl-sm"
          }`}
        >
          {image && (
            <img src={image} alt="Uploaded content" className="rounded-xl mb-2 max-h-64 object-contain" />
          )}
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <CodeBlock language={match[1]} value={String(children).replace(/\n$/, "")} />
                    ) : (
                      <code className="bg-gray-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-sm" {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
              {isStreaming && <span className="inline-block w-2 h-4 bg-primary-500 ml-0.5 animate-blink" />}
            </div>
          )}
        </div>

        {!isUser && content && !isStreaming && (
          <div className="flex items-center gap-2 mt-1.5 px-1">
            <button
              onClick={handleCopyMessage}
              className="text-xs flex items-center gap-1 text-gray-500 hover:text-primary-600 dark:text-gray-400 transition-colors"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
            {isLast && (
              <button
                onClick={onRegenerate}
                className="text-xs flex items-center gap-1 text-gray-500 hover:text-primary-600 dark:text-gray-400 transition-colors"
              >
                <RotateCcw size={12} />
                Regenerate
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
