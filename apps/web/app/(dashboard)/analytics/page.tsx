"use client";

import { useAppSelector } from "@badminton/store";
import {
  computeAllPlayerStats,
  computeWinRateOverTime,
  computeHeadToHeadMatrix,
  computeCourtUtilization,
  computeParticipationTrend,
  computeAvailabilityHeatmap,
  getRecentForm,
} from "@badminton/core";
import type { MatchRecord } from "@badminton/types";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { PlayerLevelBadge } from "@/components/PlayerLevelBadge";
import { useMemo, useState } from "react";
import {
  FiBarChart2,
  FiTrendingUp,
  FiUsers,
  FiActivity,
  FiGrid,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Tab = "overview" | "players" | "courts" | "availability";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 12 }, (_, i) => {
  const h = i * 2 + 6;
  return h >= 24 ? `${h - 24}` : `${h}`;
});

export default function AnalyticsPage() {
  const players = useAppSelector((s) => s.players.items);
  const courts = useAppSelector((s) => s.courts.items);
  const drafts = useAppSelector((s) => s.drafts.items);
  const schedules = useAppSelector((s) => s.schedules.items);

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");

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

  const allStats = useMemo(
    () => computeAllPlayerStats(matchRecords),
    [matchRecords],
  );

  const participationTrend = useMemo(
    () => computeParticipationTrend(matchRecords),
    [matchRecords],
  );

  const courtUtil = useMemo(
    () => computeCourtUtilization(matchRecords, courts),
    [matchRecords, courts],
  );

  const playerWinRate = useMemo(() => {
    if (!selectedPlayerId) return [];
    return computeWinRateOverTime(selectedPlayerId, matchRecords);
  }, [selectedPlayerId, matchRecords]);

  const h2hMatrix = useMemo(() => {
    const activeIds = players.filter((p) => (p.active ?? true)).map((p) => p.id);
    return computeHeadToHeadMatrix(activeIds, matchRecords);
  }, [players, matchRecords]);

  const heatmap = useMemo(
    () => computeAvailabilityHeatmap(schedules),
    [schedules],
  );

  const heatmapMax = useMemo(
    () => Math.max(1, ...heatmap.map((c) => c.count)),
    [heatmap],
  );

  const playerMap = useMemo(() => {
    const map = new Map<string, (typeof players)[0]>();
    for (const p of players) map.set(p.id, p);
    return map;
  }, [players]);

  const avgMatchesPerPlayer = useMemo(() => {
    if (players.length === 0) return 0;
    let total = 0;
    for (const [, s] of allStats) total += s.totalMatches;
    return allStats.size > 0 ? Math.round(total / allStats.size) : 0;
  }, [allStats, players]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <FiTrendingUp size={14} /> },
    { key: "players", label: "Players", icon: <FiUsers size={14} /> },
    { key: "courts", label: "Courts", icon: <FiBarChart2 size={14} /> },
    { key: "availability", label: "Availability", icon: <FiGrid size={14} /> },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Analytics</h1>
        <p className="text-light-300 text-sm mt-1">
          Insights and trends from your matches
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-secondary rounded-xl border border-dark-100 p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "bg-accent/10 text-accent"
                : "text-light-300 hover:text-light-100 hover:bg-dark-200"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <div className="bg-secondary p-3 sm:p-5 rounded-2xl border border-dark-100">
              <h3 className="text-light-300 text-[10px] sm:text-xs mb-1">
                Total Matches
              </h3>
              <p className="text-xl sm:text-3xl font-bold text-accent">
                {matchRecords.length}
              </p>
            </div>
            <div className="bg-secondary p-3 sm:p-5 rounded-2xl border border-dark-100">
              <h3 className="text-light-300 text-[10px] sm:text-xs mb-1">
                Total Players
              </h3>
              <p className="text-xl sm:text-3xl font-bold">{players.length}</p>
            </div>
            <div className="bg-secondary p-3 sm:p-5 rounded-2xl border border-dark-100">
              <h3 className="text-light-300 text-[10px] sm:text-xs mb-1">
                Avg Matches/Player
              </h3>
              <p className="text-xl sm:text-3xl font-bold text-info">
                {avgMatchesPerPlayer}
              </p>
            </div>
            <div className="bg-secondary p-3 sm:p-5 rounded-2xl border border-dark-100">
              <h3 className="text-light-300 text-[10px] sm:text-xs mb-1">
                Active Players
              </h3>
              <p className="text-xl sm:text-3xl font-bold text-success">
                {players.filter((p) => p.active ?? true).length}
              </p>
            </div>
          </div>

          {/* Participation Trend */}
          <div className="bg-secondary rounded-2xl border border-dark-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-dark-100 flex items-center gap-2">
              <FiTrendingUp className="text-accent" size={18} />
              <h2 className="text-sm font-semibold">Participation Trend</h2>
            </div>
            {participationTrend.length > 0 ? (
              <div className="p-4" style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={participationTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
                      tickFormatter={(v: string) => v.slice(5)}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(30,30,30,0.95)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="activeCount"
                      stroke="#84CC16"
                      strokeWidth={2}
                      dot={false}
                      name="Active Players"
                    />
                    <Line
                      type="monotone"
                      dataKey="totalMatches"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={false}
                      name="Matches"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-light-300 text-sm">No match data yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Players Tab */}
      {activeTab === "players" && (
        <div className="space-y-6">
          {/* Player Selector */}
          <div className="bg-secondary rounded-2xl border border-dark-100 p-4">
            <label className="text-xs text-light-300 mb-2 block">
              Select Player
            </label>
            <select
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              className="w-full bg-primary border border-dark-100 rounded-xl px-3 py-2 text-sm text-light-100 focus:outline-none focus:border-accent"
            >
              <option value="">Choose a player...</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Win Rate Over Time */}
          {selectedPlayerId && (
            <div className="bg-secondary rounded-2xl border border-dark-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-dark-100 flex items-center gap-2">
                <FiTrendingUp className="text-accent" size={18} />
                <h2 className="text-sm font-semibold">Win Rate Over Time</h2>
              </div>
              {playerWinRate.length > 0 ? (
                <div className="p-4" style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={playerWinRate}>
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
                      <Line
                        type="monotone"
                        dataKey="winRate"
                        stroke="#84CC16"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-light-300 text-sm">No match data for this player</p>
                </div>
              )}
            </div>
          )}

          {/* Recent Form */}
          {selectedPlayerId && (() => {
            const form = getRecentForm(selectedPlayerId, matchRecords, 10);
            const player = playerMap.get(selectedPlayerId);
            if (!player || form.wins + form.losses === 0) return null;
            return (
              <div className="bg-secondary rounded-2xl border border-dark-100 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FiActivity className="text-info" size={18} />
                  <h2 className="text-sm font-semibold">Recent Form (Last 10)</h2>
                </div>
                <div className="flex items-center gap-3">
                  <PlayerAvatar player={player} size="md" />
                  <div>
                    <p className="text-light-100 text-sm font-medium">{player.name}</p>
                    <p className="text-light-300 text-xs">
                      <span className="text-success">{form.wins}W</span>
                      {" - "}
                      <span className="text-danger">{form.losses}L</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Head-to-Head Matrix */}
          <div className="bg-secondary rounded-2xl border border-dark-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-dark-100 flex items-center gap-2">
              <FiGrid className="text-info" size={18} />
              <h2 className="text-sm font-semibold">Head-to-Head Records</h2>
            </div>
            {h2hMatrix.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-100 text-light-300 text-xs">
                      <th className="text-left px-4 py-2 font-medium">Player A</th>
                      <th className="text-left px-4 py-2 font-medium">Player B</th>
                      <th className="text-center px-2 py-2 font-medium">Record</th>
                      <th className="text-center px-2 py-2 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {h2hMatrix.slice(0, 20).map((entry) => {
                      const pA = playerMap.get(entry.playerIdA);
                      const pB = playerMap.get(entry.playerIdB);
                      return (
                        <tr
                          key={`${entry.playerIdA}-${entry.playerIdB}`}
                          className="border-b border-dark-100 last:border-b-0 hover:bg-dark-200/30"
                        >
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              {pA && <PlayerAvatar player={pA} size="sm" />}
                              <span className="text-light-100 truncate">
                                {pA?.name ?? "Unknown"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              {pB && <PlayerAvatar player={pB} size="sm" />}
                              <span className="text-light-100 truncate">
                                {pB?.name ?? "Unknown"}
                              </span>
                            </div>
                          </td>
                          <td className="text-center px-2 py-2.5">
                            <span className="text-success">{entry.winsA}</span>
                            <span className="text-light-300 mx-1">-</span>
                            <span className="text-danger">{entry.winsB}</span>
                          </td>
                          <td className="text-center px-2 py-2.5 text-light-300 tabular-nums">
                            {entry.total}
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
        </div>
      )}

      {/* Courts Tab */}
      {activeTab === "courts" && (
        <div className="space-y-6">
          <div className="bg-secondary rounded-2xl border border-dark-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-dark-100 flex items-center gap-2">
              <FiBarChart2 className="text-accent" size={18} />
              <h2 className="text-sm font-semibold">Court Utilization</h2>
            </div>
            {courtUtil.length > 0 && courtUtil.some((c) => c.matchCount > 0) ? (
              <div className="p-4" style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={courtUtil} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} />
                    <YAxis
                      type="category"
                      dataKey="courtName"
                      width={100}
                      tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(30,30,30,0.95)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="matchCount" fill="#84CC16" radius={[0, 4, 4, 0]} name="Matches" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-light-300 text-sm">No court usage data yet</p>
              </div>
            )}
          </div>

          {/* Court Stats Table */}
          {courtUtil.length > 0 && (
            <div className="bg-secondary rounded-2xl border border-dark-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-dark-100">
                <h2 className="text-sm font-semibold">Court Breakdown</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-100 text-light-300 text-xs">
                      <th className="text-left px-4 py-2 font-medium">Court</th>
                      <th className="text-center px-2 py-2 font-medium">Matches</th>
                      <th className="text-center px-2 py-2 font-medium">Usage %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courtUtil.map((c) => (
                      <tr key={c.courtId} className="border-b border-dark-100 last:border-b-0">
                        <td className="px-4 py-2.5 text-light-100">{c.courtName}</td>
                        <td className="text-center px-2 py-2.5 tabular-nums">{c.matchCount}</td>
                        <td className="text-center px-2 py-2.5 tabular-nums text-accent">{c.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Availability Tab */}
      {activeTab === "availability" && (
        <div className="space-y-6">
          <div className="bg-secondary rounded-2xl border border-dark-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-dark-100 flex items-center gap-2">
              <FiGrid className="text-accent" size={18} />
              <h2 className="text-sm font-semibold">Session Availability Heatmap</h2>
              <span className="text-light-300 text-xs ml-auto">Based on scheduled sessions</span>
            </div>
            {heatmap.length > 0 ? (
              <div className="p-4 overflow-x-auto">
                <div className="min-w-[500px]">
                  {/* Header row - hours */}
                  <div className="flex gap-1 mb-1 pl-12">
                    {HOURS.map((h, i) => (
                      <div key={i} className="flex-1 text-center text-[10px] text-light-300">
                        {h}:00
                      </div>
                    ))}
                  </div>
                  {/* Grid rows - days */}
                  {DAYS.map((day, dow) => (
                    <div key={dow} className="flex gap-1 mb-1 items-center">
                      <div className="w-10 text-xs text-light-300 text-right pr-2 shrink-0">{day}</div>
                      {HOURS.map((_, i) => {
                        const hour = i * 2 + 6;
                        const cell = heatmap.find((c) => c.dayOfWeek === dow && (c.hour === hour || c.hour === hour + 1));
                        const count = cell?.count ?? 0;
                        const intensity = count / heatmapMax;
                        return (
                          <div
                            key={i}
                            className="flex-1 aspect-square rounded-sm cursor-default"
                            style={{
                              backgroundColor:
                                count > 0
                                  ? `rgba(132, 204, 22, ${0.15 + intensity * 0.7})`
                                  : "rgba(255,255,255,0.03)",
                            }}
                            title={`${day} ${hour}:00 - ${hour + 2}:00: ${count} session(s)`}
                          />
                        );
                      })}
                    </div>
                  ))}
                  {/* Legend */}
                  <div className="flex items-center gap-2 mt-3 pl-12">
                    <span className="text-[10px] text-light-300">Less</span>
                    {[0.1, 0.3, 0.5, 0.7, 0.9].map((opacity) => (
                      <div
                        key={opacity}
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: `rgba(132, 204, 22, ${opacity})` }}
                      />
                    ))}
                    <span className="text-[10px] text-light-300">More</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-light-300 text-sm">No scheduled sessions yet</p>
                <p className="text-light-300/60 text-xs mt-0.5">
                  Create sessions in the Schedule page to see availability patterns
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
