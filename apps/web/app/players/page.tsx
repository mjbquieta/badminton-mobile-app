'use client';

import { useAppSelector } from '@badminton/store';
import { playerLevelConfig } from '@badminton/ui-shared';
import Link from 'next/link';

export default function PlayersPage() {
  const players = useAppSelector((state) => state.players.items);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-accent mb-2">Players</h1>
          <p className="text-light-200">Manage all players in the system</p>
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
            className="px-4 py-2 bg-accent text-primary rounded-lg font-semibold"
          >
            Players
          </Link>
          <Link
            href="/courts"
            className="px-4 py-2 bg-secondary text-light-100 rounded-lg hover:bg-dark-200"
          >
            Courts
          </Link>
        </nav>

        {/* Stats */}
        <div className="mb-6">
          <p className="text-light-200">
            Total: <span className="text-light-100 font-semibold">{players.length}</span> players
          </p>
        </div>

        {/* Players List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player) => {
            const levelConfig = playerLevelConfig[player.level];
            return (
              <div
                key={player.id}
                className="bg-secondary p-6 rounded-2xl border border-dark-100"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold">{player.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${levelConfig.bgClass}`}
                    style={{ color: levelConfig.color }}
                  >
                    {levelConfig.label}
                  </span>
                </div>
                <p className="text-light-200 text-sm">
                  {player.gameCount} {player.gameCount === 1 ? 'game' : 'games'}
                </p>
              </div>
            );
          })}
        </div>

        {players.length === 0 && (
          <div className="text-center py-12">
            <p className="text-light-300">No players yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
