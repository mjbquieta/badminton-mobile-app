"use client";

import { useAppSelector, useAppDispatch, addTournament, updateTournament, removeTournament } from "@badminton/store";
import {
  seedPlayers,
  pairTeamsBalanced,
  seedTeams,
  generateBracket,
  generateBracketManual,
  advanceWinner,
  isTournamentComplete,
  getTournamentWinner,
  getSwissRoundCount,
  computeSwissStandings,
  generateSwissPairings,
  recordSwissResult,
  isSwissPhaseComplete,
  getPlayoffParticipants,
} from "@badminton/core";
import type { Tournament, TournamentFormat, TournamentType, TournamentMatch, MatchRecord, SwissRound, SwissPairing } from "@badminton/types";
import { saveTournament, updateTournamentFirestore, deleteTournament } from "@badminton/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { BracketView } from "@/components/BracketView";
import { SwissStandingsTable } from "@/components/SwissStandingsTable";
import { Modal } from "@/components/Modal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { useMemo, useState } from "react";
import { FiPlus, FiTarget, FiTrash2, FiChevronRight, FiAward, FiShuffle, FiPlay, FiLock, FiList, FiGrid } from "react-icons/fi";
import { v4 as uuid } from "uuid";

export default function TournamentPage() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const players = useAppSelector((s) => s.players.items);
  const drafts = useAppSelector((s) => s.drafts.items);
  const tournaments = useAppSelector((s) => s.tournaments.items);

  const [showCreate, setShowCreate] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [resolveMatch, setResolveMatch] = useState<TournamentMatch | null>(null);
  const [resolveWinner, setResolveWinner] = useState<string>("");
  const [resolveScoreA, setResolveScoreA] = useState("");
  const [resolveScoreB, setResolveScoreB] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [swapSelect, setSwapSelect] = useState<string | null>(null);

  // Swiss detail state
  const [swissResolveMatch, setSwissResolveMatch] = useState<SwissPairing | null>(null);
  const [swissScoreA, setSwissScoreA] = useState("");
  const [swissScoreB, setSwissScoreB] = useState("");
  const [swissWinner, setSwissWinner] = useState<string>("");

  // Create form state
  const [createName, setCreateName] = useState("");
  const [createFormat, setCreateFormat] = useState<TournamentFormat>("singles");
  const [createType, setCreateType] = useState<TournamentType>("bracket");
  const [createPlayerIds, setCreatePlayerIds] = useState<Set<string>>(new Set());
  // Match pairing (who plays who in Round 1)
  const [matchPairingMode, setMatchPairingMode] = useState<"auto" | "manual">("auto");
  // Singles manual: matchups as player ID pairs
  const [manualMatchups, setManualMatchups] = useState<[string, string][]>([]);
  const [matchPickFirst, setMatchPickFirst] = useState<string | null>(null);
  // Doubles manual: each match = 4 players (2 per team), built via 4-tap flow
  const [manualDoublesMatches, setManualDoublesMatches] = useState<{ teamA: string[]; teamB: string[] }[]>([]);
  const [doublesPickBuffer, setDoublesPickBuffer] = useState<string[]>([]);

  const matchRecords: MatchRecord[] = useMemo(
    () =>
      drafts
        .filter((d) => d.finished && d.winner)
        .map((d) => {
          const half = Math.ceil(d.playerIds.length / 2);
          return {
            id: d.id, sessionId: "", draftId: d.id, playerIds: d.playerIds,
            teamA: d.playerIds.slice(0, half), teamB: d.playerIds.slice(half),
            winner: d.winner as "A" | "B", scoreA: d.scoreA, scoreB: d.scoreB,
            isSingle: d.playerIds.length === 2, finishedAt: Date.now(),
          };
        }),
    [drafts],
  );

  const playerMap = useMemo(() => {
    const map = new Map<string, (typeof players)[0]>();
    for (const p of players) map.set(p.id, p);
    return map;
  }, [players]);

  const activePlayers = useMemo(() => players.filter((p) => p.active ?? true), [players]);

  // Auto-paired teams preview for doubles
  const previewTeams = useMemo(() => {
    if (createFormat !== "doubles" || matchPairingMode !== "auto" || createPlayerIds.size < 4 || createPlayerIds.size % 2 !== 0) {
      return [];
    }
    const selected = players.filter((p) => createPlayerIds.has(p.id));
    return pairTeamsBalanced(selected, matchRecords, uuid);
  }, [createFormat, matchPairingMode, createPlayerIds, players, matchRecords]);

  // Doubles manual: players not yet in any match (available to pick)
  const availableDoublesPlayers = useMemo(() => {
    if (createFormat !== "doubles" || matchPairingMode !== "manual") return [];
    const inMatch = new Set(manualDoublesMatches.flatMap((m) => [...m.teamA, ...m.teamB]));
    return players.filter((p) => createPlayerIds.has(p.id) && !inMatch.has(p.id));
  }, [createFormat, matchPairingMode, createPlayerIds, manualDoublesMatches, players]);

  const handleDoublesPlayerTap = (playerId: string) => {
    // Deselect if already picked
    if (doublesPickBuffer.includes(playerId)) {
      setDoublesPickBuffer((prev) => prev.filter((id) => id !== playerId));
      return;
    }
    const next = [...doublesPickBuffer, playerId];
    if (next.length === 4) {
      // 4 picks complete → form a match and clear buffer
      setManualDoublesMatches((m) => [...m, { teamA: [next[0], next[1]], teamB: [next[2], next[3]] }]);
      setDoublesPickBuffer([]);
    } else {
      setDoublesPickBuffer(next);
    }
  };

  const removeDoublesMatch = (index: number) => {
    setManualDoublesMatches((prev) => prev.filter((_, i) => i !== index));
  };

  // Singles: player IDs available for matching
  const singlesParticipants = useMemo(() => {
    if (createFormat !== "singles") return [];
    return players.filter((p) => createPlayerIds.has(p.id)).map((p) => p.id);
  }, [createFormat, createPlayerIds, players]);

  // Singles: participants not yet matched
  const unmatchedSingles = useMemo(() => {
    if (createFormat !== "singles" || matchPairingMode !== "manual") return [];
    const matched = new Set(manualMatchups.flat());
    return singlesParticipants.filter((id) => !matched.has(id));
  }, [createFormat, matchPairingMode, manualMatchups, singlesParticipants]);

  const handleMatchParticipantTap = (participantId: string) => {
    if (!matchPickFirst) {
      setMatchPickFirst(participantId);
    } else if (matchPickFirst === participantId) {
      setMatchPickFirst(null);
    } else {
      setManualMatchups((prev) => [...prev, [matchPickFirst, participantId]]);
      setMatchPickFirst(null);
    }
  };

  const removeManualMatchup = (index: number) => {
    setManualMatchups((prev) => prev.filter((_, i) => i !== index));
  };

  const getPlayerName = (playerId: string): string => playerMap.get(playerId)?.name ?? "Unknown";

  const canCreate = useMemo(() => {
    if (!createName.trim()) return false;

    // Swiss: just need enough players (min 3 for singles, min 6 for doubles i.e. 3 teams)
    if (createType === "swiss") {
      if (createFormat === "singles") return createPlayerIds.size >= 3;
      return createPlayerIds.size >= 6 && createPlayerIds.size % 2 === 0;
    }

    // Bracket mode
    if (createFormat === "singles") {
      if (createPlayerIds.size < 2) return false;
      if (matchPairingMode === "manual" && manualMatchups.length === 0) return false;
    } else {
      if (matchPairingMode === "auto") {
        if (createPlayerIds.size < 4 || createPlayerIds.size % 2 !== 0) return false;
      } else {
        if (manualDoublesMatches.length === 0) return false;
      }
    }
    return true;
  }, [createName, createFormat, createType, createPlayerIds, matchPairingMode, manualMatchups, manualDoublesMatches]);

  const handleCreate = async () => {
    if (!user || !canCreate) return;

    const selectedPlayers = players.filter((p) => createPlayerIds.has(p.id));

    // --- Swiss creation ---
    if (createType === "swiss") {
      let teamsMap: Record<string, string[]> | undefined;
      let participantIds: string[];

      if (createFormat === "doubles") {
        // Auto-pair balanced teams
        const teams = pairTeamsBalanced(selectedPlayers, matchRecords, uuid);
        teamsMap = {};
        for (const t of teams) teamsMap[t.id] = t.playerIds;
        participantIds = teams.map((t) => t.id);
      } else {
        participantIds = selectedPlayers.map((p) => p.id);
      }

      const roundCount = getSwissRoundCount(participantIds.length);
      const seeds = participantIds.map((id, i) => ({ playerId: id, seedNumber: i + 1 }));

      // Generate Round 1 pairings
      const round1Pairings = generateSwissPairings(participantIds, [], [], uuid);
      const swissRounds: SwissRound[] = [{
        roundNumber: 1,
        pairings: round1Pairings,
        completed: false,
      }];

      const byeHistory = round1Pairings.filter((p) => p.isBye).map((p) => p.participantA);

      const tournament: Tournament = {
        id: uuid(),
        name: createName.trim(),
        format: createFormat,
        type: "swiss",
        status: "in_progress",
        seeds,
        matches: [],
        teams: teamsMap,
        swissRounds,
        swissRoundCount: roundCount,
        swissByeHistory: byeHistory,
        createdAt: Date.now(),
      };

      dispatch(addTournament(tournament));
      await saveTournament(user.uid, tournament);
      setShowCreate(false);
      resetCreateForm();
      setSelectedTournament(tournament);
      return;
    }

    // --- Bracket creation ---
    let seeds: ReturnType<typeof seedPlayers>;
    let teamsMap: Record<string, string[]> | undefined;
    let matches: TournamentMatch[];

    if (createFormat === "doubles") {
      if (matchPairingMode === "manual") {
        teamsMap = {};
        const matchups: [string, string][] = [];
        for (const dm of manualDoublesMatches) {
          const teamAId = uuid();
          const teamBId = uuid();
          teamsMap[teamAId] = dm.teamA;
          teamsMap[teamBId] = dm.teamB;
          matchups.push([teamAId, teamBId]);
        }
        matches = generateBracketManual(matchups, [], uuid);
        seeds = matchups.flatMap(([a, b], i) => [
          { playerId: a, seedNumber: i * 2 + 1 },
          { playerId: b, seedNumber: i * 2 + 2 },
        ]);
      } else {
        const teams = pairTeamsBalanced(selectedPlayers, matchRecords, uuid);
        teamsMap = {};
        for (const t of teams) teamsMap[t.id] = t.playerIds;
        seeds = seedTeams(teams, matchRecords);
        matches = generateBracket(seeds, uuid);
      }
    } else {
      seeds = seedPlayers(selectedPlayers, matchRecords);
      if (matchPairingMode === "manual") {
        const matchedIds = new Set(manualMatchups.flat());
        const byeParticipants = singlesParticipants.filter((id) => !matchedIds.has(id));
        matches = generateBracketManual(manualMatchups, byeParticipants, uuid);
        const allOrdered = [...manualMatchups.flat(), ...byeParticipants];
        seeds = allOrdered.map((id, i) => ({ playerId: id, seedNumber: i + 1 }));
      } else {
        matches = generateBracket(seeds, uuid);
      }
    }

    const tournament: Tournament = {
      id: uuid(),
      name: createName.trim(),
      format: createFormat,
      type: "bracket",
      status: "setup",
      seeds,
      matches,
      teams: teamsMap,
      createdAt: Date.now(),
    };

    dispatch(addTournament(tournament));
    await saveTournament(user.uid, tournament);
    setShowCreate(false);
    resetCreateForm();
    setSelectedTournament(tournament);
  };

  const resetCreateForm = () => {
    setCreateName("");
    setCreateType("bracket");
    setCreatePlayerIds(new Set());
    setMatchPairingMode("auto");
    setManualMatchups([]);
    setMatchPickFirst(null);
    setManualDoublesMatches([]);
    setDoublesPickBuffer([]);
  };

  const handleResolveMatch = async () => {
    if (!selectedTournament || !resolveMatch || !resolveWinner || !user) return;

    const scoreA = resolveScoreA ? parseInt(resolveScoreA) : undefined;
    const scoreB = resolveScoreB ? parseInt(resolveScoreB) : undefined;

    const updatedMatches = advanceWinner(
      selectedTournament.matches,
      resolveMatch.id,
      resolveWinner,
      scoreA,
      scoreB,
    );

    const complete = isTournamentComplete(updatedMatches);
    const winner = complete ? getTournamentWinner(updatedMatches) : undefined;

    const updated: Tournament = {
      ...selectedTournament,
      matches: updatedMatches,
      status: complete ? "completed" : "in_progress",
      completedAt: complete ? Date.now() : undefined,
      winnerId: winner,
    };

    dispatch(updateTournament(updated));
    await updateTournamentFirestore(user.uid, updated);
    setSelectedTournament(updated);
    setResolveMatch(null);
    setResolveWinner("");
    setResolveScoreA("");
    setResolveScoreB("");
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    dispatch(removeTournament(id));
    await deleteTournament(user.uid, id);
    if (selectedTournament?.id === id) setSelectedTournament(null);
    setDeleteConfirm(null);
  };

  // --- Setup phase handlers ---

  const handleParticipantClick = (participantId: string) => {
    if (!swapSelect) {
      setSwapSelect(participantId);
    } else if (swapSelect === participantId) {
      setSwapSelect(null);
    } else {
      // In-place swap: replace all occurrences of idA with idB and vice versa in matches
      if (!selectedTournament) return;
      const idA = swapSelect;
      const idB = participantId;

      const swapId = (val: string | undefined) => {
        if (val === idA) return idB;
        if (val === idB) return idA;
        return val;
      };

      const newMatches = selectedTournament.matches.map((m) => ({
        ...m,
        playerA: swapId(m.playerA),
        playerB: swapId(m.playerB),
        winner: swapId(m.winner),
      }));

      const newSeeds = selectedTournament.seeds.map((s) => ({
        ...s,
        playerId: s.playerId === idA ? idB : s.playerId === idB ? idA : s.playerId,
      }));

      const updated = { ...selectedTournament, seeds: newSeeds, matches: newMatches };
      setSelectedTournament(updated);
      dispatch(updateTournament(updated));
      if (user) updateTournamentFirestore(user.uid, updated);
      setSwapSelect(null);
    }
  };

  const handleShuffle = async () => {
    if (!selectedTournament || !user) return;
    const shuffled = [...selectedTournament.seeds]
      .map((s) => ({ ...s }))
      .sort(() => Math.random() - 0.5);
    shuffled.forEach((s, i) => { s.seedNumber = i + 1; });
    const matches = generateBracket(shuffled, uuid);
    const updated = { ...selectedTournament, seeds: shuffled, matches };
    dispatch(updateTournament(updated));
    await updateTournamentFirestore(user.uid, updated);
    setSelectedTournament(updated);
    setSwapSelect(null);
  };

  const handleStartTournament = async () => {
    if (!selectedTournament || !user) return;
    const updated = { ...selectedTournament, status: "in_progress" as const };
    dispatch(updateTournament(updated));
    await updateTournamentFirestore(user.uid, updated);
    setSelectedTournament(updated);
    setSwapSelect(null);
  };

  // --- Swiss handlers ---

  const handleSwissRecordResult = async () => {
    if (!selectedTournament || !swissResolveMatch || !swissWinner || !user) return;
    const scoreA = swissScoreA ? parseInt(swissScoreA) : 0;
    const scoreB = swissScoreB ? parseInt(swissScoreB) : 0;

    const rounds = selectedTournament.swissRounds ?? [];
    const currentRound = rounds[rounds.length - 1];
    if (!currentRound) return;

    const updatedRound = recordSwissResult(currentRound, swissResolveMatch.id, swissWinner, scoreA, scoreB);
    const updatedRounds = [...rounds.slice(0, -1), updatedRound];

    const updated: Tournament = { ...selectedTournament, swissRounds: updatedRounds };
    dispatch(updateTournament(updated));
    await updateTournamentFirestore(user.uid, updated);
    setSelectedTournament(updated);
    setSwissResolveMatch(null);
    setSwissScoreA("");
    setSwissScoreB("");
    setSwissWinner("");
  };

  const handleSwissNextRound = async () => {
    if (!selectedTournament || !user) return;
    const rounds = selectedTournament.swissRounds ?? [];
    const participantIds = selectedTournament.seeds.map((s) => s.playerId);
    const byeHistory = selectedTournament.swissByeHistory ?? [];

    const newPairings = generateSwissPairings(participantIds, rounds, byeHistory, uuid);
    const newByes = newPairings.filter((p) => p.isBye).map((p) => p.participantA);

    const newRound: SwissRound = {
      roundNumber: rounds.length + 1,
      pairings: newPairings,
      completed: false,
    };

    const updated: Tournament = {
      ...selectedTournament,
      swissRounds: [...rounds, newRound],
      swissByeHistory: [...byeHistory, ...newByes],
    };

    dispatch(updateTournament(updated));
    await updateTournamentFirestore(user.uid, updated);
    setSelectedTournament(updated);
  };

  const handleSwissStartPlayoffs = async () => {
    if (!selectedTournament || !user) return;
    const rounds = selectedTournament.swissRounds ?? [];
    const participantIds = selectedTournament.seeds.map((s) => s.playerId);
    const standings = computeSwissStandings(participantIds, rounds);
    const top4 = getPlayoffParticipants(standings, 4);

    // Generate playoff bracket: 1v4 and 2v3 → final
    const seeds = top4.map((s, i) => ({ playerId: s.participantId, seedNumber: i + 1 }));
    const matches = generateBracket(seeds, uuid);

    const updated: Tournament = {
      ...selectedTournament,
      swissPlayoffStarted: true,
      seeds: [...selectedTournament.seeds],
      matches,
    };

    dispatch(updateTournament(updated));
    await updateTournamentFirestore(user.uid, updated);
    setSelectedTournament(updated);
  };

  const togglePlayer = (id: string) => {
    setCreatePlayerIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    // Reset all manual pairings when player selection changes
    setManualMatchups([]);
    setMatchPickFirst(null);
    setManualDoublesMatches([]);
    setDoublesPickBuffer([]);
  };

  /** Resolve a participant name for display (handles both singles player IDs and doubles team IDs). */
  const getParticipantName = (participantId: string, tournament: Tournament): string => {
    if (tournament.format === "doubles" && tournament.teams) {
      const teamPlayerIds = tournament.teams[participantId];
      if (teamPlayerIds) {
        return teamPlayerIds.map((pid) => playerMap.get(pid)?.name ?? "?").join(" & ");
      }
    }
    return playerMap.get(participantId)?.name ?? "Unknown";
  };

  // Resolve match modal — get the two participant options
  const resolveParticipants = useMemo(() => {
    if (!resolveMatch || !selectedTournament) return [];
    return [resolveMatch.playerA, resolveMatch.playerB].filter(Boolean).map((pid) => ({
      id: pid!,
      label: getParticipantName(pid!, selectedTournament),
      teamPlayerIds: selectedTournament.teams?.[pid!],
    }));
  }, [resolveMatch, selectedTournament, playerMap]);

  // Detail view
  if (selectedTournament) {
    const isSwiss = selectedTournament.type === "swiss";
    const isSetup = selectedTournament.status === "setup";
    const isInProgress = selectedTournament.status === "in_progress";
    const isCompleted = selectedTournament.status === "completed";
    const winnerName = selectedTournament.winnerId
      ? getParticipantName(selectedTournament.winnerId, selectedTournament)
      : null;

    // Swiss-specific computed values
    const swissRounds = selectedTournament.swissRounds ?? [];
    const swissRoundCount = selectedTournament.swissRoundCount ?? 0;
    const swissParticipantIds = selectedTournament.seeds.map((s) => s.playerId);
    const swissStandings = isSwiss ? computeSwissStandings(swissParticipantIds, swissRounds) : [];
    const swissComplete = isSwiss && isSwissPhaseComplete(swissRounds, swissRoundCount);
    const currentSwissRound = swissRounds[swissRounds.length - 1];
    const currentRoundComplete = currentSwissRound?.completed ?? false;
    const playoffStarted = selectedTournament.swissPlayoffStarted ?? false;

    // Swiss detail view
    if (isSwiss) {
      return (
        <div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-6xl">
          <button
            onClick={() => { setSelectedTournament(null); setSwapSelect(null); }}
            className="flex items-center gap-1 text-light-300 hover:text-light-100 text-sm mb-4 transition-colors"
          >
            &larr; Back to Tournaments
          </button>

          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{selectedTournament.name}</h1>
              <p className="text-light-300 text-sm mt-1">
                Swiss · {selectedTournament.format === "singles" ? "Singles (1v1)" : "Doubles (2v2)"}
                {" · "}
                {swissParticipantIds.length} {selectedTournament.format === "doubles" ? "teams" : "players"}
                {" · "}
                {swissRoundCount} rounds
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isCompleted
                  ? "bg-success/10 text-success"
                  : "bg-accent/10 text-accent"
              }`}
            >
              {isCompleted ? "Completed" : playoffStarted ? "Playoffs" : `Round ${swissRounds.length}/${swissRoundCount}`}
            </span>
          </div>

          {/* Winner */}
          {winnerName && (
            <div className="bg-success/5 border border-success/20 rounded-2xl p-4 mb-6 flex items-center gap-3">
              <FiAward className="text-success" size={24} />
              <div>
                <p className="text-success text-sm font-semibold">Tournament Winner</p>
                <p className="text-light-100 font-bold">{winnerName}</p>
              </div>
            </div>
          )}

          {/* Playoff bracket (if started) */}
          {playoffStarted && selectedTournament.matches.length > 0 && (
            <div className="bg-secondary rounded-2xl border border-dark-100 p-4 mb-6">
              <h2 className="text-sm font-semibold text-light-100 mb-3 flex items-center gap-2">
                <FiGrid size={14} />
                Playoff Bracket
              </h2>
              <BracketView
                matches={selectedTournament.matches}
                playerMap={playerMap}
                teams={selectedTournament.teams}
                onMatchClick={!isCompleted ? (m) => {
                  if (m.status === "ready") {
                    setResolveMatch(m);
                    setResolveWinner("");
                    setResolveScoreA("");
                    setResolveScoreB("");
                  }
                } : undefined}
              />
            </div>
          )}

          {/* Standings */}
          <div className="bg-secondary rounded-2xl border border-dark-100 p-4 mb-6">
            <h2 className="text-sm font-semibold text-light-100 mb-3 flex items-center gap-2">
              <FiList size={14} />
              Standings
            </h2>
            <SwissStandingsTable
              standings={swissStandings}
              playerMap={playerMap}
              teams={selectedTournament.teams}
            />
          </div>

          {/* Current round pairings */}
          {currentSwissRound && !playoffStarted && (
            <div className="bg-secondary rounded-2xl border border-dark-100 p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-light-100">
                  Round {currentSwissRound.roundNumber}
                  {currentRoundComplete && <span className="text-success ml-2 text-xs font-normal">Complete</span>}
                </h2>
              </div>
              <div className="space-y-2">
                {currentSwissRound.pairings.map((pairing) => {
                  const nameA = getParticipantName(pairing.participantA, selectedTournament);
                  const nameB = pairing.isBye ? "BYE" : pairing.participantB ? getParticipantName(pairing.participantB, selectedTournament) : "?";
                  const isResolved = !!pairing.winner;

                  return (
                    <div
                      key={pairing.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors ${
                        isResolved
                          ? "bg-success/5 border-success/20"
                          : pairing.isBye
                            ? "bg-info/5 border-info/20"
                            : "border-dark-100 hover:border-accent cursor-pointer"
                      }`}
                      onClick={() => {
                        if (!isResolved && !pairing.isBye) {
                          setSwissResolveMatch(pairing);
                          setSwissWinner("");
                          setSwissScoreA("");
                          setSwissScoreB("");
                        }
                      }}
                      role={!isResolved && !pairing.isBye ? "button" : undefined}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm truncate ${isResolved && pairing.winner === pairing.participantA ? "text-success font-semibold" : "text-light-100"}`}>
                            {nameA}
                          </span>
                          {isResolved && pairing.scoreA != null && (
                            <span className={`text-xs tabular-nums ${pairing.winner === pairing.participantA ? "text-success font-bold" : "text-light-300"}`}>
                              {pairing.scoreA}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-accent font-semibold shrink-0">
                        {pairing.isBye ? "BYE" : "vs"}
                      </span>
                      <div className="flex-1 min-w-0 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          {isResolved && pairing.scoreB != null && (
                            <span className={`text-xs tabular-nums ${pairing.winner === pairing.participantB ? "text-success font-bold" : "text-light-300"}`}>
                              {pairing.scoreB}
                            </span>
                          )}
                          <span className={`text-sm truncate ${isResolved && pairing.winner === pairing.participantB ? "text-success font-semibold" : pairing.isBye ? "text-light-300 italic" : "text-light-100"}`}>
                            {nameB}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              {currentRoundComplete && !swissComplete && (
                <button
                  onClick={handleSwissNextRound}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-accent text-primary hover:bg-accent/80 transition-colors"
                >
                  <FiPlay size={14} />
                  Generate Round {currentSwissRound.roundNumber + 1}
                </button>
              )}

              {swissComplete && !playoffStarted && (
                <button
                  onClick={handleSwissStartPlayoffs}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-success text-primary hover:bg-success/80 transition-colors"
                >
                  <FiAward size={14} />
                  Start Playoffs (Top 4)
                </button>
              )}
            </div>
          )}

          {/* Previous rounds (collapsed) */}
          {swissRounds.length > 1 && (
            <div className="bg-secondary rounded-2xl border border-dark-100 p-4">
              <h2 className="text-sm font-semibold text-light-100 mb-3">Previous Rounds</h2>
              <div className="space-y-4">
                {swissRounds.slice(0, -1).map((round) => (
                  <div key={round.roundNumber}>
                    <h3 className="text-xs font-medium text-light-300 mb-2">Round {round.roundNumber}</h3>
                    <div className="space-y-1">
                      {round.pairings.map((pairing) => {
                        const nameA = getParticipantName(pairing.participantA, selectedTournament);
                        const nameB = pairing.isBye ? "BYE" : pairing.participantB ? getParticipantName(pairing.participantB, selectedTournament) : "?";
                        return (
                          <div key={pairing.id} className="flex items-center gap-2 px-2 py-1 text-xs">
                            <span className={pairing.winner === pairing.participantA ? "text-success font-medium" : "text-light-200"}>
                              {nameA}
                            </span>
                            {pairing.scoreA != null && <span className="text-light-300 tabular-nums">{pairing.scoreA}</span>}
                            <span className="text-light-300">-</span>
                            {pairing.scoreB != null && <span className="text-light-300 tabular-nums">{pairing.scoreB}</span>}
                            <span className={pairing.winner === pairing.participantB ? "text-success font-medium" : pairing.isBye ? "text-light-300 italic" : "text-light-200"}>
                              {nameB}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Swiss Resolve Match Modal */}
          <Modal
            open={!!swissResolveMatch}
            onClose={() => setSwissResolveMatch(null)}
            title="Match Result"
          >
            {swissResolveMatch && (
              <div className="space-y-4">
                <p className="text-light-300 text-sm">Select the winner and enter scores:</p>
                <div className="space-y-2">
                  {[swissResolveMatch.participantA, swissResolveMatch.participantB].filter(Boolean).map((pid) => (
                    <button
                      key={pid}
                      onClick={() => setSwissWinner(pid!)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        swissWinner === pid
                          ? "border-accent bg-accent/10"
                          : "border-dark-100 hover:border-dark-200"
                      }`}
                    >
                      {selectedTournament.teams?.[pid!] ? (
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1">
                            {selectedTournament.teams[pid!].map((tpid) => {
                              const p = playerMap.get(tpid);
                              return p ? <PlayerAvatar key={tpid} player={p} size="sm" /> : null;
                            })}
                          </div>
                          <span className="text-sm font-medium text-light-100">
                            {getParticipantName(pid!, selectedTournament)}
                          </span>
                        </div>
                      ) : (
                        <>
                          {playerMap.get(pid!) && (
                            <PlayerAvatar player={playerMap.get(pid!)!} size="sm" />
                          )}
                          <span className="text-sm font-medium text-light-100">
                            {getParticipantName(pid!, selectedTournament)}
                          </span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-light-300 mb-1 block">
                      {getParticipantName(swissResolveMatch.participantA, selectedTournament)} Score
                    </label>
                    <input
                      type="number"
                      value={swissScoreA}
                      onChange={(e) => setSwissScoreA(e.target.value)}
                      className="w-full bg-primary border border-dark-100 rounded-xl px-3 py-2 text-sm text-light-100"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-light-300 mb-1 block">
                      {swissResolveMatch.participantB
                        ? getParticipantName(swissResolveMatch.participantB, selectedTournament)
                        : "Opponent"} Score
                    </label>
                    <input
                      type="number"
                      value={swissScoreB}
                      onChange={(e) => setSwissScoreB(e.target.value)}
                      className="w-full bg-primary border border-dark-100 rounded-xl px-3 py-2 text-sm text-light-100"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setSwissResolveMatch(null)}
                    className="px-4 py-2 rounded-xl text-sm text-light-300 hover:bg-dark-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSwissRecordResult}
                    disabled={!swissWinner}
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-accent text-primary hover:bg-accent/80 disabled:opacity-50"
                  >
                    Confirm Result
                  </button>
                </div>
              </div>
            )}
          </Modal>

          {/* Bracket Resolve Match Modal (for playoffs) */}
          <Modal
            open={!!resolveMatch}
            onClose={() => setResolveMatch(null)}
            title="Playoff Match Result"
          >
            {resolveMatch && (
              <div className="space-y-4">
                <p className="text-light-300 text-sm">Select the winner:</p>
                <div className="space-y-2">
                  {resolveParticipants.map((participant) => (
                    <button
                      key={participant.id}
                      onClick={() => setResolveWinner(participant.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                        resolveWinner === participant.id
                          ? "border-accent bg-accent/10"
                          : "border-dark-100 hover:border-dark-200"
                      }`}
                    >
                      {participant.teamPlayerIds ? (
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1">
                            {participant.teamPlayerIds.map((pid) => {
                              const p = playerMap.get(pid);
                              return p ? <PlayerAvatar key={pid} player={p} size="sm" /> : null;
                            })}
                          </div>
                          <span className="text-sm font-medium text-light-100">{participant.label}</span>
                        </div>
                      ) : (
                        <>
                          {playerMap.get(participant.id) && (
                            <PlayerAvatar player={playerMap.get(participant.id)!} size="sm" />
                          )}
                          <span className="text-sm font-medium text-light-100">{participant.label}</span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-light-300 mb-1 block">
                      {resolveParticipants[0]?.label ?? "Player A"} Score
                    </label>
                    <input
                      type="number"
                      value={resolveScoreA}
                      onChange={(e) => setResolveScoreA(e.target.value)}
                      className="w-full bg-primary border border-dark-100 rounded-xl px-3 py-2 text-sm text-light-100"
                      placeholder="Optional"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-light-300 mb-1 block">
                      {resolveParticipants[1]?.label ?? "Player B"} Score
                    </label>
                    <input
                      type="number"
                      value={resolveScoreB}
                      onChange={(e) => setResolveScoreB(e.target.value)}
                      className="w-full bg-primary border border-dark-100 rounded-xl px-3 py-2 text-sm text-light-100"
                      placeholder="Optional"
                      min="0"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setResolveMatch(null)}
                    className="px-4 py-2 rounded-xl text-sm text-light-300 hover:bg-dark-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResolveMatch}
                    disabled={!resolveWinner}
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-accent text-primary hover:bg-accent/80 disabled:opacity-50"
                  >
                    Confirm Result
                  </button>
                </div>
              </div>
            )}
          </Modal>
        </div>
      );
    }

    // Bracket detail view
    return (
      <div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-6xl">
        <button
          onClick={() => { setSelectedTournament(null); setSwapSelect(null); }}
          className="flex items-center gap-1 text-light-300 hover:text-light-100 text-sm mb-4 transition-colors"
        >
          &larr; Back to Tournaments
        </button>

        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{selectedTournament.name}</h1>
            <p className="text-light-300 text-sm mt-1">
              {selectedTournament.format === "singles" ? "Singles (1v1)" : "Doubles (2v2)"}
              {" · "}
              {selectedTournament.seeds.length} {selectedTournament.format === "doubles" ? "teams" : "players"}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isCompleted
                ? "bg-success/10 text-success"
                : isSetup
                  ? "bg-info/10 text-info"
                  : "bg-accent/10 text-accent"
            }`}
          >
            {isCompleted ? "Completed" : isSetup ? "Setup" : "In Progress"}
          </span>
        </div>

        {/* Setup banner + actions */}
        {isSetup && (
          <div className="bg-info/5 border border-info/20 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3 mb-3">
              <FiLock className="text-info mt-0.5" size={18} />
              <div className="flex-1">
                <p className="text-info text-sm font-semibold">Setup Mode</p>
                <p className="text-light-300 text-xs mt-0.5">
                  Tap two {selectedTournament.format === "doubles" ? "teams" : "players"} in Round 1 to swap their positions. When ready, start the tournament to lock the bracket.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShuffle}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-dark-100 text-light-300 hover:text-light-100 hover:bg-dark-200 transition-colors"
              >
                <FiShuffle size={13} />
                Shuffle
              </button>
              <button
                onClick={handleStartTournament}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-accent text-primary hover:bg-accent/80 transition-colors ml-auto"
              >
                <FiPlay size={13} />
                Start Tournament
              </button>
            </div>
          </div>
        )}

        {/* Winner */}
        {winnerName && (
          <div className="bg-success/5 border border-success/20 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <FiAward className="text-success" size={24} />
            <div>
              <p className="text-success text-sm font-semibold">Tournament Winner</p>
              <p className="text-light-100 font-bold">{winnerName}</p>
            </div>
          </div>
        )}

        {/* Bracket */}
        <div className="bg-secondary rounded-2xl border border-dark-100 p-4">
          <BracketView
            matches={selectedTournament.matches}
            playerMap={playerMap}
            teams={selectedTournament.teams}
            editable={isSetup}
            selectedParticipant={isSetup ? swapSelect : undefined}
            onParticipantClick={isSetup ? handleParticipantClick : undefined}
            onMatchClick={isInProgress ? (m) => {
              if (m.status === "ready") {
                setResolveMatch(m);
                setResolveWinner("");
                setResolveScoreA("");
                setResolveScoreB("");
              }
            } : undefined}
          />
        </div>

        {/* Resolve Match Modal */}
        <Modal
          open={!!resolveMatch}
          onClose={() => setResolveMatch(null)}
          title="Match Result"
        >
          {resolveMatch && (
            <div className="space-y-4">
              <p className="text-light-300 text-sm">Select the winner:</p>
              <div className="space-y-2">
                {resolveParticipants.map((participant) => (
                  <button
                    key={participant.id}
                    onClick={() => setResolveWinner(participant.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                      resolveWinner === participant.id
                        ? "border-accent bg-accent/10"
                        : "border-dark-100 hover:border-dark-200"
                    }`}
                  >
                    {participant.teamPlayerIds ? (
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1">
                          {participant.teamPlayerIds.map((pid) => {
                            const p = playerMap.get(pid);
                            return p ? <PlayerAvatar key={pid} player={p} size="sm" /> : null;
                          })}
                        </div>
                        <span className="text-sm font-medium text-light-100">{participant.label}</span>
                      </div>
                    ) : (
                      <>
                        {playerMap.get(participant.id) && (
                          <PlayerAvatar player={playerMap.get(participant.id)!} size="sm" />
                        )}
                        <span className="text-sm font-medium text-light-100">{participant.label}</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-light-300 mb-1 block">
                    {resolveParticipants[0]?.label ?? "Player A"} Score
                  </label>
                  <input
                    type="number"
                    value={resolveScoreA}
                    onChange={(e) => setResolveScoreA(e.target.value)}
                    className="w-full bg-primary border border-dark-100 rounded-xl px-3 py-2 text-sm text-light-100"
                    placeholder="Optional"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-light-300 mb-1 block">
                    {resolveParticipants[1]?.label ?? "Player B"} Score
                  </label>
                  <input
                    type="number"
                    value={resolveScoreB}
                    onChange={(e) => setResolveScoreB(e.target.value)}
                    className="w-full bg-primary border border-dark-100 rounded-xl px-3 py-2 text-sm text-light-100"
                    placeholder="Optional"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setResolveMatch(null)}
                  className="px-4 py-2 rounded-xl text-sm text-light-300 hover:bg-dark-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolveMatch}
                  disabled={!resolveWinner}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-accent text-primary hover:bg-accent/80 disabled:opacity-50"
                >
                  Confirm Result
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    );
  }

  // List view
  return (
    <div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-6xl">
      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        title="Delete Tournament"
        message="Are you sure? This cannot be undone."
        confirmLabel="Delete"
        danger
      />

      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Tournament</h1>
          <p className="text-light-300 text-sm mt-1">Bracket & Swiss format tournaments</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-accent text-primary font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-accent/80 transition-colors"
        >
          <FiPlus size={16} />
          New
        </button>
      </div>

      {/* Tournament List */}
      {tournaments.length > 0 ? (
        <div className="space-y-3">
          {tournaments.map((t) => {
            const winnerLabel = t.winnerId ? getParticipantName(t.winnerId, t) : null;
            return (
              <div
                key={t.id}
                className="bg-secondary rounded-2xl border border-dark-100 p-4 flex items-center gap-4 hover:border-dark-200 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    t.status === "completed" ? "bg-success/10" : t.status === "setup" ? "bg-info/10" : "bg-accent/10"
                  }`}
                >
                  <FiTarget
                    size={18}
                    className={t.status === "completed" ? "text-success" : t.status === "setup" ? "text-info" : "text-accent"}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-light-100 font-semibold text-sm truncate">{t.name}</h3>
                  <p className="text-light-300 text-xs">
                    {t.type === "swiss" ? "Swiss" : "Bracket"}
                    {" · "}
                    {t.format === "singles" ? "Singles" : "Doubles"}
                    {" · "}
                    {t.seeds.length} {t.format === "doubles" ? "teams" : "players"}
                    {t.status === "setup" && (
                      <span className="text-info"> · Setup</span>
                    )}
                    {winnerLabel && (
                      <>
                        {" · Winner: "}
                        <span className="text-success">{winnerLabel}</span>
                      </>
                    )}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm(t.id);
                  }}
                  className="text-light-300 hover:text-danger p-2 transition-colors"
                >
                  <FiTrash2 size={16} />
                </button>
                <button
                  onClick={() => setSelectedTournament(t)}
                  className="text-light-300 hover:text-accent p-2 transition-colors"
                >
                  <FiChevronRight size={18} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-secondary rounded-2xl border border-dark-100 py-16 text-center">
          <FiTarget className="text-light-300/40 mx-auto mb-3" size={40} />
          <p className="text-light-300 text-sm">No tournaments yet</p>
          <p className="text-light-300/60 text-xs mt-0.5">Create one to get started</p>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        open={showCreate}
        onClose={() => { setShowCreate(false); resetCreateForm(); }}
        title="New Tournament"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs text-light-300 mb-1 block">Tournament Name</label>
            <input
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              className="w-full bg-primary border border-dark-100 rounded-xl px-3 py-2 text-sm text-light-100"
              placeholder="e.g. Friday Night Tournament"
            />
          </div>

          <div>
            <label className="text-xs text-light-300 mb-1 block">Tournament Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(["bracket", "swiss"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setCreateType(type)}
                  className={`px-3 py-2 rounded-xl text-sm border transition-colors ${
                    createType === type
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-dark-100 text-light-300 hover:border-dark-200"
                  }`}
                >
                  {type === "bracket" ? "Elimination" : "Swiss System"}
                </button>
              ))}
            </div>
            {createType === "swiss" && (
              <p className="text-[10px] text-light-300 mt-1.5">
                All teams play multiple rounds. Top 4 advance to playoffs.
              </p>
            )}
          </div>

          <div>
            <label className="text-xs text-light-300 mb-1 block">Format</label>
            <div className="grid grid-cols-2 gap-2">
              {(["singles", "doubles"] as const).map((format) => (
                <button
                  key={format}
                  onClick={() => setCreateFormat(format)}
                  className={`px-3 py-2 rounded-xl text-sm border transition-colors ${
                    createFormat === format
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-dark-100 text-light-300 hover:border-dark-200"
                  }`}
                >
                  {format === "singles" ? "Singles (1v1)" : "Doubles (2v2)"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-light-300 mb-2 block">
              Select Players ({createPlayerIds.size} selected
              {createFormat === "singles"
                ? ", min 2"
                : createPlayerIds.size % 2 !== 0
                  ? ", need even number"
                  : `, ${Math.floor(createPlayerIds.size / 2)} teams`}
              )
            </label>
            <div className="max-h-48 overflow-y-auto space-y-1 bg-primary rounded-xl border border-dark-100 p-2">
              {activePlayers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => togglePlayer(p.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    createPlayerIds.has(p.id)
                      ? "bg-accent/10 text-accent"
                      : "text-light-200 hover:bg-dark-200"
                  }`}
                >
                  <PlayerAvatar player={p} size="sm" />
                  <span className="truncate">{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Swiss info */}
          {createType === "swiss" && createPlayerIds.size >= 3 && (
            <div className="bg-info/5 border border-info/20 rounded-xl p-3">
              <p className="text-xs text-light-200">
                <span className="font-medium text-info">Swiss System:</span>
                {" "}
                {createFormat === "doubles"
                  ? `${Math.floor(createPlayerIds.size / 2)} teams`
                  : `${createPlayerIds.size} players`}
                {" · "}
                {getSwissRoundCount(
                  createFormat === "doubles"
                    ? Math.floor(createPlayerIds.size / 2)
                    : createPlayerIds.size
                )} rounds + Top 4 playoffs
              </p>
            </div>
          )}

          {/* Match Pairing (bracket only) */}
          {createType === "bracket" && ((createFormat === "singles" && createPlayerIds.size >= 2) ||
            (createFormat === "doubles" && createPlayerIds.size >= 4)) && (
            <div>
              <label className="text-xs text-light-300 mb-2 block flex items-center gap-1.5">
                <FiTarget size={12} />
                Match Pairing
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() => { setMatchPairingMode("auto"); setManualMatchups([]); setMatchPickFirst(null); setManualDoublesMatches([]); setDoublesPickBuffer([]); }}
                  className={`px-3 py-1.5 rounded-xl text-xs border transition-colors ${
                    matchPairingMode === "auto"
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-dark-100 text-light-300 hover:border-dark-200"
                  }`}
                >
                  Auto-balanced
                </button>
                <button
                  onClick={() => { setMatchPairingMode("manual"); setMatchPickFirst(null); setDoublesPickBuffer([]); }}
                  className={`px-3 py-1.5 rounded-xl text-xs border transition-colors ${
                    matchPairingMode === "manual"
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-dark-100 text-light-300 hover:border-dark-200"
                  }`}
                >
                  Manual
                </button>
              </div>

              {/* Auto mode */}
              {matchPairingMode === "auto" && (
                <>
                  <p className="text-[10px] text-light-300 mb-2">
                    {createFormat === "doubles"
                      ? "Teams auto-balanced by skill, matchups seeded by team strength."
                      : "Matchups auto-seeded based on player stats (best vs weakest)."}
                  </p>
                  {/* Auto doubles: show team preview */}
                  {createFormat === "doubles" && previewTeams.length > 0 && (
                    <div className="space-y-2 bg-primary rounded-xl border border-dark-100 p-3">
                      {previewTeams.map((team, idx) => {
                        const p1 = playerMap.get(team.playerIds[0]);
                        const p2 = playerMap.get(team.playerIds[1]);
                        return (
                          <div key={team.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-dark-200/40">
                            <span className="text-xs text-light-300 w-12 shrink-0">Team {idx + 1}</span>
                            <div className="flex items-center gap-1.5">
                              {p1 && <PlayerAvatar player={p1} size="sm" />}
                              <span className="text-xs text-light-100">{p1?.name ?? "?"}</span>
                            </div>
                            <span className="text-xs text-light-300">&</span>
                            <div className="flex items-center gap-1.5">
                              {p2 && <PlayerAvatar player={p2} size="sm" />}
                              <span className="text-xs text-light-100">{p2?.name ?? "?"}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* Manual singles */}
              {matchPairingMode === "manual" && createFormat === "singles" && (
                <div className="space-y-3">
                  {unmatchedSingles.length > 0 && (
                    <div>
                      <p className="text-[10px] text-light-300 mb-1.5">
                        {matchPickFirst
                          ? `Tap an opponent for ${getPlayerName(matchPickFirst)}`
                          : "Tap two players to create a match"}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {unmatchedSingles.map((id) => {
                          const player = playerMap.get(id);
                          return (
                            <button
                              key={id}
                              onClick={() => handleMatchParticipantTap(id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${
                                matchPickFirst === id
                                  ? "border-accent bg-accent/10 text-accent"
                                  : "border-dark-100 text-light-200 hover:border-dark-200"
                              }`}
                            >
                              {player && <PlayerAvatar player={player} size="sm" />}
                              {getPlayerName(id)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {manualMatchups.length > 0 && (
                    <div className="space-y-2 bg-primary rounded-xl border border-dark-100 p-3">
                      {manualMatchups.map(([a, b], idx) => (
                        <div key={idx} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-dark-200/40">
                          <span className="text-xs text-light-300 w-12 shrink-0">Match {idx + 1}</span>
                          <span className="text-xs text-light-100 truncate">{getPlayerName(a)}</span>
                          <span className="text-xs text-accent font-semibold">vs</span>
                          <span className="text-xs text-light-100 truncate">{getPlayerName(b)}</span>
                          <button
                            onClick={() => removeManualMatchup(idx)}
                            className="ml-auto text-light-300 hover:text-danger transition-colors shrink-0"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {unmatchedSingles.length === 1 && manualMatchups.length > 0 && (
                    <p className="text-[10px] text-light-300">
                      {getPlayerName(unmatchedSingles[0])} will get a BYE in Round 1.
                    </p>
                  )}
                  {unmatchedSingles.length === 0 && manualMatchups.length > 0 && (
                    <p className="text-[10px] text-success">All matchups set!</p>
                  )}
                </div>
              )}

              {/* Manual doubles: 4-tap flow */}
              {matchPairingMode === "manual" && createFormat === "doubles" && (
                <div className="space-y-3">
                  {/* Pick buffer indicator */}
                  {doublesPickBuffer.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap bg-accent/5 border border-accent/20 rounded-xl px-3 py-2">
                      <span className="text-[10px] text-light-300 mr-1">Building:</span>
                      <span className="text-xs text-light-100">{getPlayerName(doublesPickBuffer[0])}</span>
                      <span className="text-xs text-light-300">&</span>
                      <span className="text-xs text-light-100">{doublesPickBuffer[1] ? getPlayerName(doublesPickBuffer[1]) : "?"}</span>
                      <span className="text-xs text-accent font-semibold mx-1">vs</span>
                      <span className="text-xs text-light-100">{doublesPickBuffer[2] ? getPlayerName(doublesPickBuffer[2]) : "?"}</span>
                      <span className="text-xs text-light-300">&</span>
                      <span className="text-xs text-light-100">{doublesPickBuffer[3] ? getPlayerName(doublesPickBuffer[3]) : "?"}</span>
                    </div>
                  )}

                  {/* Available players */}
                  {availableDoublesPlayers.length > 0 && (
                    <div>
                      <p className="text-[10px] text-light-300 mb-1.5">
                        {doublesPickBuffer.length === 0 && "Tap 4 players to create a match — first 2 = Team A, next 2 = Team B"}
                        {doublesPickBuffer.length === 1 && "Tap 1 more for Team A"}
                        {doublesPickBuffer.length === 2 && "Team A set — now tap 2 players for Team B"}
                        {doublesPickBuffer.length === 3 && "Tap 1 more to complete the match"}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {availableDoublesPlayers.map((p) => {
                          const inBuffer = doublesPickBuffer.includes(p.id);
                          return (
                            <button
                              key={p.id}
                              onClick={() => handleDoublesPlayerTap(p.id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${
                                inBuffer
                                  ? "border-accent bg-accent/10 text-accent"
                                  : "border-dark-100 text-light-200 hover:border-dark-200"
                              }`}
                            >
                              <PlayerAvatar player={p} size="sm" />
                              {p.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Formed matches */}
                  {manualDoublesMatches.length > 0 && (
                    <div className="space-y-2 bg-primary rounded-xl border border-dark-100 p-3">
                      {manualDoublesMatches.map((dm, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-dark-200/40">
                          <span className="text-xs text-light-300 w-12 shrink-0">Match {idx + 1}</span>
                          <span className="text-xs text-light-100 truncate">
                            {dm.teamA.map(getPlayerName).join(" & ")}
                          </span>
                          <span className="text-xs text-accent font-semibold">vs</span>
                          <span className="text-xs text-light-100 truncate">
                            {dm.teamB.map(getPlayerName).join(" & ")}
                          </span>
                          <button
                            onClick={() => removeDoublesMatch(idx)}
                            className="ml-auto text-light-300 hover:text-danger transition-colors shrink-0"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {availableDoublesPlayers.length === 0 && doublesPickBuffer.length === 0 && manualDoublesMatches.length > 0 && (
                    <p className="text-[10px] text-success">All matchups set!</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => { setShowCreate(false); resetCreateForm(); }}
              className="px-4 py-2 rounded-xl text-sm text-light-300 hover:bg-dark-200"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!canCreate}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-accent text-primary hover:bg-accent/80 disabled:opacity-50"
            >
              Create Tournament
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
