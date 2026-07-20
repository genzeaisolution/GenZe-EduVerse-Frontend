import { useEffect, useState } from "react";
import { Mail, MessageCircle, Send, Linkedin } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState(null);

  // Contact links (WhatsApp/LinkedIn/email) are admin-configurable via Settings —
  // never hardcoded in the UI. Falls back gracefully if a link isn't set.
  useEffect(() => {
    fetch(`${API_URL}/api/settings`)
      .then((res) => res.json())
      .then(setSettings)
      .catch(() => setSettings(null));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "feedback",
          email: form.email,
          message: `From: ${form.name}\n\n${form.message}`,
        }),
      });
      if (!res.ok) throw new Error("Failed to send message. Please try again.");
      setSent(true);
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const whatsappLink = settings?.whatsapp
    ? `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`
    : null;
  const linkedinLink = settings?.linkedin || null;
  const emailAddress = settings?.email || "support@genzeeduverse.com";

  return (
    <div className="px-4 max-w-3xl mx-auto py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold mb-4">Get in Touch</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Questions, feedback, or suggestions? We'd love to hear from you.
        </p>
      </div>

      <div className="glass-strong rounded-3xl p-8 sm:p-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl px-4 py-3 glass bg-white/70 dark:bg-white/5 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl px-4 py-3 glass bg-white/70 dark:bg-white/5 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Message</label>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full rounded-xl px-4 py-3 glass bg-white/70 dark:bg-white/5 outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
              placeholder="How can we help?"
            />
          </div>
          <button type="submit" disabled={sending} className="btn-primary w-full sm:w-auto disabled:opacity-60">
            <Send size={16} /> {sending ? "Sending..." : "Send Message"}
          </button>
          {sent && (
            <p className="text-sm text-green-600 dark:text-green-400 animate-fade-in">
              Thanks for reaching out! We'll get back to you soon.
            </p>
          )}
          {error && <p className="text-sm text-red-500 animate-fade-in">{error}</p>}
        </form>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <div className="glass rounded-2xl p-6 flex items-center gap-4">
          <div className="bg-gradient-to-br from-primary-600 to-purple-600 w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
            <Mail size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm">Email</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{emailAddress}</p>
          </div>
        </div>

        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="glass rounded-2xl p-6 flex items-center gap-4 hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
          >
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
              <MessageCircle size={18} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm">WhatsApp</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Chat with us directly</p>
            </div>
          </a>
        )}

        {linkedinLink && (
          <a
            href={linkedinLink}
            target="_blank"
            rel="noopener noreferrer"
            className="glass rounded-2xl p-6 flex items-center gap-4 hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
          >
            <div className="bg-gradient-to-br from-blue-600 to-sky-500 w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
              <Linkedin size={18} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm">LinkedIn</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Follow our page</p>
            </div>
          </a>
        )}
      </div>
    </div>
  );
}
