import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type QueueState = {
	/**
	 * Ordered player ids waiting to be assigned to doubles courts.
	 * Groups are derived by chunking this list by 4.
	 */
	ids: string[];
};

const initialState: QueueState = {
	ids: [],
};

const queueSlice = createSlice({
	name: "queue",
	initialState,
	reducers: {
		setQueue: (state, action: PayloadAction<string[]>) => {
			state.ids = action.payload;
		},
		clearQueue: (state) => {
			state.ids = [];
		},
	},
});

export const { setQueue, clearQueue } = queueSlice.actions;
export const queueReducer = queueSlice.reducer;
