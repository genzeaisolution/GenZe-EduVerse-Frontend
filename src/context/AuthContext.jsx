import { createContext, useContext, useEffect, useState, useCallback } from "react";

const AuthContext = createContext();
const TOKEN_KEY = "genze_admin_token";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);

  const logoutLocal = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setAdmin(null);
  }, []);

  // Verify token validity on mount / whenever it changes.
  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (!token) {
        setChecking(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Invalid session");
        const data = await res.json();
        if (!cancelled) setAdmin(data.admin);
      } catch {
        if (!cancelled) logoutLocal();
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [token, logoutLocal]);

  const login = async (username, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Login failed.");
    }
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setAdmin(data.admin);
    return data;
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Ignore network errors on logout — clear local session regardless.
    }
    logoutLocal();
  };

  return (
    <AuthContext.Provider value={{ token, admin, checking, login, logout, isAuthenticated: !!token && !!admin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
