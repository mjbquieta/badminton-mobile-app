import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5">
        <span className="text-xl font-bold text-accent">Smash Potato</span>
        <div className="flex items-center gap-3">
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
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center -mt-16">
        <div className="inline-flex items-center gap-2 bg-court-deep/20 border border-court-deep/40 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-court-lime animate-pulse" />
          <span className="text-court-lime text-xs font-medium">Badminton Court Manager</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold max-w-2xl leading-tight">
          Manage your courts{' '}
          <span className="text-accent">effortlessly</span>
        </h1>

        <p className="text-light-300 text-base sm:text-lg max-w-lg mt-5 leading-relaxed">
          Track players, automate matchmaking, and keep your badminton sessions running smoothly.
        </p>

        <div className="flex items-center gap-4 mt-8">
          <Link
            href="/register"
            className="bg-accent text-primary font-semibold px-8 py-3 rounded-xl hover:bg-accent/80 transition-colors text-sm sm:text-base"
          >
            Get Started — It&apos;s Free
          </Link>
          <Link
            href="/login"
            className="border border-dark-100 text-light-200 font-medium px-8 py-3 rounded-xl hover:bg-dark-200 transition-colors text-sm sm:text-base"
          >
            Sign In
          </Link>
        </div>

        {/* Download APK */}
        <div className="mt-12">
          <a
            href="/smash-potato.apk"
            download
            className="inline-flex items-center gap-3 bg-court-deep/20 border border-court-deep/40 hover:bg-court-deep/30 transition-colors rounded-xl px-6 py-3"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-court-lime fill-current">
              <path d="M17.523 2.226l1.392 2.412a.5.5 0 01-.866.5l-1.392-2.412a7.034 7.034 0 00-9.314 0L5.951 5.138a.5.5 0 01-.866-.5L6.477 2.226A8.034 8.034 0 0112 0a8.034 8.034 0 015.523 2.226zM4 8a8 8 0 0116 0v1a1 1 0 01-1 1H5a1 1 0 01-1-1V8zm5.5 0a1 1 0 10-2 0 1 1 0 002 0zm7 0a1 1 0 10-2 0 1 1 0 002 0zM5 12h14v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8z" />
            </svg>
            <div className="text-left">
              <span className="text-light-100 text-sm font-semibold block">Download for Android</span>
              <span className="text-light-300 text-xs">Get the APK</span>
            </div>
          </a>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 max-w-3xl w-full">
          <div className="bg-secondary border border-dark-100 rounded-2xl p-6 text-left">
            <div className="w-10 h-10 rounded-xl bg-court-deep/30 flex items-center justify-center mb-4">
              <span className="text-court-lime text-lg">&#9776;</span>
            </div>
            <h3 className="font-semibold mb-1">Smart Queue</h3>
            <p className="text-light-300 text-sm leading-relaxed">
              Automatic player rotation with fair matchmaking based on skill level.
            </p>
          </div>

          <div className="bg-secondary border border-dark-100 rounded-2xl p-6 text-left">
            <div className="w-10 h-10 rounded-xl bg-court-deep/30 flex items-center justify-center mb-4">
              <span className="text-court-lime text-lg">&#9733;</span>
            </div>
            <h3 className="font-semibold mb-1">Player Tracking</h3>
            <p className="text-light-300 text-sm leading-relaxed">
              Track game counts, skill levels, and player status in real time.
            </p>
          </div>

          <div className="bg-secondary border border-dark-100 rounded-2xl p-6 text-left">
            <div className="w-10 h-10 rounded-xl bg-court-deep/30 flex items-center justify-center mb-4">
              <span className="text-court-lime text-lg">&#9851;</span>
            </div>
            <h3 className="font-semibold mb-1">Live Sync</h3>
            <p className="text-light-300 text-sm leading-relaxed">
              All data syncs across devices instantly via Firebase.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-light-300 text-xs">
        Smash Potato &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
