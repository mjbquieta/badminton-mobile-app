import { type Player } from '@badminton/types';
import {
	shuffle,
	chunkBy,
	buildPlayerMap,
	buildCompatibleBenchQueueIds,
	sortQueueIdsByGameCountPriority,
} from '@badminton/core';
import { assignPlayersToCourtsBulk, endGame } from '../slices/courts';
import type { AppDispatch, RootState } from '../configure-store';
import { incrementPlayersGameCount } from '../slices/players';
import { setQueue } from '../slices/queue';

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
			return {
				needsConfirmation: true as const,
				playersAdded: 0,
				message:
					"Not enough compatible bench players to form a fair game.\n\nAllowed pairings:\n- Beginner + Intermediate\n- Intermediate + Advanced\n- Advanced + Pro\n\nProceed anyway?",
			};
		}

		if (fullCount === 0) {
			// Not enough bench players to form a doubles queue.
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
		const playersNeeded = court.isSingle ? 2 : 4;
		dispatch(incrementPlayersGameCount(endedIds));
		dispatch(endGame(endedIds));

		// Auto-assign the next queue group to this court.
		const updatedQueue = getState().queue.ids;
		if (updatedQueue.length >= playersNeeded) {
			const nextGroupIds = updatedQueue.slice(0, playersNeeded);
			const playerMap = buildPlayerMap(getState().players.items);
			const nextPlayers: Player[] = [];
			for (const id of nextGroupIds) {
				const p = playerMap.get(id);
				if (p) nextPlayers.push(p);
			}
			if (nextPlayers.length === playersNeeded) {
				dispatch(assignPlayersToCourtsBulk({ assignments: [{ courtId, players: nextPlayers }] }));
				dispatch(setQueue(updatedQueue.slice(playersNeeded)));
				return { warnedQueueEmpty: false };
			}
		}

		const warnedQueueEmpty = !court.isSingle && updatedQueue.length < playersNeeded;
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

/**
 * Sends players on a court back to the end of the queue.
 * Does NOT count games - the game is not considered finished.
 */
export const backToQueue =
	(courtId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
		const state = getState();
		const court = state.courts.items.find((c) => c.id === courtId);
		if (!court || court.players.length === 0) return;

		const playerIds = court.players.map((p) => p.id);
		dispatch(endGame(playerIds));
		const currentQueue = getState().queue.ids;
		dispatch(setQueue([...currentQueue, ...playerIds]));
	};
