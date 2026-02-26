import { type Player } from '@badminton/types';
import { levelIndex } from './level-index';

/**
 * Checks if a group of players can play together based on skill level compatibility
 * Rule: Only adjacent skill bands are allowed (max 1 level difference)
 * - BEGINNER ↔ INTERMEDIATE
 * - INTERMEDIATE ↔ ADVANCED
 * - ADVANCED ↔ PRO
 *
 * @param players - Array of players to check
 * @returns true if players can play together, false otherwise
 */
export const canPlayTogether = (players: Player[]): boolean => {
	if (players.length === 0) return true;

	let min = Infinity;
	let max = -Infinity;

	for (const p of players) {
		const idx = levelIndex[p.level];
		if (idx < min) min = idx;
		if (idx > max) max = idx;
	}

	// Only adjacent bands are allowed
	return max - min <= 1;
};
