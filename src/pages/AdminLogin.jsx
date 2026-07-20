import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Lock, User, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminLogin() {
  const { login, isAuthenticated, checking } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!checking && isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <div className="glass-strong rounded-3xl p-8 sm:p-10 w-full max-w-md animate-fade-in">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-gradient-to-br from-primary-600 to-purple-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
            <ShieldCheck size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">Admin Access</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Restricted area — GenZe EduVerse administrators only.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Username</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl pl-11 pr-4 py-3 glass bg-white/70 dark:bg-white/5 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                placeholder="Admin username"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl pl-11 pr-11 py-3 glass bg-white/70 dark:bg-white/5 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-500/10 rounded-xl py-2 px-4 text-center">{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full !py-3 disabled:opacity-60">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
