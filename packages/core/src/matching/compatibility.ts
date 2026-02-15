import { PlayerLevel, type Player } from '@badminton/types';

/**
 * Maps PlayerLevel enum to numeric index for comparison
 */
const levelIndex: Record<PlayerLevel, number> = {
	BEGINNER: 0,
	INTERMEDIATE: 1,
	ADVANCED: 2,
	PRO: 3,
};

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
