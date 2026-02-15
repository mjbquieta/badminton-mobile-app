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

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 max-w-3xl w-full">
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
