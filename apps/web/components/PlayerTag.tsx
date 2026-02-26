'use client';

import { type Player } from '@badminton/types';
import { PlayerAvatar } from './PlayerAvatar';
import { PlayerLevelBadge } from './PlayerLevelBadge';

interface PlayerTagProps {
  player: Player;
}

export function PlayerTag({ player }: PlayerTagProps) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-dark-200 rounded-lg px-2 py-1">
      <PlayerAvatar player={player} size="sm" />
      <PlayerLevelBadge level={player.level} />
      <span className="text-sm text-light-100">{player.name}</span>
      <span className="text-xs text-light-300">{player.gameCount}g</span>
    </span>
  );
}
