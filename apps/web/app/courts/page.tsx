'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { type Court } from '@badminton/types';
import {
  useAppSelector,
  useAppDispatch,
  addCourt,
  removeCourt,
  clearCourts,
  clearCourtsError,
  endGameAndAdvanceQueue,
  dissolveCourt,
  backToQueue,
} from '@badminton/store';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PlayerTag } from '@/components/PlayerTag';

export default function CourtsPage() {
  const dispatch = useAppDispatch();
  const courts = useAppSelector((state) => state.courts.items);
  const courtsError = useAppSelector((state) => state.courts.error);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addSingle, setAddSingle] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Court | null>(null);
  const [actionTarget, setActionTarget] = useState<{ court: Court; action: string } | null>(null);

  function handleAddCourt() {
    dispatch(addCourt({ id: uuidv4(), name: '', players: [], isSingle: addSingle }));
    setShowAddModal(false);
  }

  function handleCourtAction() {
    if (!actionTarget) return;
    const { court, action } = actionTarget;
    switch (action) {
      case 'finish':
        dispatch(endGameAndAdvanceQueue(court.id));
        break;
      case 'dissolve':
        dispatch(dissolveCourt(court.id));
        break;
      case 'backToQueue':
        dispatch(backToQueue(court.id));
        break;
    }
    setActionTarget(null);
  }

  function getCourtBorderColor(court: Court) {
    const needed = court.isSingle ? 2 : 4;
    if (court.players.length === needed) return 'border-success';
    if (court.players.length > 0) return 'border-accent';
    return 'border-dark-100';
  }

  const actionMessages: Record<string, { title: string; message: string; label: string; danger: boolean }> = {
    finish: { title: 'Finish Game', message: 'End this game and advance the queue? Game counts will be incremented.', label: 'Finish', danger: false },
    dissolve: { title: 'Dissolve Court', message: 'Remove all players from this court? No game counts will be changed.', label: 'Dissolve', danger: true },
    backToQueue: { title: 'Back to Queue', message: 'Send these players back to the end of the queue?', label: 'Back to Queue', danger: false },
  };

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Courts</h1>
          <p className="text-light-300 text-sm mt-1">{courts.length} total</p>
        </div>
        <div className="flex gap-3">
          {courts.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-4 py-2 rounded-xl text-sm text-danger border border-danger/30 hover:bg-danger/10"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl text-sm bg-accent text-primary font-semibold hover:bg-accent/80"
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
          const needed = court.isSingle ? 2 : 4;
          const isFull = court.players.length === needed;
          const hasPlayers = court.players.length > 0;

          return (
            <div
              key={court.id}
              className={`bg-secondary p-5 rounded-2xl border-2 ${getCourtBorderColor(court)} transition-colors`}
            >
              {/* Court Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold">{court.name}</h3>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-semibold mt-1 ${
                      court.isSingle ? 'bg-info/15 text-info' : 'bg-success/15 text-success'
                    }`}
                  >
                    {court.isSingle ? 'Singles' : 'Doubles'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isFull && (
                    <span className="text-xs bg-success/15 text-success px-2 py-0.5 rounded font-semibold">
                      Ready
                    </span>
                  )}
                  <span className="text-sm text-light-300">
                    {court.players.length}/{needed}
                  </span>
                </div>
              </div>

              {/* Players */}
              <div className="flex flex-wrap gap-1.5 mb-4 min-h-[32px]">
                {court.players.length > 0 ? (
                  court.players.map((player) => (
                    <PlayerTag key={player.id} player={player} />
                  ))
                ) : (
                  <span className="text-light-300 text-sm">Empty</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {isFull && (
                  <>
                    <button
                      onClick={() => setActionTarget({ court, action: 'finish' })}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-success/15 text-success hover:bg-success/25"
                    >
                      Finish Game
                    </button>
                    <button
                      onClick={() => setActionTarget({ court, action: 'backToQueue' })}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-info/15 text-info hover:bg-info/25"
                    >
                      Back to Queue
                    </button>
                    <button
                      onClick={() => setActionTarget({ court, action: 'dissolve' })}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-danger/15 text-danger hover:bg-danger/25"
                    >
                      Dissolve
                    </button>
                  </>
                )}
                {hasPlayers && !isFull && (
                  <button
                    onClick={() => setActionTarget({ court, action: 'dissolve' })}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-danger/15 text-danger hover:bg-danger/25"
                  >
                    Dissolve
                  </button>
                )}
                {!hasPlayers && (
                  <button
                    onClick={() => setDeleteTarget(court)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-light-300 hover:text-danger hover:bg-danger/10"
                  >
                    Remove Court
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

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

      {/* Court Action Confirm */}
      {actionTarget && (
        <ConfirmDialog
          open
          onClose={() => setActionTarget(null)}
          onConfirm={handleCourtAction}
          title={actionMessages[actionTarget.action].title}
          message={actionMessages[actionTarget.action].message}
          confirmLabel={actionMessages[actionTarget.action].label}
          danger={actionMessages[actionTarget.action].danger}
        />
      )}

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
