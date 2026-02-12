import type { Player } from '@badminton/types';
import { playerStatusConfig, type PlayerStatus } from '../config/player-status';

/**
 * View model hook for PlayerCard component
 * Extracts display logic from UI implementation
 *
 * @param player - Player data
 * @param status - Current player status
 * @param courtName - Optional court name if player is in game
 * @returns View model with computed display properties
 */
export function usePlayerCardViewModel(
  player: Player,
  status: PlayerStatus,
  courtName?: string
) {
  const config = playerStatusConfig[status];

  // Compute display label with court name if applicable
  const displayLabel =
    status === 'in_game' && courtName
      ? `${config.label} · ${courtName}`
      : config.label;

  // Format game count text
  const gameCountText = `${player.gameCount} ${
    player.gameCount === 1 ? 'game' : 'games'
  }`;

  return {
    // Status display
    statusIcon: config.icon,
    statusColor: config.color,
    statusLabel: displayLabel,
    statusBgClass: config.bgClass,
    statusBorderClass: config.borderClass,

    // Player info
    playerName: player.name,
    playerLevel: player.level,
    gameCountText,

    // Raw config for custom rendering
    config,
  };
}
