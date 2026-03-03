"use client";

import { PublicFooter } from "@/components/PublicFooter";
import { PublicNavbar } from "@/components/PublicNavbar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const SPORTS = [
  {
    name: "Badminton",
    icon: "/icons/shuttlecock.png",
    color: "from-green-400/25 to-emerald-400/25",
    border: "border-green-400/40",
    text: "text-green-300",
    desc: "Singles & doubles matchmaking",
    float: "float-1",
  },
  {
    name: "Pickleball",
    icon: "/icons/pickleball.png",
    color: "from-blue-400/25 to-cyan-400/25",
    border: "border-blue-400/40",
    text: "text-blue-300",
    desc: "Court rotation & scoring",
    float: "float-2",
  },
  {
    name: "Table Tennis",
    icon: "/icons/table-tennis.png",
    color: "from-orange-400/25 to-amber-400/25",
    border: "border-orange-400/40",
    text: "text-orange-300",
    desc: "Round-robin & league play",
    float: "float-3",
  },
  {
    name: "Your Sport",
    icon: "/icons/plus.png",
    color: "from-purple-400/25 to-pink-400/25",
    border: "border-purple-400/40",
    text: "text-purple-300",
    desc: "Fully customizable for any sport",
    float: "float-4",
  },
];

const FEATURES = [
  {
    emoji: "\uD83C\uDFAF",
    title: "Smart Matchmaking",
    desc: "Auto-generate balanced matchups or build them manually. Supports 1v1, 2v2, and custom formats.",
    accent: "from-red-500/20 to-orange-500/20",
    accentBorder: "border-red-500/20",
  },
  {
    emoji: "\uD83D\uDC65",
    title: "Player Management",
    desc: "Track skill levels, game counts, and player status. Import/export rosters across sessions.",
    accent: "from-blue-500/20 to-indigo-500/20",
    accentBorder: "border-blue-500/20",
  },
  {
    emoji: "\uD83C\uDFC6",
    title: "Rankings & Leaderboards",
    desc: "Trophies, win rates, and head-to-head records. Saved snapshots let you track progress over time.",
    accent: "from-yellow-500/20 to-amber-500/20",
    accentBorder: "border-yellow-500/20",
  },
  {
    emoji: "\uD83D\uDFE9",
    title: "Court Management",
    desc: "Assign players to courts, track usage, and rotate matches automatically across multiple courts.",
    accent: "from-green-500/20 to-emerald-500/20",
    accentBorder: "border-green-500/20",
  },
  {
    emoji: "\u2709\uFE0F",
    title: "Player RSVP",
    desc: "Share a link so players can confirm attendance before the session. No more no-show surprises.",
    accent: "from-pink-500/20 to-rose-500/20",
    accentBorder: "border-pink-500/20",
  },
  {
    emoji: "\u26A1",
    title: "Real-Time Sync",
    desc: "All data syncs instantly across devices. Works offline and catches up when you reconnect.",
    accent: "from-cyan-500/20 to-teal-500/20",
    accentBorder: "border-cyan-500/20",
  },
];

