'use client';

import { useState, useEffect } from 'react';
import { type Player } from '@badminton/types';
import { Modal } from './Modal';
import { PlayerLevelBadge } from './PlayerLevelBadge';

interface ManualSelectModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  players: Player[];
  maxSelect: number;
  onConfirm: (selectedIds: string[]) => void;
  initialSelected?: string[];
}

export function ManualSelectModal({
  open,
  onClose,
  title,
  players,
  maxSelect,
  onConfirm,
  initialSelected,
}: ManualSelectModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (open) {
      setSelected(new Set(initialSelected ?? []));
      setSearch('');
    }
  }, [open, initialSelected]);

  const filtered = players.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < maxSelect) {
        next.add(id);
      }
      return next;
    });
  }

  function handleConfirm() {
    onConfirm(Array.from(selected));
    setSelected(new Set());
    setSearch('');
    onClose();
  }

  function handleClose() {
    setSelected(new Set());
    setSearch('');
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title={title}>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-dark-200 border border-dark-100 rounded-xl px-4 py-2 text-sm text-light-100 placeholder:text-light-300 outline-none focus:border-accent/50"
        />

        <div className="text-xs text-light-300 text-right">
          {selected.size}/{maxSelect} selected
        </div>

        <div className="max-h-64 overflow-y-auto space-y-1">
          {filtered.map((player) => {
            const isSelected = selected.has(player.id);
            const isDisabled = !isSelected && selected.size >= maxSelect;
            return (
              <button
                key={player.id}
                onClick={() => toggle(player.id)}
                disabled={isDisabled}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors ${
                  isSelected
                    ? 'bg-accent/10 border border-accent/30'
                    : isDisabled
                    ? 'opacity-40 cursor-not-allowed'
                    : 'hover:bg-dark-200 border border-transparent'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    isSelected ? 'border-accent bg-accent' : 'border-dark-100'
                  }`}
                >
                  {isSelected && <span className="text-primary text-xs font-bold">✓</span>}
                </div>
                <PlayerLevelBadge level={player.level} />
                <span className="flex-1 text-sm">{player.name}</span>
                <span className="text-xs text-light-300">{player.gameCount}g</span>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-light-300 py-4 text-sm">No players available</p>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <button onClick={handleClose} className="px-4 py-2 rounded-xl text-light-200 hover:bg-dark-200">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selected.size === 0}
            className="px-4 py-2 rounded-xl bg-accent text-primary font-semibold hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm ({selected.size})
          </button>
        </div>
      </div>
    </Modal>
  );
}
