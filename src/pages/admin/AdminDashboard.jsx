import { useEffect, useState } from "react";
import {
  Users,
  MessageSquareText,
  Image as ImageIcon,
  Clock,
  AlertTriangle,
  Server,
  Zap,
  Activity,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { adminGet } from "../../utils/adminApi.js";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

function StatCard({ icon: Icon, label, value, accent = "text-primary-600" }) {
  return (
    <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
      <div className={`p-2.5 rounded-xl bg-primary-500/10 ${accent}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{label}</p>
        <p className="text-lg font-bold truncate">{value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState(null);
  const [keyPool, setKeyPool] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [dashboard, reportData, security] = await Promise.all([
          adminGet("/api/admin/dashboard"),
          adminGet("/api/admin/reports?range=weekly"),
          adminGet("/api/admin/security"),
        ]);
        if (cancelled) return;
        setStats(dashboard);
        setReports(reportData);
        setKeyPool(security.apiKeyPool);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 30_000); // light auto-refresh
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 rounded-2xl text-red-500 flex items-center gap-2">
        <AlertTriangle size={18} /> {error}
      </div>
    );
  }

  const subjectChartData = (reports?.topSubjects || []).map((s) => ({ name: s.subject, value: s.count }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Live overview — auto-refreshes every 30s. Server uptime: {stats.serverUptime}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Total Visitors" value={stats.totalVisitors} />
        <StatCard icon={Users} label="Today's Visitors" value={stats.todayVisitors} />
        <StatCard icon={Activity} label="Daily Active Sessions" value={stats.dailyActiveSessions} />
        <StatCard icon={Activity} label="Monthly Active Sessions" value={stats.monthlyActiveSessions} />
        <StatCard icon={MessageSquareText} label="Total AI Requests" value={stats.totalAiRequests} />
        <StatCard icon={MessageSquareText} label="Today's AI Requests" value={stats.todayAiRequests} />
        <StatCard icon={ImageIcon} label="Vision Requests" value={stats.visionRequests} />
        <StatCard icon={ImageIcon} label="OCR Requests" value={stats.ocrRequests} />
        <StatCard icon={Clock} label="Avg Response Time" value={`${stats.avgResponseTimeMs}ms`} />
        <StatCard icon={Zap} label="Total Tokens Used" value={stats.totalTokensUsed.toLocaleString()} />
        <StatCard
          icon={AlertTriangle}
          label="Error Rate"
          value={`${stats.errorRatePercent}%`}
          accent={stats.errorRatePercent > 10 ? "text-red-500" : "text-primary-600"}
        />
        <StatCard
          icon={Server}
          label="API Status"
          value={stats.apiStatus === "configured" ? "Configured" : "Missing Key"}
          accent={stats.apiStatus === "configured" ? "text-green-500" : "text-red-500"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <h2 className="font-semibold mb-3">Most Asked Subjects (7 days)</h2>
          {subjectChartData.length === 0 ? (
            <p className="text-sm text-gray-500">No data yet.</p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={subjectChartData} dataKey="value" nameKey="name" outerRadius={80} label>
                    {subjectChartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <h2 className="font-semibold mb-3">Groq API Key Pool</h2>
          {!keyPool || keyPool.size === 0 ? (
            <p className="text-sm text-gray-500">No key pool status available.</p>
          ) : (
            <div className="space-y-2">
              {keyPool.keys.map((k) => (
                <div
                  key={k.keyIndex}
                  className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-white/50 dark:bg-white/5"
                >
                  <span>Key #{k.keyIndex}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      k.available
                        ? "bg-green-500/10 text-green-600"
                        : "bg-red-500/10 text-red-500"
                    }`}
                  >
                    {k.available
                      ? "Available"
                      : `Cooling: ${k.modelCooldowns
                          .map((c) => `${c.model.split("/").pop()} (${Math.ceil(c.cooldownRemainingMs / 1000)}s)`)
                          .join(", ")}`}
                  </span>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-3">
            {keyPool?.size || 0} key(s) configured. Rotation & failover handled automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
