import { PlayerLevel, type Player } from "@badminton/types";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const testPlayers = [] as Player[];

// const testPlayers = [
// 	{
// 		id: "e4c2ec55-4b3b-4fb1-8e06-3aabf6bbf001",
// 		name: "Sam",
// 		gameCount: 0,
// 		level: PlayerLevel.BEGINNER,
// 	},
// 	{
// 		id: "1f0375d2-88d4-4bee-bdfa-b9f7fa92b6ee",
// 		name: "Kap",
// 		gameCount: 2,
// 		level: PlayerLevel.BEGINNER,
// 	},
// 	{
// 		id: "2c56f7a6-47d3-480a-8f0e-6ad4d1e54f5a",
// 		name: "Jessie",
// 		gameCount: 2,
// 		level: PlayerLevel.INTERMEDIATE,
// 	},
// 	{
// 		id: "8b8ec2a5-3e7b-4223-a9f7-8c8a7a217b8e",
// 		name: "Kyle",
// 		gameCount: 1,
// 		level: PlayerLevel.ADVANCED,
// 	},
// 	{
// 		id: "54b6aaf0-3e51-44c2-9097-ec7edb7fbc7d",
// 		name: "Mae2",
// 		gameCount: 1,
// 		level: PlayerLevel.BEGINNER,
// 	},
// 	{
// 		id: "a1ff8e74-b8c0-45e5-bdeb-19961f2341ed",
// 		name: "Jessa2",
// 		gameCount: 1,
// 		level: PlayerLevel.INTERMEDIATE,
// 	},
// 	{
// 		id: "b6a7dfa2-0cf9-419d-9fa7-761b5b847ed8",
// 		name: "RVv",
// 		gameCount: 1,
// 		level: PlayerLevel.ADVANCED,
// 	},
// 	{
// 		id: "c4e59d77-8391-4ae7-950b-d0f5eca96a19",
// 		name: "Jerome",
// 		gameCount: 1,
// 		level: PlayerLevel.ADVANCED,
// 	},
// 	{
// 		id: "2d7a3096-e75e-44e5-8846-c7e4907e96d4",
// 		name: "Mharz",
// 		gameCount: 1,
// 		level: PlayerLevel.INTERMEDIATE,
// 	},
// 	{
// 		id: "a504ca37-9d1a-4f7f-992c-053b7c1c38f6",
// 		name: "Ina",
// 		gameCount: 1,
// 		level: PlayerLevel.BEGINNER,
// 	},
// 	{
// 		id: "97b7b7bc-d204-41d5-8f9b-9c5bddf6c3a0",
// 		name: "Eloyz",
// 		gameCount: 1,
// 		level: PlayerLevel.BEGINNER,
// 	},
// 	{
// 		id: "fea27d2c-8f41-4b2e-a1be-1a92a9afe483",
// 		name: "Maeng",
// 		gameCount: 2,
// 		level: PlayerLevel.ADVANCED,
// 	},
// 	{
// 		id: "fd0b8a77-a3e2-44b1-b8e5-f7fa3fea7277",
// 		name: "Rey",
// 		gameCount: 1,
// 		level: PlayerLevel.INTERMEDIATE,
// 	},
// 	{
// 		id: "3815bfa5-89a7-43c5-8616-803b7e68c3fb",
// 		name: "Razel",
// 		gameCount: 1,
// 		level: PlayerLevel.ADVANCED,
// 	},
// 	{
// 		id: "d5480352-6bc4-4a15-a3fa-3786e6d6d124",
// 		name: "Joseph",
// 		gameCount: 1,
// 		level: PlayerLevel.INTERMEDIATE,
// 	},
// 	{
// 		id: "7755e0e4-6480-4565-9b4a-beffda50a302",
// 		name: "Joshua",
// 		gameCount: 1,
// 		level: PlayerLevel.BEGINNER,
// 	},
// 	{
// 		id: "213cd326-40af-45b8-a3a7-12d20df56f21",
// 		name: "Clang",
// 		gameCount: 1,
// 		level: PlayerLevel.BEGINNER,
// 	},
// 	{
// 		id: "ae1b770f-b9b9-4fb1-9ca6-d52a131b5dea",
// 		name: "Zybil",
// 		gameCount: 0,
// 		level: PlayerLevel.BEGINNER,
// 	},
// 	{
// 		id: "f6479865-7efa-4b4d-ab14-c317a31c1d38",
// 		name: "Shem",
// 		gameCount: 2,
// 		level: PlayerLevel.BEGINNER,
// 	},
// 	{
// 		id: "b95aa6b4-aee6-4a89-b770-2695323c7cf3",
// 		name: "Rhenz",
// 		gameCount: 0,
// 		level: PlayerLevel.BEGINNER,
// 	},
// 	{
// 		id: "cc806315-c504-4623-a673-d7a6379883e2",
// 		name: "Chu",
// 		gameCount: 1,
// 		level: PlayerLevel.INTERMEDIATE,
// 	},
// 	{
// 		id: "ada15f45-38b0-49d3-86e9-17429d4ff7c6",
// 		name: "Junrey",
// 		gameCount: 1,
// 		level: PlayerLevel.BEGINNER,
// 	},
// 	{
// 		id: "b791a9c0-cd0a-4bdf-987d-074b204b3661",
// 		name: "Kitoy",
// 		gameCount: 1,
// 		level: PlayerLevel.BEGINNER,
// 	},
// 	{
// 		id: "4d761563-039d-4ab8-b382-d6d7ae42657a",
// 		name: "Joan",
// 		gameCount: 1,
// 		level: PlayerLevel.BEGINNER,
// 	},
// 	{
// 		id: "4d761563-039d-4ab8-b382-d6d7ae4265ba",
// 		name: "Rhona",
// 		gameCount: 1,
// 		level: PlayerLevel.BEGINNER,
// 	},
// 	{
// 		id: "4d761563-039d-4ab8-b382-d6d7ae4265bc",
// 		name: "Hermz",
// 		gameCount: 1,
// 		level: PlayerLevel.BEGINNER,
// 	},
// ];

