"use client";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ExportScheduleModal } from "@/components/ExportScheduleModal";
import { ManualSelectModal } from "@/components/ManualSelectModal";
import { Modal } from "@/components/Modal";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { PlayerLevelBadge } from "@/components/PlayerLevelBadge";
import { useAuth } from "@/contexts/AuthContext";
import { computeBalanceScore, generateAutoDrafts } from "@badminton/core";
import {
  addDraft,
  addDraftsBatch,
  clearDrafts,
  clearDraftsError,
  finishDraft,
  incrementPlayersGameCount,
  incrementPlayersTrophies,
  removeDraft,
  resetAllGameCounts,
  setDrafts,
  updateDraftCourt,
  updateDraftPlayers,
  useAppDispatch,
  useAppSelector,
} from "@badminton/store";
import { PlayerLevel, type Draft, type Player } from "@badminton/types";
import { playerLevelConfig } from "@badminton/ui-shared";
import { useRef, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiCheck,
  FiCornerUpLeft,
  FiCornerUpRight,
  FiEdit2,
  FiMoreVertical,
  FiPlus,
  FiRotateCcw,
  FiShare2,
  FiTrash2,
  FiX,
  FiZap,
} from "react-icons/fi";
import { RiDraftLine } from "react-icons/ri";
import { v4 as uuidv4 } from "uuid";

