'use client';

import { useState, useMemo } from 'react';
import { type Player, type Court } from '@badminton/types';
import {
  useAppSelector,
  useAppDispatch,
  rollDice,
  endGameAndAdvanceQueue,
  dissolveCourt,
  backToQueue,
  setQueue,
  assignPlayersToCourtsBulk,
  addPlayersToCourtManually,
  resetSession,
} from '@badminton/store';
import { PlayerTag } from '@/components/PlayerTag';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ManualSelectModal } from '@/components/ManualSelectModal';

export default function ActivityPage() {
  const dispatch = useAppDispatch();
  const players = useAppSelector((state) => state.players.items);
  const courts = useAppSelector((state) => state.courts.items);
  const queue = useAppSelector((state) => state.queue.ids);

  const [actionTarget, setActionTarget] = useState<{ court: Court; action: string } | null>(null);
  const [showManualQueue, setShowManualQueue] = useState<'singles' | 'doubles' | null>(null);
  const [showQueueTypePicker, setShowQueueTypePicker] = useState(false);
  const [assignCourt, setAssignCourt] = useState<Court | null>(null);
  const [rollConfirm, setRollConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [manualAddCourt, setManualAddCourt] = useState<Court | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // Derived state
  const playersInCourts = useMemo(() => {
    const ids = new Set<string>();
    courts.forEach((c) => c.players.forEach((p) => ids.add(p.id)));
    return ids;
  }, [courts]);

  const queueSet = useMemo(() => new Set(queue), [queue]);

  const benchPlayers = useMemo(
    () => players.filter((p) => !playersInCourts.has(p.id) && !queueSet.has(p.id)),
    [players, playersInCourts, queueSet]
  );

  const queueGroups = useMemo(() => {
    const groups: Player[][] = [];
    for (let i = 0; i < queue.length; i += 4) {
      const groupIds = queue.slice(i, i + 4);
      const groupPlayers = groupIds
        .map((id) => players.find((p) => p.id === id))
        .filter((p): p is Player => !!p);
      groups.push(groupPlayers);
    }
    return groups;
  }, [queue, players]);

  const activeCourts = courts.filter((c) => c.players.length > 0);
  const emptyDoubleCourts = courts.filter((c) => c.players.length === 0 && !c.isSingle);
  const emptySinglesCourts = courts.filter((c) => c.players.length === 0 && c.isSingle);
  const allEmptyCourts = courts.filter((c) => c.players.length === 0);

  // Actions
  function handleAutoQueue() {
    const result = dispatch(rollDice()) as unknown as { needsConfirmation: boolean; playersAdded: number; message?: string };
    if (result?.needsConfirmation) {
      setRollConfirm(result.message ?? 'Incompatible skill levels. Proceed anyway?');
    } else if (result?.playersAdded > 0) {
      showToast(`${result.playersAdded} players added to queue`);
    } else {
      showToast('Not enough bench players to form a group');
    }
  }

  function handleForceRoll() {
    const result = dispatch(rollDice({ allowIncompatible: true })) as unknown as { playersAdded: number };
    setRollConfirm(null);
    if (result?.playersAdded > 0) {
      showToast(`${result.playersAdded} players added to queue`);
    }
  }

  function handleManualQueueConfirm(selectedIds: string[]) {
    dispatch(setQueue([...queue, ...selectedIds]));
    setShowManualQueue(null);
    showToast(`${selectedIds.length} players added to queue`);
  }

  function handleResetSession() {
    dispatch(resetSession());
    setShowResetConfirm(false);
    showToast('Session reset — all game counts cleared');
  }

  function handleAssignQueue(groupIndex: number) {
    if (!assignCourt) return;
    const group = queueGroups[groupIndex];
    const needed = assignCourt.isSingle ? 2 : 4;
    if (group.length < needed) return;

    const assignPlayers = group.slice(0, needed);
    dispatch(assignPlayersToCourtsBulk({
      assignments: [{ courtId: assignCourt.id, players: assignPlayers }],
    }));

    const assignedIds = new Set(assignPlayers.map((p) => p.id));
    dispatch(setQueue(queue.filter((id) => !assignedIds.has(id))));
    setAssignCourt(null);
  }

  function handleManualAddToCourt(selectedIds: string[]) {
    if (!manualAddCourt) return;
    const selectedPlayers = selectedIds
      .map((id) => players.find((p) => p.id === id))
      .filter((p): p is Player => !!p);
    dispatch(addPlayersToCourtManually({ courtId: manualAddCourt.id, players: selectedPlayers }));
    setManualAddCourt(null);
  }

  function handleCourtAction() {
    if (!actionTarget) return;
    const { court, action } = actionTarget;
    switch (action) {
      case 'finish': {
        const result = dispatch(endGameAndAdvanceQueue(court.id)) as unknown as { warnedQueueEmpty: boolean };
        if (result?.warnedQueueEmpty) {
          showToast('Queue is running low! Consider rolling dice to add more players.');
        }
        break;
      }
      case 'dissolve':
        dispatch(dissolveCourt(court.id));
        break;
      case 'backToQueue':
        dispatch(backToQueue(court.id));
        break;
    }
    setActionTarget(null);
  }

  const actionMessages: Record<string, { title: string; message: string; label: string; danger: boolean }> = {
    finish: { title: 'Finish Game', message: 'End this game? Game counts will be incremented and the next queue group will be assigned.', label: 'Finish', danger: false },
    dissolve: { title: 'Dissolve', message: 'Remove all players? No game counts will change.', label: 'Dissolve', danger: true },
    backToQueue: { title: 'Back to Queue', message: 'Send these players to the end of the queue?', label: 'Back to Queue', danger: false },
  };

  return (
    <div className="p-8 max-w-6xl">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 bg-secondary border border-dark-100 text-light-100 px-4 py-2 rounded-xl text-sm font-medium z-50 shadow-elevated">
          {toast}
        </div>
      )}

      {/* Header */}
      <h1 className="text-3xl font-bold mb-6">Activity</h1>

      {/* Quick Actions Panel */}
      <div className="bg-secondary rounded-2xl border border-dark-100 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-6">
            <div>
              <span className="text-light-300 text-xs block">Bench</span>
              <span className="text-xl font-bold">{benchPlayers.length}</span>
            </div>
            <div>
              <span className="text-light-300 text-xs block">Queue Groups</span>
              <span className="text-xl font-bold">{queueGroups.filter((g) => g.length === 4).length}</span>
            </div>
            <div>
              <span className="text-light-300 text-xs block">Available Courts</span>
              <span className="text-xl font-bold">{allEmptyCourts.length}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowResetConfirm(true)}
              disabled={players.length === 0}
              className="px-4 py-2 rounded-xl text-sm text-danger border border-danger/30 hover:bg-danger/10 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Reset Session
            </button>
            <button
              onClick={() => setShowQueueTypePicker(true)}
              disabled={benchPlayers.length === 0}
              className="px-4 py-2 rounded-xl text-sm border border-accent/30 text-accent hover:bg-accent/10 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Manual Queue
            </button>
            <button
              onClick={handleAutoQueue}
              disabled={benchPlayers.length === 0}
              className="px-4 py-2 rounded-xl text-sm bg-accent text-primary font-semibold hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Auto Queue
            </button>
          </div>
        </div>
        {queue.length > 0 && queue.length < 8 && (
          <div className="text-xs text-warning bg-warning/10 rounded-lg px-3 py-2">
            Low queue — only {Math.floor(queue.length / 4)} full group{Math.floor(queue.length / 4) !== 1 ? 's' : ''} remaining
          </div>
        )}
      </div>

      {/* In Game Section */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">In Game ({activeCourts.length})</h2>
        {activeCourts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCourts.map((court) => {
              const needed = court.isSingle ? 2 : 4;
              const isFull = court.players.length === needed;
              const remaining = needed - court.players.length;
              return (
                <div
                  key={court.id}
                  className={`bg-secondary p-5 rounded-2xl border-2 ${
                    isFull ? 'border-success' : 'border-accent'
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold">{court.name}</h3>
                    <span className="text-sm text-light-300">{court.players.length}/{needed}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {court.players.map((p) => (
                      <PlayerTag key={p.id} player={p} />
                    ))}
                  </div>
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
                    {!isFull && (
                      <>
                        <button
                          onClick={() => setManualAddCourt(court)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent/15 text-accent hover:bg-accent/25"
                        >
                          Add {remaining} more
                        </button>
                        <button
                          onClick={() => setActionTarget({ court, action: 'dissolve' })}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-danger/15 text-danger hover:bg-danger/25"
                        >
                          Dissolve
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-secondary rounded-2xl border border-dark-100 p-6">
            <p className="text-light-300 text-center">No active games</p>
          </div>
        )}
      </section>

      {/* Empty Courts */}
      {allEmptyCourts.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Available Courts ({allEmptyCourts.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allEmptyCourts.map((court) => {
              const needed = court.isSingle ? 2 : 4;
              const hasQueueGroup = queueGroups.some((g) => g.length >= needed);
              return (
                <div key={court.id} className="bg-secondary p-5 rounded-2xl border border-dark-100">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold">{court.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      court.isSingle ? 'bg-info/15 text-info' : 'bg-success/15 text-success'
                    }`}>
                      {court.isSingle ? 'Singles' : 'Doubles'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAssignCourt(court)}
                      disabled={!hasQueueGroup}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent/15 text-accent hover:bg-accent/25 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      From Queue
                    </button>
                    <button
                      onClick={() => setManualAddCourt(court)}
                      disabled={benchPlayers.length === 0}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-dark-100 text-light-200 hover:bg-dark-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Manual Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Queue Section */}
      <section>
        <h2 className="text-xl font-bold mb-4">Waiting Queue ({queue.length})</h2>
        {queueGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {queueGroups.map((group, i) => (
              <div key={i} className="bg-secondary p-4 rounded-2xl border border-dark-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-sm">Queue {i + 1}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                    group.length === 4 ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                  }`}>
                    {group.length}/4
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {group.map((p) => (
                    <PlayerTag key={p.id} player={p} />
                  ))}
                </div>
                <button
                  onClick={() => {
                    const groupIds = new Set(group.map((p) => p.id));
                    dispatch(setQueue(queue.filter((id) => !groupIds.has(id))));
                    showToast(`${group.length} players returned to bench`);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-danger/15 text-danger hover:bg-danger/25"
                >
                  Dissolve
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-secondary rounded-2xl border border-dark-100 p-6">
            <p className="text-light-300 text-center">Queue is empty. Use Auto Queue or Manual Queue to add players.</p>
          </div>
        )}
      </section>

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

      {/* Roll Dice Confirm (incompatible levels) */}
      <ConfirmDialog
        open={!!rollConfirm}
        onClose={() => setRollConfirm(null)}
        onConfirm={handleForceRoll}
        title="Incompatible Levels"
        message={rollConfirm ?? ''}
        confirmLabel="Proceed Anyway"
      />

      {/* Reset Session Confirm */}
      <ConfirmDialog
        open={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetSession}
        title="Reset Session"
        message="This will reset all player game counts to 0, clear all courts, and empty the queue. Are you sure?"
        confirmLabel="Reset All"
        danger
      />

      {/* Manual Queue Court Type Picker */}
      {showQueueTypePicker && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowQueueTypePicker(false)}>
          <div className="bg-secondary border border-dark-100 rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Queue for which court type?</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setShowQueueTypePicker(false); setShowManualQueue('singles'); }}
                className="p-4 rounded-xl border-2 border-info/30 text-center hover:border-info hover:bg-info/5 transition-colors"
              >
                <div className="font-semibold text-sm text-info">Singles</div>
                <div className="text-xs text-light-300 mt-1">Max 2 players</div>
              </button>
              <button
                onClick={() => { setShowQueueTypePicker(false); setShowManualQueue('doubles'); }}
                className="p-4 rounded-xl border-2 border-success/30 text-center hover:border-success hover:bg-success/5 transition-colors"
              >
                <div className="font-semibold text-sm text-success">Doubles</div>
                <div className="text-xs text-light-300 mt-1">Max 4 players</div>
              </button>
            </div>
            <button
              onClick={() => setShowQueueTypePicker(false)}
              className="mt-4 w-full px-4 py-2 rounded-xl text-light-200 hover:bg-dark-200 text-center text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Manual Queue Modal */}
      <ManualSelectModal
        open={!!showManualQueue}
        onClose={() => setShowManualQueue(null)}
        title={`Add to Queue (${showManualQueue === 'singles' ? 'Singles' : 'Doubles'})`}
        players={benchPlayers}
        maxSelect={showManualQueue === 'singles' ? 2 : 4}
        onConfirm={handleManualQueueConfirm}
      />

      {/* Manual Add to Court Modal */}
      {manualAddCourt && (
        <ManualSelectModal
          open
          onClose={() => setManualAddCourt(null)}
          title={`Add players to ${manualAddCourt.name}`}
          players={benchPlayers}
          maxSelect={(manualAddCourt.isSingle ? 2 : 4) - manualAddCourt.players.length}
          onConfirm={handleManualAddToCourt}
        />
      )}

      {/* Assign Queue Group Modal */}
      {assignCourt && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setAssignCourt(null)}>
          <div className="bg-secondary border border-dark-100 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Assign to {assignCourt.name}</h2>
            <p className="text-light-200 text-sm mb-4">
              Select a queue group ({assignCourt.isSingle ? '2' : '4'} players needed):
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {queueGroups.map((group, i) => {
                const needed = assignCourt.isSingle ? 2 : 4;
                if (group.length < needed) return null;
                return (
                  <button
                    key={i}
                    onClick={() => handleAssignQueue(i)}
                    className="w-full p-3 rounded-xl border border-dark-100 hover:border-accent/50 hover:bg-accent/5 text-left"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-sm">Queue {i + 1}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {group.slice(0, needed).map((p) => (
                        <PlayerTag key={p.id} player={p} />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setAssignCourt(null)}
              className="mt-4 w-full px-4 py-2 rounded-xl text-light-200 hover:bg-dark-200 text-center"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
