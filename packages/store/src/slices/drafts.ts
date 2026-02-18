import { type Draft } from '@badminton/types';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type DraftsState = {
	items: Draft[];
	error: string | null;
};

const initialState: DraftsState = {
	items: [],
	error: null,
};

const MAX_DRAFTS = 30;
const PLAYERS_PER_DRAFT = 4;

const draftsSlice = createSlice({
	name: 'drafts',
	initialState,
	reducers: {
		addDraft: (
			state,
			action: PayloadAction<{ id: string; name?: string; playerIds: string[] }>
		) => {
			if (state.items.length >= MAX_DRAFTS) {
				state.error = `Draft limit reached (${MAX_DRAFTS}).`;
				return;
			}
			if (action.payload.playerIds.length !== PLAYERS_PER_DRAFT) {
				state.error = `A draft must have exactly ${PLAYERS_PER_DRAFT} players.`;
				return;
			}
			state.items.push({
				id: action.payload.id,
				name:
					action.payload.name || `Draft ${state.items.length + 1}`,
				playerIds: action.payload.playerIds,
			});
			state.error = null;
		},

		removeDraft: (state, action: PayloadAction<string>) => {
			state.items = state.items.filter((d) => d.id !== action.payload);
			state.error = null;
		},

		updateDraftPlayers: (
			state,
			action: PayloadAction<{ id: string; playerIds: string[] }>
		) => {
			if (action.payload.playerIds.length !== PLAYERS_PER_DRAFT) {
				state.error = `A draft must have exactly ${PLAYERS_PER_DRAFT} players.`;
				return;
			}
			const draft = state.items.find((d) => d.id === action.payload.id);
			if (draft) {
				draft.playerIds = action.payload.playerIds;
			}
			state.error = null;
		},

		clearDrafts: (state) => {
			state.items = [];
			state.error = null;
		},

		updateDraftCourt: (
			state,
			action: PayloadAction<{ id: string; courtId: string | undefined }>
		) => {
			const draft = state.items.find((d) => d.id === action.payload.id);
			if (draft) {
				draft.courtId = action.payload.courtId;
			}
			state.error = null;
		},

		finishDraft: (
			state,
			action: PayloadAction<{ id: string; winner: 'A' | 'B' }>
		) => {
			const draft = state.items.find((d) => d.id === action.payload.id);
			if (draft) {
				draft.finished = true;
				draft.winner = action.payload.winner;
			}
			state.error = null;
		},

		clearDraftsError: (state) => {
			state.error = null;
		},

		setDrafts: (state, action: PayloadAction<Draft[]>) => {
			state.items = action.payload;
			state.error = null;
		},
	},
});

export const {
	addDraft,
	removeDraft,
	updateDraftPlayers,
	updateDraftCourt,
	finishDraft,
	clearDrafts,
	clearDraftsError,
	setDrafts,
} = draftsSlice.actions;

export const draftsReducer = draftsSlice.reducer;
