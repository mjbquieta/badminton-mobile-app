import { type Court } from "@/types/courts";
import { type Player } from "@/types/players";
import { shuffle } from "@/utils/shuffle";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const testCourts = [
	{
		id: "e4c2ec55-4b3b-4fb1-8e06-3aabf6bbf001",
		name: "Court 1",
		players: [],
		isSingle: false,
	},
	{
		id: "1f0375d2-88d4-4bee-bdfa-b9f7fa92b6ee",
		name: "Court 2",
		players: [],
		isSingle: false,
	},
	{
		id: "2c56f7a6-47d3-480a-8f0e-6ad4d1e54f5a",
		name: "Court 3",
		players: [],
		isSingle: false,
	},
];

type CourtsState = {
	items: Court[];
	error: string | null;
};

const initialState: CourtsState = {
	items: testCourts,
	error: null,
};

const courtSlice = createSlice({
	name: "courts",
	initialState,
	reducers: {
		addCourt: (state, action: PayloadAction<Court>) => {
			state.items.push({
				...action.payload,
				name: `Court ${state.items.length + 1}`,
			});
			state.error = null;
		},
		removeCourt: (state, action: PayloadAction<string>) => {
			const court = state.items.find((c) => c.id === action.payload);

			if (!court) {
				state.error = "Court not found";
				return;
			}

			if (court.players.length > 0) {
				state.error = `Court ${court.name} has players. Please end the game first.`;
				return;
			}

			const playersInCourtIds = court.players.map((p) => p.id);
			const players = state.items.flatMap((c) => c.players);
			const playersInCourt = players.filter((p) =>
				playersInCourtIds.includes(p.id)
			);
			state.items = state.items.filter((c) => c.id !== action.payload);
			state.error = null;
		},
		clearCourts: (state) => {
			state.items = [];
			state.error = null;
		},
		clearCourtsError: (state) => {
			state.error = null;
		},
		assignPlayersToCourts: (
			state,
			action: PayloadAction<{ players: Player[] }>
		) => {
			const { players } = action.payload;
			const pool = shuffle([...players]); // already shuffled by caller

			state.items = state.items.map((court) => {
				const playersNeeded = court.isSingle ? 2 : 4;
				if (pool.length < playersNeeded) return { ...court, players: [] };
				const assigned = pool.splice(0, playersNeeded);
				return { ...court, players: assigned };
			});

			state.error = null;
		},
		removePlayerFromCourt: (
			state,
			action: PayloadAction<{ courtId: string; playerId: string }>
		) => {
			const { courtId, playerId } = action.payload;
			const court = state.items.find((c) => c.id === courtId);
			if (!court) {
				state.error = "Court not found";
				return;
			}
			court.players = court.players.filter((p) => p.id !== playerId);
			state.error = null;
		},
		assignPlayersToCourt: (
			state,
			action: PayloadAction<{ courtId: string; players: Player[] }>
		) => {
			const { courtId, players } = action.payload;
			const court = state.items.find((c) => c.id === courtId);
			if (!court) {
				state.error = "Court not found";
				return;
			}

			if (court.players.length > 0) {
				state.error = `${court.name} already has players. Please end the game first.`;
				return;
			}

			const playersInCourtIds = state.items
				.map((c) => c.players.map((p) => p.id))
				.flat();

			const playersNeeded = court.isSingle ? 2 : 4;
			if (players.length < playersNeeded) {
				state.error = "Not enough players. Please add more players.";
				return;
			}

			const allAvailablePlayers = players.filter(
				(p) => !playersInCourtIds.includes(p.id)
			);

			if (allAvailablePlayers.length < playersNeeded) {
				state.error = "Not enough players. Please add more players.";
				return;
			}

			const assigned = allAvailablePlayers.splice(0, playersNeeded);

			state.items = state.items.map((c) => {
				if (c.id === courtId) {
					return { ...c, players: assigned };
				}
				return c;
			});

			state.error = null;
		},
		addPlayersToCourtManually: (
			state,
			action: PayloadAction<{ courtId: string; players: Player[] }>
		) => {
			const { courtId, players } = action.payload;
			const court = state.items.find((c) => c.id === courtId);
			if (!court) {
				state.error = "Court not found";
				return;
			}

			if (players.length === 0) {
				state.error = "Please select at least one player.";
				return;
			}

			const playersNeeded = court.isSingle ? 2 : 4;
			const remainingSlots = playersNeeded - court.players.length;
			if (remainingSlots <= 0) {
				state.error = `${court.name} is already full.`;
				return;
			}

			if (players.length > remainingSlots) {
				state.error = `Too many players selected. You can add up to ${remainingSlots}.`;
				return;
			}

			const playersInCourts = state.items.flatMap((c) => c.players);
			const playersInCourtsIds = new Set(playersInCourts.map((p) => p.id));

			// Allow players already on this court (no-op), but reject players on OTHER courts.
			const currentCourtIds = new Set(court.players.map((p) => p.id));
			for (const p of players) {
				if (currentCourtIds.has(p.id)) {
					state.error = `${p.name} is already on ${court.name}.`;
					return;
				}
				if (playersInCourtsIds.has(p.id)) {
					state.error = `${p.name} is already playing on another court.`;
					return;
				}
			}

			court.players = [...court.players, ...players];
			state.error = null;
		},
		endGame: (state, action: PayloadAction<string[]>) => {
			state.items = state.items.map((court) => {
				if (court.players.some((p) => action.payload.includes(p.id))) {
					return { ...court, players: [] };
				}
				return court;
			});
		},
	},
});

export const {
	addCourt,
	removeCourt,
	clearCourts,
	clearCourtsError,
	assignPlayersToCourts,
	assignPlayersToCourt,
	addPlayersToCourtManually,
	endGame,
	removePlayerFromCourt,
} = courtSlice.actions;
export const courtsReducer = courtSlice.reducer;
