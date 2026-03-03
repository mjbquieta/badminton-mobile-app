import { type LeaderboardSnapshot } from '@badminton/types';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type LeaderboardState = {
	snapshots: LeaderboardSnapshot[];
};

const initialState: LeaderboardState = {
	snapshots: [],
};

const leaderboardSlice = createSlice({
	name: 'leaderboard',
	initialState,
	reducers: {
		setLeaderboardSnapshots: (state, action: PayloadAction<LeaderboardSnapshot[]>) => {
			state.snapshots = action.payload;
		},
		addLeaderboardSnapshot: (state, action: PayloadAction<LeaderboardSnapshot>) => {
			state.snapshots.unshift(action.payload);
		},
		removeLeaderboardSnapshot: (state, action: PayloadAction<string>) => {
			state.snapshots = state.snapshots.filter((s) => s.id !== action.payload);
		},
		clearLeaderboardSnapshots: (state) => {
			state.snapshots = [];
		},
	},
});

export const {
	setLeaderboardSnapshots,
	addLeaderboardSnapshot,
	removeLeaderboardSnapshot,
	clearLeaderboardSnapshots,
} = leaderboardSlice.actions;

export const leaderboardReducer = leaderboardSlice.reducer;
