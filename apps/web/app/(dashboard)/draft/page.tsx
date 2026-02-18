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
import { useState } from "react";
import {
  FiAlertCircle,
  FiCheck,
  FiEdit2,
  FiPlus,
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
  const [finishTarget, setFinishTarget] = useState<Draft | null>(null);
  const playerMap = new Map(players.map((p) => [p.id, p]));

  function resolvePlayer(id: string): Player | undefined {
    return playerMap.get(id);
  }

  function handleCreateDraft(selectedIds: string[]) {
    if (selectedIds.length !== 4) return;
    dispatch(addDraft({ id: uuidv4(), playerIds: selectedIds }));
  }

  function handleEditPlayers(selectedIds: string[]) {
    if (!editingDraft || selectedIds.length !== 4) return;
    dispatch(
      updateDraftPlayers({ id: editingDraft.id, playerIds: selectedIds }),
    );
    setEditingDraft(null);
  }

  function handleFinish(winner: "A" | "B") {
    if (!finishTarget || finishTarget.finished) return;
    const winnerIds =
      winner === "A"
        ? finishTarget.playerIds.slice(0, 2)
        : finishTarget.playerIds.slice(2, 4);
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

  function handleAutoDraft() {
    const ids = players.map((p) => p.id);
    if (ids.length < 4) return;

    const maxNew = 30 - drafts.length;
    if (maxNew <= 0) return;

    // Level ranking for adjacency check
    const levelRank: Record<string, number> = {
      [PlayerLevel.BEGINNER]: 0,
      [PlayerLevel.INTERMEDIATE]: 1,
      [PlayerLevel.ADVANCED]: 2,
      [PlayerLevel.PRO]: 3,
    };
    const playerLevelRank = new Map(
      players.map((p) => [p.id, levelRank[p.level] ?? 0]),
    );

    // Check if all 4 players are within 1 adjacent level
    function isCompatible(combo: string[]): boolean {
      const ranks = combo.map((id) => playerLevelRank.get(id)!);
      const min = Math.min(...ranks);
      const max = Math.max(...ranks);
      return max - min <= 1;
    }

    const usedCombos = new Set(
      drafts.map((d) => [...d.playerIds].sort().join(",")),
    );
    const counts = new Map(ids.map((id) => [id, 0]));

    for (let i = 0; i < maxNew; i++) {
      const sorted = [...ids].sort((a, b) => counts.get(a)! - counts.get(b)!);

      let found = false;
      // Try increasing pool sizes from lowest-count players
      for (let poolSize = 4; poolSize <= sorted.length && !found; poolSize++) {
        const pool = sorted.slice(0, poolSize);
        for (let a = 0; a < pool.length - 3 && !found; a++) {
          for (let b = a + 1; b < pool.length - 2 && !found; b++) {
            for (let c = b + 1; c < pool.length - 1 && !found; c++) {
              for (let d = c + 1; d < pool.length && !found; d++) {
                const combo = [pool[a], pool[b], pool[c], pool[d]];
                if (!isCompatible(combo)) continue;
                const key = [...combo].sort().join(",");
                if (!usedCombos.has(key)) {
                  // Shuffle so team A/B assignment varies
                  for (let s = combo.length - 1; s > 0; s--) {
                    const j = Math.floor(Math.random() * (s + 1));
                    [combo[s], combo[j]] = [combo[j], combo[s]];
                  }
                  usedCombos.add(key);
                  const draftId = uuidv4();
                  dispatch(addDraft({ id: draftId, playerIds: combo }));
                  // Assign court in round-robin per round
                  if (courts.length > 0) {
                    const courtIndex = (drafts.length + i) % courts.length;
                    dispatch(
                      updateDraftCourt({
                        id: draftId,
                        courtId: courts[courtIndex].id,
                      }),
                    );
                  }
                  for (const id of combo) {
                    counts.set(id, counts.get(id)! + 1);
                  }
                  found = true;
                }
              }
            }
          }
        }
      }
      if (!found) break;
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
            <p className="text-light-300 text-sm mt-0.5">
              {drafts.length} / 30 matches
            </p>
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
            onClick={() => setShowAutoDraftConfirm(true)}
            disabled={drafts.length >= 30 || players.length < 4}
            className="flex items-center gap-1.5 p-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm bg-accent/20 text-accent font-semibold hover:bg-accent/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Auto Draft"
          >
            <FiZap size={14} />
            <span className="hidden sm:inline">Auto Draft</span>
          </button>
          <button
            onClick={() => setShowSelectModal(true)}
            disabled={drafts.length >= 30 || players.length < 4}
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
                const teamA = [
                  resolvePlayer(draft.playerIds[0]),
                  resolvePlayer(draft.playerIds[1]),
                ].filter((p): p is Player => p !== undefined);
                const teamB = [
                  resolvePlayer(draft.playerIds[2]),
                  resolvePlayer(draft.playerIds[3]),
                ].filter((p): p is Player => p !== undefined);

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
                    <span className="text-[10px] sm:text-xs font-bold text-red-500 uppercase shrink-0">
                      vs
                    </span>
                    <div className="flex-1 flex flex-col items-start gap-1">
                      {teamB.map((p) => (
                        <div key={p.id} className="flex items-center gap-1.5">
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
        players={players}
        maxSelect={4}
        onConfirm={handleCreateDraft}
      />

      {/* Edit Draft Players Modal */}
      {editingDraft && (
        <ManualSelectModal
          open={!!editingDraft}
          onClose={() => setEditingDraft(null)}
          title={`Edit Players - ${editingDraft.name}`}
          players={players}
          maxSelect={4}
          initialSelected={editingDraft.playerIds}
          onConfirm={handleEditPlayers}
        />
      )}

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
      <ConfirmDialog
        open={showAutoDraftConfirm}
        onClose={() => setShowAutoDraftConfirm(false)}
        onConfirm={handleAutoDraft}
        title="Auto Draft"
        message={`This will automatically generate up to ${30 - drafts.length} drafts with balanced game distribution. No duplicate matchups will be created. Continue?`}
        confirmLabel="Generate"
      />

      {/* Winner Selection Modal */}
      <Modal
        open={!!finishTarget}
        onClose={() => setFinishTarget(null)}
        title="Select Winner"
      >
        {finishTarget &&
          (() => {
            const tA = [
              resolvePlayer(finishTarget.playerIds[0]),
              resolvePlayer(finishTarget.playerIds[1]),
            ].filter((p): p is Player => !!p);
            const tB = [
              resolvePlayer(finishTarget.playerIds[2]),
              resolvePlayer(finishTarget.playerIds[3]),
            ].filter((p): p is Player => !!p);
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
    </div>
  );
}
