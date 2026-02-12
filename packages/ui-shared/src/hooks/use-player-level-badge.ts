import type { PlayerLevel } from '@badminton/types';
import { playerLevelConfig } from '../config/player-level';

export type BadgeSize = 'sm' | 'xs';

/**
 * View model hook for PlayerLevelBadge component
 * Computes size and display properties based on level and size
 *
 * @param level - Player skill level
 * @param size - Badge size variant
 * @param showLabel - Whether to show full label or short label
 * @returns View model with computed display properties
 */
export function usePlayerLevelBadgeViewModel(
  level: PlayerLevel,
  size: BadgeSize = 'sm',
  showLabel: boolean = true
) {
  const config = playerLevelConfig[level];

  // Compute size-dependent properties
  const fontSize = size === 'xs' ? 10 : 12;
  const paddingClass = size === 'xs' ? 'px-1.5 py-0.5' : 'px-2 py-0.5';

  // Select label based on showLabel flag
  const displayLabel = showLabel ? config.label : config.shortLabel;

  return {
    // Label
    displayLabel,

    // Colors
    textColor: config.color,
    bgClass: config.bgClass,

    // Size properties
    fontSize,
    paddingClass,

    // Raw config for custom rendering
    config,
  };
}
