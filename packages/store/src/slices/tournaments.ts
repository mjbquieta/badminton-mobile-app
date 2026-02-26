import { type Tournament } from '@badminton/types';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type TournamentsState = {
	items: Tournament[];
	loading: boolean;
	error: string | null;
};

const initialState: TournamentsState = {
	items: [],
	loading: false,
	error: null,
};

const tournamentsSlice = createSlice({
	name: 'tournaments',
	initialState,
	reducers: {
		setTournaments: (state, action: PayloadAction<Tournament[]>) => {
			state.items = action.payload;
			state.error = null;
		},
		addTournament: (state, action: PayloadAction<Tournament>) => {
			state.items.unshift(action.payload);
			state.error = null;
		},
		updateTournament: (state, action: PayloadAction<Tournament>) => {
			const idx = state.items.findIndex((t) => t.id === action.payload.id);
			if (idx !== -1) {
				state.items[idx] = action.payload;
			}
			state.error = null;
		},
		removeTournament: (state, action: PayloadAction<string>) => {
			state.items = state.items.filter((t) => t.id !== action.payload);
			state.error = null;
		},
		setTournamentsLoading: (state, action: PayloadAction<boolean>) => {
			state.loading = action.payload;
		},
		setTournamentsError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},
	},
});

export const {
	setTournaments,
	addTournament,
	updateTournament,
	removeTournament,
	setTournamentsLoading,
	setTournamentsError,
} = tournamentsSlice.actions;

export const tournamentsReducer = tournamentsSlice.reducer;
