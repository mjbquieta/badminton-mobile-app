"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import Link from "next/link";
import { useState } from "react";
import { FiArrowLeft, FiMenu, FiX } from "react-icons/fi";

const features = [
  {
    tag: "Beta",
    title: "Tournament Bracket Mode",
    description:
      "Run single elimination, double elimination, or Swiss-format tournaments. Seed players automatically by win rate, resolve matches round by round, and crown a champion — all from one page.",
    highlights: [
      "Single & double elimination brackets",
      "Swiss format with round-robin pairings",
      "Auto-seeding based on player stats",
      "Visual bracket with connected rounds",
      "Top 4 playoff after Swiss rounds",
    ],
    icon: "🏆",
    color: "accent",
  },
  {
    tag: "Beta",
    title: "Session Scheduling",
    description:
      "Plan your badminton sessions ahead of time with a built-in calendar. Create events with date, time, location, and recurring schedules so your group always knows when the next session is.",
    highlights: [
      "Monthly calendar view",
      "Recurring sessions (weekly, biweekly, monthly)",
      "Session details with location & notes",
      "Quick overview of upcoming events",
    ],
    icon: "📅",
    color: "court-lime",
  },
  {
    tag: "Beta",
    title: "Advanced Analytics Dashboard",
    description:
      "Dive deep into your club's data with interactive charts and visualizations. Track participation trends, court usage, player performance, and more — powered by recharts.",
    highlights: [
      "Participation trend over time",
      "Court utilization breakdown",
      "Player win rate charts",
      "Head-to-head comparison matrix",
      "Player availability heatmap",
    ],
    icon: "📊",
    color: "info",
  },
  {
    tag: "New",
    title: "Player Profiles",
    description:
      "Every player now has a dedicated profile page with their complete stats, match history, and head-to-head records against other players.",
    highlights: [
      "Individual player stats & win rate",
      "Full match history",
      "Head-to-head records vs opponents",
      "Win rate over time chart",
      "Recent form indicator",
    ],
    icon: "👤",
    color: "accent",
  },
  {
    tag: "New",
    title: "Import & Export Data",
    description:
      "Back up your entire club data as a JSON file or restore from a previous backup. Never worry about losing your players, courts, drafts, or tournament history.",
    highlights: [
      "Full JSON export of all data",
      "Import with preview & validation",
      "Covers players, courts, drafts & more",
      "One-click download",
    ],
    icon: "💾",
    color: "warning",
  },
  {
    tag: "Improved",
    title: "Player RSVP",
    description:
      "Share a link with your group so players can confirm or decline attendance before drafting. Track who's coming in real time with automatic cost splitting.",
    highlights: [
      "Shareable link with PIN protection",
      "Real-time attendance tracking",
      "Automatic cost per player calculation",
      "Lock confirmations before drafting",
    ],
    icon: "✅",
    color: "success",
  },
];

function WhatsNewContent() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-court-deep/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      {/* Nav */}
      <header className="relative z-10 px-6 sm:px-10 py-5">
        {/* Mobile */}
        <div className="flex sm:hidden items-center justify-between">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/potato-logo.svg"
              alt="Smash Potatoes"
              className="w-8 h-8"
            />
            <span className="text-xl font-bold text-light-100">
              Smash Potatoes
            </span>
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-light-200 hover:text-light-100 transition-colors"
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
        {menuOpen && (
          <div className="sm:hidden mt-3 flex flex-col gap-1 bg-secondary/90 backdrop-blur border border-dark-100 rounded-2xl p-3">
            <Link
              href="/"
              className="text-sm text-light-200 hover:text-light-100 transition-colors px-3 py-2.5 rounded-xl hover:bg-dark-200"
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/feedback"
              className="text-sm text-light-200 hover:text-light-100 transition-colors px-3 py-2.5 rounded-xl hover:bg-dark-200"
              onClick={() => setMenuOpen(false)}
            >
              Feedback
            </Link>
            <Link
              href="/login"
              className="text-sm text-light-200 hover:text-light-100 transition-colors px-3 py-2.5 rounded-xl hover:bg-dark-200"
              onClick={() => setMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-accent text-primary px-4 py-2.5 rounded-xl hover:bg-accent/80 transition-colors text-center mt-1"
              onClick={() => setMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        )}
        {/* Desktop */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/potato-logo.svg"
              alt="Smash Potatoes"
              className="w-8 h-8"
            />
            <span className="text-xl font-bold text-light-100">
              Smash Potatoes
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-light-200 hover:text-light-100 transition-colors px-4 py-2"
            >
              Home
            </Link>
            <Link
              href="/feedback"
              className="text-sm text-light-200 hover:text-light-100 transition-colors px-4 py-2"
            >
              Feedback
            </Link>
            <Link
              href="/login"
              className="text-sm text-light-200 hover:text-light-100 transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-accent text-primary px-5 py-2 rounded-xl hover:bg-accent/80 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 flex flex-col items-center px-6 pt-8 sm:pt-16 pb-20">
        {/* Back link */}
        <div className="w-full max-w-4xl mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-light-300 hover:text-light-100 transition-colors"
          >
            <FiArrowLeft size={14} />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-accent/10 border border-accent/30 text-accent text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            Latest Updates
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            What&apos;s New
          </h1>
          <p className="text-light-300 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            New features and improvements to help you run better badminton
            sessions.
          </p>
        </div>

        {/* Feature cards */}
        <div className="w-full max-w-4xl space-y-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group bg-secondary/60 backdrop-blur border border-dark-100 rounded-2xl p-6 sm:p-8 hover:border-accent/30 transition-colors"
            >
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Icon */}
                <div className="flex items-start gap-4 sm:gap-0">
                  <div className="w-14 h-14 rounded-2xl bg-dark-200 flex items-center justify-center text-2xl shrink-0">
                    {feature.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        feature.tag === "Beta"
                          ? "bg-accent/15 text-accent"
                          : feature.tag === "Improved"
                            ? "bg-success/15 text-success"
                            : "bg-info/15 text-info"
                      }`}
                    >
                      {feature.tag}
                    </span>
                  </div>
                  <p className="text-light-300 text-sm leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  <ul className="space-y-1.5">
                    {feature.highlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-start gap-2 text-sm text-light-200"
                      >
                        <span className="text-accent mt-0.5 shrink-0">
                          &bull;
                        </span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-light-300 text-sm mb-6">
            Ready to try these features?
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-xs sm:max-w-none sm:w-auto">
            <Link
              href="/register"
              className="bg-accent text-primary font-semibold px-8 py-3.5 rounded-xl hover:shadow-glow-accent transition-all text-sm sm:text-base text-center"
            >
              Get Started — It&apos;s Free
            </Link>
            <Link
              href="/login"
              className="border border-dark-100 text-light-200 font-medium px-8 py-3.5 rounded-xl hover:bg-dark-200 hover:border-dark-200 transition-all text-sm sm:text-base text-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-10 text-light-300 text-xs flex flex-col items-center gap-2">
        <Link
          href="/feedback"
          className="text-light-200 hover:text-light-100 transition-colors"
        >
          Feedback &amp; Bug Reports
        </Link>
        <span>Smash Potatoes &copy; {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}

export default function WhatsNewPage() {
  return (
    <AuthProvider>
      <WhatsNewContent />
    </AuthProvider>
  );
}
