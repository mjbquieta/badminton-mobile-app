import { type Player } from "@/types/players";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const testPlayers = [
	{ id: "e4c2ec55-4b3b-4fb1-8e06-3aabf6bbf001", name: "Sam", gameCount: 0 },
	{ id: "1f0375d2-88d4-4bee-bdfa-b9f7fa92b6ee", name: "Kap", gameCount: 0 },
	{ id: "2c56f7a6-47d3-480a-8f0e-6ad4d1e54f5a", name: "Jessie", gameCount: 0 },
	{ id: "8b8ec2a5-3e7b-4223-a9f7-8c8a7a217b8e", name: "EJ", gameCount: 0 },
	{ id: "54b6aaf0-3e51-44c2-9097-ec7edb7fbc7d", name: "Chu", gameCount: 0 },
	{ id: "a1ff8e74-b8c0-45e5-bdeb-19961f2341ed", name: "Mae2", gameCount: 0 },
	{ id: "b6a7dfa2-0cf9-419d-9fa7-761b5b847ed8", name: "Kyle", gameCount: 0 },
	{ id: "c4e59d77-8391-4ae7-950b-d0f5eca96a19", name: "Clang", gameCount: 0 },
	{ id: "2d7a3096-e75e-44e5-8846-c7e4907e96d4", name: "Rey", gameCount: 0 },
	{ id: "a504ca37-9d1a-4f7f-992c-053b7c1c38f6", name: "Lloydy", gameCount: 0 },
	{ id: "97b7b7bc-d204-41d5-8f9b-9c5bddf6c3a0", name: "Raffy", gameCount: 0 },
	{ id: "fea27d2c-8f41-4b2e-a1be-1a92a9afe483", name: "Harold", gameCount: 0 },
	{
		id: "fd0b8a77-a3e2-44b1-b8e5-f7fa3fea7277",
		name: "Kent John",
		gameCount: 0,
	},
	{
		id: "3815bfa5-89a7-43c5-8616-803b7e68c3fb",
		name: "Ganiel Trisha",
		gameCount: 0,
	},
	{ id: "d5480352-6bc4-4a15-a3fa-3786e6d6d124", name: "Sydrick", gameCount: 0 },
	{ id: "7755e0e4-6480-4565-9b4a-beffda50a302", name: "Joshua", gameCount: 0 },
	{ id: "213cd326-40af-45b8-a3a7-12d20df56f21", name: "Ina", gameCount: 0 },
	{ id: "ae1b770f-b9b9-4fb1-9ca6-d52a131b5dea", name: "Eloy", gameCount: 0 },
	{ id: "f6479865-7efa-4b4d-ab14-c317a31c1d38", name: "Joseph", gameCount: 0 },
	{ id: "b95aa6b4-aee6-4a89-b770-2695323c7cf3", name: "Razel", gameCount: 0 },
];

type PlayersState = {
	items: Player[];

	error: string | null;
};

type AddPlayerPayload = Pick<Player, "id" | "name">;

const initialState: PlayersState = {
	items: testPlayers,
	error: null,
};

const playersSlice = createSlice({
	name: "players",
	initialState,
	reducers: {
		addPlayer: (state, action: PayloadAction<AddPlayerPayload>) => {
			const name = action.payload.name.trim();

			if (name.length < 3) {
				state.error = "Player name must be at least 3 characters long";
				return;
			}

			const existingPlayer = state.items.find(
				(p) => p.name.trim().toLowerCase() === name.trim().toLowerCase()
			);

			if (existingPlayer) {
				state.error = "Player already exists";
				return;
			}

			state.items.push({ id: action.payload.id, name, gameCount: 0 });
			state.error = null;
		},
		removePlayer: (state, action: PayloadAction<string>) => {
			state.items = state.items.filter((p) => p.id !== action.payload);
			state.error = null;
		},
		incrementPlayersGameCount: (state, action: PayloadAction<string[]>) => {
			const idSet = new Set(action.payload);
			for (const p of state.items) {
				if (idSet.has(p.id)) p.gameCount += 1;
			}
			state.error = null;
		},
		setPlayersAtEndOfQueue: (state, action: PayloadAction<string[]>) => {
			const endedIds = new Set(action.payload);
			const filteredPlayers = state.items.filter((p) => !endedIds.has(p.id));
			const endedPlayers = state.items.filter((p) => endedIds.has(p.id));
			state.items = [...filteredPlayers, ...endedPlayers];
			state.error = null;
		},
		setPlayersError: (state, action: PayloadAction<string>) => {
			state.error = action.payload;
		},
		clearPlayersError: (state) => {
			state.error = null;
		},
		clearPlayers: (state) => {
			state.items = [];
			state.error = null;
		},
	},
});

export const {
	addPlayer,
	removePlayer,
	incrementPlayersGameCount,
	setPlayersAtEndOfQueue,
	setPlayersError,
	clearPlayersError,
	clearPlayers,
} = playersSlice.actions;
export const playersReducer = playersSlice.reducer;
