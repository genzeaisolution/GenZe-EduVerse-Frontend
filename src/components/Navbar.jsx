import { useState } from "react";
import { NavLink } from "react-router-dom";
import { GraduationCap, Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle.jsx";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 ${
      isActive
        ? "text-primary-600 dark:text-primary-400"
        : "text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
    }`;

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <nav className="glass-strong max-w-6xl mx-auto rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="bg-gradient-to-br from-primary-600 to-purple-600 p-2 rounded-xl">
            <GraduationCap size={20} className="text-white" />
          </span>
          <span className="hidden sm:inline">GenZe EduVerse</span>
        </NavLink>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NavLink to="/chat" className="btn-primary !px-4 !py-2 !text-sm hidden sm:inline-flex">
            Start Learning
          </NavLink>
          <button
            className="md:hidden glass rounded-full p-2.5"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="glass-strong max-w-6xl mx-auto mt-2 rounded-2xl p-4 flex flex-col gap-1 md:hidden animate-slide-up">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          <NavLink to="/chat" className="btn-primary mt-2" onClick={() => setOpen(false)}>
            Start Learning
          </NavLink>
        </div>
      )}
    </header>
  );
}
