import { PlayerLevel, type Player } from "@/types/players";
import { shuffle } from "@/utils/shuffle";
import { assignPlayersToCourtsBulk, endGame } from "./courtSlice";
import type { AppDispatch, RootState } from "./index";
import { incrementPlayersGameCount } from "./playersSlice";
import { setQueue } from "./queueSlice";

const chunkBy = <T>(arr: T[], size: number): T[][] => {
	const out: T[][] = [];
	for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
	return out;
};

const buildPlayerMap = (players: Player[]) => {
	const m = new Map<string, Player>();
	for (const p of players) m.set(p.id, p);
	return m;
};

const levelIndex: Record<PlayerLevel, number> = {
	BEGINNER: 0,
	INTERMEDIATE: 1,
	ADVANCED: 2,
	PRO: 3,
};

const canPlayTogether = (players: Player[]): boolean => {
	if (players.length === 0) return true;
	let min = Infinity;
	let max = -Infinity;
	for (const p of players) {
		const idx = levelIndex[p.level];
		if (idx < min) min = idx;
		if (idx > max) max = idx;
	}
	// Only adjacent bands are allowed:
	// Beginner↔Intermediate, Intermediate↔Advanced, Advanced↔Pro
	return max - min <= 1;
};

const buildCompatibleBenchQueueIds = (benchPlayers: Player[]): string[] => {
	// Build maximum number of compatible doubles groups (size 4) from bench players.
	// Compatibility rule: each group must fit in a window of 2 adjacent levels.
	const beginners = benchPlayers.filter((p) => p.level === PlayerLevel.BEGINNER);
	const intermediates = benchPlayers.filter(
		(p) => p.level === PlayerLevel.INTERMEDIATE
	);
	const advanceds = benchPlayers.filter((p) => p.level === PlayerLevel.ADVANCED);
	const pros = benchPlayers.filter((p) => p.level === PlayerLevel.PRO);

	// Preserve randomness by shuffling within buckets.
	shuffle(beginners);
	shuffle(intermediates);
	shuffle(advanceds);
	shuffle(pros);

	const B = beginners.length;
	const I = intermediates.length;
	const A = advanceds.length;
	const P = pros.length;

	let best = {
		totalGroups: 0,
		iToBI: 0, // intermediates allocated to [Beginner,Intermediate] window
		aToAP: 0, // advanceds allocated to [Advanced,Pro] window
		leftover: Infinity,
	};

	for (let iToBI = 0; iToBI <= I; iToBI++) {
		for (let aToAP = 0; aToAP <= A; aToAP++) {
			const gBI = Math.floor((B + iToBI) / 4);
			const gAP = Math.floor((P + aToAP) / 4);
			const gIA = Math.floor((I - iToBI + (A - aToAP)) / 4);
			const totalGroups = gBI + gAP + gIA;

			// Prefer more groups; tie-break by fewer leftovers.
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

	if (best.totalGroups === 0) return [];

	const iToBIPlayers = intermediates.slice(0, best.iToBI);
	const iToIAPlayers = intermediates.slice(best.iToBI);
	const aToAPPlayers = advanceds.slice(0, best.aToAP);
	const aToIAPlayers = advanceds.slice(best.aToAP);

	const windowBI = shuffle([...beginners, ...iToBIPlayers]);
	const windowIA = shuffle([...iToIAPlayers, ...aToIAPlayers]);
	const windowAP = shuffle([...aToAPPlayers, ...pros]);

	const ids: string[] = [];
	for (const group of chunkBy(windowBI, 4)) {
		if (group.length === 4 && canPlayTogether(group)) ids.push(...group.map((p) => p.id));
	}
	for (const group of chunkBy(windowIA, 4)) {
		if (group.length === 4 && canPlayTogether(group)) ids.push(...group.map((p) => p.id));
	}
	for (const group of chunkBy(windowAP, 4)) {
		if (group.length === 4 && canPlayTogether(group)) ids.push(...group.map((p) => p.id));
	}

	// Ensure we only return full groups.
	const fullLen = Math.floor(ids.length / 4) * 4;
	return ids.slice(0, fullLen);
};

const sortQueueIdsByGameCountPriority = (
	ids: string[],
	playerMap: Map<string, Player>
): string[] => {
	// IMPORTANT: Preserve groups of 4 as atomic units; sorting individual IDs would
	// reshuffle group composition and can break level-based matching.
	const fullLen = Math.floor(ids.length / 4) * 4;
	const fullIds = ids.slice(0, fullLen);
	const remainder = ids.slice(fullLen);

	const groups = chunkBy(fullIds, 4).map((group, idx) => ({
		group,
		idx,
		score: group.reduce((acc, id) => acc + (playerMap.get(id)?.gameCount ?? 999), 0),
	}));

	groups.sort((a, b) => {
		const diff = a.score - b.score;
		if (diff !== 0) return diff;
		return a.idx - b.idx; // stable
	});

	return [...groups.flatMap((g) => g.group), ...remainder];
};

export const fillDoublesCourtsFromQueue =
	() => (dispatch: AppDispatch, getState: () => RootState) => {
		const state = getState();
		const { courts, players, queue } = state;

		const emptyDoublesCourts = courts.items.filter(
			(c) => !c.isSingle && c.players.length === 0
		);
		if (emptyDoublesCourts.length === 0) return;

		// Queue is defined as groups of exactly 4 for doubles.
		if (queue.ids.length < 4) return;

		const playerMap = buildPlayerMap(players.items);
		const groups = chunkBy(queue.ids, 4);

		const assignments: { courtId: string; players: Player[] }[] = [];
		const consumedIds: string[] = [];

		for (let i = 0; i < emptyDoublesCourts.length; i++) {
			const group = groups[i];
			if (!group || group.length < 4) break;

			const groupPlayers: Player[] = [];
			for (const id of group) {
				const p = playerMap.get(id);
				if (!p) return; // shouldn't happen; fail safe: don't partially assign
				groupPlayers.push(p);
			}

			assignments.push({
				courtId: emptyDoublesCourts[i].id,
				players: groupPlayers,
			});
			consumedIds.push(...group);
		}

		if (assignments.length === 0) return;

		dispatch(assignPlayersToCourtsBulk({ assignments }));
		dispatch(setQueue(queue.ids.slice(consumedIds.length)));
	};

export const rollDice =
	(options?: { allowIncompatible?: boolean }) =>
	(dispatch: AppDispatch, getState: () => RootState) => {
		const state = getState();
		const courts = state.courts.items;
		const players = state.players.items;
		const queuedIds = new Set(state.queue.ids);

		const inGameIds = new Set(
			courts.flatMap((c) => c.players.map((p) => p.id))
		);
		const benchPlayers = players.filter(
			(p) => !inGameIds.has(p.id) && !queuedIds.has(p.id)
		);

		if (benchPlayers.length === 0) {
			// nothing to add; still try to fill any empty doubles courts from existing queue
			dispatch(fillDoublesCourtsFromQueue());
			return { needsConfirmation: false as const, playersAdded: 0 };
		}

		// Prefer forming compatible groups (adjacent skill bands only). Any remainder (<4)
		// stays on the bench.
		const shuffledBench = shuffle([...benchPlayers]);
		const compatibleQueueIds = buildCompatibleBenchQueueIds(shuffledBench);

		// If we can't form ANY compatible game but we *can* form a doubles group,
		// ask the UI to confirm before proceeding with mismatched levels.
		const fullCount = Math.floor(shuffledBench.length / 4) * 4;
		if (!options?.allowIncompatible && compatibleQueueIds.length === 0 && fullCount > 0) {
			dispatch(fillDoublesCourtsFromQueue());
			return {
				needsConfirmation: true as const,
				playersAdded: 0,
				message:
					"Not enough compatible bench players to form a fair game.\n\nAllowed pairings:\n- Beginner + Intermediate\n- Intermediate + Advanced\n- Advanced + Pro\n\nProceed anyway?",
			};
		}

		if (fullCount === 0) {
			// Not enough bench players to form a doubles queue.
			dispatch(fillDoublesCourtsFromQueue());
			return { needsConfirmation: false as const, playersAdded: 0 };
		}

		const newQueueIds =
			!options?.allowIncompatible && compatibleQueueIds.length > 0
				? compatibleQueueIds
				: shuffledBench.slice(0, fullCount).map((p) => p.id);
		const nextQueueIds = [...state.queue.ids, ...newQueueIds];
		const playerMap = buildPlayerMap(players);
		const prioritizedQueueIds = sortQueueIdsByGameCountPriority(
			nextQueueIds,
			playerMap
		);

		dispatch(setQueue(prioritizedQueueIds));
		dispatch(fillDoublesCourtsFromQueue());
		return { needsConfirmation: false as const, playersAdded: newQueueIds.length };
	};

export const endGameAndAdvanceQueue =
	(
		courtId: string
	): ((
		dispatch: AppDispatch,
		getState: () => RootState
	) => { warnedQueueEmpty: boolean }) =>
	(dispatch: AppDispatch, getState: () => RootState) => {
		const state = getState();
		const court = state.courts.items.find((c) => c.id === courtId);
		if (!court || court.players.length === 0)
			return { warnedQueueEmpty: false };

		const endedIds = court.players.map((p) => p.id);
		dispatch(incrementPlayersGameCount(endedIds));
		dispatch(endGame(endedIds));
		const queueIdsBeforeFill = getState().queue.ids;
		dispatch(fillDoublesCourtsFromQueue());

		// If this was a doubles court and we have no full queue to replace the finished game,
		// warn and leave the court empty until the user re-rolls the dice.
		// const warnedQueueEmpty = !court.isSingle && queueIdsBeforeFill.length < 4;
		const warnedQueueEmpty = false;
		return { warnedQueueEmpty };
	};

/**
 * Dissolves a court by removing all players and sending them back to the bench.
 * Does NOT count games - use this when the game didn't happen or was cancelled.
 */
export const dissolveCourt =
	(courtId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
		const state = getState();
		const court = state.courts.items.find((c) => c.id === courtId);
		if (!court || court.players.length === 0) return;

		const playerIds = court.players.map((p) => p.id);
		dispatch(endGame(playerIds));
	};
