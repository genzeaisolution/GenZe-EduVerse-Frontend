// Base URL of the backend proxy API. Configure via .env (VITE_API_URL).
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Streams a chat completion from the backend.
 * @param {Array} messages - conversation history [{role, content}]
 * @param {string|null} image - optional base64 data URL of an uploaded image
 * @param {AbortSignal} signal - abort signal to support "Stop generation"
 * @param {(chunk: string) => void} onChunk - callback fired for each streamed token
 */
export async function streamChat({ messages, image = null, signal, onChunk }) {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, image }),
    signal,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || "Something went wrong. Please try again.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    onChunk(chunk);
  }
}
