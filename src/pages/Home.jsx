import { Link } from "react-router-dom";
import {
  Sparkles,
  Code2,
  Calculator,
  FlaskConical,
  BookOpen,
  Image as ImageIcon,
  Zap,
  ArrowRight,
} from "lucide-react";
import FeatureCard from "../components/FeatureCard.jsx";

const features = [
  {
    icon: Calculator,
    title: "Math & Science",
    description: "Step-by-step solutions for Math, Physics, Chemistry & Biology problems.",
  },
  {
    icon: Code2,
    title: "Programming Help",
    description: "Debug code, learn concepts, and get clean examples for any language.",
  },
  {
    icon: ImageIcon,
    title: "Image Understanding",
    description: "Upload handwritten notes, diagrams or screenshots for instant explanations.",
  },
  {
    icon: BookOpen,
    title: "All Subjects",
    description: "Business, Economics, History, English & general knowledge — covered.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Powered by Groq for near-instant AI responses while you study.",
  },
  {
    icon: FlaskConical,
    title: "Deep Explanations",
    description: "Not just answers — real understanding, explained like a great tutor.",
  },
];

export default function Home() {
  return (
    <div className="px-4">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto text-center pt-16 sm:pt-24 pb-12">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-medium mb-6 animate-fade-in">
          <Sparkles size={14} className="text-primary-600" />
          Your AI Learning Companion
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-6 animate-slide-up">
          Ask Anything About{" "}
          <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
            Education
          </span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 animate-slide-up">
          From Math to Machine Learning — GenZe EduVerse gives students fast, accurate,
          AI-powered answers focused purely on learning. No distractions. Just knowledge.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
          <Link to="/chat" className="btn-primary">
            Start Learning <ArrowRight size={18} />
          </Link>
          <Link to="/about" className="btn-secondary">
            Learn More
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-6xl mx-auto py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Built Exclusively for Students</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Every feature is designed with one goal: help you learn better and faster.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-5xl mx-auto py-8">
        <div className="glass-strong rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 relative">Ready to learn smarter?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 relative">
            Join thousands of students using GenZe EduVerse every day.
          </p>
          <Link to="/chat" className="btn-primary relative">
            Start Learning Now <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
