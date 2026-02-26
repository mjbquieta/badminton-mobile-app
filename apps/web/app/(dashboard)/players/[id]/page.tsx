"use client";

import { useAppSelector } from "@badminton/store";
import {
  computePlayerStats,
  computeHeadToHead,
  getRecentForm,
  computeWinRateOverTime,
} from "@badminton/core";
import type { MatchRecord } from "@badminton/types";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { PlayerLevelBadge } from "@/components/PlayerLevelBadge";
import { WinRateBar } from "@/components/WinRateBar";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  FiArrowLeft,
  FiAward,
  FiTrendingUp,
  FiActivity,
  FiUsers,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function PlayerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const playerId = params.id as string;

  const players = useAppSelector((s) => s.players.items);
  const drafts = useAppSelector((s) => s.drafts.items);

  const player = useMemo(() => players.find((p) => p.id === playerId), [players, playerId]);

  const playerMap = useMemo(() => {
    const map = new Map<string, (typeof players)[0]>();
    for (const p of players) map.set(p.id, p);
    return map;
  }, [players]);

  const matchRecords: MatchRecord[] = useMemo(
    () =>
      drafts
        .filter((d) => d.finished && d.winner)
        .map((d) => {
          const half = Math.ceil(d.playerIds.length / 2);
          return {
            id: d.id,
            sessionId: "",
            draftId: d.id,
            playerIds: d.playerIds,
            teamA: d.playerIds.slice(0, half),
            teamB: d.playerIds.slice(half),
            winner: d.winner as "A" | "B",
            scoreA: d.scoreA,
            scoreB: d.scoreB,
            isSingle: d.playerIds.length === 2,
            finishedAt: Date.now(),
          };
        }),
    [drafts],
  );

  const stats = useMemo(
    () => (playerId ? computePlayerStats(playerId, matchRecords) : null),
    [playerId, matchRecords],
  );

  const winRateOverTime = useMemo(
    () => (playerId ? computeWinRateOverTime(playerId, matchRecords) : []),
    [playerId, matchRecords],
  );

  const recentForm = useMemo(
    () => (playerId ? getRecentForm(playerId, matchRecords, 10) : { wins: 0, losses: 0 }),
    [playerId, matchRecords],
  );

  const playerMatches = useMemo(
    () =>
      matchRecords
        .filter((m) => m.playerIds.includes(playerId))
        .sort((a, b) => b.finishedAt - a.finishedAt),
    [matchRecords, playerId],
  );

  const headToHead = useMemo(() => {
    const opponents = new Set<string>();
    for (const m of playerMatches) {
      for (const pid of m.playerIds) {
        if (pid !== playerId) opponents.add(pid);
      }
    }
    return Array.from(opponents)
      .map((oppId) => ({
        opponent: playerMap.get(oppId),
        record: computeHeadToHead(playerId, oppId, matchRecords),
      }))
      .filter((h) => h.record.matchesPlayed > 0)
      .sort((a, b) => b.record.matchesPlayed - a.record.matchesPlayed);
  }, [playerMatches, playerId, matchRecords, playerMap]);

  if (!player) {
    return (
      <div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-6xl">
        <button
          onClick={() => router.push("/players")}
          className="flex items-center gap-1 text-light-300 hover:text-light-100 text-sm mb-4"
        >
          <FiArrowLeft size={14} /> Back to Players
        </button>
        <p className="text-light-300">Player not found</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-6xl">
      {/* Back */}
      <button
        onClick={() => router.push("/players")}
        className="flex items-center gap-1 text-light-300 hover:text-light-100 text-sm mb-4 transition-colors"
      >
        <FiArrowLeft size={14} /> Back to Players
      </button>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <PlayerAvatar player={player} size="lg" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{player.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <PlayerLevelBadge level={player.level} />
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                player.active ?? true
                  ? "bg-success/10 text-success"
                  : "bg-light-300/10 text-light-300"
              }`}
            >
              {player.active ?? true ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 mb-6">
          <div className="bg-secondary p-3 rounded-2xl border border-dark-100 text-center">
            <p className="text-light-300 text-[10px] mb-0.5">Matches</p>
            <p className="text-xl font-bold">{stats.totalMatches}</p>
          </div>
          <div className="bg-secondary p-3 rounded-2xl border border-dark-100 text-center">
            <p className="text-light-300 text-[10px] mb-0.5">Wins</p>
            <p className="text-xl font-bold text-success">{stats.wins}</p>
          </div>
          <div className="bg-secondary p-3 rounded-2xl border border-dark-100 text-center">
            <p className="text-light-300 text-[10px] mb-0.5">Losses</p>
            <p className="text-xl font-bold text-danger">{stats.losses}</p>
          </div>
          <div className="bg-secondary p-3 rounded-2xl border border-dark-100 text-center">
            <p className="text-light-300 text-[10px] mb-0.5">Win Rate</p>
            <p className="text-xl font-bold text-accent">
              {Math.round(stats.winRate * 100)}%
            </p>
          </div>
          <div className="bg-secondary p-3 rounded-2xl border border-dark-100 text-center">
            <p className="text-light-300 text-[10px] mb-0.5">Streak</p>
            <p className={`text-xl font-bold ${stats.currentStreak > 0 ? "text-success" : stats.currentStreak < 0 ? "text-danger" : "text-light-300"}`}>
              {stats.currentStreak > 0 ? `W${stats.currentStreak}` : stats.currentStreak < 0 ? `L${Math.abs(stats.currentStreak)}` : "-"}
            </p>
          </div>
          <div className="bg-secondary p-3 rounded-2xl border border-dark-100 text-center">
            <p className="text-light-300 text-[10px] mb-0.5">Best Streak</p>
            <p className="text-xl font-bold text-info">
              {stats.bestStreak > 0 ? `W${stats.bestStreak}` : "-"}
            </p>
          </div>
        </div>
      )}

      {/* Recent Form */}
      <div className="bg-secondary rounded-2xl border border-dark-100 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <FiActivity className="text-info" size={18} />
          <h2 className="text-sm font-semibold">Recent Form (Last 10)</h2>
        </div>
        {recentForm.wins + recentForm.losses > 0 ? (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {playerMatches.slice(0, 10).map((m) => {
                const won =
                  (m.winner === "A" ? m.teamA : m.teamB).includes(playerId);
                return (
                  <span
                    key={m.id}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      won ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                    }`}
                  >
                    {won ? "W" : "L"}
                  </span>
                );
              })}
            </div>
            <span className="text-light-300 text-xs ml-2">
              {recentForm.wins}W - {recentForm.losses}L
            </span>
          </div>
        ) : (
          <p className="text-light-300 text-sm">No recent matches</p>
        )}
      </div>

      {/* Win Rate Over Time */}
      {winRateOverTime.length > 0 && (
        <div className="bg-secondary rounded-2xl border border-dark-100 overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-dark-100 flex items-center gap-2">
            <FiTrendingUp className="text-accent" size={18} />
            <h2 className="text-sm font-semibold">Win Rate Over Time</h2>
          </div>
          <div className="p-4" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={winRateOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
                  tickFormatter={(v: string) => v.slice(5)}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(30,30,30,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value) => [`${value}%`, "Win Rate"]}
                />
                <Line type="monotone" dataKey="winRate" stroke="#84CC16" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Head-to-Head */}
      <div className="bg-secondary rounded-2xl border border-dark-100 overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-dark-100 flex items-center gap-2">
          <FiUsers className="text-info" size={18} />
          <h2 className="text-sm font-semibold">Head-to-Head</h2>
        </div>
        {headToHead.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-100 text-light-300 text-xs">
                  <th className="text-left px-4 py-2 font-medium">Opponent</th>
                  <th className="text-center px-2 py-2 font-medium">W</th>
                  <th className="text-center px-2 py-2 font-medium">L</th>
                  <th className="text-left px-4 py-2 font-medium min-w-[100px]">Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {headToHead.map((h) => {
                  const wins = h.record.winsA;
                  const losses = h.record.winsB;
                  const rate = h.record.matchesPlayed > 0 ? wins / h.record.matchesPlayed : 0;
                  return (
                    <tr
                      key={h.record.playerIdB}
                      className="border-b border-dark-100 last:border-b-0 hover:bg-dark-200/30"
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          {h.opponent && <PlayerAvatar player={h.opponent} size="sm" />}
                          {h.opponent && <PlayerLevelBadge level={h.opponent.level} />}
                          <span className="text-light-100 truncate">
                            {h.opponent?.name ?? "Unknown"}
                          </span>
                        </div>
                      </td>
                      <td className="text-center px-2 py-2.5 text-success tabular-nums">{wins}</td>
                      <td className="text-center px-2 py-2.5 text-danger tabular-nums">{losses}</td>
                      <td className="px-4 py-2.5">
                        <WinRateBar rate={rate} size="sm" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="text-light-300 text-sm">No head-to-head data yet</p>
          </div>
        )}
      </div>

      {/* Match History */}
      <div className="bg-secondary rounded-2xl border border-dark-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-dark-100 flex items-center gap-2">
          <FiAward className="text-accent" size={18} />
          <h2 className="text-sm font-semibold">Match History ({playerMatches.length})</h2>
        </div>
        {playerMatches.length > 0 ? (
          <div>
            {playerMatches.slice(0, 20).map((m) => {
              const won = (m.winner === "A" ? m.teamA : m.teamB).includes(playerId);
              const teamAPlayers = m.teamA.map((id) => playerMap.get(id)?.name ?? "?");
              const teamBPlayers = m.teamB.map((id) => playerMap.get(id)?.name ?? "?");
              return (
                <div
                  key={m.id}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-dark-100 last:border-b-0 ${
                    won ? "border-l-2 border-l-success" : "border-l-2 border-l-danger"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                      won ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                    }`}
                  >
                    {won ? "W" : "L"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-light-100 text-xs truncate">
                      {teamAPlayers.join(", ")}
                      <span className="text-light-300 mx-1">vs</span>
                      {teamBPlayers.join(", ")}
                    </p>
                    {(m.scoreA !== undefined || m.scoreB !== undefined) && (
                      <p className="text-light-300 text-[10px]">
                        Score: {m.scoreA ?? "?"} - {m.scoreB ?? "?"}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {playerMatches.length > 20 && (
              <div className="text-center py-2 text-light-300 text-xs">
                Showing 20 of {playerMatches.length} matches
              </div>
            )}
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="text-light-300 text-sm">No match history yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
