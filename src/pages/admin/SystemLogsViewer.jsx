import { useEffect, useState, useCallback } from "react";
import { Search, Download, Trash2, RefreshCw } from "lucide-react";
import { adminGet, adminDelete } from "../../utils/adminApi.js";

const CATEGORIES = ["api", "ai", "auth", "uploads", "errors", "performance", "system", "vision", "ocr"];
const SEVERITY_COLORS = {
  info: "bg-blue-500/10 text-blue-600",
  warn: "bg-amber-500/10 text-amber-600",
  error: "bg-red-500/10 text-red-500",
  debug: "bg-gray-500/10 text-gray-500",
};

/**
 * One page, all categories: reads Phase 1's logs/<category>/<date>.log NDJSON files
 * through the backend's logFileService-backed endpoints.
 */
export default function SystemLogsViewer() {
  const [category, setCategory] = useState("ai");
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ logs: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const limit = 25;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit });
      if (search) params.set("search", search);
      if (severity) params.set("severity", severity);
      const result = await adminGet(`/api/admin/system-logs/${category}?${params.toString()}`);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category, search, severity, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [category, severity]);

  const handleExport = () => {
    const token = localStorage.getItem("genze_admin_token");
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    fetch(`${apiUrl}/api/admin/system-logs/${category}/export`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${category}-logs.ndjson`;
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  const handleDeleteToday = async () => {
    const today = new Date().toISOString().slice(0, 10);
    if (!confirm(`Delete today's (${today}) ${category} log file? This cannot be undone.`)) return;
    try {
      await adminDelete(`/api/admin/system-logs/${category}/${today}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const totalPages = Math.max(1, Math.ceil(data.total / limit));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">System Logs</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Live view of the file-based logging system (logs/&lt;category&gt;/&lt;date&gt;.log).
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
              category === c
                ? "bg-primary-600 text-white"
                : "bg-white/50 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-white/80"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="glass-card p-4 rounded-2xl space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (setPage(1), load())}
              placeholder="Search message, event, session ID..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-sm bg-white/60 dark:bg-white/5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm bg-white/60 dark:bg-white/5 border border-white/20"
          >
            <option value="">All severities</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
            <option value="debug">Debug</option>
          </select>
          <button
            onClick={load}
            className="p-2 rounded-xl bg-white/60 dark:bg-white/5 border border-white/20"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={handleExport}
            className="p-2 rounded-xl bg-white/60 dark:bg-white/5 border border-white/20"
            title="Export as NDJSON"
          >
            <Download size={16} />
          </button>
          <button
            onClick={handleDeleteToday}
            className="p-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20"
            title="Delete today's log file"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-white/10">
                <th className="py-2 pr-3">Time</th>
                <th className="py-2 pr-3">Severity</th>
                <th className="py-2 pr-3">Event</th>
                <th className="py-2 pr-3">Session</th>
                <th className="py-2">Message</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : data.logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-400">
                    No log entries found.
                  </td>
                </tr>
              ) : (
                data.logs.map((log, i) => (
                  <tr key={i} className="border-b border-white/5 align-top">
                    <td className="py-2 pr-3 whitespace-nowrap text-xs text-gray-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2 pr-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          SEVERITY_COLORS[log.severity] || SEVERITY_COLORS.info
                        }`}
                      >
                        {log.severity}
                      </span>
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs">{log.event}</td>
                    <td className="py-2 pr-3 text-xs text-gray-400 truncate max-w-[100px]">
                      {log.sessionId || "—"}
                    </td>
                    <td className="py-2 text-xs">{log.message}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 pt-2">
          <span>
            {data.total} entries — page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-lg bg-white/50 dark:bg-white/5 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 rounded-lg bg-white/50 dark:bg-white/5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