export default function DraftPage() {
  const { isAdmin, user } = useAuth();
  const dispatch = useAppDispatch();
  const drafts = useAppSelector((state) => state.drafts.items);
  const draftsError = useAppSelector((state) => state.drafts.error);
  const players = useAppSelector((state) => state.players.items);
  const courts = useAppSelector((state) => state.courts.items);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Draft | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showAutoDraftConfirm, setShowAutoDraftConfirm] = useState(false);
  const [draftCount, setDraftCount] = useState(30);
  const [shuffleMode, setShuffleMode] = useState<
    "balanced" | "random" | "skill-match"
  >("balanced");
  const [selectedLevels, setSelectedLevels] = useState<Set<PlayerLevel>>(
    new Set([
      PlayerLevel.BEGINNER,
      PlayerLevel.INTERMEDIATE,
      PlayerLevel.ADVANCED,
      PlayerLevel.PRO,
    ]),
  );
  const [finishTarget, setFinishTarget] = useState<Draft | null>(null);
  const [showNoCourts, setShowNoCourts] = useState(false);
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  // Undo/Redo stacks
  const undoStack = useRef<Draft[][]>([]);
  const redoStack = useRef<Draft[][]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Player edit sub-modes (Replace / Exchange)
  const [changeTarget, setChangeTarget] = useState<{
    draft: Draft;
    playerIndex: number;
  } | null>(null);
  const [replaceSearch, setReplaceSearch] = useState("");
  const [replaceSort, setReplaceSort] = useState<"name" | "level">("name");
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Confirmation-aware player filtering
  const confirmation = useAppSelector((state) => state.confirmation);
  const isConfirmationActive = confirmation.meta.enabled;

  const draftablePlayers = useMemo(() => {
    const activePlayers = players.filter((p) => p.active ?? true);
    if (!isConfirmationActive) return activePlayers;
    const confirmedIds = new Set(
      confirmation.playerConfirmations
        .filter((pc) => pc.status === "confirmed")
        .map((pc) => pc.playerId),
    );
    return activePlayers.filter((p) => confirmedIds.has(p.id));
  }, [players, isConfirmationActive, confirmation.playerConfirmations]);

  const playerMap = useMemo(
    () => new Map(players.map((p) => [p.id, p])),
    [players],
  );

  const playerDraftCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const draft of drafts) {
      if (draft.finished) continue;
      for (const pid of draft.playerIds) {
        counts.set(pid, (counts.get(pid) ?? 0) + 1);
      }
    }
    return counts;
  }, [drafts]);

  function resolvePlayer(id: string): Player | undefined {
    return playerMap.get(id);
  }

  function pushUndo() {
    undoStack.current.push([...drafts]);
    redoStack.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }

  function handleUndo() {
    if (undoStack.current.length === 0) return;
    const prev = undoStack.current.pop()!;
    redoStack.current.push([...drafts]);
    dispatch(setDrafts(prev));
    setCanUndo(undoStack.current.length > 0);
    setCanRedo(true);
  }

  function handleRedo() {
    if (redoStack.current.length === 0) return;
    const next = redoStack.current.pop()!;
    undoStack.current.push([...drafts]);
    dispatch(setDrafts(next));
    setCanUndo(true);
    setCanRedo(redoStack.current.length > 0);
  }

  function handleCreateDraft(selectedIds: string[]) {
    if (selectedIds.length !== 4) return;
    pushUndo();
    dispatch(addDraft({ id: uuidv4(), playerIds: selectedIds }));
  }

  function handleFinish(winner: "A" | "B") {
    if (!finishTarget || finishTarget.finished) return;
    const half = Math.ceil(finishTarget.playerIds.length / 2);
    const winnerIds =
      winner === "A"
        ? finishTarget.playerIds.slice(0, half)
        : finishTarget.playerIds.slice(half);
    pushUndo();
    dispatch(incrementPlayersGameCount(finishTarget.playerIds));
    dispatch(incrementPlayersTrophies(winnerIds));
    const numA = parseInt(scoreA, 10);
    const numB = parseInt(scoreB, 10);
    dispatch(
      finishDraft({
        id: finishTarget.id,
        winner,
        scoreA: !isNaN(numA) ? numA : undefined,
        scoreB: !isNaN(numB) ? numB : undefined,
      }),
    );
    setFinishTarget(null);
    setScoreA("");
    setScoreB("");
  }

  function handleDelete() {
    if (!deleteTarget) return;
    pushUndo();
    dispatch(removeDraft(deleteTarget.id));
    setDeleteTarget(null);
  }

  function handleChangePlayer(selectedIds: string[]) {
    if (!changeTarget || selectedIds.length !== 1) return;
    const newPlayerIds = [...changeTarget.draft.playerIds];
    newPlayerIds[changeTarget.playerIndex] = selectedIds[0];
    dispatch(
      updateDraftPlayers({
        id: changeTarget.draft.id,
        playerIds: newPlayerIds,
      }),
    );
    // Update editingDraft to reflect the change in the modal
    if (editingDraft && editingDraft.id === changeTarget.draft.id) {
      setEditingDraft({ ...editingDraft, playerIds: newPlayerIds });
    }
    setChangeTarget(null);
  }

  function handleAutoDraft() {
    // Exclude players from the latest round/set so they aren't re-drafted immediately
    const latestRoundPlayerIds = new Set<string>();
    if (drafts.length > 0) {
      const cc = Math.max(courts.length, 1);
      const lastRoundStart = Math.floor((drafts.length - 1) / cc) * cc;
      for (let i = lastRoundStart; i < drafts.length; i++) {
        for (const pid of drafts[i].playerIds) {
          latestRoundPlayerIds.add(pid);
        }
      }
    }

    const eligible = draftablePlayers.filter((p) => !latestRoundPlayerIds.has(p.id));
    const playerIds = eligible.map((p) => p.id);
    const playerLevels = new Map(
      eligible.map((p) => [p.id, p.level]),
    );
    const courtSpecs = courts.map((c) => ({ id: c.id, isSingle: c.isSingle }));

    const result = generateAutoDrafts({
      mode: shuffleMode,
      draftCount,
      playerIds,
      playerLevels,
      courts: courtSpecs,
      existingDrafts: drafts,
      existingDraftCount: drafts.length,
      selectedLevels:
        shuffleMode === "skill-match" ? selectedLevels : undefined,
      idGenerator: uuidv4,
    });

    if (result.drafts.length > 0) {
      pushUndo();
      dispatch(addDraftsBatch(result.drafts));
    }
    setShowAutoDraftConfirm(false);
  }

  // Group drafts into rounds based on court count
  const courtCount = Math.max(courts.length, 1);
  const rounds = useMemo(() => {
    const r: Draft[][] = [];
    for (let i = 0; i < drafts.length; i += courtCount) {
      r.push(drafts.slice(i, i + courtCount));
    }
    return r;
  }, [drafts, courtCount]);

  // Track matchup frequency for repetition warnings
  const comboFrequency = useMemo(() => {
    const freq = new Map<string, number>();
    for (const d of drafts) {
      const key = [...d.playerIds].sort().join(",");
      freq.set(key, (freq.get(key) ?? 0) + 1);
    }
    return freq;
  }, [drafts]);

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-5xl">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-primary/95 backdrop-blur-sm -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-3 mb-3 flex items-start sm:items-center justify-between gap-3 border-b border-dark-100/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <RiDraftLine className="text-accent" size={20} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Draft</h1>
            {drafts.length > 0 && (
              <span className="text-sm text-light-300 mt-0.5">
                {drafts.length} matches
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-end">
          {canUndo && (
            <button
              onClick={handleUndo}
              className="flex items-center gap-1.5 p-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm text-light-300 border border-dark-100 hover:bg-dark-200 transition-colors"
              title="Undo"
            >
              <FiCornerUpLeft size={14} />
              <span className="hidden sm:inline">Undo</span>
            </button>
          )}
          {canRedo && (
            <button
              onClick={handleRedo}
              className="flex items-center gap-1.5 p-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm text-light-300 border border-dark-100 hover:bg-dark-200 transition-colors"
              title="Redo"
            >
              <FiCornerUpRight size={14} />
              <span className="hidden sm:inline">Redo</span>
            </button>
          )}
          {drafts.length > 0 && (
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 p-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm text-light-300 border border-dark-100 hover:bg-dark-200 transition-colors"
              title="Export"
            >
              <FiShare2 size={14} />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
          {isAdmin && (drafts.length > 0 || players.length > 0) && (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 p-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm text-danger border border-danger/30 hover:bg-danger/10 transition-colors"
              title="Reset"
            >
              <FiRotateCcw size={14} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
          {isAdmin && (
          <button
            onClick={() =>
              courts.length === 0
                ? setShowNoCourts(true)
                : setShowAutoDraftConfirm(true)
            }
            disabled={draftablePlayers.length < 4}
            className="flex items-center gap-1.5 p-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm bg-accent/20 text-accent font-semibold hover:bg-accent/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Auto Draft"
          >
            <FiZap size={14} />
            <span className="hidden sm:inline">Auto Draft</span>
          </button>
          )}
          {isAdmin && (
          <button
            onClick={() =>
              courts.length === 0
                ? setShowNoCourts(true)
                : setShowSelectModal(true)
            }
            disabled={draftablePlayers.length < 4}
            className="flex items-center gap-1.5 p-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm bg-accent text-primary font-semibold hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="New Draft"
          >
            <FiPlus size={14} />
            <span className="hidden sm:inline">New Draft</span>
          </button>
          )}
        </div>
      </div>

      {/* Error */}
      {draftsError && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
          <FiAlertCircle size={16} className="shrink-0" />
          <span className="flex-1 text-sm">{draftsError}</span>
          <button
            onClick={() => dispatch(clearDraftsError())}
            className="text-danger/60 hover:text-danger transition-colors"
          >
            <FiX size={16} />
          </button>
        </div>
      )}

      {/* Confirmed Players Info */}
      {isConfirmationActive && (
        <div className="bg-success/10 border border-success/30 text-success rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
          <FiCheck size={16} className="shrink-0" />
          <span className="text-sm">
            RSVP active — {draftablePlayers.length} confirmed{" "}
            {draftablePlayers.length === 1 ? "player" : "players"} available for
            drafting
          </span>
        </div>
      )}

      {/* Schedule */}
      {drafts.length > 0 ? (
        <div className="bg-secondary rounded-2xl border border-dark-100 overflow-hidden">
          {/* Desktop Table Header */}
          <div className="hidden sm:grid grid-cols-[60px_110px_1fr_116px] text-xs font-semibold text-light-300 uppercase tracking-wider border-b border-dark-100 px-4 py-3">
            <span>#</span>
            <span>Court</span>
            <span className="text-center">Matchup</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Rounds */}
          {rounds.map((round, roundIndex) => (
            <div key={roundIndex}>
              {roundIndex > 0 && (
                <div className="flex items-center gap-3 px-4 py-1.5 bg-dark-200/30">
                  <div className="flex-1 h-px bg-accent/20" />
                  <span className="text-[10px] font-semibold text-accent/50 uppercase tracking-widest">
                    Set {roundIndex + 1}
                  </span>
                  <div className="flex-1 h-px bg-accent/20" />
                </div>
              )}
              {round.map((draft, indexInRound) => {
                const matchNumber = roundIndex * courtCount + indexInRound + 1;
                const half = Math.ceil(draft.playerIds.length / 2);
                const teamA = draft.playerIds
                  .slice(0, half)
                  .map(resolvePlayer)
                  .filter((p): p is Player => p !== undefined);
                const teamB = draft.playerIds
                  .slice(half)
                  .map(resolvePlayer)
                  .filter((p): p is Player => p !== undefined);

                // Balance score for non-finished drafts
                const balanceScore =
                  !draft.finished && teamA.length > 0 && teamB.length > 0
                    ? computeBalanceScore(teamA, teamB)
                    : null;
                const balanceColor =
                  balanceScore !== null
                    ? balanceScore >= 80
                      ? "text-green-400 bg-green-400/10"
                      : balanceScore >= 50
                        ? "text-yellow-400 bg-yellow-400/10"
                        : "text-red-400 bg-red-400/10"
                    : "";

                // Matchup repetition detection
                const comboKey = [...draft.playerIds].sort().join(",");
                const isRepeated = (comboFrequency.get(comboKey) ?? 0) > 1;

                const courtSelect = (
                  <select
                    value={draft.courtId ?? ""}
                    disabled={draft.finished}
                    onChange={(e) =>
                      dispatch(
                        updateDraftCourt({
                          id: draft.id,
                          courtId: e.target.value || undefined,
                        }),
                      )
                    }
                    className={`bg-dark-200 border border-dark-100 rounded-lg px-2 py-1.5 text-xs text-light-100 outline-none focus:border-accent/50 transition-colors ${draft.finished ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-light-300/30"}`}
                  >
                    <option value="">--</option>
                    {courts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                );

                const actions = (
                  <div className="flex gap-1">
                    {draft.finished ? (
                      <span className="text-[10px] sm:text-xs font-bold text-accent uppercase tracking-wide">
                        Finished
                      </span>
                    ) : (
                      <>
                        {isAdmin && (
                        <button
                          onClick={() => setFinishTarget(draft)}
                          className="p-1.5 rounded-lg text-light-300 hover:text-green-400 hover:bg-green-400/10 transition-colors"
                          title="Finish match"
                        >
                          <FiCheck size={14} />
                        </button>
                        )}
                        {isAdmin && (
                        <button
                          onClick={() => setEditingDraft(draft)}
                          className="p-1.5 rounded-lg text-light-300 hover:text-accent hover:bg-accent/10 transition-colors"
                          title="Edit players"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        )}
                        {isAdmin && (
                        <button
                          onClick={() => setDeleteTarget(draft)}
                          className="p-1.5 rounded-lg text-light-300 hover:text-danger hover:bg-danger/10 transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 size={14} />
                        </button>
                        )}
                      </>
                    )}
                  </div>
                );

                const teams = (
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex-1 flex flex-col flex-wrap-reverse items-start gap-1">
                      {teamA.map((p) => (
                        <div key={p.id} className="flex items-center gap-1.5">
                          <PlayerAvatar player={p} size="sm" />
                          <PlayerLevelBadge level={p.level} />
                          <span
                            className={`text-sm truncate ${draft.finished && draft.winner === "A" ? "text-accent font-semibold" : "text-light-100"}`}
                          >
                            {p.name}
                          </span>
                        </div>
                      ))}
                      {teamA.length === 0 && (
                        <span className="text-xs text-danger/70 italic">
                          Missing
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-0.5 shrink-0">
                      {draft.finished &&
                      draft.scoreA != null &&
                      draft.scoreB != null ? (
                        <span className="text-xs font-bold text-light-100 tabular-nums">
                          {draft.scoreA} - {draft.scoreB}
                        </span>
                      ) : (
                        <span className="text-[10px] sm:text-xs font-bold text-red-500 uppercase">
                          vs
                        </span>
                      )}
                      {balanceScore !== null && (
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${balanceColor}`}
                        >
                          {balanceScore}%
                        </span>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col items-start gap-1">
                      {teamB.map((p) => (
                        <div key={p.id} className="flex items-center gap-1.5">
                          <PlayerAvatar player={p} size="sm" />
                          <PlayerLevelBadge level={p.level} />
                          <span
                            className={`text-sm truncate ${draft.finished && draft.winner === "B" ? "text-accent font-semibold" : "text-light-100"}`}
                          >
                            {p.name}
                          </span>
                        </div>
                      ))}
                      {teamB.length === 0 && (
                        <span className="text-xs text-danger/70 italic">
                          Missing
                        </span>
                      )}
                    </div>
                  </div>
                );

                return (
                  <div
                    key={draft.id}
                    className={`border-b border-dark-100 last:border-b-0 transition-colors group ${isRepeated && !draft.finished ? "border-l-2 border-l-orange-400" : ""} ${draft.finished ? "opacity-40" : "hover:bg-dark-200/30"}`}
                  >
                    {/* Mobile Card Layout */}
                    <div className="sm:hidden p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {isRepeated && !draft.finished && (
                            <FiAlertTriangle
                              size={12}
                              className="text-orange-400 shrink-0"
                              title="Repeated matchup"
                            />
                          )}
                          <span className="text-sm font-bold text-accent/80 shrink-0">
                            #{matchNumber}
                          </span>
                          {courtSelect}
                        </div>
                        {actions}
                      </div>
                      {teams}
                    </div>

                    {/* Desktop Grid Layout */}
                    <div className="hidden sm:grid grid-cols-[60px_110px_1fr_116px] items-center px-4 py-3">
                      <span className="text-sm font-bold text-accent/80 flex items-center gap-1">
                        {isRepeated && !draft.finished && (
                          <FiAlertTriangle
                            size={12}
                            className="text-orange-400"
                            title="Repeated matchup"
                          />
                        )}
                        {matchNumber}
                      </span>
                      <div className="max-w-[100px]">{courtSelect}</div>
                      {teams}
                      <div className="justify-end opacity-50 group-hover:opacity-100 transition-opacity flex">
                        {actions}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-dark-200 flex items-center justify-center mb-4">
            <RiDraftLine className="text-light-300/40" size={28} />
          </div>
          <p className="text-light-300 text-sm mb-1">No drafts yet</p>
          <p className="text-light-300/60 text-xs">
            Create one to save a group of 4 players
          </p>
        </div>
      )}

      {/* Create Draft Modal */}
      <ManualSelectModal
        open={showSelectModal}
        onClose={() => setShowSelectModal(false)}
        title="Select 4 Players for Draft"
        players={draftablePlayers}
        maxSelect={4}
        onConfirm={handleCreateDraft}
        draftCounts={playerDraftCounts}
      />

      {/* Edit Draft Modal */}
      <Modal
        open={!!editingDraft}
        onClose={() => {
          setEditingDraft(null);
          setChangeTarget(null);
          setReplaceSearch("");
        }}
        title={editingDraft ? `Edit - ${editingDraft.name}` : "Edit"}
        size="lg"
      >
        {editingDraft &&
          (() => {
            const half = Math.ceil(editingDraft.playerIds.length / 2);
            const eTeamA = editingDraft.playerIds
              .slice(0, half)
              .map((id, i) => ({ id, index: i, player: resolvePlayer(id) }))
              .filter(
                (o): o is { id: string; index: number; player: Player } =>
                  !!o.player,
              );
            const eTeamB = editingDraft.playerIds
              .slice(half)
              .map((id, i) => ({
                id,
                index: half + i,
                player: resolvePlayer(id),
              }))
              .filter(
                (o): o is { id: string; index: number; player: Player } =>
                  !!o.player,
              );

            const isReplacing = changeTarget?.draft.id === editingDraft.id;
            const levelOrder = {
              [PlayerLevel.BEGINNER]: 0,
              [PlayerLevel.INTERMEDIATE]: 1,
              [PlayerLevel.ADVANCED]: 2,
              [PlayerLevel.PRO]: 3,
            };
            const availablePlayers = isReplacing
              ? players
                  .filter(
                    (p) =>
                      (p.active ?? true) &&
                      !editingDraft.playerIds.includes(p.id),
                  )
                  .filter((p) =>
                    p.name
                      .toLowerCase()
                      .includes(replaceSearch.toLowerCase()),
                  )
                  .sort((a, b) =>
                    replaceSort === "name"
                      ? a.name.localeCompare(b.name)
                      : levelOrder[a.level] - levelOrder[b.level] ||
                        a.name.localeCompare(b.name),
                  )
              : [];

            function handleDragStart(
              e: React.DragEvent,
              team: "A" | "B",
              index: number,
              playerId: string,
            ) {
              e.dataTransfer.setData(
                "application/json",
                JSON.stringify({ team, index, playerId }),
              );
              e.dataTransfer.effectAllowed = "move";
            }

            function handleDragOver(
              e: React.DragEvent,
              targetTeam: "A" | "B",
              targetIndex: number,
            ) {
              e.preventDefault();
              try {
                // Only allow drops from opposite team
                const raw = e.dataTransfer.types.includes("application/json");
                if (raw) {
                  e.dataTransfer.dropEffect = "move";
                  setDragOverIndex(targetIndex);
                }
              } catch {
                // dataTransfer data not available during dragover
                e.dataTransfer.dropEffect = "move";
                setDragOverIndex(targetIndex);
              }
            }

            function handleDrop(
              e: React.DragEvent,
              targetTeam: "A" | "B",
              targetIndex: number,
            ) {
              e.preventDefault();
              setDragOverIndex(null);
              if (!editingDraft) return;
              try {
                const data = JSON.parse(
                  e.dataTransfer.getData("application/json"),
                ) as { team: string; index: number; playerId: string };
                if (data.team === targetTeam) return; // same team, ignore
                const targetPlayerId =
                  editingDraft.playerIds[targetIndex];
                if (!targetPlayerId) return;
                const newPlayerIds = [...editingDraft.playerIds];
                newPlayerIds[data.index] = targetPlayerId;
                newPlayerIds[targetIndex] = data.playerId;
                dispatch(
                  updateDraftPlayers({
                    id: editingDraft.id,
                    playerIds: newPlayerIds,
                  }),
                );
                setEditingDraft({
                  ...editingDraft,
                  playerIds: newPlayerIds,
                });
              } catch {
                // Invalid drag data
              }
            }

            const renderPlayerRow = (
              team: "A" | "B",
              {
                id,
                index,
                player: p,
              }: {
                id: string;
                index: number;
                player: Player;
              },
            ) => {
              const isActive =
                isReplacing && changeTarget?.playerIndex === index;
              const isDragOver = dragOverIndex === index;
              return (
                <div key={id}>
                  <div
                    draggable={!isActive}
                    onDragStart={(e) => handleDragStart(e, team, index, id)}
                    onDragOver={(e) => handleDragOver(e, team, index)}
                    onDragLeave={() => setDragOverIndex(null)}
                    onDrop={(e) => handleDrop(e, team, index)}
                    className={`flex items-center gap-2 p-2 rounded-xl bg-dark-200 border transition-colors ${
                      isActive
                        ? "border-info"
                        : isDragOver
                          ? "border-accent ring-2 ring-accent/30"
                          : "border-dark-100"
                    } ${!isActive ? "cursor-grab active:cursor-grabbing" : ""}`}
                  >
                    <FiMoreVertical
                      size={12}
                      className="text-light-300/40 shrink-0"
                    />
                    <PlayerLevelBadge level={p.level} />
                    <span className="flex-1 text-sm text-light-100 truncate">
                      {p.name}
                    </span>
                    <button
                      onClick={() => {
                        if (isActive) {
                          setChangeTarget(null);
                          setReplaceSearch("");
                        } else {
                          setChangeTarget({
                            draft: editingDraft,
                            playerIndex: index,
                          });
                          setReplaceSearch("");
                        }
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors shrink-0 ${isActive ? "text-danger hover:bg-danger/10" : "text-info hover:bg-info/10"}`}
                    >
                      {isActive ? "Cancel" : "Replace"}
                    </button>
                  </div>
                  {isActive && (
                    <div className="ml-4 mt-1 border-l-2 border-info/30 pl-3 space-y-1.5 pb-1">
                      <input
                        type="text"
                        placeholder="Search players..."
                        value={replaceSearch}
                        onChange={(e) => setReplaceSearch(e.target.value)}
                        className="w-full bg-dark-200 border border-dark-100 rounded-lg px-3 py-1.5 text-xs text-light-100 placeholder:text-light-300 outline-none focus:border-accent/50"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-light-300/50 mr-1">Sort:</span>
                        <button
                          onClick={() => setReplaceSort("name")}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${replaceSort === "name" ? "bg-accent/15 text-accent" : "text-light-300/60 hover:text-light-300"}`}
                        >
                          Name
                        </button>
                        <button
                          onClick={() => setReplaceSort("level")}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${replaceSort === "level" ? "bg-accent/15 text-accent" : "text-light-300/60 hover:text-light-300"}`}
                        >
                          Level
                        </button>
                      </div>
                      <div className="max-h-40 overflow-y-auto space-y-0.5">
                        {availablePlayers.map((ap) => (
                          <button
                            key={ap.id}
                            onClick={() => {
                              handleChangePlayer([ap.id]);
                              setReplaceSearch("");
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-dark-100 transition-colors"
                          >
                            <PlayerLevelBadge level={ap.level} />
                            <span className="flex-1 text-xs text-light-100 truncate">
                              {ap.name}
                            </span>
                            {playerDraftCounts && (
                              <span className="text-[10px] text-light-300/60 tabular-nums shrink-0">
                                {playerDraftCounts.get(ap.id) ?? 0}d
                              </span>
                            )}
                          </button>
                        ))}
                        {availablePlayers.length === 0 && (
                          <p className="text-center text-light-300/60 py-2 text-xs">
                            No players found
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            };

            return (
              <div className="space-y-3">
                <div className="flex items-stretch gap-3">
                  {/* Team A */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-light-300 uppercase tracking-wide mb-2">
                      Team A
                    </p>
                    <div className="space-y-2">
                      {eTeamA.map((row) => renderPlayerRow("A", row))}
                    </div>
                  </div>

                  {/* VS divider */}
                  <div className="flex flex-col items-center justify-center px-1">
                    <div className="flex-1 w-px bg-dark-100" />
                    <span className="text-[10px] font-bold text-light-300/50 uppercase py-2">
                      vs
                    </span>
                    <div className="flex-1 w-px bg-dark-100" />
                  </div>

                  {/* Team B */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-light-300 uppercase tracking-wide mb-2">
                      Team B
                    </p>
                    <div className="space-y-2">
                      {eTeamB.map((row) => renderPlayerRow("B", row))}
                    </div>
                  </div>
                </div>

                <p className="text-center text-[10px] text-light-300/40 italic">
                  Drag players between teams to swap
                </p>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      setEditingDraft(null);
                      setChangeTarget(null);
                      setReplaceSearch("");
                    }}
                    className="px-4 py-2 rounded-xl text-sm text-light-300 hover:text-light-100 hover:bg-dark-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            );
          })()}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Draft"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        danger
      />

      {/* Reset Confirm */}
      <ConfirmDialog
        open={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={() => {
          dispatch(clearDrafts());
          dispatch(resetAllGameCounts());
        }}
        title="Reset All"
        message="This will clear all drafts and reset all players' game counts and trophies to zero. Are you sure?"
        confirmLabel="Reset"
        danger
      />

      {/* Auto Draft Confirm */}
      <Modal
        open={showAutoDraftConfirm}
        onClose={() => setShowAutoDraftConfirm(false)}
        title="Auto Draft"
      >
        <div className="space-y-4">
          <p className="text-sm text-light-300">
            Unique matchups are prioritized, duplicates allowed when exhausted.
          </p>
          <div>
            <label className="block text-xs font-semibold text-light-300 uppercase tracking-wide mb-1.5">
              Number of Drafts
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDraftCount(Math.max(1, draftCount - 5))}
                className="w-8 h-8 rounded-lg bg-dark-200 border border-dark-100 text-light-100 text-sm hover:bg-dark-100 flex items-center justify-center"
              >
                -
              </button>
              <input
                type="number"
                min={1}
                value={draftCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 1) setDraftCount(val);
                }}
                className="w-16 bg-dark-200 border border-dark-100 rounded-lg px-2 py-1.5 text-sm text-light-100 text-center outline-none focus:border-accent/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                onClick={() => setDraftCount(draftCount + 5)}
                className="w-8 h-8 rounded-lg bg-dark-200 border border-dark-100 text-light-100 text-sm hover:bg-dark-100 flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-light-300 uppercase tracking-wide mb-1.5">
              Shuffle Mode
            </label>
            <select
              value={shuffleMode}
              onChange={(e) =>
                setShuffleMode(
                  e.target.value as "balanced" | "random" | "skill-match",
                )
              }
              className="w-full bg-dark-200 border border-dark-100 rounded-lg px-3 py-2 text-sm text-light-100 outline-none focus:border-accent/50 transition-colors cursor-pointer"
            >
              <option value="balanced">
                Balanced — Equal game distribution
              </option>
              <option value="random">Random — Fully randomized</option>
              <option value="skill-match">
                Skill Match — Same skill levels first
              </option>
            </select>
          </div>
          {shuffleMode === "skill-match" && (
            <div>
              <label className="block text-xs font-semibold text-light-300 uppercase tracking-wide mb-1.5">
                Include Levels
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.values(PlayerLevel).map((level) => {
                  const config = playerLevelConfig[level];
                  const checked = selectedLevels.has(level);
                  return (
                    <button
                      key={level}
                      onClick={() => {
                        setSelectedLevels((prev) => {
                          const next = new Set(prev);
                          if (next.has(level)) next.delete(level);
                          else next.add(level);
                          return next;
                        });
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                        checked
                          ? "border-accent/50 bg-accent/10"
                          : "border-dark-100 bg-dark-200 opacity-50"
                      }`}
                    >
                      <span
                        className="inline-flex items-center justify-center font-bold rounded text-[10px] w-5 h-5"
                        style={{
                          color: config.color,
                          backgroundColor: `${config.color}15`,
                        }}
                      >
                        {config.shortLabel}
                      </span>
                      <span className="text-light-100">{config.label}</span>
                    </button>
                  );
                })}
              </div>
              {selectedLevels.size === 0 && (
                <p className="text-xs text-danger mt-1">
                  Select at least one level
                </p>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowAutoDraftConfirm(false)}
              className="px-4 py-2 rounded-xl text-sm text-light-300 hover:text-light-100 hover:bg-dark-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAutoDraft}
              disabled={
                shuffleMode === "skill-match" && selectedLevels.size === 0
              }
              className="px-4 py-2 rounded-xl text-sm bg-accent text-primary font-semibold hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Generate
            </button>
          </div>
        </div>
      </Modal>

      {/* Winner Selection Modal */}
      <Modal
        open={!!finishTarget}
        onClose={() => {
          setFinishTarget(null);
          setScoreA("");
          setScoreB("");
        }}
        title="Finish Match"
      >
        {finishTarget &&
          (() => {
            const half = Math.ceil(finishTarget.playerIds.length / 2);
            const tA = finishTarget.playerIds
              .slice(0, half)
              .map(resolvePlayer)
              .filter((p): p is Player => !!p);
            const tB = finishTarget.playerIds
              .slice(half)
              .map(resolvePlayer)
              .filter((p): p is Player => !!p);
            const numA = parseInt(scoreA, 10);
            const numB = parseInt(scoreB, 10);
            const autoWinner =
              !isNaN(numA) && !isNaN(numB) && numA !== numB
                ? numA > numB
                  ? "A"
                  : "B"
                : null;
            return (
              <div className="space-y-4">
                {/* Score Inputs */}
                <div>
                  <label className="block text-xs font-semibold text-light-300 uppercase tracking-wide mb-2">
                    Score (optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-[10px] text-light-300/60 mb-1 text-center">
                        Team A
                      </p>
                      <input
                        type="number"
                        min={0}
                        value={scoreA}
                        onChange={(e) => setScoreA(e.target.value)}
                        placeholder="—"
                        className="w-full bg-dark-200 border border-dark-100 rounded-lg px-3 py-2 text-sm text-light-100 text-center outline-none focus:border-accent/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    <span className="text-xs font-bold text-light-300 pt-4">
                      —
                    </span>
                    <div className="flex-1">
                      <p className="text-[10px] text-light-300/60 mb-1 text-center">
                        Team B
                      </p>
                      <input
                        type="number"
                        min={0}
                        value={scoreB}
                        onChange={(e) => setScoreB(e.target.value)}
                        placeholder="—"
                        className="w-full bg-dark-200 border border-dark-100 rounded-lg px-3 py-2 text-sm text-light-100 text-center outline-none focus:border-accent/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Winner Selection */}
                <div>
                  <p className="text-xs font-semibold text-light-300 uppercase tracking-wide mb-2">
                    {autoWinner
                      ? `Winner: Team ${autoWinner} (from score)`
                      : "Select Winner"}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleFinish(autoWinner ?? "A")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors group ${autoWinner === "A" ? "border-accent bg-accent/10" : "border-dark-100 hover:border-accent hover:bg-accent/10"}`}
                    >
                      <span className="text-xs font-semibold text-light-300 uppercase tracking-wide group-hover:text-accent">
                        Team A {autoWinner === "A" ? "✓" : ""}
                      </span>
                      {tA.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-1.5"
                        >
                          <PlayerLevelBadge level={p.level} />
                          <span className="text-sm text-light-100">
                            {p.name}
                          </span>
                        </div>
                      ))}
                    </button>
                    <button
                      onClick={() => handleFinish(autoWinner ?? "B")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors group ${autoWinner === "B" ? "border-accent bg-accent/10" : "border-dark-100 hover:border-accent hover:bg-accent/10"}`}
                    >
                      <span className="text-xs font-semibold text-light-300 uppercase tracking-wide group-hover:text-accent">
                        Team B {autoWinner === "B" ? "✓" : ""}
                      </span>
                      {tB.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-1.5"
                        >
                          <PlayerLevelBadge level={p.level} />
                          <span className="text-sm text-light-100">
                            {p.name}
                          </span>
                        </div>
                      ))}
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
      </Modal>

      {/* No Courts Prompt */}
      <Modal
        open={showNoCourts}
        onClose={() => setShowNoCourts(false)}
        title="No Courts Available"
      >
        <div className="space-y-4">
          <p className="text-sm text-light-300">
            Please add at least one court before creating drafts. Courts are
            used to assign matches and determine singles or doubles play.
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => setShowNoCourts(false)}
              className="px-4 py-2 rounded-xl text-sm bg-accent text-primary font-semibold hover:bg-accent/80 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      </Modal>

      {/* Export Schedule Modal */}
      <ExportScheduleModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        drafts={drafts}
        courts={courts}
        resolvePlayer={resolvePlayer}
        courtCount={courtCount}
      />

    </div>
  );
}
