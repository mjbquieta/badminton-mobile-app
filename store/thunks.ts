import { type Player } from "@/types/players";
import { shuffle } from "@/utils/shuffle";
import { assignPlayersToCourtsBulk, endGame } from "./courtSlice";
import type { AppDispatch, RootState } from "./index";
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
	() => (dispatch: AppDispatch, getState: () => RootState) => {
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
			return;
		}

		// Randomly group BENCH players into sets of 4. Any remainder (<4) stays on the bench.
		const shuffledBench = shuffle([...benchPlayers]);
		const fullCount = Math.floor(shuffledBench.length / 4) * 4;
		if (fullCount === 0) {
			// Not enough bench players to form a doubles queue.
			dispatch(fillDoublesCourtsFromQueue());
			return;
		}

		const newQueueIds = shuffledBench.slice(0, fullCount).map((p) => p.id);
		const nextQueueIds = [...state.queue.ids, ...newQueueIds];

		dispatch(setQueue(nextQueueIds));
		dispatch(fillDoublesCourtsFromQueue());
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
		dispatch(endGame(endedIds));
		const queueIdsBeforeFill = getState().queue.ids;
		dispatch(fillDoublesCourtsFromQueue());

		// If this was a doubles court and we have no full queue to replace the finished game,
		// warn and leave the court empty until the user re-rolls the dice.
		// const warnedQueueEmpty = !court.isSingle && queueIdsBeforeFill.length < 4;
		const warnedQueueEmpty = false;
		return { warnedQueueEmpty };
	};
