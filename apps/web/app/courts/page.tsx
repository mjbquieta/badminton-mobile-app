'use client';

import { useAppSelector } from '@badminton/store';
import Link from 'next/link';

export default function CourtsPage() {
  const courts = useAppSelector((state) => state.courts.items);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-accent mb-2">Courts</h1>
          <p className="text-light-200">Manage badminton courts and matches</p>
        </header>

        {/* Navigation */}
        <nav className="flex gap-4 mb-8">
          <Link
            href="/"
            className="px-4 py-2 bg-secondary text-light-100 rounded-lg hover:bg-dark-200"
          >
            Dashboard
          </Link>
          <Link
            href="/players"
            className="px-4 py-2 bg-secondary text-light-100 rounded-lg hover:bg-dark-200"
          >
            Players
          </Link>
          <Link
            href="/courts"
            className="px-4 py-2 bg-accent text-primary rounded-lg font-semibold"
          >
            Courts
          </Link>
        </nav>

        {/* Stats */}
        <div className="mb-6">
          <p className="text-light-200">
            Total: <span className="text-light-100 font-semibold">{courts.length}</span> courts
          </p>
        </div>

        {/* Courts List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courts.map((court) => (
            <div
              key={court.id}
              className="bg-secondary p-6 rounded-2xl border border-dark-100"
            >
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">{court.name}</h3>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                    court.isSingle ? 'bg-info/15 text-info' : 'bg-success/15 text-success'
                  }`}
                >
                  {court.isSingle ? 'Singles' : 'Doubles'}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-light-200 text-sm font-semibold">
                  Players ({court.players.length}/{court.isSingle ? 2 : 4}):
                </p>
                {court.players.length > 0 ? (
                  <ul className="space-y-1">
                    {court.players.map((player) => (
                      <li key={player.id} className="text-light-300 text-sm">
                        • {player.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-light-300 text-sm">No players assigned</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {courts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-light-300">No courts configured</p>
          </div>
        )}
      </div>
    </div>
  );
}