function LandingContent() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/home");
    }
  }, [user, loading, router]);

  if (loading || user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-green-500/8 rounded-full blur-[120px]" />
        <div className="absolute top-[30%] right-[-15%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <PublicNavbar isLandingPage />

      {/* Hero section with background image */}
      <section className="relative z-10 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/rallyup-bg.png"
            alt=""
            className="w-full h-full object-cover object-center"
          />
          {/* Dark overlay to dim the background */}
          <div className="absolute inset-0 bg-primary/85" />
          {/* Top fade from navbar */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary to-transparent" />
          {/* Bottom fade into page */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary to-transparent" />
        </div>

        <div className="relative flex flex-col items-center px-6 text-center pt-12 sm:pt-20 pb-24">
          {/* Banner logo with floating icons */}
          <div className="relative w-full max-w-2xl mx-auto mb-2">
            {/* Floating sport icons */}
            <div className="absolute -top-4 -left-4 sm:-left-12 opacity-80 pointer-events-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/shuttlecock.png"
                alt=""
                className="w-12 h-12 sm:w-16 sm:h-16 float-1 drop-shadow-xl"
              />
            </div>
            <div className="absolute -top-2 -right-2 sm:-right-10 opacity-80 pointer-events-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/pickleball.png"
                alt=""
                className="w-10 h-10 sm:w-14 sm:h-14 float-2 drop-shadow-xl"
              />
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:-bottom-2 sm:-right-4 opacity-70 pointer-events-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/table-tennis.png"
                alt=""
                className="w-10 h-10 sm:w-12 sm:h-12 float-3 drop-shadow-xl"
              />
            </div>

            {/* Banner logo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/rallyup-banner.png"
              alt="RallyUp"
              className="w-full max-w-md sm:max-w-lg mx-auto drop-shadow-2xl hover-pop"
            />
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold leading-[1.1] tracking-tight mt-4">
            One app for <span className="text-accent">every court.</span>
          </h2>

          <p className="text-light-300 text-base sm:text-lg max-w-lg mt-5 leading-relaxed">
            Manage players, automate matchmaking, and run sessions for
            badminton, pickleball, table tennis, and more all from one place.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-10 w-full max-w-xs sm:max-w-none sm:w-auto">
            <Link
              href="/register"
              className="group relative bg-accent text-primary font-bold px-8 py-3.5 rounded-2xl hover:shadow-glow-accent hover:scale-105 transition-all text-sm sm:text-base text-center"
            >
              Get Started | It&apos;s Free
            </Link>
            <Link
              href="/login"
              className="border-2 border-dark-100 text-light-200 font-semibold px-8 py-3.5 rounded-2xl hover:bg-dark-200 hover:border-dark-200 hover:scale-105 transition-all text-sm sm:text-base text-center"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile app coming soon */}
          <div className="mt-10 inline-flex items-center gap-4 bg-secondary/60 backdrop-blur border-2 border-dark-100 rounded-2xl px-6 py-4 w-full max-w-xs sm:w-auto cursor-default hover:scale-[1.02] transition-all">
            <svg
              viewBox="0 0 24 24"
              className="w-7 h-7 text-light-300 fill-current flex-shrink-0"
            >
              <path d="M17.523 2.226l1.392 2.412a.5.5 0 01-.866.5l-1.392-2.412a7.034 7.034 0 00-9.314 0L5.951 5.138a.5.5 0 01-.866-.5L6.477 2.226A8.034 8.034 0 0112 0a8.034 8.034 0 015.523 2.226zM4 8a8 8 0 0116 0v1a1 1 0 01-1 1H5a1 1 0 01-1-1V8zm5.5 0a1 1 0 10-2 0 1 1 0 002 0zm7 0a1 1 0 10-2 0 1 1 0 002 0zM5 12h14v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8z" />
            </svg>
            <div className="text-left">
              <span className="text-light-200 text-sm font-semibold block">
                Mobile App
              </span>
              <span className="text-light-300 text-xs">Coming Soon</span>
            </div>
          </div>
        </div>
      </section>

      <main className="relative z-10 flex flex-col items-center px-6 text-center pb-20">
        {/* Sport Selection */}
        <section id="sports" className="mt-24 max-w-4xl w-full scroll-mt-8">
          <p className="text-light-300 text-xs font-medium uppercase tracking-widest mb-2">
            Built for your sport
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
            Pick your game. We handle the rest!
          </h2>
          <p className="text-light-300 text-sm max-w-md mx-auto mb-10">
            The same powerful tools work across every racket and paddle sport.
            Switch sports or manage multiple it&apos;s all seamless.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
            {SPORTS.map((sport) => (
              <div
                key={sport.name}
                className={`group relative bg-gradient-to-br ${sport.color} backdrop-blur border-2 ${sport.border} rounded-3xl p-5 sm:p-6 text-center hover:scale-[1.06] hover:-rotate-1 transition-all cursor-default`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sport.icon}
                  alt={sport.name}
                  className={`w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 drop-shadow-xl ${sport.float} group-hover:scale-110 transition-transform`}
                />
                <h3 className={`font-bold text-sm sm:text-base ${sport.text}`}>
                  {sport.name}
                </h3>
                <p className="text-light-300 text-[11px] sm:text-xs mt-1 leading-relaxed">
                  {sport.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Universal Features */}
        <section id="features" className="mt-24 max-w-4xl w-full scroll-mt-8">
          <p className="text-light-300 text-xs font-medium uppercase tracking-widest mb-2">
            Everything you need
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
            Packed with goodies!
          </h2>
          <p className="text-light-300 text-sm max-w-md mx-auto mb-10">
            From casual pickup games to organized club play &mdash; manage it
            all.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className={`group bg-gradient-to-br ${feature.accent} backdrop-blur border ${feature.accentBorder} rounded-3xl p-6 text-left hover:scale-[1.03] transition-all cursor-default`}
              >
                <span className="text-3xl block mb-3 group-hover:animate-bounce">
                  {feature.emoji}
                </span>
                <h3 className="font-bold mb-1">{feature.title}</h3>
                <p className="text-light-300 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* App Screenshots */}
        <section className="mt-24 max-w-5xl w-full">
          <p className="text-light-300 text-xs font-medium uppercase tracking-widest mb-2">
            See it in action
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
            Sneak peek inside!
          </h2>
          <p className="text-light-300 text-sm max-w-md mx-auto mb-10">
            From drafting matches to tracking stats &mdash; here&apos;s what
            your sessions look like.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="group relative rounded-3xl border-2 border-dark-100 overflow-hidden hover:border-accent/40 hover:scale-[1.02] hover:-rotate-[0.5deg] transition-all">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/ss/draft.png"
                alt="Draft page showing match schedule with court assignments"
                className="w-full"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10">
                <h3 className="font-bold text-sm text-white">Draft Matches</h3>
                <p className="text-white/60 text-xs">
                  Auto-generate or manually build your match schedule
                </p>
              </div>
            </div>

            <div className="group relative rounded-3xl border-2 border-dark-100 overflow-hidden hover:border-accent/40 hover:scale-[1.02] hover:rotate-[0.5deg] transition-all">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/ss/leadboard.png"
                alt="Dashboard showing leaderboard with player rankings"
                className="w-full"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10">
                <h3 className="font-bold text-sm text-white">Leaderboard</h3>
                <p className="text-white/60 text-xs">
                  Track trophies and see who&apos;s on top
                </p>
              </div>
            </div>

            <div className="group relative rounded-3xl border-2 border-dark-100 overflow-hidden hover:border-accent/40 hover:scale-[1.02] hover:rotate-[0.5deg] transition-all">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/ss/player stats.png"
                alt="Player stats showing win rates and game counts"
                className="w-full"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10">
                <h3 className="font-bold text-sm text-white">Player Stats</h3>
                <p className="text-white/60 text-xs">
                  Win rates, game counts, and detailed analytics
                </p>
              </div>
            </div>

            <div className="group relative rounded-3xl border-2 border-dark-100 overflow-hidden hover:border-accent/40 hover:scale-[1.02] hover:-rotate-[0.5deg] transition-all">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/ss/rsvp.png"
                alt="Player RSVP panel with attendance tracking"
                className="w-full"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10">
                <h3 className="font-bold text-sm text-white">Player RSVP</h3>
                <p className="text-white/60 text-xs">
                  Share a link and track attendance in real time
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Clubs Love It */}
        <section className="mt-24 max-w-3xl w-full">
          <p className="text-light-300 text-xs font-medium uppercase tracking-widest mb-2">
            Why clubs love it
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-10">
            Built for organizers, loved by players!
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {[
              {
                emoji: "\uD83D\uDCA5",
                label: "No more spreadsheets",
                desc: "Everything lives in one app",
              },
              {
                emoji: "\u2696\uFE0F",
                label: "Fair play guaranteed",
                desc: "Balanced matchmaking ensures equal court time",
              },
              {
                emoji: "\uD83D\uDCF6",
                label: "Works offline",
                desc: "Sync catches up when you're back online",
              },
              {
                emoji: "\uD83C\uDD93",
                label: "Free to use",
                desc: "No subscriptions, no paywalls",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-3 bg-secondary/40 border-2 border-dark-100 rounded-2xl p-4 hover:scale-[1.02] transition-all cursor-default"
              >
                <span className="text-xl flex-shrink-0">{item.emoji}</span>
                <div>
                  <p className="font-bold text-sm">{item.label}</p>
                  <p className="text-light-300 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Auto-draft modes */}
        <section className="mt-24 max-w-4xl w-full">
          <p className="text-light-300 text-xs font-medium uppercase tracking-widest mb-2">
            Auto-draft modes
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
            Three ways to draft!
          </h2>
          <p className="text-light-300 text-sm mb-10">
            Choose how matches are generated &mdash; every session is different.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500/15 to-indigo-500/15 backdrop-blur border-2 border-blue-500/20 rounded-3xl p-6 text-left hover:scale-[1.03] transition-all cursor-default">
              <span className="text-4xl block mb-3">{"\u2696\uFE0F"}</span>
              <h4 className="font-bold text-base mb-2">Balanced</h4>
              <p className="text-light-300 text-sm leading-relaxed">
                Prioritizes players with the fewest games. Everyone gets equal
                court time and no one sits on the bench.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/15 to-pink-500/15 backdrop-blur border-2 border-purple-500/20 rounded-3xl p-6 text-left hover:scale-[1.03] transition-all cursor-default">
              <span className="text-4xl block mb-3">{"\uD83C\uDFB2"}</span>
              <h4 className="font-bold text-base mb-2">Random</h4>
              <p className="text-light-300 text-sm leading-relaxed">
                Fully randomized &mdash; anyone can end up against anyone. Great
                for casual sessions where you just want to have fun.
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-500/15 to-orange-500/15 backdrop-blur border-2 border-amber-500/20 rounded-3xl p-6 text-left hover:scale-[1.03] transition-all cursor-default">
              <span className="text-4xl block mb-3">{"\uD83C\uDFC5"}</span>
              <h4 className="font-bold text-base mb-2">Skill Match</h4>
              <p className="text-light-300 text-sm leading-relaxed">
                Groups players by level &mdash; Beginner, Intermediate,
                Advanced, or Pro. Keeps matches competitive and fair.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mt-24 max-w-2xl w-full">
          <p className="text-light-300 text-xs font-medium uppercase tracking-widest mb-10">
            How it works
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-0">
            <div className="flex-1 text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent/15 border-2 border-accent/30 flex items-center justify-center mx-auto mb-3 hover-wiggle">
                <span className="text-accent font-extrabold text-lg">1</span>
              </div>
              <h4 className="font-bold text-sm mb-1">Add Players & Courts</h4>
              <p className="text-light-300 text-xs">
                Set up your courts and register players with their skill level
              </p>
            </div>

            <div className="hidden sm:block text-light-300 text-2xl flex-shrink-0 px-2">
              {"\u{279C}"}
            </div>

            <div className="flex-1 text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent/15 border-2 border-accent/30 flex items-center justify-center mx-auto mb-3 hover-wiggle">
                <span className="text-accent font-extrabold text-lg">2</span>
              </div>
              <h4 className="font-bold text-sm mb-1">Draft the Schedule</h4>
              <p className="text-light-300 text-xs">
                Auto-generate or manually pick matchups for the session
              </p>
            </div>

            <div className="hidden sm:block text-light-300 text-2xl flex-shrink-0 px-2">
              {"\u{279C}"}
            </div>

            <div className="flex-1 text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent/15 border-2 border-accent/30 flex items-center justify-center mx-auto mb-3 hover-wiggle">
                <span className="text-accent font-extrabold text-lg">3</span>
              </div>
              <h4 className="font-bold text-sm mb-1">Play & Record Results</h4>
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
          <div className="inline-block bg-accent/15 border-2 border-accent/30 text-accent text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            New Feature
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">
            Player RSVP
          </h2>
          <p className="text-light-300 text-sm sm:text-base max-w-lg mx-auto mb-12 leading-relaxed">
            Share a link with your players so they can confirm or decline
            attendance before you start drafting. No more guessing who&apos;s
            coming.
          </p>

          <div className="space-y-16">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-left order-2 md:order-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-8 h-8 rounded-xl bg-accent/15 border-2 border-accent/30 flex items-center justify-center text-accent text-xs font-extrabold">
                    1
                  </span>
                  <h3 className="font-semibold text-lg">Set Up Your Event</h3>
                </div>
                <p className="text-light-300 text-sm leading-relaxed">
                  Toggle Player RSVP on the Players page and fill in your event
                  details &mdash; location, date, time, courts, and costs. A
                  secure shareable link and PIN are generated instantly.
                </p>
              </div>
              <div className="flex-1 order-1 md:order-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/ss-rsvp-1.png"
                  alt="Event Details form with location, date, time, and cost fields"
                  className="rounded-3xl border-2 border-dark-100 shadow-elevated w-full"
                />
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/ss-rsvp-5.png"
                  alt="RSVP panel showing shareable link, PIN, attendance tracker, and cost breakdown"
                  className="rounded-3xl border-2 border-dark-100 shadow-elevated w-full"
                />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-8 h-8 rounded-xl bg-accent/15 border-2 border-accent/30 flex items-center justify-center text-accent text-xs font-extrabold">
                    2
                  </span>
                  <h3 className="font-semibold text-lg">
                    Share with Your Players
                  </h3>
                </div>
                <p className="text-light-300 text-sm leading-relaxed">
                  Copy the link and PIN, then send it to your group chat &mdash;
                  Messenger, Viber, WhatsApp, or any messaging app. Track
                  attendance and per-player costs in real time.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-left order-2 md:order-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-8 h-8 rounded-xl bg-accent/15 border-2 border-accent/30 flex items-center justify-center text-accent text-xs font-extrabold">
                    3
                  </span>
                  <h3 className="font-semibold text-lg">
                    Players Confirm Attendance
                  </h3>
                </div>
                <p className="text-light-300 text-sm leading-relaxed">
                  Players enter the PIN to view event details, costs, and the
                  full player list. They tap Confirm or Decline &mdash; updates
                  appear in real time for everyone.
                </p>
              </div>
              <div className="flex-1 order-1 md:order-2 grid grid-cols-2 gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/ss-rsvp-2.png"
                  alt="PIN entry screen for player confirmation"
                  className="rounded-3xl border-2 border-dark-100 shadow-elevated w-full"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/ss-rsvp-3.png"
                  alt="Event details and cost breakdown on the public RSVP page"
                  className="rounded-3xl border-2 border-dark-100 shadow-elevated w-full"
                />
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/ss-rsvp-4.png"
                  alt="Player list with Confirm and Decline buttons"
                  className="rounded-3xl border-2 border-dark-100 shadow-elevated w-full max-w-sm mx-auto"
                />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-8 h-8 rounded-xl bg-accent/15 border-2 border-accent/30 flex items-center justify-center text-accent text-xs font-extrabold">
                    4
                  </span>
                  <h3 className="font-semibold text-lg">
                    Draft with Confirmed Players
                  </h3>
                </div>
                <p className="text-light-300 text-sm leading-relaxed">
                  Once everyone has responded, lock confirmations and head to
                  Draft. Only confirmed players are included in the matchups
                  &mdash; no more no-shows messing up your schedule.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-24 max-w-2xl w-full">
          <div className="bg-gradient-to-br from-accent/15 to-green-500/10 border-2 border-accent/25 rounded-[2rem] p-8 sm:p-12 relative overflow-hidden">
            {/* Decorative floating icons */}
            <div className="absolute top-4 right-6 opacity-20 pointer-events-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/shuttlecock.png"
                alt=""
                className="w-12 h-12 float-5"
              />
            </div>
            <div className="absolute bottom-4 left-6 opacity-20 pointer-events-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/table-tennis.png"
                alt=""
                className="w-10 h-10 float-6"
              />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
              Ready to smash it?
            </h2>
            <p className="text-light-300 text-sm sm:text-base mb-8">
              Join organizers and clubs already using RallyUp for badminton,
              pickleball, table tennis, and more.
            </p>
            <Link
              href="/register"
              className="inline-block bg-accent text-primary font-bold px-8 py-3.5 rounded-2xl hover:shadow-glow-accent hover:scale-105 transition-all text-sm sm:text-base"
            >
              Get Started &mdash; It&apos;s Free
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
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
