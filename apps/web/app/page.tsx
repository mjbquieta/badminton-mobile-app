'use client';

import { useAppSelector } from '@badminton/store';
import Link from 'next/link';

export default function Dashboard() {
  const players = useAppSelector((state) => state.players.items);
  const courts = useAppSelector((state) => state.courts.items);
  const queue = useAppSelector((state) => state.queue.ids);

  // Calculate stats
  const totalPlayers = players.length;
  const inGame = players.filter((p) =>
    courts.some((c) => c.players.some((cp) => cp.id === p.id))
  ).length;
  const inQueue = queue.length;
  const onBench = totalPlayers - inGame - inQueue;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-accent mb-2">
            🏸 Badminton Court Manager
          </h1>
          <p className="text-light-200">
            Manage players, courts, and matchmaking for your badminton sessions
          </p>
        </header>

        {/* Navigation */}
        <nav className="flex gap-4 mb-8">
          <Link
            href="/"
            className="px-4 py-2 bg-accent text-primary rounded-lg font-semibold"
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
            className="px-4 py-2 bg-secondary text-light-100 rounded-lg hover:bg-dark-200"
          >
            Courts
          </Link>
        </nav>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-secondary p-6 rounded-2xl border border-dark-100">
            <h3 className="text-light-200 text-sm mb-2">Total Players</h3>
            <p className="text-3xl font-bold text-light-100">{totalPlayers}</p>
          </div>
          <div className="bg-secondary p-6 rounded-2xl border border-dark-100">
            <h3 className="text-light-200 text-sm mb-2">In Game</h3>
            <p className="text-3xl font-bold text-danger">{inGame}</p>
          </div>
          <div className="bg-secondary p-6 rounded-2xl border border-dark-100">
            <h3 className="text-light-200 text-sm mb-2">In Queue</h3>
            <p className="text-3xl font-bold text-success">{inQueue}</p>
          </div>
          <div className="bg-secondary p-6 rounded-2xl border border-dark-100">
            <h3 className="text-light-200 text-sm mb-2">On Bench</h3>
            <p className="text-3xl font-bold text-light-300">{onBench}</p>
          </div>
        </div>

        {/* Courts Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Courts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courts.map((court) => (
              <div
                key={court.id}
                className="bg-secondary p-6 rounded-2xl border border-dark-100"
              >
                <h3 className="text-xl font-semibold mb-2">{court.name}</h3>
                <p className="text-light-200 text-sm mb-3">
                  {court.isSingle ? 'Singles' : 'Doubles'} Court
                </p>
                <div className="text-light-300">
                  Players: {court.players.length}/{court.isSingle ? 2 : 4}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Queue Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Queue ({queue.length})</h2>
          <div className="bg-secondary p-6 rounded-2xl border border-dark-100">
            {queue.length > 0 ? (
              <p className="text-light-200">
                {queue.length} player{queue.length !== 1 ? 's' : ''} waiting
              </p>
            ) : (
              <p className="text-light-300">No players in queue</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
