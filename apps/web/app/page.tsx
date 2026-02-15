'use client';

import { useState } from 'react';
import { useAppSelector, useAppDispatch, rollDice } from '@badminton/store';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const players = useAppSelector((state) => state.players.items);
  const courts = useAppSelector((state) => state.courts.items);
  const queue = useAppSelector((state) => state.queue.ids);

  const [rollConfirm, setRollConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Calculate stats
  const totalPlayers = players.length;
  const inGame = players.filter((p) =>
    courts.some((c) => c.players.some((cp) => cp.id === p.id))
  ).length;
  const inQueue = queue.length;
  const onBench = totalPlayers - inGame - inQueue;
  const availableCourts = courts.filter((c) => c.players.length === 0).length;

  function handleRollDice() {
    const result = dispatch(rollDice()) as unknown as { needsConfirmation: boolean; playersAdded: number; message?: string };
    if (result?.needsConfirmation) {
      setRollConfirm(result.message ?? 'Incompatible skill levels. Proceed anyway?');
    } else if (result?.playersAdded > 0) {
      setToast(`${result.playersAdded} players added to queue`);
      setTimeout(() => setToast(null), 3000);
    } else if (result?.playersAdded === 0) {
      setToast('Not enough bench players to form a group');
      setTimeout(() => setToast(null), 3000);
    }
  }

  function handleForceRoll() {
    const result = dispatch(rollDice({ allowIncompatible: true })) as unknown as { playersAdded: number };
    setRollConfirm(null);
    if (result?.playersAdded > 0) {
      setToast(`${result.playersAdded} players added to queue`);
      setTimeout(() => setToast(null), 3000);
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto bg-success/90 text-white px-4 py-2 rounded-xl text-sm font-medium z-50 shadow-elevated">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-light-300 text-sm mt-1">Session overview</p>
        </div>
        <button
          onClick={handleRollDice}
          disabled={onBench === 0}
          className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-accent text-primary font-semibold hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed text-sm sm:text-base shrink-0"
        >
          Roll Dice
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
        <div className="bg-secondary p-3 sm:p-5 rounded-2xl border border-dark-100">
          <h3 className="text-light-300 text-[10px] sm:text-xs mb-1">Players</h3>
          <p className="text-xl sm:text-3xl font-bold">{totalPlayers}</p>
        </div>
        <div className="bg-secondary p-3 sm:p-5 rounded-2xl border border-dark-100">
          <h3 className="text-light-300 text-[10px] sm:text-xs mb-1">In Game</h3>
          <p className="text-xl sm:text-3xl font-bold text-danger">{inGame}</p>
        </div>
        <div className="bg-secondary p-3 sm:p-5 rounded-2xl border border-dark-100">
          <h3 className="text-light-300 text-[10px] sm:text-xs mb-1">In Queue</h3>
          <p className="text-xl sm:text-3xl font-bold text-success">{inQueue}</p>
        </div>
        <div className="bg-secondary p-3 sm:p-5 rounded-2xl border border-dark-100">
          <h3 className="text-light-300 text-[10px] sm:text-xs mb-1">On Bench</h3>
          <p className="text-xl sm:text-3xl font-bold text-light-300">{onBench}</p>
        </div>
        <div className="bg-secondary p-3 sm:p-5 rounded-2xl border border-dark-100">
          <h3 className="text-light-300 text-[10px] sm:text-xs mb-1">Courts Free</h3>
          <p className="text-xl sm:text-3xl font-bold text-info">{availableCourts}/{courts.length}</p>
        </div>
      </div>

      {/* Roll Dice Incompatible Confirm */}
      <ConfirmDialog
        open={!!rollConfirm}
        onClose={() => setRollConfirm(null)}
        onConfirm={handleForceRoll}
        title="Incompatible Levels"
        message={rollConfirm ?? ''}
        confirmLabel="Proceed Anyway"
      />
    </div>
  );
}
