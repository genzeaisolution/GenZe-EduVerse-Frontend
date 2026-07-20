const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const TOKEN_KEY = "genze_admin_token";

/**
 * Authenticated fetch wrapper for /api/admin/* endpoints.
 * Automatically attaches the JWT bearer token and throws on non-2xx responses.
 */
export async function adminFetch(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    // Session expired/invalid — force back to login.
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = "/admin/login";
    throw new Error("Session expired. Please log in again.");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

export const adminGet = (path) => adminFetch(path);
export const adminDelete = (path) => adminFetch(path, { method: "DELETE" });
export const adminPut = (path, body) =>
  adminFetch(path, { method: "PUT", body: JSON.stringify(body) });
