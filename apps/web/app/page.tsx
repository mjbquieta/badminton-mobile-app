"use client";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

function LandingContent() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/home");
    }
  }, [user, loading, router]);

  const [menuOpen, setMenuOpen] = useState(false);

  if (loading || user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-court-deep/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      {/* Nav */}
      <header className="relative z-10 px-6 sm:px-10 py-5">
        {/* Mobile: logo left, hamburger right */}
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
        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="sm:hidden mt-3 flex flex-col gap-1 bg-secondary/90 backdrop-blur border border-dark-100 rounded-2xl p-3">
            <a
              href="#player-rsvp"
              className="relative text-sm font-semibold text-accent px-3 py-2.5 rounded-xl hover:bg-dark-200 transition-colors flex items-center gap-2"
              onClick={() => setMenuOpen(false)}
            >
              Player RSVP
              <span className="bg-danger text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full">
                NEW
              </span>
            </a>
            <Link
              href="/whats-new"
              className="text-sm font-semibold text-accent px-3 py-2.5 rounded-xl hover:bg-dark-200 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              What&apos;s New
            </Link>
            <a
              href="https://michaelquieta.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-white hover:text-accent transition-colors px-3 py-2.5 rounded-xl hover:bg-dark-200"
              onClick={() => setMenuOpen(false)}
            >
              About the Developer
            </a>
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
        {/* Desktop: logo left, nav right */}
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
            <div className="relative">
              <div
                className="animate-rainbow-spin rounded-xl p-[1.5px]"
                style={{
                  background:
                    "conic-gradient(from var(--rainbow-angle, 0deg), #ff0000, #ff8800, #ffdd00, #00ff00, #0088ff, #8800ff, #ff0000)",
                }}
              >
                <a
                  href="#player-rsvp"
                  className="flex items-center gap-1.5 bg-secondary rounded-[10px] px-4 py-1.5 text-sm font-semibold text-light-100 hover:text-accent transition-colors"
                >
                  Player RSVP
                </a>
              </div>
              <span className="absolute -top-2 -right-2 bg-danger text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full -rotate-12 shadow-md pointer-events-none">
                NEW
              </span>
            </div>
            <Link
              href="/whats-new"
              className="text-sm font-semibold text-accent hover:text-accent/80 transition-colors px-4 py-2"
            >
              What&apos;s New
            </Link>
            <a
              href="https://michaelquieta.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-white hover:text-accent transition-colors px-4 py-2"
            >
              About the Developer
            </a>
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

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center px-6 text-center pt-12 sm:pt-20 pb-20">
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold max-w-3xl leading-[1.1] tracking-tight">
          Your courts,
          <br />
          <span className="text-accent">your rules.</span>
        </h1>

        <p className="text-light-300 text-base sm:text-lg max-w-md mt-6 leading-relaxed">
          Track players, automate matchmaking, and run your badminton sessions
          without the hassle.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-10 w-full max-w-xs sm:max-w-none sm:w-auto">
          <Link
            href="/register"
            className="group relative bg-accent text-primary font-semibold px-8 py-3.5 rounded-xl hover:shadow-glow-accent transition-all text-sm sm:text-base text-center"
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

        {/* Android download */}
        <a
          href="https://drive.google.com/drive/folders/1zDuPpaihPyfcMaOKGNdFEhN7zdz1x-Us?usp=sharing"
          target="_blank"
          className="mt-10 inline-flex items-center gap-4 bg-court-deep/20 border border-court-deep/40 hover:bg-court-deep/30 hover:border-court-lime/30 transition-all rounded-2xl px-6 py-4 w-full max-w-xs sm:w-auto"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-7 h-7 text-court-lime fill-current flex-shrink-0"
          >
            <path d="M17.523 2.226l1.392 2.412a.5.5 0 01-.866.5l-1.392-2.412a7.034 7.034 0 00-9.314 0L5.951 5.138a.5.5 0 01-.866-.5L6.477 2.226A8.034 8.034 0 0112 0a8.034 8.034 0 015.523 2.226zM4 8a8 8 0 0116 0v1a1 1 0 01-1 1H5a1 1 0 01-1-1V8zm5.5 0a1 1 0 10-2 0 1 1 0 002 0zm7 0a1 1 0 10-2 0 1 1 0 002 0zM5 12h14v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8z" />
          </svg>
          <div className="text-left">
            <span className="text-light-100 text-sm font-semibold block">
              Download for Android
            </span>
            <span className="text-light-300 text-xs">Get the APK &rarr;</span>
          </div>
        </a>

        {/* Features */}
        <section className="mt-20 max-w-4xl w-full">
          <p className="text-light-300 text-xs font-medium uppercase tracking-widest mb-8">
            Everything you need
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Draft Matches */}
            <div className="group bg-secondary/60 backdrop-blur border border-dark-100 rounded-2xl p-6 text-left hover:border-court-deep/60 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-court-deep/30 flex items-center justify-center mb-4 group-hover:bg-court-deep/50 transition-colors">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-court-lime"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <line x1="8" y1="14" x2="8.01" y2="14" />
                  <line x1="12" y1="14" x2="12.01" y2="14" />
                  <line x1="16" y1="14" x2="16.01" y2="14" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Draft Matches</h3>
              <p className="text-light-300 text-sm leading-relaxed">
                Plan your session ahead of time. Build 2v2 matchups manually or
                let auto-draft fill the schedule up to 30 matches per session.
              </p>
            </div>

            {/* Player Tracking */}
            <div className="group bg-secondary/60 backdrop-blur border border-dark-100 rounded-2xl p-6 text-left hover:border-court-deep/60 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-court-deep/30 flex items-center justify-center mb-4 group-hover:bg-court-deep/50 transition-colors">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-court-lime"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Player Tracking</h3>
              <p className="text-light-300 text-sm leading-relaxed">
                Track game counts, skill levels, and player status in real time.
              </p>
            </div>

            {/* Leaderboard */}
            <div className="group bg-secondary/60 backdrop-blur border border-dark-100 rounded-2xl p-6 text-left hover:border-court-deep/60 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-court-deep/30 flex items-center justify-center mb-4 group-hover:bg-court-deep/50 transition-colors">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-court-lime"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Leaderboard</h3>
              <p className="text-light-300 text-sm leading-relaxed">
                Winners earn trophies after every match. The leaderboard ranks
                all players by trophies so the best players always rise to the
                top.
              </p>
            </div>

            {/* Live Sync */}
            <div className="group bg-secondary/60 backdrop-blur border border-dark-100 rounded-2xl p-6 text-left hover:border-court-deep/60 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-court-deep/30 flex items-center justify-center mb-4 group-hover:bg-court-deep/50 transition-colors">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-court-lime"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Live Sync</h3>
              <p className="text-light-300 text-sm leading-relaxed">
                All data syncs across devices instantly via Firebase.
              </p>
            </div>
          </div>
        </section>

        {/* Shuffle Modes */}
        <section className="mt-20 max-w-4xl w-full">
          <p className="text-light-300 text-xs font-medium uppercase tracking-widest mb-2">
            Auto-draft modes
          </p>
          <p className="text-light-300 text-sm mb-8">
            Choose how matches are generated every session is different.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-secondary/60 backdrop-blur border border-dark-100 rounded-2xl p-5 text-left">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">⚖️</span>
                <h4 className="font-semibold">Balanced</h4>
              </div>
              <p className="text-light-300 text-sm leading-relaxed">
                Prioritizes players with the fewest games played. Everyone gets
                equal court time and no one is left sitting on the bench.
              </p>
            </div>

            <div className="bg-secondary/60 backdrop-blur border border-dark-100 rounded-2xl p-5 text-left">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🎲</span>
                <h4 className="font-semibold">Random</h4>
              </div>
              <p className="text-light-300 text-sm leading-relaxed">
                Fully randomized anyone can end up against anyone. Great for
                casual sessions where you just want to have fun.
              </p>
            </div>

            <div className="bg-secondary/60 backdrop-blur border border-dark-100 rounded-2xl p-5 text-left">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🏅</span>
                <h4 className="font-semibold">Skill Match</h4>
              </div>
              <p className="text-light-300 text-sm leading-relaxed">
                Groups players of the same level Beginner, Intermediate,
                Advanced, or Pro. Keeps matches competitive and fair.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mt-20 max-w-2xl w-full">
          <p className="text-light-300 text-xs font-medium uppercase tracking-widest mb-10">
            How it works
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-0">
            <div className="flex-1 text-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto mb-3">
                <span className="text-accent font-bold text-sm">1</span>
              </div>
              <h4 className="font-semibold text-sm mb-1">
                Add Players & Courts
              </h4>
              <p className="text-light-300 text-xs">
                Set up your courts and register players with their skill level
              </p>
            </div>

            <div className="hidden sm:block w-12 h-px bg-dark-100 flex-shrink-0" />

            <div className="flex-1 text-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto mb-3">
                <span className="text-accent font-bold text-sm">2</span>
              </div>
              <h4 className="font-semibold text-sm mb-1">Draft the Schedule</h4>
              <p className="text-light-300 text-xs">
                Auto-generate or manually pick matchups for the session
              </p>
            </div>

            <div className="hidden sm:block w-12 h-px bg-dark-100 flex-shrink-0" />

            <div className="flex-1 text-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto mb-3">
                <span className="text-accent font-bold text-sm">3</span>
              </div>
              <h4 className="font-semibold text-sm mb-1">
                Play & Record Results
              </h4>
              <p className="text-light-300 text-xs">
                Mark winners, earn trophies, and track stats in real time
              </p>
            </div>
          </div>
        </section>

        {/* Player RSVP Feature */}
        <section
          id="player-rsvp"
          className="mt-24 max-w-5xl w-full scroll-mt-8"
        >
          <div className="inline-block bg-accent/10 border border-accent/30 text-accent text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            New Feature
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">Player RSVP</h2>
          <p className="text-light-300 text-sm sm:text-base max-w-lg mx-auto mb-12 leading-relaxed">
            Share a link with your players so they can confirm or decline
            attendance before you start drafting. No more guessing who&apos;s
            coming.
          </p>

          {/* Step-by-step showcase */}
          <div className="space-y-16">
            {/* Step 1: Enable & Setup */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-left order-2 md:order-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-accent text-xs font-bold">
                    1
                  </span>
                  <h3 className="font-semibold text-lg">Set Up Your Event</h3>
                </div>
                <p className="text-light-300 text-sm leading-relaxed">
                  Toggle Player RSVP on the Players page and fill in your event
                  details location, date, time, courts, and costs. A secure
                  shareable link and PIN are generated instantly.
                </p>
              </div>
              <div className="flex-1 order-1 md:order-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/ss-rsvp-1.png"
                  alt="Event Details form with location, date, time, and cost fields"
                  className="rounded-2xl border border-dark-100 shadow-elevated w-full"
                />
              </div>
            </div>

            {/* Step 2: Share the Link */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/ss-rsvp-5.png"
                  alt="RSVP panel showing shareable link, PIN, attendance tracker, and cost breakdown"
                  className="rounded-2xl border border-dark-100 shadow-elevated w-full"
                />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-accent text-xs font-bold">
                    2
                  </span>
                  <h3 className="font-semibold text-lg">
                    Share with Your Players
                  </h3>
                </div>
                <p className="text-light-300 text-sm leading-relaxed">
                  Copy the link and PIN, then send it to your group chat —
                  Messenger, Viber, WhatsApp, or any messaging app. Track
                  attendance and per-player costs in real time.
                </p>
              </div>
            </div>

            {/* Step 3: Players Confirm */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-left order-2 md:order-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-accent text-xs font-bold">
                    3
                  </span>
                  <h3 className="font-semibold text-lg">
                    Players Confirm Attendance
                  </h3>
                </div>
                <p className="text-light-300 text-sm leading-relaxed">
                  Players enter the PIN to view event details, costs, and the
                  full player list. They tap Confirm or Decline updates appear
                  in real time for everyone.
                </p>
              </div>
              <div className="flex-1 order-1 md:order-2 grid grid-cols-2 gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/ss-rsvp-2.png"
                  alt="PIN entry screen for player confirmation"
                  className="rounded-2xl border border-dark-100 shadow-elevated w-full"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/ss-rsvp-3.png"
                  alt="Event details and cost breakdown on the public RSVP page"
                  className="rounded-2xl border border-dark-100 shadow-elevated w-full"
                />
              </div>
            </div>

            {/* Step 4: Player List */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/ss-rsvp-4.png"
                  alt="Player list with Confirm and Decline buttons"
                  className="rounded-2xl border border-dark-100 shadow-elevated w-full max-w-sm mx-auto"
                />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-accent text-xs font-bold">
                    4
                  </span>
                  <h3 className="font-semibold text-lg">
                    Draft with Confirmed Players
                  </h3>
                </div>
                <p className="text-light-300 text-sm leading-relaxed">
                  Once everyone has responded, lock confirmations and head to
                  Draft. Only confirmed players are included in the matchups —
                  no more no-shows messing up your schedule.
                </p>
              </div>
            </div>
          </div>
        </section>
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

export default function LandingPage() {
  return (
    <AuthProvider>
      <LandingContent />
    </AuthProvider>
  );
}
