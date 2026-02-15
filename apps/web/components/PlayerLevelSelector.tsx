'use client';

import { PlayerLevel } from '@badminton/types';
import { playerLevelConfig } from '@badminton/ui-shared';

interface PlayerLevelSelectorProps {
  value: PlayerLevel;
  onChange: (level: PlayerLevel) => void;
}

const levels = [
  PlayerLevel.BEGINNER,
  PlayerLevel.INTERMEDIATE,
  PlayerLevel.ADVANCED,
  PlayerLevel.PRO,
];

export function PlayerLevelSelector({ value, onChange }: PlayerLevelSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {levels.map((level) => {
        const config = playerLevelConfig[level];
        const isSelected = value === level;
        return (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border transition-colors ${
              isSelected
                ? 'border-current'
                : 'border-dark-100 hover:border-dark-100/50'
            }`}
            style={{ color: config.color }}
          >
            <span className="text-lg font-bold">{config.shortLabel}</span>
            <span className="text-[10px]">{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}
