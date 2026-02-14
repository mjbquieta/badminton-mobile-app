'use client';

import { useMemo } from 'react';
import { useAppSelector, useAppDispatch, rollDice } from '@badminton/store';
import { type Player } from '@badminton/types';
import Link from 'next/link';
import { PlayerTag } from '@/components/PlayerTag';

export default function Dashboard() {
  const dispatch = useAppDispatch();
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
  const availableCourts = courts.filter((c) => c.players.length === 0).length;

  const queueGroups = useMemo(() => {
    const groups: Player[][] = [];
    for (let i = 0; i < queue.length; i += 4) {
      const groupIds = queue.slice(i, i + 4);
      const groupPlayers = groupIds
        .map((id) => players.find((p) => p.id === id))
        .filter((p): p is Player => !!p);
      groups.push(groupPlayers);
    }
    return groups;
  }, [queue, players]);

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-light-300 text-sm mt-1">Session overview</p>
        </div>
        <button
          onClick={() => dispatch(rollDice())}
          disabled={onBench === 0}
          className="px-5 py-2.5 rounded-xl bg-accent text-primary font-semibold hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Roll Dice
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-secondary p-5 rounded-2xl border border-dark-100">
          <h3 className="text-light-300 text-xs mb-1">Total Players</h3>
          <p className="text-3xl font-bold">{totalPlayers}</p>
        </div>
        <div className="bg-secondary p-5 rounded-2xl border border-dark-100">
          <h3 className="text-light-300 text-xs mb-1">In Game</h3>
          <p className="text-3xl font-bold text-danger">{inGame}</p>
        </div>
        <div className="bg-secondary p-5 rounded-2xl border border-dark-100">
          <h3 className="text-light-300 text-xs mb-1">In Queue</h3>
          <p className="text-3xl font-bold text-success">{inQueue}</p>
        </div>
        <div className="bg-secondary p-5 rounded-2xl border border-dark-100">
          <h3 className="text-light-300 text-xs mb-1">On Bench</h3>
          <p className="text-3xl font-bold text-light-300">{onBench}</p>
        </div>
        <div className="bg-secondary p-5 rounded-2xl border border-dark-100">
          <h3 className="text-light-300 text-xs mb-1">Courts Free</h3>
          <p className="text-3xl font-bold text-info">{availableCourts}/{courts.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Courts Overview */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Courts</h2>
            <Link href="/courts" className="text-xs text-accent hover:underline">Manage &rarr;</Link>
          </div>
          <div className="space-y-3">
            {courts.map((court) => {
              const needed = court.isSingle ? 2 : 4;
              const isFull = court.players.length === needed;
              return (
                <div
                  key={court.id}
                  className={`bg-secondary p-4 rounded-2xl border ${
                    isFull ? 'border-success' : court.players.length > 0 ? 'border-accent' : 'border-dark-100'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm">{court.name}</span>
                    <span className="text-xs text-light-300">{court.players.length}/{needed}</span>
                  </div>
                  {court.players.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {court.players.map((p) => (
                        <PlayerTag key={p.id} player={p} />
                      ))}
                    </div>
                  ) : (
                    <span className="text-light-300 text-xs">Empty</span>
                  )}
                </div>
              );
            })}
            {courts.length === 0 && (
              <div className="bg-secondary p-6 rounded-2xl border border-dark-100 text-center">
                <p className="text-light-300 text-sm">No courts configured</p>
                <Link href="/courts" className="text-xs text-accent hover:underline mt-1 inline-block">Add courts &rarr;</Link>
              </div>
            )}
          </div>
        </section>

        {/* Queue Overview */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Queue ({queue.length})</h2>
            <Link href="/activity" className="text-xs text-accent hover:underline">Activity &rarr;</Link>
          </div>
          <div className="space-y-3">
            {queueGroups.map((group, i) => (
              <div key={i} className="bg-secondary p-4 rounded-2xl border border-dark-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-sm">Queue {i + 1}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                    group.length === 4 ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                  }`}>
                    {group.length}/4
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.map((p) => (
                    <PlayerTag key={p.id} player={p} />
                  ))}
                </div>
              </div>
            ))}
            {queueGroups.length === 0 && (
              <div className="bg-secondary p-6 rounded-2xl border border-dark-100 text-center">
                <p className="text-light-300 text-sm">Queue is empty</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
