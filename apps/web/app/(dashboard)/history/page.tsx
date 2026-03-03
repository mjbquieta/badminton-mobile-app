"use client";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { PlayerLevelBadge } from "@/components/PlayerLevelBadge";
import { useAuth } from "@/contexts/AuthContext";
import { clearMatchHistoryFirestore, deleteLeaderboardSnapshot } from "@badminton/firebase";
import {
  clearMatchHistory,
  useAppDispatch,
  useAppSelector,
} from "@badminton/store";
import type { LeaderboardSnapshot, MatchRecord, Player } from "@badminton/types";
import { playerLevelConfig } from "@badminton/ui-shared";
import { useMemo, useState } from "react";
import { FiAward, FiCalendar, FiChevronDown, FiChevronUp, FiClock, FiList, FiSearch, FiTrash2 } from "react-icons/fi";

export default function HistoryPage() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const records = useAppSelector((state) => state.matchHistory.records);
  const players = useAppSelector((state) => state.players.items);
  const courts = useAppSelector((state) => state.courts.items);

  const leaderboardSnapshots = useAppSelector((state) => state.leaderboard.snapshots);
  const [activeTab, setActiveTab] = useState<"matches" | "leaderboards">("matches");
  const [expandedSnapshotId, setExpandedSnapshotId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [search, setSearch] = useState("");
  const [courtFilter, setCourtFilter] = useState("");
  const [winnerFilter, setWinnerFilter] = useState<"" | "A" | "B">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const playerMap = useMemo(
    () => new Map(players.map((p) => [p.id, p])),
    [players],
  );

  function resolvePlayer(id: string): Player | undefined {
    return playerMap.get(id);
  }

  // Collect unique court names from records for the filter dropdown
  const courtNames = useMemo(() => {
    const names = new Set<string>();
    for (const r of records) {
      if (r.courtName) names.add(r.courtName);
    }
    return Array.from(names).sort();
  }, [records]);

  const filteredRecords = useMemo(() => {
    const fromTs = dateFrom ? new Date(dateFrom).getTime() : 0;
    const toTs = dateTo ? new Date(dateTo).getTime() + 86_400_000 : Infinity; // end of the "to" day

    return records.filter((r) => {
      if (r.finishedAt < fromTs || r.finishedAt >= toTs) return false;
      if (winnerFilter && r.winner !== winnerFilter) return false;
      if (courtFilter) {
        const court = r.courtId ? courts.find((c) => c.id === r.courtId) : undefined;
        const matchesName = r.courtName === courtFilter;
        const matchesCourt = court?.name === courtFilter;
        if (!matchesName && !matchesCourt) return false;
      }
      if (search) {
        const lowerSearch = search.toLowerCase();
        const allNames = [
          ...r.playerIds.map((id) => resolvePlayer(id)?.name),
          ...(r.teamANames ?? []),
          ...(r.teamBNames ?? []),
        ];
        const hasMatch = allNames.some((name) => name?.toLowerCase().includes(lowerSearch));
        if (!hasMatch) return false;
      }
      return true;
    });
  }, [records, search, courtFilter, winnerFilter, dateFrom, dateTo, playerMap, courts]);

  // Group records by date
  const groupedByDate = useMemo(() => {
    const groups: { date: string; records: MatchRecord[] }[] = [];
    let currentDate = "";
    let currentGroup: MatchRecord[] = [];

    for (const record of filteredRecords) {
      const date = new Date(record.finishedAt).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      if (date !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, records: currentGroup });
        }
        currentDate = date;
        currentGroup = [record];
      } else {
        currentGroup.push(record);
      }
    }
    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, records: currentGroup });
    }

    return groups;
  }, [filteredRecords]);

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">History</h1>
        </div>
        {activeTab === "matches" && records.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-danger bg-danger/10 border border-danger/20 hover:bg-danger/20 transition-colors"
          >
            <FiTrash2 size={14} />
            Clear History
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-dark-200 rounded-xl p-1 mb-6">
        <button
          onClick={() => setActiveTab("matches")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === "matches"
              ? "bg-dark-100 text-light-100"
              : "text-light-300 hover:text-light-200"
          }`}
        >
          <FiList size={14} />
          Matches
          {records.length > 0 && (
            <span className="text-[10px] bg-dark-200 rounded-full px-1.5 py-0.5 ml-0.5">
              {records.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("leaderboards")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === "leaderboards"
              ? "bg-dark-100 text-light-100"
              : "text-light-300 hover:text-light-200"
          }`}
        >
          <FiAward size={14} />
          Leaderboards
          {leaderboardSnapshots.length > 0 && (
            <span className="text-[10px] bg-dark-200 rounded-full px-1.5 py-0.5 ml-0.5">
              {leaderboardSnapshots.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === "matches" ? (
      <>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="relative flex-1 min-w-[180px]">
          <FiSearch
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-light-300"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by player name..."
            className="w-full bg-secondary border border-dark-100 rounded-xl pl-9 pr-3 py-2 text-sm text-light-100 placeholder:text-light-300/50 outline-none focus:border-accent/50"
          />
        </div>
        {courtNames.length > 0 && (
          <select
            value={courtFilter}
            onChange={(e) => setCourtFilter(e.target.value)}
            className="bg-secondary border border-dark-100 rounded-xl px-3 py-2 text-sm text-light-100 outline-none focus:border-accent/50 cursor-pointer"
          >
            <option value="">All Courts</option>
            {courtNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        )}
        <select
          value={winnerFilter}
          onChange={(e) => setWinnerFilter(e.target.value as "" | "A" | "B")}
          className="bg-secondary border border-dark-100 rounded-xl px-3 py-2 text-sm text-light-100 outline-none focus:border-accent/50 cursor-pointer"
        >
          <option value="">All Winners</option>
          <option value="A">Team A Won</option>
          <option value="B">Team B Won</option>
        </select>
      </div>

      {/* Date Range */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <FiCalendar size={14} className="text-light-300 shrink-0" />
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="bg-secondary border border-dark-100 rounded-xl px-3 py-2 text-sm text-light-100 outline-none focus:border-accent/50"
        />
        <span className="text-xs text-light-300">to</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="bg-secondary border border-dark-100 rounded-xl px-3 py-2 text-sm text-light-100 outline-none focus:border-accent/50"
        />
        {(dateFrom || dateTo) && (
          <button
            onClick={() => { setDateFrom(""); setDateTo(""); }}
            className="text-xs text-light-300 hover:text-light-100 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Match List */}
      {filteredRecords.length === 0 ? (
        <div className="bg-secondary rounded-2xl border border-dark-100 py-16 text-center">
          <FiClock size={32} className="mx-auto text-light-300/40 mb-3" />
          <p className="text-light-300 text-sm">No finished matches yet</p>
          <p className="text-light-300/60 text-xs mt-0.5">
            Finish matches in the Draft page to see them here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByDate.map((group) => (
            <div key={group.date}>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 h-px bg-accent/20" />
                <span className="text-[10px] font-semibold text-accent/50 uppercase tracking-widest">
                  {group.date}
                </span>
                <div className="flex-1 h-px bg-accent/20" />
              </div>
              <div className="bg-secondary rounded-2xl border border-dark-100 overflow-hidden">
                {group.records.map((record, idx) => {
                  const teamA = record.teamA.map((id, i) => {
                    const p = resolvePlayer(id);
                    if (p) return { player: p, deleted: false };
                    const name = record.teamANames?.[i] ?? "Unknown";
                    return { player: { id, name, level: "BEGINNER" as const, gameCount: 0, trophies: 0 } as Player, deleted: true };
                  });
                  const teamB = record.teamB.map((id, i) => {
                    const p = resolvePlayer(id);
                    if (p) return { player: p, deleted: false };
                    const name = record.teamBNames?.[i] ?? "Unknown";
                    return { player: { id, name, level: "BEGINNER" as const, gameCount: 0, trophies: 0 } as Player, deleted: true };
                  });

                  return (
                    <div
                      key={record.id}
                      className="border-b border-dark-100 last:border-b-0 p-3 sm:p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-accent/80">
                            #{idx + 1}
                          </span>
                          {record.courtName && (
                            <span className="text-[10px] bg-dark-200 rounded-lg px-2 py-0.5 text-light-300">
                              {record.courtName}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wide ${
                            record.winner === "A"
                              ? "text-accent"
                              : "text-info"
                          }`}
                        >
                          Team {record.winner} Won
                        </span>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div
                          className={`flex-1 flex flex-col items-start gap-1 ${
                            record.winner === "A"
                              ? "ring-1 ring-accent/20 rounded-lg p-2 bg-accent/5"
                              : "p-2"
                          }`}
                        >
                          {teamA.map(({ player: p, deleted }) => (
                            <div
                              key={p.id}
                              className={`flex items-center gap-1.5 ${deleted ? "opacity-50" : ""}`}
                            >
                              <PlayerAvatar player={p} size="sm" />
                              {!deleted && <PlayerLevelBadge level={p.level} />}
                              <span
                                className={`text-sm truncate ${
                                  record.winner === "A"
                                    ? "text-accent font-semibold"
                                    : "text-light-100"
                                }`}
                              >
                                {p.name}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-col items-center gap-0.5 shrink-0">
                          {record.scoreA != null && record.scoreB != null ? (
                            <span className="text-sm font-bold text-light-100 tabular-nums">
                              {record.scoreA} - {record.scoreB}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-light-300 uppercase">
                              vs
                            </span>
                          )}
                        </div>
                        <div
                          className={`flex-1 flex flex-col items-start gap-1 ${
                            record.winner === "B"
                              ? "ring-1 ring-info/20 rounded-lg p-2 bg-info/5"
                              : "p-2"
                          }`}
                        >
                          {teamB.map(({ player: p, deleted }) => (
                            <div
                              key={p.id}
                              className={`flex items-center gap-1.5 ${deleted ? "opacity-50" : ""}`}
                            >
                              <PlayerAvatar player={p} size="sm" />
                              {!deleted && <PlayerLevelBadge level={p.level} />}
                              <span
                                className={`text-sm truncate ${
                                  record.winner === "B"
                                    ? "text-info font-semibold"
                                    : "text-light-100"
                                }`}
                              >
                                {p.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      </>
      ) : (
        /* Leaderboards Tab */
        <div className="space-y-4">
          {leaderboardSnapshots.length === 0 ? (
            <div className="bg-secondary rounded-2xl border border-dark-100 py-16 text-center">
              <FiAward size={32} className="mx-auto text-light-300/40 mb-3" />
              <p className="text-light-300 text-sm">No leaderboard snapshots yet</p>
              <p className="text-light-300/50 text-xs mt-1">
                Snapshots are saved when you reset drafts
              </p>
            </div>
          ) : (
            leaderboardSnapshots.map((snapshot) => {
              const isExpanded = expandedSnapshotId === snapshot.id;
              const top3 = snapshot.entries.slice(0, 3);
              return (
                <div
                  key={snapshot.id}
                  className="bg-secondary rounded-2xl border border-dark-100 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedSnapshotId(isExpanded ? null : snapshot.id)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-dark-200/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FiAward size={16} className="text-accent shrink-0" />
                      <div className="text-left min-w-0">
                        <p className="text-sm font-semibold">
                          {new Date(snapshot.createdAt).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-[10px] text-light-300">
                          {snapshot.totalMatches} match{snapshot.totalMatches !== 1 ? "es" : ""}
                          {" · "}
                          {snapshot.entries.length} player{snapshot.entries.length !== 1 ? "s" : ""}
                          {top3.length > 0 && (
                            <> · Top: {top3.map((e) => e.playerName).join(", ")}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isExpanded ? <FiChevronUp size={16} className="text-light-300" /> : <FiChevronDown size={16} className="text-light-300" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-dark-100">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-[10px] text-light-300 uppercase tracking-wide">
                              <th className="text-left px-4 py-2 font-semibold">#</th>
                              <th className="text-left px-4 py-2 font-semibold">Player</th>
                              <th className="text-center px-2 py-2 font-semibold">W</th>
                              <th className="text-center px-2 py-2 font-semibold">L</th>
                              <th className="text-center px-2 py-2 font-semibold">Win%</th>
                              <th className="text-center px-2 py-2 font-semibold">Games</th>
                              <th className="text-center px-2 py-2 font-semibold">Trophies</th>
                            </tr>
                          </thead>
                          <tbody>
                            {snapshot.entries.map((entry, i) => {
                              const config = playerLevelConfig[entry.playerLevel];
                              return (
                                <tr key={entry.playerId} className="border-t border-dark-100/50">
                                  <td className="px-4 py-2 text-light-300 font-bold text-xs">{i + 1}</td>
                                  <td className="px-4 py-2">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className="inline-flex items-center justify-center font-bold rounded text-[10px] w-5 h-5 shrink-0"
                                        style={{ color: config.color, backgroundColor: `${config.color}15` }}
                                      >
                                        {config.shortLabel}
                                      </span>
                                      <span className="truncate">{entry.playerName}</span>
                                    </div>
                                  </td>
                                  <td className="text-center px-2 py-2 text-success font-semibold">{entry.wins}</td>
                                  <td className="text-center px-2 py-2 text-danger font-semibold">{entry.losses}</td>
                                  <td className="text-center px-2 py-2 font-semibold">{Math.round(entry.winRate * 100)}%</td>
                                  <td className="text-center px-2 py-2 text-light-300">{entry.gameCount}</td>
                                  <td className="text-center px-2 py-2 text-warning">{entry.trophies}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex justify-end px-4 py-2 border-t border-dark-100/50">
                        <button
                          onClick={() => {
                            if (user?.uid) {
                              deleteLeaderboardSnapshot(user.uid, snapshot.id).catch((err) =>
                                console.error("Failed to delete snapshot:", err),
                              );
                            }
                          }}
                          className="flex items-center gap-1 text-[10px] text-danger/60 hover:text-danger transition-colors"
                        >
                          <FiTrash2 size={10} />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      <ConfirmDialog
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => {
          dispatch(clearMatchHistory());
          if (user?.uid) {
            clearMatchHistoryFirestore(user.uid).catch((err) =>
              console.error("Failed to clear match history:", err),
            );
          }
        }}
        title="Clear All Match History"
        message="This will permanently delete all match history. Player stats (game counts and trophies) will not be affected. This action cannot be undone."
        confirmLabel="Clear All"
        danger
      />
    </div>
  );
}
