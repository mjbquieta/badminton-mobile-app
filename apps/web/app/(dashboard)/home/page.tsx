"use client";

import { useAppSelector } from "@badminton/store";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";
import { PlayerLevelBadge } from "@/components/PlayerLevelBadge";
import { FiAward } from "react-icons/fi";

export default function Dashboard() {
  const players = useAppSelector((state) => state.players.items);
  const courts = useAppSelector((state) => state.courts.items);

  const leaderboard = [...players]
    .filter((p) => p.trophies > 0)
    .sort((a, b) => b.trophies - a.trophies);

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-light-300 text-sm mt-1">Session overview</p>
        </div>
      </div>

      <EmailVerificationBanner />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-4 mb-6">
        <div className="bg-secondary p-3 sm:p-5 rounded-2xl border border-dark-100">
          <h3 className="text-light-300 text-[10px] sm:text-xs mb-1">
            Players
          </h3>
          <p className="text-xl sm:text-3xl font-bold">{players.length}</p>
        </div>
        <div className="bg-secondary p-3 sm:p-5 rounded-2xl border border-dark-100">
          <h3 className="text-light-300 text-[10px] sm:text-xs mb-1">
            Courts
          </h3>
          <p className="text-xl sm:text-3xl font-bold text-info">
            {courts.length}
          </p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-secondary rounded-2xl border border-dark-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-dark-100 flex items-center gap-2">
          <FiAward className="text-accent" size={18} />
          <h2 className="text-sm font-semibold">Leaderboard</h2>
        </div>
        {leaderboard.length > 0 ? (
          <div>
            {leaderboard.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center gap-3 px-4 py-3 border-b border-dark-100 last:border-b-0"
              >
                <span
                  className={`w-6 text-center text-sm font-bold ${
                    index === 0
                      ? "text-yellow-400"
                      : index === 1
                        ? "text-gray-300"
                        : index === 2
                          ? "text-amber-600"
                          : "text-light-300"
                  }`}
                >
                  {index + 1}
                </span>
                <PlayerLevelBadge level={player.level} />
                <span className="flex-1 text-sm text-light-100 truncate">
                  {player.name}
                </span>
                <span className="inline-flex items-center gap-1 text-accent text-sm font-semibold">
                  <FiAward size={14} />
                  {player.trophies}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="text-light-300 text-sm">No trophies yet</p>
            <p className="text-light-300/60 text-xs mt-0.5">
              Finish matches to see the leaderboard
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
