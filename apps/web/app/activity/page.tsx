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
  const [showManualQueue, setShowManualQueue] = useState(false);
  const [assignCourt, setAssignCourt] = useState<Court | null>(null);
  const [showRollConfirm, setShowRollConfirm] = useState(false);

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
  const emptyCourts = courts.filter((c) => c.players.length === 0 && !c.isSingle);

  // Actions
  function handleAutoQueue() {
    const result = dispatch(rollDice());
    // rollDice returns thunk result with needsConfirmation
    if ((result as any)?.payload?.needsConfirmation) {
      setShowRollConfirm(true);
    }
  }

  function handleForceRoll() {
    dispatch(rollDice({ allowIncompatible: true }));
    setShowRollConfirm(false);
  }

  function handleManualQueueConfirm(selectedIds: string[]) {
    dispatch(setQueue([...queue, ...selectedIds]));
  }

  function handleAssignQueue(groupIndex: number) {
    if (!assignCourt) return;
    const group = queueGroups[groupIndex];
    if (group.length !== 4) return;

    dispatch(assignPlayersToCourtsBulk({
      assignments: [{ courtId: assignCourt.id, players: group }],
    }));

    // Remove assigned group from queue
    const assignedIds = new Set(group.map((p) => p.id));
    dispatch(setQueue(queue.filter((id) => !assignedIds.has(id))));
    setAssignCourt(null);
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

  const actionMessages: Record<string, { title: string; message: string; label: string; danger: boolean }> = {
    finish: { title: 'Finish Game', message: 'End this game? Game counts will be incremented and the next queue group will be assigned.', label: 'Finish', danger: false },
    dissolve: { title: 'Dissolve', message: 'Remove all players? No game counts will change.', label: 'Dissolve', danger: true },
    backToQueue: { title: 'Back to Queue', message: 'Send these players to the end of the queue?', label: 'Back to Queue', danger: false },
  };

  return (
    <div className="p-8 max-w-6xl">
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
              <span className="text-xl font-bold">{emptyCourts.length}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowManualQueue(true)}
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
                      <button
                        onClick={() => setActionTarget({ court, action: 'dissolve' })}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-danger/15 text-danger hover:bg-danger/25"
                      >
                        Dissolve
                      </button>
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
      {emptyCourts.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Available Courts ({emptyCourts.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emptyCourts.map((court) => (
              <div key={court.id} className="bg-secondary p-5 rounded-2xl border border-dark-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">{court.name}</h3>
                  <span className="text-xs text-light-300">{court.isSingle ? 'Singles' : 'Doubles'}</span>
                </div>
                <button
                  onClick={() => setAssignCourt(court)}
                  disabled={queueGroups.filter((g) => g.length === 4).length === 0}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent/15 text-accent hover:bg-accent/25 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  From Queue
                </button>
              </div>
            ))}
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
                <div className="flex flex-wrap gap-1.5">
                  {group.map((p) => (
                    <PlayerTag key={p.id} player={p} />
                  ))}
                </div>
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
        open={showRollConfirm}
        onClose={() => setShowRollConfirm(false)}
        onConfirm={handleForceRoll}
        title="Incompatible Levels"
        message="Some players have incompatible skill levels. Proceed anyway?"
        confirmLabel="Proceed"
      />

      {/* Manual Queue Modal */}
      <ManualSelectModal
        open={showManualQueue}
        onClose={() => setShowManualQueue(false)}
        title="Add to Queue"
        players={benchPlayers}
        maxSelect={Math.max(4, benchPlayers.length)}
        onConfirm={handleManualQueueConfirm}
      />

      {/* Assign Queue Group Modal */}
      {assignCourt && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setAssignCourt(null)}>
          <div className="bg-secondary border border-dark-100 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Assign to {assignCourt.name}</h2>
            <p className="text-light-200 text-sm mb-4">Select a queue group:</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {queueGroups.map((group, i) => {
                if (group.length !== 4) return null;
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
                      {group.map((p) => (
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
