import { GraduationCap, Github, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-24 px-4 pb-8">
      <div className="glass-strong max-w-6xl mx-auto rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-bold">
          <span className="bg-gradient-to-br from-primary-600 to-purple-600 p-2 rounded-xl">
            <GraduationCap size={18} className="text-white" />
          </span>
          GenZe EduVerse
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          © {new Date().getFullYear()} GenZe EduVerse. Your AI Learning Companion.
        </p>
        <div className="flex items-center gap-3">
          <a href="#" className="glass rounded-full p-2.5 hover:scale-105 transition-transform" aria-label="GitHub">
            <Github size={16} />
          </a>
          <a href="/contact" className="glass rounded-full p-2.5 hover:scale-105 transition-transform" aria-label="Email">
            <Mail size={16} />
          </a>
        </div>
      </div>
    </footer>
  );
}
