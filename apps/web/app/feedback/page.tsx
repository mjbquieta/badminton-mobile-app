"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

function FeedbackForm() {
  const { user, loading } = useAuth();
  const isAuthenticated = !loading && !!user;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("Bug Report");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user?.email) {
      setEmail(user.email);
    }
  }, [loading, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("https://formspree.io/f/mkooqkvn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, type, message }),
      });

      if (!res.ok) throw new Error("Failed to send. Please try again.");
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative z-10 bg-secondary border border-dark-100 rounded-2xl p-8 w-full max-w-md">
      <Link
        href={isAuthenticated ? "/home" : "/"}
        className="inline-flex items-center gap-1 text-light-300 text-sm hover:text-light-100 transition-colors mb-4"
      >
        &larr; {isAuthenticated ? "Back to dashboard" : "Back to home"}
      </Link>

      <h1 className="text-2xl font-bold mb-2">Feedback</h1>
      <p className="text-light-300 text-sm mb-6">
        Report a bug, suggest a feature, or share your thoughts.
      </p>

      {submitted ? (
        <div className="bg-success/10 border border-success/30 rounded-xl p-4 text-center">
          <p className="text-success font-semibold mb-1">
            Thanks for your feedback!
          </p>
          <p className="text-light-300 text-sm">
            We&apos;ll review your message and get back to you if needed.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setName("");
              setEmail(user?.email ?? "");
              setType("Bug Report");
              setMessage("");
            }}
            className="mt-4 text-accent text-sm hover:underline"
          >
            Send another
          </button>
        </div>
      ) : (
        <>
          {error && (
            <div className="bg-danger/10 border border-danger/30 rounded-xl p-3 mb-4">
              <p className="text-danger text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-light-200 mb-1 block">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-dark-200 border border-dark-100 text-light-100 placeholder:text-light-300 focus:outline-none focus:border-accent/50"
                placeholder="Your name (optional)"
              />
            </div>

            <div>
              <label className="text-sm text-light-200 mb-1 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => !isAuthenticated && setEmail(e.target.value)}
                readOnly={isAuthenticated}
                required
                className={`w-full px-4 py-2.5 rounded-xl bg-dark-200 border border-dark-100 text-light-100 placeholder:text-light-300 focus:outline-none focus:border-accent/50 ${isAuthenticated ? "opacity-60 cursor-not-allowed" : ""}`}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="text-sm text-light-200 mb-1 block">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-dark-200 border border-dark-100 text-light-100 focus:outline-none focus:border-accent/50 appearance-none"
              >
                <option value="Bug Report">Bug Report</option>
                <option value="Suggestion">Suggestion</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-light-200 mb-1 block">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl bg-dark-200 border border-dark-100 text-light-100 placeholder:text-light-300 focus:outline-none focus:border-accent/50 resize-none"
                placeholder="Describe the issue or share your idea..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-accent text-primary font-semibold hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Sending..." : "Send Feedback"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
        {/* Ambient glow */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-court-deep/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
        </div>

        <FeedbackForm />
      </div>
    </AuthProvider>
  );
}
