import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-court-deep/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      {/* Floating decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/shuttlecock.svg"
          alt=""
          className="float-1 absolute top-[12%] left-[8%] w-8 sm:w-12 opacity-[0.15]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/potato.svg"
          alt=""
          className="float-2 absolute top-[18%] right-[10%] w-10 sm:w-14 opacity-[0.15]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/shuttlecock.svg"
          alt=""
          className="float-3 absolute top-[45%] right-[5%] w-7 sm:w-10 opacity-[0.12]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/potato.svg"
          alt=""
          className="float-4 absolute top-[55%] left-[6%] w-9 sm:w-12 opacity-[0.12]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/potato.svg"
          alt=""
          className="float-5 absolute bottom-[20%] right-[15%] w-8 sm:w-10 opacity-[0.10]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/shuttlecock.svg"
          alt=""
          className="float-6 absolute bottom-[15%] left-[12%] w-6 sm:w-9 opacity-[0.10]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/potato.svg"
          alt=""
          className="float-7 absolute top-[8%] left-[35%] w-7 sm:w-10 opacity-[0.12]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/shuttlecock.svg"
          alt=""
          className="float-8 absolute top-[25%] right-[25%] w-8 sm:w-11 opacity-[0.10]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/potato.svg"
          alt=""
          className="float-9 absolute top-[38%] left-[18%] w-6 sm:w-9 opacity-[0.10]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/shuttlecock.svg"
          alt=""
          className="float-10 absolute top-[65%] right-[20%] w-7 sm:w-10 opacity-[0.12]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/potato.svg"
          alt=""
          className="float-11 absolute bottom-[30%] left-[25%] w-8 sm:w-11 opacity-[0.10]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/shuttlecock.svg"
          alt=""
          className="float-12 absolute bottom-[8%] right-[35%] w-6 sm:w-8 opacity-[0.10]"
        />
      </div>

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-5">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/potato-logo.svg" alt="Smash Potato" className="w-8 h-8" />
          <span className="text-xl font-bold text-light-100">Smash Potato</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
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
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center mt-20">
        {/* <div className="inline-flex items-center gap-2 bg-court-deep/20 border border-court-deep/40 rounded-full px-4 py-1.5 mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-court-lime opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-court-lime" />
          </span>
          <span className="text-court-lime text-xs font-medium tracking-wide">
            Badminton Court Manager
          </span>
        </div> */}

        <h1 className="text-5xl sm:text-7xl font-bold max-w-3xl leading-[1.1] tracking-tight">
          Your courts,
          <br />
          <span className="text-accent">your rules.</span>
        </h1>

        <p className="text-light-300 text-base sm:text-lg max-w-md mt-6 leading-relaxed">
          Track players, automate matchmaking, and run your badminton sessions
          without the hassle.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-10">
          <Link
            href="/register"
            className="group relative bg-accent text-primary font-semibold px-8 py-3.5 rounded-xl hover:shadow-glow-accent transition-all text-sm sm:text-base"
          >
            Get Started — It&apos;s Free
          </Link>
          <Link
            href="/login"
            className="border border-dark-100 text-light-200 font-medium px-8 py-3.5 rounded-xl hover:bg-dark-200 hover:border-dark-200 transition-all text-sm sm:text-base"
          >
            Sign In
          </Link>
        </div>

        {/* Android download */}
        <a
          href="https://drive.google.com/drive/folders/1zDuPpaihPyfcMaOKGNdFEhN7zdz1x-Us?usp=sharing"
          target="_blank"
          className="mt-10 inline-flex items-center gap-4 bg-court-deep/20 border border-court-deep/40 hover:bg-court-deep/30 hover:border-court-lime/30 transition-all rounded-2xl px-7 py-4"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-7 h-7 text-court-lime fill-current"
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

        {/* Divider */}
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-dark-100 to-transparent mt-12" />

        {/* Features */}
        <section className="mt-12 max-w-4xl w-full">
          <p className="text-light-300 text-xs font-medium uppercase tracking-widest mb-8">
            Everything you need
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Smart Queue */}
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
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Smart Queue</h3>
              <p className="text-light-300 text-sm leading-relaxed">
                Automatic player rotation with fair matchmaking based on skill
                level.
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

        {/* How it works */}
        <section className="mt-20 max-w-2xl w-full">
          <p className="text-light-300 text-xs font-medium uppercase tracking-widest mb-10">
            How it works
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-0">
            <div className="flex-1 text-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto mb-3">
                <span className="text-accent font-bold text-sm">1</span>
              </div>
              <h4 className="font-semibold text-sm mb-1">Create a Session</h4>
              <p className="text-light-300 text-xs">
                Set up courts and add players
              </p>
            </div>

            <div className="hidden sm:block w-12 h-px bg-dark-100 flex-shrink-0" />

            <div className="flex-1 text-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto mb-3">
                <span className="text-accent font-bold text-sm">2</span>
              </div>
              <h4 className="font-semibold text-sm mb-1">Auto Matchmake</h4>
              <p className="text-light-300 text-xs">
                We pair players by skill level
              </p>
            </div>

            <div className="hidden sm:block w-12 h-px bg-dark-100 flex-shrink-0" />

            <div className="flex-1 text-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto mb-3">
                <span className="text-accent font-bold text-sm">3</span>
              </div>
              <h4 className="font-semibold text-sm mb-1">Play & Rotate</h4>
              <p className="text-light-300 text-xs">
                Track games and keep it fair
              </p>
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
        <span>Smash Potato &copy; {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
