import { Target, Users, Rocket, ShieldCheck } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Our Mission",
    text: "To make quality educational help accessible, instant, and free of distraction for every student.",
  },
  {
    icon: Users,
    title: "For Students, By Design",
    text: "Every feature — from image uploads to markdown answers — is built around real study habits.",
  },
  {
    icon: Rocket,
    title: "Powered by Groq",
    text: "We use Groq's ultra-fast inference so you get answers in seconds, not minutes.",
  },
  {
    icon: ShieldCheck,
    title: "Education Only",
    text: "GenZe EduVerse stays focused strictly on academic topics — no noise, no gimmicks.",
  },
];

export default function About() {
  return (
    <div className="px-4 max-w-5xl mx-auto py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold mb-4">About GenZe EduVerse</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          GenZe EduVerse is an AI-powered education assistant built exclusively for students.
          Unlike general-purpose chatbots, we focus entirely on helping you learn — across every subject,
          every level, and every learning style.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-16">
        {values.map((v) => (
          <div key={v.title} className="glass rounded-2xl p-6">
            <div className="bg-gradient-to-br from-primary-600 to-purple-600 w-11 h-11 rounded-xl flex items-center justify-center mb-4">
              <v.icon size={20} className="text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-2">{v.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{v.text}</p>
          </div>
        ))}
      </div>

      <div className="glass-strong rounded-3xl p-10 text-center">
        <h2 className="text-2xl font-bold mb-3">Version 1.0 — MVP</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          We're just getting started. GenZe EduVerse is actively evolving with new subjects,
          smarter explanations, and deeper learning tools — all while staying laser-focused on education.
        </p>
      </div>
    </div>
  );
}
