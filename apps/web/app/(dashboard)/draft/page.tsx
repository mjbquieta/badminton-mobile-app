"use client";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ManualSelectModal } from "@/components/ManualSelectModal";
import { Modal } from "@/components/Modal";
import { PlayerLevelBadge } from "@/components/PlayerLevelBadge";
import {
  addDraft,
  clearDrafts,
  clearDraftsError,
  finishDraft,
  incrementPlayersGameCount,
  incrementPlayersTrophies,
  removeDraft,
  resetAllGameCounts,
  updateDraftCourt,
  updateDraftPlayers,
  useAppDispatch,
  useAppSelector,
} from "@badminton/store";
import { PlayerLevel, type Draft, type Player } from "@badminton/types";
import { playerLevelConfig } from "@badminton/ui-shared";
import { useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiCheck,
  FiEdit2,
  FiPlus,
  FiRepeat,
  FiRotateCcw,
  FiTrash2,
  FiX,
  FiZap,
} from "react-icons/fi";
import { RiDraftLine } from "react-icons/ri";
import { v4 as uuidv4 } from "uuid";

export default function DraftPage() {
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

  // Player edit sub-modes (Replace / Exchange)
  const [changeTarget, setChangeTarget] = useState<{
    draft: Draft;
    playerIndex: number;
  } | null>(null);
  const [exchangeTarget, setExchangeTarget] = useState<{
    draft: Draft;
    playerIdA: string;
    playerIdB: string;
  } | null>(null);

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

  const playerMap = new Map(players.map((p) => [p.id, p]));

  function resolvePlayer(id: string): Player | undefined {
    return playerMap.get(id);
  }

  function handleCreateDraft(selectedIds: string[]) {
    if (selectedIds.length !== 4) return;
    dispatch(addDraft({ id: uuidv4(), playerIds: selectedIds }));
  }

  function handleFinish(winner: "A" | "B") {
    if (!finishTarget || finishTarget.finished) return;
    const half = Math.ceil(finishTarget.playerIds.length / 2);
    const winnerIds =
      winner === "A"
        ? finishTarget.playerIds.slice(0, half)
        : finishTarget.playerIds.slice(half);
    dispatch(incrementPlayersGameCount(finishTarget.playerIds));
    dispatch(incrementPlayersTrophies(winnerIds));
    dispatch(finishDraft({ id: finishTarget.id, winner }));
    setFinishTarget(null);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    dispatch(removeDraft(deleteTarget.id));
    setDeleteTarget(null);
  }

  function handleChangePlayer(selectedIds: string[]) {
    if (!changeTarget || selectedIds.length !== 1) return;
    const newPlayerIds = [...changeTarget.draft.playerIds];
    newPlayerIds[changeTarget.playerIndex] = selectedIds[0];
    dispatch(updateDraftPlayers({ id: changeTarget.draft.id, playerIds: newPlayerIds }));
    // Update editingDraft to reflect the change in the modal
    if (editingDraft && editingDraft.id === changeTarget.draft.id) {
      setEditingDraft({ ...editingDraft, playerIds: newPlayerIds });
    }
    setChangeTarget(null);
  }

  function handleExchangePlayer() {
    if (!exchangeTarget) return;
    const { draft, playerIdA, playerIdB } = exchangeTarget;
    const idxA = draft.playerIds.indexOf(playerIdA);
    const idxB = draft.playerIds.indexOf(playerIdB);
    if (idxA === -1 || idxB === -1) return;
    const newPlayerIds = [...draft.playerIds];
    newPlayerIds[idxA] = playerIdB;
    newPlayerIds[idxB] = playerIdA;
    dispatch(updateDraftPlayers({ id: draft.id, playerIds: newPlayerIds }));
    // Update editingDraft to reflect the swap in the modal
    if (editingDraft && editingDraft.id === draft.id) {
      setEditingDraft({ ...editingDraft, playerIds: newPlayerIds });
    }
    setExchangeTarget(null);
  }

  // Compute C(n, k)
  function comb(n: number, k: number): number {
    if (k > n) return 0;
    let result = 1;
    for (let i = 0; i < k; i++) result = (result * (n - i)) / (i + 1);
    return Math.round(result);
  }

  function handleAutoDraft() {
    const usedCombos = new Set(
      drafts.map((d) => [...d.playerIds].sort().join(",")),
    );

    // Shuffle array helper (Fisher-Yates)
    function shuffle<T>(arr: T[]): T[] {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    // Generate all N-player combos from a pool, shuffled
    function generateCombos(pool: string[], size: number): string[][] {
      const combos: string[][] = [];
      function build(start: number, current: string[]) {
        if (current.length === size) { combos.push([...current]); return; }
        for (let i = start; i < pool.length; i++) {
          current.push(pool[i]);
          build(i + 1, current);
          current.pop();
        }
      }
      build(0, []);
      return shuffle(combos);
    }

    // Determine combo size based on the court this draft will be assigned to
    function getComboSize(draftIndex: number): number {
      if (courts.length === 0) return 4;
      const courtIndex = (drafts.length + draftIndex) % courts.length;
      return courts[courtIndex].isSingle ? 2 : 4;
    }

    // Track players already assigned within the current round/set
    const roundSize = courts.length > 0 ? courts.length : Infinity;
    const usedInRound = new Set<string>();

    // Dispatch a draft from a combo
    function commitDraft(combo: string[], draftIndex: number) {
      shuffle(combo); // shuffle team A/B assignment
      const key = [...combo].sort().join(",");
      usedCombos.add(key);
      const draftId = uuidv4();
      dispatch(addDraft({ id: draftId, playerIds: combo }));
      if (courts.length > 0) {
        const courtIndex = (drafts.length + draftIndex) % courts.length;
        dispatch(
          updateDraftCourt({
            id: draftId,
            courtId: courts[courtIndex].id,
          }),
        );
      }
    }

    if (shuffleMode === "skill-match") {
      // --- Skill Match: drafts from selected levels only, mixed freely ---
      const filteredIds = draftablePlayers
        .filter((p) => selectedLevels.has(p.level))
        .map((p) => p.id);

      if (filteredIds.length < 2) {
        setShowAutoDraftConfirm(false);
        return;
      }

      const maxCombos = Math.min(draftCount, comb(filteredIds.length, 2) + comb(filteredIds.length, 4));
      const counts = new Map(filteredIds.map((id) => [id, 0]));

      for (let i = 0; i < maxCombos; i++) {
        if (i % roundSize === 0) usedInRound.clear();
        const comboSize = getComboSize(i);

        // Sort by game count, shuffle within same count tier
        const sorted = [...filteredIds].sort(
          (a, b) => counts.get(a)! - counts.get(b)!,
        );
        let idx = 0;
        while (idx < sorted.length) {
          const count = counts.get(sorted[idx])!;
          let end = idx;
          while (end < sorted.length && counts.get(sorted[end])! === count)
            end++;
          const tier = sorted.slice(idx, end);
          shuffle(tier);
          for (let t = 0; t < tier.length; t++) sorted[idx + t] = tier[t];
          idx = end;
        }

        let found = false;
        for (
          let poolSize = comboSize;
          poolSize <= sorted.length && !found;
          poolSize++
        ) {
          const pool = sorted.slice(0, poolSize);
          const combos = generateCombos(pool, comboSize);

          for (const combo of combos) {
            if (combo.some((id) => usedInRound.has(id))) continue;
            const key = [...combo].sort().join(",");
            if (usedCombos.has(key)) continue;

            for (const id of combo) usedInRound.add(id);
            commitDraft(combo, i);
            for (const id of combo) {
              counts.set(id, counts.get(id)! + 1);
            }
            found = true;
            break;
          }
        }
        // If no unique combo found, allow reuse and retry
        if (!found) {
          usedCombos.clear();
          for (
            let poolSize = comboSize;
            poolSize <= sorted.length && !found;
            poolSize++
          ) {
            const pool = sorted.slice(0, poolSize);
            const combos = generateCombos(pool, comboSize);

            for (const combo of combos) {
              if (combo.some((id) => usedInRound.has(id))) continue;

              for (const id of combo) usedInRound.add(id);
              commitDraft(combo, i);
              for (const id of combo) {
                counts.set(id, counts.get(id)! + 1);
              }
              found = true;
              break;
            }
          }
        }
        if (!found) {
          if (i % roundSize === 0) break;
          const nextRound = (Math.floor(i / roundSize) + 1) * roundSize;
          i = nextRound - 1;
        }
      }
    } else {
      // --- Balanced & Random modes ---
      const ids = draftablePlayers.map((p) => p.id);
      if (ids.length < 2) return;

      const maxCombos = Math.min(draftCount, comb(ids.length, 2) + comb(ids.length, 4));
      const counts = new Map(ids.map((id) => [id, 0]));

      for (let i = 0; i < maxCombos; i++) {
        if (i % roundSize === 0) usedInRound.clear();
        const comboSize = getComboSize(i);

        // Build player order based on mode
        let sorted: string[];
        if (shuffleMode === "random") {
          sorted = shuffle([...ids]);
        } else {
          // "balanced" — sort by game count, shuffle within same count tier
          sorted = [...ids].sort(
            (a, b) => counts.get(a)! - counts.get(b)!,
          );
          let idx = 0;
          while (idx < sorted.length) {
            const count = counts.get(sorted[idx])!;
            let end = idx;
            while (end < sorted.length && counts.get(sorted[end])! === count)
              end++;
            const tier = sorted.slice(idx, end);
            shuffle(tier);
            for (let t = 0; t < tier.length; t++) sorted[idx + t] = tier[t];
            idx = end;
          }
        }

        let found = false;
        for (
          let poolSize = comboSize;
          poolSize <= sorted.length && !found;
          poolSize++
        ) {
          const pool = sorted.slice(0, poolSize);
          const combos = generateCombos(pool, comboSize);

          for (const combo of combos) {
            if (combo.some((id) => usedInRound.has(id))) continue;
            const key = [...combo].sort().join(",");
            if (usedCombos.has(key)) continue;

            for (const id of combo) usedInRound.add(id);
            commitDraft(combo, i);
            for (const id of combo) {
              counts.set(id, counts.get(id)! + 1);
            }
            found = true;
            break;
          }
        }
        // If no unique combo found, allow reuse and retry
        if (!found) {
          usedCombos.clear();
          for (
            let poolSize = comboSize;
            poolSize <= sorted.length && !found;
            poolSize++
          ) {
            const pool = sorted.slice(0, poolSize);
            const combos = generateCombos(pool, comboSize);

            for (const combo of combos) {
              if (combo.some((id) => usedInRound.has(id))) continue;

              for (const id of combo) usedInRound.add(id);
              commitDraft(combo, i);
              for (const id of combo) {
                counts.set(id, counts.get(id)! + 1);
              }
              found = true;
              break;
            }
          }
        }
        if (!found) {
          if (i % roundSize === 0) break;
          const nextRound = (Math.floor(i / roundSize) + 1) * roundSize;
          i = nextRound - 1;
        }
      }
    }

    setShowAutoDraftConfirm(false);
  }

  // Group drafts into rounds based on court count
  const courtCount = Math.max(courts.length, 1);
  const rounds: Draft[][] = [];
  for (let i = 0; i < drafts.length; i += courtCount) {
    rounds.push(drafts.slice(i, i + courtCount));
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-24 md:pb-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <RiDraftLine className="text-accent" size={20} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Draft</h1>
            {drafts.length > 0 && (
              <span className="text-sm text-light-300 mt-0.5">{drafts.length} matches</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-end">
          {(drafts.length > 0 || players.length > 0) && (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 p-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm text-danger border border-danger/30 hover:bg-danger/10 transition-colors"
              title="Reset"
            >
              <FiRotateCcw size={14} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
          <button
            onClick={() => courts.length === 0 ? setShowNoCourts(true) : setShowAutoDraftConfirm(true)}
            disabled={draftablePlayers.length < 4}
            className="flex items-center gap-1.5 p-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm bg-accent/20 text-accent font-semibold hover:bg-accent/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Auto Draft"
          >
            <FiZap size={14} />
            <span className="hidden sm:inline">Auto Draft</span>
          </button>
          <button
            onClick={() => courts.length === 0 ? setShowNoCourts(true) : setShowSelectModal(true)}
            disabled={draftablePlayers.length < 4}
            className="flex items-center gap-1.5 p-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm bg-accent text-primary font-semibold hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="New Draft"
          >
            <FiPlus size={14} />
            <span className="hidden sm:inline">New Draft</span>
          </button>
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
            RSVP active — {draftablePlayers.length} confirmed {draftablePlayers.length === 1 ? "player" : "players"} available for drafting
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
                const teamA = draft.playerIds.slice(0, half)
                  .map(resolvePlayer)
                  .filter((p): p is Player => p !== undefined);
                const teamB = draft.playerIds.slice(half)
                  .map(resolvePlayer)
                  .filter((p): p is Player => p !== undefined);

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
                        <button
                          onClick={() => setFinishTarget(draft)}
                          className="p-1.5 rounded-lg text-light-300 hover:text-green-400 hover:bg-green-400/10 transition-colors"
                          title="Finish match"
                        >
                          <FiCheck size={14} />
                        </button>
                        <button
                          onClick={() => setEditingDraft(draft)}
                          className="p-1.5 rounded-lg text-light-300 hover:text-accent hover:bg-accent/10 transition-colors"
                          title="Edit players"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(draft)}
                          className="p-1.5 rounded-lg text-light-300 hover:text-danger hover:bg-danger/10 transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                );

                const teams = (
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex-1 flex flex-col flex-wrap-reverse items-start gap-1">
                      {teamA.map((p) => (
                        <div key={p.id} className="flex items-center gap-1.5">
                          <PlayerLevelBadge level={p.level} />
                          <span className={`text-sm truncate ${draft.finished && draft.winner === "A" ? "text-accent font-semibold" : "text-light-100"}`}>
                            {p.name}
                          </span>
                        </div>
                      ))}
                      {teamA.length === 0 && (
                        <span className="text-xs text-danger/70 italic">Missing</span>
                      )}
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-red-500 uppercase shrink-0">
                      vs
                    </span>
                    <div className="flex-1 flex flex-col items-start gap-1">
                      {teamB.map((p) => (
                        <div key={p.id} className="flex items-center gap-1.5">
                          <PlayerLevelBadge level={p.level} />
                          <span className={`text-sm truncate ${draft.finished && draft.winner === "B" ? "text-accent font-semibold" : "text-light-100"}`}>
                            {p.name}
                          </span>
                        </div>
                      ))}
                      {teamB.length === 0 && (
                        <span className="text-xs text-danger/70 italic">Missing</span>
                      )}
                    </div>
                  </div>
                );

                return (
                  <div
                    key={draft.id}
                    className={`border-b border-dark-100 last:border-b-0 transition-colors group ${draft.finished ? "opacity-40" : "hover:bg-dark-200/30"}`}
                  >
                    {/* Mobile Card Layout */}
                    <div className="sm:hidden p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
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
                      <span className="text-sm font-bold text-accent/80">
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
      />

      {/* Edit Draft Modal */}
      {editingDraft && (() => {
        const half = Math.ceil(editingDraft.playerIds.length / 2);
        const eTeamA = editingDraft.playerIds.slice(0, half)
          .map((id, i) => ({ id, index: i, player: resolvePlayer(id) }))
          .filter((o): o is { id: string; index: number; player: Player } => !!o.player);
        const eTeamB = editingDraft.playerIds.slice(half)
          .map((id, i) => ({ id, index: half + i, player: resolvePlayer(id) }))
          .filter((o): o is { id: string; index: number; player: Player } => !!o.player);

        return (
          <Modal
            open={!!editingDraft}
            onClose={() => setEditingDraft(null)}
            title={`Edit - ${editingDraft.name}`}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Team A */}
                <div>
                  <p className="text-xs font-semibold text-light-300 uppercase tracking-wide mb-2">Team A</p>
                  <div className="space-y-2">
                    {eTeamA.map(({ id, index, player: p }) => (
                      <div key={id} className="flex items-center gap-2 p-2 rounded-xl bg-dark-200 border border-dark-100">
                        <PlayerLevelBadge level={p.level} />
                        <span className="flex-1 text-sm text-light-100 truncate">{p.name}</span>
                        <button
                          onClick={() => setChangeTarget({ draft: editingDraft, playerIndex: index })}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold text-info hover:bg-info/10 transition-colors shrink-0"
                          title="Replace player"
                        >
                          Replace
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Team B */}
                <div>
                  <p className="text-xs font-semibold text-light-300 uppercase tracking-wide mb-2">Team B</p>
                  <div className="space-y-2">
                    {eTeamB.map(({ id, index, player: p }) => (
                      <div key={id} className="flex items-center gap-2 p-2 rounded-xl bg-dark-200 border border-dark-100">
                        <PlayerLevelBadge level={p.level} />
                        <span className="flex-1 text-sm text-light-100 truncate">{p.name}</span>
                        <button
                          onClick={() => setChangeTarget({ draft: editingDraft, playerIndex: index })}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold text-info hover:bg-info/10 transition-colors shrink-0"
                          title="Replace player"
                        >
                          Replace
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Exchange Section */}
              <div className="border-t border-dark-100 pt-4">
                <p className="text-xs font-semibold text-light-300 uppercase tracking-wide mb-2">Exchange Players</p>
                {editingDraft.playerIds.length === 2 ? (
                  <button
                    onClick={() => {
                      const newIds = [...editingDraft.playerIds].reverse();
                      dispatch(updateDraftPlayers({ id: editingDraft.id, playerIds: newIds }));
                      setEditingDraft({ ...editingDraft, playerIds: newIds });
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-dark-200 border border-dark-100 hover:border-accent/30 transition-colors text-sm text-light-100"
                  >
                    <span>{eTeamA[0]?.player.name}</span>
                    <FiRepeat size={14} className="text-accent shrink-0" />
                    <span>{eTeamB[0]?.player.name}</span>
                  </button>
                ) : (
                  <div className="space-y-1.5">
                    {eTeamA.map((a, i) => {
                      const b = eTeamB[i];
                      if (!b) return null;
                      return (
                        <button
                          key={`${a.id}-${b.id}`}
                          onClick={() => setExchangeTarget({ draft: editingDraft, playerIdA: a.id, playerIdB: b.id })}
                          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-dark-200 border border-dark-100 hover:border-accent/30 transition-colors text-sm"
                        >
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <PlayerLevelBadge level={a.player.level} />
                            <span className="text-light-100 truncate">{a.player.name}</span>
                          </div>
                          <FiRepeat size={14} className="text-light-300 shrink-0" />
                          <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                            <span className="text-light-100 truncate">{b.player.name}</span>
                            <PlayerLevelBadge level={b.player.level} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setEditingDraft(null)}
                  className="px-4 py-2 rounded-xl text-sm text-light-300 hover:text-light-100 hover:bg-dark-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        );
      })()}

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
              <option value="balanced">Balanced — Equal game distribution</option>
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
        onClose={() => setFinishTarget(null)}
        title="Select Winner"
      >
        {finishTarget &&
          (() => {
            const half = Math.ceil(finishTarget.playerIds.length / 2);
            const tA = finishTarget.playerIds.slice(0, half)
              .map(resolvePlayer)
              .filter((p): p is Player => !!p);
            const tB = finishTarget.playerIds.slice(half)
              .map(resolvePlayer)
              .filter((p): p is Player => !!p);
            return (
              <div className="space-y-4">
                <p className="text-sm text-light-300">
                  Which team won this match?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleFinish("A")}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dark-100 hover:border-accent hover:bg-accent/10 transition-colors group"
                  >
                    <span className="text-xs font-semibold text-light-300 uppercase tracking-wide group-hover:text-accent">
                      Team A
                    </span>
                    {tA.map((p) => (
                      <div key={p.id} className="flex items-center gap-1.5">
                        <PlayerLevelBadge level={p.level} />
                        <span className="text-sm text-light-100">{p.name}</span>
                      </div>
                    ))}
                  </button>
                  <button
                    onClick={() => handleFinish("B")}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dark-100 hover:border-accent hover:bg-accent/10 transition-colors group"
                  >
                    <span className="text-xs font-semibold text-light-300 uppercase tracking-wide group-hover:text-accent">
                      Team B
                    </span>
                    {tB.map((p) => (
                      <div key={p.id} className="flex items-center gap-1.5">
                        <PlayerLevelBadge level={p.level} />
                        <span className="text-sm text-light-100">{p.name}</span>
                      </div>
                    ))}
                  </button>
                </div>
              </div>
            );
          })()}
      </Modal>

      {/* Change Player Modal */}
      {changeTarget && (
        <ManualSelectModal
          open={!!changeTarget}
          onClose={() => setChangeTarget(null)}
          title="Select Replacement Player"
          players={players.filter((p) => !changeTarget.draft.playerIds.includes(p.id))}
          maxSelect={1}
          onConfirm={handleChangePlayer}
        />
      )}

      {/* Exchange Confirm */}
      {exchangeTarget && (() => {
        const pA = resolvePlayer(exchangeTarget.playerIdA);
        const pB = resolvePlayer(exchangeTarget.playerIdB);
        return (
          <Modal
            open={!!exchangeTarget}
            onClose={() => setExchangeTarget(null)}
            title="Confirm Exchange"
          >
            <div className="space-y-4">
              <p className="text-sm text-light-300">
                Swap these players between teams?
              </p>
              <div className="flex items-center justify-center gap-3 py-2">
                {pA && (
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dark-200 border border-dark-100">
                    <PlayerLevelBadge level={pA.level} />
                    <span className="text-sm text-light-100">{pA.name}</span>
                  </div>
                )}
                <FiRepeat size={16} className="text-accent shrink-0" />
                {pB && (
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-dark-200 border border-dark-100">
                    <PlayerLevelBadge level={pB.level} />
                    <span className="text-sm text-light-100">{pB.name}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setExchangeTarget(null)}
                  className="px-4 py-2 rounded-xl text-sm text-light-300 hover:text-light-100 hover:bg-dark-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExchangePlayer}
                  className="px-4 py-2 rounded-xl text-sm bg-accent text-primary font-semibold hover:bg-accent/80 transition-colors"
                >
                  Exchange
                </button>
              </div>
            </div>
          </Modal>
        );
      })()}

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
    </div>
  );
}
