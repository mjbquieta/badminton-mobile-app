'use client';

import { type PlayerLevel } from '@badminton/types';
import { playerLevelConfig } from '@badminton/ui-shared';

interface PlayerLevelBadgeProps {
  level: PlayerLevel;
  size?: 'sm' | 'md';
}

export function PlayerLevelBadge({ level, size = 'sm' }: PlayerLevelBadgeProps) {
  const config = playerLevelConfig[level];

  return (
    <span
      className={`inline-flex items-center justify-center font-bold rounded ${
        size === 'sm' ? 'text-[10px] w-5 h-5' : 'text-xs px-2 py-0.5'
      }`}
      style={{ color: config.color, backgroundColor: `${config.color}15` }}
    >
      {size === 'sm' ? config.shortLabel : config.label}
    </span>
  );
}
