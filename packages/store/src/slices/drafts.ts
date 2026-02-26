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

const draftsSlice = createSlice({
	name: 'drafts',
	initialState,
	reducers: {
		addDraft: (
			state,
			action: PayloadAction<{ id: string; name?: string; playerIds: string[] }>
		) => {
			const playerCount = action.payload.playerIds.length;
			if (playerCount !== 2 && playerCount !== 4) {
				state.error = `A draft must have 2 or 4 players.`;
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

		addDraftsBatch: (
			state,
			action: PayloadAction<{ id: string; name?: string; playerIds: string[]; courtId?: string }[]>
		) => {
			for (const draft of action.payload) {
				const playerCount = draft.playerIds.length;
				if (playerCount !== 2 && playerCount !== 4) continue;
				state.items.push({
					id: draft.id,
					name: draft.name || `Draft ${state.items.length + 1}`,
					playerIds: draft.playerIds,
					courtId: draft.courtId,
				});
			}
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
			const playerCount = action.payload.playerIds.length;
			if (playerCount !== 2 && playerCount !== 4) {
				state.error = `A draft must have 2 or 4 players.`;
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
			action: PayloadAction<{ id: string; winner: 'A' | 'B'; scoreA?: number; scoreB?: number }>
		) => {
			const draft = state.items.find((d) => d.id === action.payload.id);
			if (draft) {
				draft.finished = true;
				draft.winner = action.payload.winner;
				draft.scoreA = action.payload.scoreA;
				draft.scoreB = action.payload.scoreB;
			}
			state.error = null;
		},

		updateDraftScore: (
			state,
			action: PayloadAction<{ id: string; scoreA: number; scoreB: number }>
		) => {
			const draft = state.items.find((d) => d.id === action.payload.id);
			if (draft) {
				draft.scoreA = action.payload.scoreA;
				draft.scoreB = action.payload.scoreB;
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
	addDraftsBatch,
	removeDraft,
	updateDraftPlayers,
	updateDraftCourt,
	finishDraft,
	updateDraftScore,
	clearDrafts,
	clearDraftsError,
	setDrafts,
} = draftsSlice.actions;

export const draftsReducer = draftsSlice.reducer;
