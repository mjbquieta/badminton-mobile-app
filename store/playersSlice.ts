import { type Player } from "@/types/players";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const testPlayers = [
	{ id: "e4c2ec55-4b3b-4fb1-8e06-3aabf6bbf001", name: "John Doe" },
	{ id: "1f0375d2-88d4-4bee-bdfa-b9f7fa92b6ee", name: "Jane Doe" },
	{ id: "2c56f7a6-47d3-480a-8f0e-6ad4d1e54f5a", name: "Jim Doe" },
	{ id: "8b8ec2a5-3e7b-4223-a9f7-8c8a7a217b8e", name: "Jill Doe" },
	{ id: "54b6aaf0-3e51-44c2-9097-ec7edb7fbc7d", name: "Jack Doe" },
	{ id: "a1ff8e74-b8c0-45e5-bdeb-19961f2341ed", name: "Ava Smith" },
	{ id: "b6a7dfa2-0cf9-419d-9fa7-761b5b847ed8", name: "Liam Johnson" },
	{ id: "c4e59d77-8391-4ae7-950b-d0f5eca96a19", name: "Noah Williams" },
	{ id: "2d7a3096-e75e-44e5-8846-c7e4907e96d4", name: "Emma Brown" },
	{ id: "a504ca37-9d1a-4f7f-992c-053b7c1c38f6", name: "Oliver Jones" },
	{ id: "97b7b7bc-d204-41d5-8f9b-9c5bddf6c3a0", name: "Charlotte Garcia" },
	{ id: "fea27d2c-8f41-4b2e-a1be-1a92a9afe483", name: "Mia Martinez" },
	{ id: "fd0b8a77-a3e2-44b1-b8e5-f7fa3fea7277", name: "Amelia Rodriguez" },
	{ id: "3815bfa5-89a7-43c5-8616-803b7e68c3fb", name: "Elijah Lee" },
	{ id: "d5480352-6bc4-4a15-a3fa-3786e6d6d124", name: "Lucas Perez" },
	{ id: "7755e0e4-6480-4565-9b4a-beffda50a302", name: "James Thompson" },
	{ id: "213cd326-40af-45b8-a3a7-12d20df56f21", name: "Benjamin White" },
	{ id: "ae1b770f-b9b9-4fb1-9ca6-d52a131b5dea", name: "Henry Harris" },
	{ id: "f6479865-7efa-4b4d-ab14-c317a31c1d38", name: "Alexander Sanchez" },
	{ id: "b95aa6b4-aee6-4a89-b770-2695323c7cf3", name: "Sebastian Clark" },
	{ id: "d2fe4eed-d3fa-4beb-8c6c-a33752afaf6d", name: "William Young" },
	{ id: "94e3bfe7-438b-420f-875b-1c2702918d33", name: "Evelyn King" },
	{ id: "e73de95d-57cd-4e02-902d-94bb3271e59c", name: "Sophia Wright" },
	{ id: "bc36b1c3-f073-4b61-8647-6224ec7b98cf", name: "Harper Green" },
	{ id: "7e51906a-1842-4b93-8a6d-c2032c1c647c", name: "Ella Adams" },
];

type PlayersState = {
	items: Player[];

	error: string | null;
};

const initialState: PlayersState = {
	items: testPlayers,
	error: null,
};

const playersSlice = createSlice({
	name: "players",
	initialState,
	reducers: {
		addPlayer: (state, action: PayloadAction<Player>) => {
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

			state.items.push(action.payload);
			state.error = null;
		},
		removePlayer: (state, action: PayloadAction<string>) => {
			state.items = state.items.filter((p) => p.id !== action.payload);
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
	setPlayersAtEndOfQueue,
	setPlayersError,
	clearPlayersError,
	clearPlayers,
} = playersSlice.actions;
export const playersReducer = playersSlice.reducer;
