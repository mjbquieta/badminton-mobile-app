import { BadmintonPalette } from '../theme/palette';

export type PlayerStatus = 'in_game' | 'in_queue' | 'bench';

export type PlayerStatusConfig = {
  icon: string;
  color: string;
  label: string;
  bgClass: string;
  borderClass: string;
};

/**
 * Configuration for player status display
 * Defines visual appearance and labels for each status state
 */
export const playerStatusConfig: Record<PlayerStatus, PlayerStatusConfig> = {
  in_game: {
    icon: 'badminton',
    color: BadmintonPalette.status.inGame,
    label: 'In Game',
    bgClass: 'bg-danger/10',
    borderClass: 'border-danger/30',
  },
  in_queue: {
    icon: 'timer-sand',
    color: BadmintonPalette.status.waiting,
    label: 'In Queue',
    bgClass: 'bg-success/10',
    borderClass: 'border-success/30',
  },
  bench: {
    icon: 'account-outline',
    color: BadmintonPalette.status.bench,
    label: 'Bench',
    bgClass: 'bg-dark-100',
    borderClass: 'border-dark-100',
  },
};
