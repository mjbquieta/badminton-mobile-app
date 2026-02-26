'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { type Court, type Player } from '@badminton/types';
import {
  useAppSelector,
  useAppDispatch,
  addCourt,
  removeCourt,
  clearCourts,
  clearCourtsError,
  removePlayerFromCourt,
  addPlayersToCourtManually,
} from '@badminton/store';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PlayerTag } from '@/components/PlayerTag';
import { useAuth } from '@/contexts/AuthContext';
import { UNVERIFIED_LIMITS } from '@badminton/ui-shared';
import { FiTrash2 } from 'react-icons/fi';

export default function CourtsPage() {
  const { emailVerified } = useAuth();
  const dispatch = useAppDispatch();
  const courts = useAppSelector((state) => state.courts.items);
  const courtsError = useAppSelector((state) => state.courts.error);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addSingle, setAddSingle] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Court | null>(null);

  // Drag-and-drop state
  const [dragOverCourtId, setDragOverCourtId] = useState<string | null>(null);
  const [dragOverBench, setDragOverBench] = useState(false);

  function handleAddCourt() {
    dispatch(addCourt({ id: uuidv4(), name: '', players: [], isSingle: addSingle, maxCourts: emailVerified ? undefined : UNVERIFIED_LIMITS.MAX_COURTS }));
    setShowAddModal(false);
  }

  function getCourtBorderColor(court: Court) {
    if (dragOverCourtId === court.id) return 'border-accent ring-2 ring-accent/30';
    const needed = court.isSingle ? 2 : 4;
    if (court.players.length === needed) return 'border-success';
    if (court.players.length > 0) return 'border-accent';
    return 'border-dark-100';
  }

  function handleDragStart(e: React.DragEvent, player: Player, fromCourtId: string) {
    e.dataTransfer.setData('application/json', JSON.stringify({ player, fromCourtId }));
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleCourtDragOver(e: React.DragEvent, courtId: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCourtId(courtId);
  }

  function handleCourtDragLeave() {
    setDragOverCourtId(null);
  }

  function handleCourtDrop(e: React.DragEvent, targetCourtId: string) {
    e.preventDefault();
    setDragOverCourtId(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const { player, fromCourtId } = data as { player: Player; fromCourtId: string };
      if (fromCourtId === targetCourtId) return;
      dispatch(removePlayerFromCourt({ courtId: fromCourtId, playerId: player.id }));
      dispatch(addPlayersToCourtManually({ courtId: targetCourtId, players: [player] }));
    } catch {
      // Invalid drag data
    }
  }

  function handleBenchDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverBench(true);
  }

  function handleBenchDragLeave() {
    setDragOverBench(false);
  }

  function handleBenchDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOverBench(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const { player, fromCourtId } = data as { player: Player; fromCourtId: string };
      dispatch(removePlayerFromCourt({ courtId: fromCourtId, playerId: player.id }));
    } catch {
      // Invalid drag data
    }
  }

  // Check if any court has players (for showing bench)
  const anyPlayersOnCourts = courts.some((c) => c.players.length > 0);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Courts</h1>
          <p className="text-light-300 text-sm mt-1">{courts.length} total</p>
        </div>
        <div className="flex gap-2 sm:gap-3 shrink-0">
          {courts.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm text-danger border border-danger/30 hover:bg-danger/10"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm bg-accent text-primary font-semibold hover:bg-accent/80"
          >
            + Add Court
          </button>
        </div>
      </div>

      {/* Error */}
      {courtsError && (
        <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl px-4 py-3 mb-4 flex justify-between items-center">
          <span>{courtsError}</span>
          <button onClick={() => dispatch(clearCourtsError())} className="text-danger/60 hover:text-danger">&times;</button>
        </div>
      )}

      {/* Courts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courts.map((court) => {
          const hasPlayers = court.players.length > 0;

          return (
            <div
              key={court.id}
              className={`bg-secondary p-4 rounded-2xl border-2 ${getCourtBorderColor(court)} transition-colors`}
              onDragOver={(e) => handleCourtDragOver(e, court.id)}
              onDragLeave={handleCourtDragLeave}
              onDrop={(e) => handleCourtDrop(e, court.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{court.name}</h3>
                  <span className="text-xs text-light-300">
                    {court.isSingle ? 'Singles' : 'Doubles'}
                  </span>
                </div>
                <button
                  onClick={() => setDeleteTarget(court)}
                  className="p-1.5 rounded-lg text-light-300 hover:text-danger hover:bg-danger/10"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>

              {hasPlayers ? (
                <div className="flex flex-wrap gap-1.5">
                  {court.players.map((player) => (
                    <span
                      key={player.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, player, court.id)}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <PlayerTag player={player} />
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-light-300/50 py-2">
                  Drop players here
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Bench Drop Zone */}
      {anyPlayersOnCourts && (
        <div
          onDragOver={handleBenchDragOver}
          onDragLeave={handleBenchDragLeave}
          onDrop={handleBenchDrop}
          className={`mt-4 border-2 border-dashed rounded-2xl p-4 text-center transition-colors ${
            dragOverBench
              ? 'border-danger bg-danger/5 text-danger'
              : 'border-dark-100 text-light-300/50'
          }`}
        >
          <p className="text-sm">Drop here to remove from court</p>
        </div>
      )}

      {courts.length === 0 && (
        <p className="text-center text-light-300 py-12">No courts yet. Add some!</p>
      )}

      {/* Add Court Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Court">
        <div className="space-y-4">
          <label className="text-sm text-light-200 mb-2 block">Court Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setAddSingle(true)}
              className={`p-4 rounded-xl border-2 text-center transition-colors ${
                addSingle ? 'border-info text-info' : 'border-dark-100 text-light-300 hover:border-dark-100/50'
              }`}
            >
              <div className="text-2xl mb-1">🏸</div>
              <div className="font-semibold text-sm">Singles</div>
              <div className="text-xs opacity-60">1v1 · 2 players</div>
            </button>
            <button
              onClick={() => setAddSingle(false)}
              className={`p-4 rounded-xl border-2 text-center transition-colors ${
                !addSingle ? 'border-success text-success' : 'border-dark-100 text-light-300 hover:border-dark-100/50'
              }`}
            >
              <div className="text-2xl mb-1">🏸🏸</div>
              <div className="font-semibold text-sm">Doubles</div>
              <div className="text-xs opacity-60">2v2 · 4 players</div>
            </button>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl text-light-200 hover:bg-dark-200">
              Cancel
            </button>
            <button onClick={handleAddCourt} className="px-4 py-2 rounded-xl bg-accent text-primary font-semibold hover:bg-accent/80">
              Add
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Court Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) dispatch(removeCourt(deleteTarget.id)); setDeleteTarget(null); }}
        title="Remove Court"
        message={`Remove ${deleteTarget?.name}?`}
        confirmLabel="Remove"
        danger
      />

      {/* Clear All Confirm */}
      <ConfirmDialog
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => dispatch(clearCourts())}
        title="Clear All Courts"
        message="This will remove all courts. Are you sure?"
        confirmLabel="Clear All"
        danger
      />
    </div>
  );
}
