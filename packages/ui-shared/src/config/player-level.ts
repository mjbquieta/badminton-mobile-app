import type { PlayerLevel } from '@badminton/types';
import { BadmintonPalette } from '../theme/palette';

export type PlayerLevelConfig = {
  label: string;
  shortLabel: string;
  color: string;
  bgClass: string;
};

/**
 * Configuration for player level badges
 * Defines visual appearance and labels for each skill level
 */
export const playerLevelConfig: Record<PlayerLevel, PlayerLevelConfig> = {
  BEGINNER: {
    label: 'Beginner',
    shortLabel: 'B',
    color: BadmintonPalette.levels.beginner,
    bgClass: 'bg-beginner/15 border-beginner/40',
  },
  INTERMEDIATE: {
    label: 'Intermediate',
    shortLabel: 'I',
    color: BadmintonPalette.levels.intermediate,
    bgClass: 'bg-intermediate/15 border-intermediate/40',
  },
  ADVANCED: {
    label: 'Advanced',
    shortLabel: 'A',
    color: BadmintonPalette.levels.advanced,
    bgClass: 'bg-advanced/15 border-advanced/40',
  },
  PRO: {
    label: 'Pro',
    shortLabel: 'P',
    color: BadmintonPalette.levels.pro,
    bgClass: 'bg-pro/15 border-pro/40',
  },
};
