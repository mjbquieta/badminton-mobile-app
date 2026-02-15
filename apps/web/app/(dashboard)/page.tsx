"use client";

import { useAppDispatch, useAppSelector } from "@badminton/store";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const players = useAppSelector((state) => state.players.items);
  const courts = useAppSelector((state) => state.courts.items);
  const queue = useAppSelector((state) => state.queue.ids);

  // Calculate stats
  const totalPlayers = players.length;
  const inGame = players.filter((p) =>
    courts.some((c) => c.players.some((cp) => cp.id === p.id)),
  ).length;
  const inQueue = queue.length;
  const onBench = totalPlayers - inGame - inQueue;
  const availableCourts = courts.filter((c) => c.players.length === 0).length;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-light-300 text-sm mt-1">Session overview</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
        <div className="bg-secondary p-3 sm:p-5 rounded-2xl border border-dark-100">
          <h3 className="text-light-300 text-[10px] sm:text-xs mb-1">
            Players
          </h3>
          <p className="text-xl sm:text-3xl font-bold">{totalPlayers}</p>
        </div>
        <div className="bg-secondary p-3 sm:p-5 rounded-2xl border border-dark-100">
          <h3 className="text-light-300 text-[10px] sm:text-xs mb-1">
            In Game
          </h3>
          <p className="text-xl sm:text-3xl font-bold text-danger">{inGame}</p>
        </div>
        <div className="bg-secondary p-3 sm:p-5 rounded-2xl border border-dark-100">
          <h3 className="text-light-300 text-[10px] sm:text-xs mb-1">
            In Queue
          </h3>
          <p className="text-xl sm:text-3xl font-bold text-success">
            {inQueue}
          </p>
        </div>
        <div className="bg-secondary p-3 sm:p-5 rounded-2xl border border-dark-100">
          <h3 className="text-light-300 text-[10px] sm:text-xs mb-1">
            On Bench
          </h3>
          <p className="text-xl sm:text-3xl font-bold text-light-300">
            {onBench}
          </p>
        </div>
        <div className="bg-secondary p-3 sm:p-5 rounded-2xl border border-dark-100">
          <h3 className="text-light-300 text-[10px] sm:text-xs mb-1">
            Courts Free
          </h3>
          <p className="text-xl sm:text-3xl font-bold text-info">
            {availableCourts}/{courts.length}
          </p>
        </div>
      </div>
    </div>
  );
}
