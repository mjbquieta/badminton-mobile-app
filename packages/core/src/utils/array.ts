import type { Player } from '@badminton/types';

/**
 * Chunks an array into smaller arrays of specified size
 * @param arr - Array to chunk
 * @param size - Size of each chunk
 * @returns Array of chunks
 */
export const chunkBy = <T>(arr: T[], size: number): T[][] => {
	const out: T[][] = [];
	for (let i = 0; i < arr.length; i += size) {
		out.push(arr.slice(i, i + size));
	}
	return out;
};

/**
 * Builds a Map of player ID to Player for O(1) lookups
 * @param players - Array of players
 * @returns Map of player ID to Player object
 */
export const buildPlayerMap = (players: Player[]): Map<string, Player> => {
	const m = new Map<string, Player>();
	for (const p of players) {
		m.set(p.id, p);
	}
	return m;
};
