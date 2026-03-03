"use client";

import { PlayerAvatar } from "@/components/PlayerAvatar";
import { PlayerLevelBadge } from "@/components/PlayerLevelBadge";
import { useAppSelector } from "@badminton/store";
import type { MatchRecord, Player } from "@badminton/types";
import { useMemo, useState } from "react";
import { FiCalendar, FiClock, FiSearch } from "react-icons/fi";

export default function HistoryPage() {
  const records = useAppSelector((state) => state.matchHistory.records);
  const players = useAppSelector((state) => state.players.items);
  const courts = useAppSelector((state) => state.courts.items);

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
        const hasMatchingPlayer = r.playerIds.some((id) => {
          const p = resolvePlayer(id);
          return p?.name.toLowerCase().includes(lowerSearch);
        });
        if (!hasMatchingPlayer) return false;
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
          <h1 className="text-2xl sm:text-3xl font-bold">Match History</h1>
          <p className="text-light-300 text-sm mt-1">
            {filteredRecords.length} finished match
            {filteredRecords.length !== 1 ? "es" : ""}
          </p>
        </div>
      </div>

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
                  const teamA = record.teamA
                    .map(resolvePlayer)
                    .filter((p): p is Player => p !== undefined);
                  const teamB = record.teamB
                    .map(resolvePlayer)
                    .filter((p): p is Player => p !== undefined);

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
                          {teamA.map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center gap-1.5"
                            >
                              <PlayerAvatar player={p} size="sm" />
                              <PlayerLevelBadge level={p.level} />
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
                          {teamB.map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center gap-1.5"
                            >
                              <PlayerAvatar player={p} size="sm" />
                              <PlayerLevelBadge level={p.level} />
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
    </div>
  );
}