type PlayersState = {
	items: Player[];
	error: string | null;
};

type AddPlayerPayload = Pick<Player, "id" | "name" | "level"> & {
	maxPlayers?: number;
};

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
				(p) => p.name.trim().toLowerCase() === name.trim().toLowerCase(),
			);

			if (existingPlayer) {
				state.error = "Player already exists";
				return;
			}

			const { maxPlayers } = action.payload;
			if (maxPlayers !== undefined && state.items.length >= maxPlayers) {
				state.error = `Player limit reached (${maxPlayers}). Verify your email to add unlimited players.`;
				return;
			}

			state.items.push({
				id: action.payload.id,
				name,
				gameCount: 0,
				level: action.payload.level,
			});
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
		updatePlayerLevel: (
			state,
			action: PayloadAction<{ id: string; level: PlayerLevel }>,
		) => {
			const player = state.items.find((p) => p.id === action.payload.id);
			if (player) {
				player.level = action.payload.level;
			}
			state.error = null;
		},
		updatePlayerGameCount: (
			state,
			action: PayloadAction<{ id: string; gameCount: number }>,
		) => {
			const player = state.items.find((p) => p.id === action.payload.id);
			if (player) {
				player.gameCount = Math.max(0, action.payload.gameCount);
			}
			state.error = null;
		},
		resetAllGameCounts: (state) => {
			for (const p of state.items) {
				p.gameCount = 0;
			}
			state.error = null;
		},
		setPlayers: (state, action: PayloadAction<Player[]>) => {
			state.items = action.payload;
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
	updatePlayerLevel,
	updatePlayerGameCount,
	resetAllGameCounts,
	setPlayers,
} = playersSlice.actions;
export const playersReducer = playersSlice.reducer;
