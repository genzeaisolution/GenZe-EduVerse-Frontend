import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  MessageSquareText,
  AlertTriangle,
  ScrollText,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  GraduationCap,
  X,
  FileStack,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/system-logs", label: "System Logs", icon: FileStack },
  { to: "/admin/visitors", label: "Live Logs", icon: Users },
  { to: "/admin/chats", label: "Chat Logs", icon: MessageSquareText },
  { to: "/admin/errors", label: "Error Logs", icon: AlertTriangle },
  { to: "/admin/audit", label: "Audit Logs", icon: ScrollText },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

export default function AdminSidebar({ open, onClose }) {
  const { admin, logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? "bg-primary-600/10 text-primary-700 dark:text-primary-300"
        : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-white/5"
    }`;

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed lg:static z-50 top-0 left-0 h-full w-72 glass-strong p-4 flex flex-col gap-2
        transition-transform duration-300 lg:translate-x-0 lg:rounded-2xl lg:h-[calc(100vh-2rem)] lg:sticky lg:top-4
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 font-bold">
            <span className="bg-gradient-to-br from-primary-600 to-purple-600 p-1.5 rounded-lg">
              <GraduationCap size={16} className="text-white" />
            </span>
            Admin Panel
          </div>
          <button className="lg:hidden p-1" onClick={onClose} aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass} onClick={onClose}>
              <l.icon size={17} />
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 pt-3 mt-2">
          <p className="text-xs text-gray-400 px-3 mb-2 truncate">Signed in as {admin?.username}</p>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
