"use client";

import { PlayerAvatar } from "@/components/PlayerAvatar";
import { PlayerLevelBadge } from "@/components/PlayerLevelBadge";
import { useAppSelector } from "@badminton/store";
import type { Draft, Player } from "@badminton/types";
import { useMemo, useState } from "react";
import { FiClock, FiSearch, FiFilter } from "react-icons/fi";

export default function HistoryPage() {
  const drafts = useAppSelector((state) => state.drafts.items);
  const players = useAppSelector((state) => state.players.items);
  const courts = useAppSelector((state) => state.courts.items);

  const [search, setSearch] = useState("");
  const [courtFilter, setCourtFilter] = useState("");
  const [winnerFilter, setWinnerFilter] = useState<"" | "A" | "B">("");

  const playerMap = useMemo(
    () => new Map(players.map((p) => [p.id, p])),
    [players],
  );

  const courtMap = useMemo(
    () => new Map(courts.map((c) => [c.id, c])),
    [courts],
  );

  function resolvePlayer(id: string): Player | undefined {
    return playerMap.get(id);
  }

  const finishedDrafts = useMemo(() => {
    return drafts
      .filter((d) => d.finished && d.winner)
      .filter((d) => {
        if (winnerFilter && d.winner !== winnerFilter) return false;
        if (courtFilter && d.courtId !== courtFilter) return false;
        if (search) {
          const lowerSearch = search.toLowerCase();
          const hasMatchingPlayer = d.playerIds.some((id) => {
            const p = resolvePlayer(id);
            return p?.name.toLowerCase().includes(lowerSearch);
          });
          if (!hasMatchingPlayer) return false;
        }
        return true;
      });
  }, [drafts, search, courtFilter, winnerFilter, playerMap]);

  // Group by rounds (courtCount)
  const courtCount = courts.length || 1;
  const groupedRounds = useMemo(() => {
    const rounds: Draft[][] = [];
    for (let i = 0; i < finishedDrafts.length; i += courtCount) {
      rounds.push(finishedDrafts.slice(i, i + courtCount));
    }
    return rounds;
  }, [finishedDrafts, courtCount]);

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Match History</h1>
          <p className="text-light-300 text-sm mt-1">
            {finishedDrafts.length} finished match
            {finishedDrafts.length !== 1 ? "es" : ""}
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
        {courts.length > 0 && (
          <select
            value={courtFilter}
            onChange={(e) => setCourtFilter(e.target.value)}
            className="bg-secondary border border-dark-100 rounded-xl px-3 py-2 text-sm text-light-100 outline-none focus:border-accent/50 cursor-pointer"
          >
            <option value="">All Courts</option>
            {courts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
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

      {/* Match List */}
      {finishedDrafts.length === 0 ? (
        <div className="bg-secondary rounded-2xl border border-dark-100 py-16 text-center">
          <FiClock size={32} className="mx-auto text-light-300/40 mb-3" />
          <p className="text-light-300 text-sm">No finished matches yet</p>
          <p className="text-light-300/60 text-xs mt-0.5">
            Finish matches in the Draft page to see them here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedRounds.map((round, roundIndex) => (
            <div key={roundIndex}>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 h-px bg-accent/20" />
                <span className="text-[10px] font-semibold text-accent/50 uppercase tracking-widest">
                  Set {roundIndex + 1}
                </span>
                <div className="flex-1 h-px bg-accent/20" />
              </div>
              <div className="bg-secondary rounded-2xl border border-dark-100 overflow-hidden">
                {round.map((draft, indexInRound) => {
                  const half = Math.ceil(draft.playerIds.length / 2);
                  const teamA = draft.playerIds
                    .slice(0, half)
                    .map(resolvePlayer)
                    .filter((p): p is Player => p !== undefined);
                  const teamB = draft.playerIds
                    .slice(half)
                    .map(resolvePlayer)
                    .filter((p): p is Player => p !== undefined);
                  const court = draft.courtId
                    ? courtMap.get(draft.courtId)
                    : null;

                  return (
                    <div
                      key={draft.id}
                      className="border-b border-dark-100 last:border-b-0 p-3 sm:p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-accent/80">
                            #{roundIndex * courtCount + indexInRound + 1}
                          </span>
                          {court && (
                            <span className="text-[10px] bg-dark-200 rounded-lg px-2 py-0.5 text-light-300">
                              {court.name}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wide ${
                            draft.winner === "A"
                              ? "text-accent"
                              : "text-info"
                          }`}
                        >
                          Team {draft.winner} Won
                        </span>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div
                          className={`flex-1 flex flex-col items-start gap-1 ${
                            draft.winner === "A"
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
                                  draft.winner === "A"
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
                          {draft.scoreA != null && draft.scoreB != null ? (
                            <span className="text-sm font-bold text-light-100 tabular-nums">
                              {draft.scoreA} - {draft.scoreB}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-light-300 uppercase">
                              vs
                            </span>
                          )}
                        </div>
                        <div
                          className={`flex-1 flex flex-col items-start gap-1 ${
                            draft.winner === "B"
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
                                  draft.winner === "B"
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
