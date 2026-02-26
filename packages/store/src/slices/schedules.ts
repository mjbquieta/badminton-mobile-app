import { type ScheduledSession } from '@badminton/types';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type SchedulesState = {
	items: ScheduledSession[];
	loading: boolean;
	error: string | null;
};

const initialState: SchedulesState = {
	items: [],
	loading: false,
	error: null,
};

const schedulesSlice = createSlice({
	name: 'schedules',
	initialState,
	reducers: {
		setSchedules: (state, action: PayloadAction<ScheduledSession[]>) => {
			state.items = action.payload;
			state.error = null;
		},
		addSchedule: (state, action: PayloadAction<ScheduledSession>) => {
			state.items.push(action.payload);
			state.items.sort((a, b) => a.date.localeCompare(b.date));
			state.error = null;
		},
		updateSchedule: (state, action: PayloadAction<ScheduledSession>) => {
			const idx = state.items.findIndex((s) => s.id === action.payload.id);
			if (idx !== -1) {
				state.items[idx] = action.payload;
				state.items.sort((a, b) => a.date.localeCompare(b.date));
			}
			state.error = null;
		},
		removeSchedule: (state, action: PayloadAction<string>) => {
			state.items = state.items.filter((s) => s.id !== action.payload);
			state.error = null;
		},
		setSchedulesLoading: (state, action: PayloadAction<boolean>) => {
			state.loading = action.payload;
		},
		setSchedulesError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},
	},
});

export const {
	setSchedules,
	addSchedule,
	updateSchedule,
	removeSchedule,
	setSchedulesLoading,
	setSchedulesError,
} = schedulesSlice.actions;

export const schedulesReducer = schedulesSlice.reducer;
