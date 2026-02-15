import { PlayerLevel, type Player } from '@badminton/types';
import { shuffle } from '../utils/shuffle';
import { chunkBy, buildPlayerMap } from '../utils/array';
import { canPlayTogether } from './compatibility';

/**
 * Builds maximum number of compatible doubles groups (size 4) from bench players
 * using a sophisticated optimization algorithm.
 *
 * Compatibility rule: each group must fit in a window of 2 adjacent skill levels
 * Windows: [BEGINNER, INTERMEDIATE], [INTERMEDIATE, ADVANCED], [ADVANCED, PRO]
 *
 * Algorithm:
 * 1. Separates players into skill buckets
 * 2. Tries all possible allocations of INTERMEDIATE and ADVANCED players across windows
 * 3. Optimizes for: maximum groups formed, then minimum leftover players
 * 4. Returns player IDs in groups of 4
 *
 * @param benchPlayers - Array of available bench players
 * @returns Array of player IDs forming complete groups of 4
 */
export const buildCompatibleBenchQueueIds = (benchPlayers: Player[]): string[] => {
	// Separate players by skill level
	const beginners = benchPlayers.filter((p) => p.level === PlayerLevel.BEGINNER);
	const intermediates = benchPlayers.filter((p) => p.level === PlayerLevel.INTERMEDIATE);
	const advanceds = benchPlayers.filter((p) => p.level === PlayerLevel.ADVANCED);
	const pros = benchPlayers.filter((p) => p.level === PlayerLevel.PRO);

	// Shuffle within buckets to preserve randomness
	shuffle(beginners);
	shuffle(intermediates);
	shuffle(advanceds);
	shuffle(pros);

	const B = beginners.length;
	const I = intermediates.length;
	const A = advanceds.length;
	const P = pros.length;

	// Find optimal allocation of intermediates and advanceds across windows
	let best = {
		totalGroups: 0,
		iToBI: 0, // intermediates allocated to [Beginner, Intermediate] window
		aToAP: 0, // advanceds allocated to [Advanced, Pro] window
		leftover: Infinity,
	};

	// Try all possible allocations
	for (let iToBI = 0; iToBI <= I; iToBI++) {
		for (let aToAP = 0; aToAP <= A; aToAP++) {
			const gBI = Math.floor((B + iToBI) / 4); // Groups in BI window
			const gAP = Math.floor((P + aToAP) / 4); // Groups in AP window
			const gIA = Math.floor((I - iToBI + (A - aToAP)) / 4); // Groups in IA window
			const totalGroups = gBI + gAP + gIA;

			// Prefer more groups; tie-break by fewer leftovers
			const used = totalGroups * 4;
			const leftover = B + I + A + P - used;

			if (
				totalGroups > best.totalGroups ||
				(totalGroups === best.totalGroups && leftover < best.leftover)
			) {
				best = { totalGroups, iToBI, aToAP, leftover };
			}
		}
	}

	// No groups can be formed
	if (best.totalGroups === 0) return [];

	// Allocate players to windows based on optimal solution
	const iToBIPlayers = intermediates.slice(0, best.iToBI);
	const iToIAPlayers = intermediates.slice(best.iToBI);
	const aToAPPlayers = advanceds.slice(0, best.aToAP);
	const aToIAPlayers = advanceds.slice(best.aToAP);

	// Build windows and shuffle to mix skill levels
	const windowBI = shuffle([...beginners, ...iToBIPlayers]);
	const windowIA = shuffle([...iToIAPlayers, ...aToIAPlayers]);
	const windowAP = shuffle([...aToAPPlayers, ...pros]);

	// Extract full groups of 4 from each window
	const ids: string[] = [];
	for (const group of chunkBy(windowBI, 4)) {
		if (group.length === 4 && canPlayTogether(group)) {
			ids.push(...group.map((p) => p.id));
		}
	}
	for (const group of chunkBy(windowIA, 4)) {
		if (group.length === 4 && canPlayTogether(group)) {
			ids.push(...group.map((p) => p.id));
		}
	}
	for (const group of chunkBy(windowAP, 4)) {
		if (group.length === 4 && canPlayTogether(group)) {
			ids.push(...group.map((p) => p.id));
		}
	}

	// Ensure we only return full groups
	const fullLen = Math.floor(ids.length / 4) * 4;
	return ids.slice(0, fullLen);
};

/**
 * Sorts queue IDs by cumulative game count priority while preserving group integrity
 *
 * IMPORTANT: Groups of 4 are treated as atomic units to preserve skill-based matching.
 * Sorting individual IDs would reshuffle group composition and break level compatibility.
 *
 * Algorithm:
 * 1. Chunks IDs into groups of 4
 * 2. Calculates cumulative game count for each group
 * 3. Sorts groups by total game count (lowest first = higher priority)
 * 4. Flattens groups back into ID array
 * 5. Appends any remainder IDs (< 4) at the end
 *
 * @param ids - Array of player IDs in queue
 * @param playerMap - Map of player ID to Player object for game count lookup
 * @returns Sorted array of player IDs with groups prioritized by game count
 */
export const sortQueueIdsByGameCountPriority = (
	ids: string[],
	playerMap: Map<string, Player>
): string[] => {
	// Separate full groups from remainder
	const fullLen = Math.floor(ids.length / 4) * 4;
	const fullIds = ids.slice(0, fullLen);
	const remainder = ids.slice(fullLen);

	// Calculate score (total game count) for each group
	const groups = chunkBy(fullIds, 4).map((group, idx) => ({
		group,
		idx,
		score: group.reduce((acc, id) => acc + (playerMap.get(id)?.gameCount ?? 999), 0),
	}));

	// Sort by score (ascending), with stable sort for ties
	groups.sort((a, b) => {
		const diff = a.score - b.score;
		if (diff !== 0) return diff;
		return a.idx - b.idx; // Stable sort
	});

	// Flatten groups and append remainder
	return [...groups.flatMap((g) => g.group), ...remainder];
};
