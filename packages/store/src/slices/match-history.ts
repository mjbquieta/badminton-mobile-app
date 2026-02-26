import { type MatchRecord } from '@badminton/types';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type MatchHistoryState = {
	records: MatchRecord[];
	loading: boolean;
	error: string | null;
};

const initialState: MatchHistoryState = {
	records: [],
	loading: false,
	error: null,
};

const matchHistorySlice = createSlice({
	name: 'matchHistory',
	initialState,
	reducers: {
		setMatchHistory: (state, action: PayloadAction<MatchRecord[]>) => {
			state.records = action.payload;
			state.error = null;
		},
		addMatchRecord: (state, action: PayloadAction<MatchRecord>) => {
			state.records.unshift(action.payload);
			state.error = null;
		},
		addMatchRecordsBatch: (state, action: PayloadAction<MatchRecord[]>) => {
			state.records.unshift(...action.payload);
			state.error = null;
		},
		removeMatchRecord: (state, action: PayloadAction<string>) => {
			state.records = state.records.filter((r) => r.id !== action.payload);
			state.error = null;
		},
		clearMatchHistory: (state) => {
			state.records = [];
			state.error = null;
		},
		setMatchHistoryLoading: (state, action: PayloadAction<boolean>) => {
			state.loading = action.payload;
		},
		setMatchHistoryError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},
	},
});

export const {
	setMatchHistory,
	addMatchRecord,
	addMatchRecordsBatch,
	removeMatchRecord,
	clearMatchHistory,
	setMatchHistoryLoading,
	setMatchHistoryError,
} = matchHistorySlice.actions;

export const matchHistoryReducer = matchHistorySlice.reducer;
