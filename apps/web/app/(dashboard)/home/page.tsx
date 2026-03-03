"use client";

import { useAppSelector } from "@badminton/store";
import { computeAllPlayerStats } from "@badminton/core";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { PlayerLevelBadge } from "@/components/PlayerLevelBadge";
import { WinRateBar } from "@/components/WinRateBar";
import { useMemo, useState } from "react";
import { FiAward, FiBarChart2, FiTrendingUp, FiUsers } from "react-icons/fi";

type StatsTab = "leaderboard" | "stats";

export default function Dashboard() {
  const players = useAppSelector((state) => state.players.items);
  const courts = useAppSelector((state) => state.courts.items);
  const matchRecords = useAppSelector((state) => state.matchHistory.records);

  const activePlayers = useMemo(
    () => players.filter((p) => p.active ?? true),
    [players],
  );

  const allStats = useMemo(
    () => computeAllPlayerStats(matchRecords),
    [matchRecords],
  );

  const [statsTab, setStatsTab] = useState<StatsTab>("leaderboard");

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6">
        <div className="bg-secondary p-3 sm:p-5 rounded-2xl border border-dark-100">
          <h3 className="text-light-300 text-[10px] sm:text-xs mb-1 flex items-center gap-1">
            <FiUsers size={12} /> Players
          </h3>
          <p className="text-xl sm:text-3xl font-bold">{players.length}</p>
        </div>
        <div className="bg-secondary p-3 sm:p-5 rounded-2xl border border-dark-100">
          <h3 className="text-light-300 text-[10px] sm:text-xs mb-1 flex items-center gap-1">
            <FiBarChart2 size={12} /> Courts
          </h3>
          <p className="text-xl sm:text-3xl font-bold text-info">
            {courts.length}
          </p>
        </div>
        <div className="bg-secondary p-3 sm:p-5 rounded-2xl border border-dark-100">
          <h3 className="text-light-300 text-[10px] sm:text-xs mb-1 flex items-center gap-1">
            <FiTrendingUp size={12} /> Matches
          </h3>
          <p className="text-xl sm:text-3xl font-bold text-accent">
            {matchRecords.length}
          </p>
        </div>
        <div className="bg-secondary p-3 sm:p-5 rounded-2xl border border-dark-100">
          <h3 className="text-light-300 text-[10px] sm:text-xs mb-1 flex items-center gap-1">
            <FiUsers size={12} /> Active
          </h3>
          <p className="text-xl sm:text-3xl font-bold text-success">
            {activePlayers.length}
          </p>
        </div>
      </div>

      {/* Leaderboard / Player Stats */}
      <div className="bg-secondary rounded-2xl border border-dark-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-dark-100 flex items-center gap-2">
          <div className="flex gap-1 bg-primary rounded-lg p-0.5">
            <button
              onClick={() => setStatsTab("leaderboard")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                statsTab === "leaderboard"
                  ? "bg-accent/10 text-accent"
                  : "text-light-300 hover:text-light-100"
              }`}
            >
              <FiAward size={13} />
              Leaderboard
            </button>
            <button
              onClick={() => setStatsTab("stats")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                statsTab === "stats"
                  ? "bg-accent/10 text-accent"
                  : "text-light-300 hover:text-light-100"
              }`}
            >
              <FiBarChart2 size={13} />
              Player Stats
            </button>
          </div>
        </div>

        {statsTab === "leaderboard" && (
          <>
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
                    <PlayerAvatar player={player} size="sm" />
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
          </>
        )}

        {statsTab === "stats" && (
          <>
            {matchRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-100 text-light-300 text-xs">
                      <th className="text-left px-4 py-2 font-medium">Player</th>
                      <th className="text-center px-2 py-2 font-medium">Games</th>
                      <th className="text-center px-2 py-2 font-medium">W</th>
                      <th className="text-center px-2 py-2 font-medium">L</th>
                      <th className="text-left px-4 py-2 font-medium min-w-[120px]">
                        Win Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {players
                      .filter((p) => {
                        const s = allStats.get(p.id);
                        return s && s.totalMatches > 0;
                      })
                      .sort((a, b) => {
                        const sa = allStats.get(a.id);
                        const sb = allStats.get(b.id);
                        return (sb?.winRate ?? 0) - (sa?.winRate ?? 0);
                      })
                      .map((player) => {
                        const stats = allStats.get(player.id)!;
                        return (
                          <tr
                            key={player.id}
                            className="border-b border-dark-100 last:border-b-0 hover:bg-dark-200/30"
                          >
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <PlayerAvatar player={player} size="sm" />
                                <PlayerLevelBadge level={player.level} />
                                <span className="text-light-100 truncate">
                                  {player.name}
                                </span>
                              </div>
                            </td>
                            <td className="text-center px-2 py-2.5 text-light-200 tabular-nums">
                              {stats.totalMatches}
                            </td>
                            <td className="text-center px-2 py-2.5 text-success tabular-nums">
                              {stats.wins}
                            </td>
                            <td className="text-center px-2 py-2.5 text-danger tabular-nums">
                              {stats.losses}
                            </td>
                            <td className="px-4 py-2.5">
                              <WinRateBar rate={stats.winRate} size="sm" />
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-light-300 text-sm">No match data yet</p>
                <p className="text-light-300/60 text-xs mt-0.5">
                  Finish matches to see player statistics
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
