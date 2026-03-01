'use client';

import { useState, useEffect, useMemo } from 'react';
import { PlayerLevel, type Player } from '@badminton/types';
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
  draftCounts?: Map<string, number>;
}

export function ManualSelectModal({
  open,
  onClose,
  title,
  players,
  maxSelect,
  onConfirm,
  initialSelected,
  draftCounts,
}: ManualSelectModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'level'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  function handleSort(field: 'name' | 'level') {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  }

  useEffect(() => {
    if (open) {
      setSelected(new Set(initialSelected ?? []));
      setSearch('');
    }
  }, [open, initialSelected]);

  const levelOrder = {
    [PlayerLevel.BEGINNER]: 0,
    [PlayerLevel.INTERMEDIATE]: 1,
    [PlayerLevel.ADVANCED]: 2,
    [PlayerLevel.PRO]: 3,
  };

  const filtered = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    const list = players.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
    return list.sort((a, b) => {
      if (sortBy === 'name') {
        return dir * a.name.localeCompare(b.name);
      }
      const lvl = levelOrder[a.level] - levelOrder[b.level];
      return lvl !== 0 ? dir * lvl : a.name.localeCompare(b.name);
    });
  }, [players, search, sortBy, sortDir]);

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
    <Modal open={open} onClose={handleClose} title={title} size="lg">
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-dark-200 border border-dark-100 rounded-xl px-4 py-2 text-sm text-light-100 placeholder:text-light-300 outline-none focus:border-accent/50"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-xs text-light-300">
              {selected.size}/{maxSelect} selected
            </div>
            <span className="text-light-300/20">|</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-light-300/50">Sort:</span>
              <button
                onClick={() => handleSort('name')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${sortBy === 'name' ? 'bg-accent/15 text-accent border border-accent/30' : 'text-light-300/60 hover:text-light-100 hover:bg-dark-100 border border-transparent'}`}
              >
                Name
                {sortBy === 'name' && <span className="text-[10px]">{sortDir === 'asc' ? '↑' : '↓'}</span>}
              </button>
              <button
                onClick={() => handleSort('level')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${sortBy === 'level' ? 'bg-accent/15 text-accent border border-accent/30' : 'text-light-300/60 hover:text-light-100 hover:bg-dark-100 border border-transparent'}`}
              >
                Level
                {sortBy === 'level' && <span className="text-[10px]">{sortDir === 'asc' ? '↑' : '↓'}</span>}
              </button>
            </div>
          </div>
          {draftCounts && (
            <div className="flex items-center gap-1.5 text-[10px] text-light-300/50 uppercase tracking-wider">
              <span className="w-10 text-center">Drafts</span>
              <span className="text-light-300/20">|</span>
              <span className="w-10 text-center">Games</span>
            </div>
          )}
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
                <div className="flex items-center gap-1.5 shrink-0 text-[11px] tabular-nums">
                  {draftCounts && (
                    <>
                      <span className="w-10 text-center text-light-300/60">{draftCounts.get(player.id) ?? 0}</span>
                      <span className="text-light-300/30">|</span>
                    </>
                  )}
                  <span className="w-10 text-center text-light-300">{player.gameCount}</span>
                </div>
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
