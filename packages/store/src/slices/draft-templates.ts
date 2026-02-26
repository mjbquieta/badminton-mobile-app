import { type DraftTemplate } from '@badminton/types';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type DraftTemplatesState = {
	items: DraftTemplate[];
	loading: boolean;
	error: string | null;
};

const initialState: DraftTemplatesState = {
	items: [],
	loading: false,
	error: null,
};

const draftTemplatesSlice = createSlice({
	name: 'draftTemplates',
	initialState,
	reducers: {
		setDraftTemplates: (state, action: PayloadAction<DraftTemplate[]>) => {
			state.items = action.payload;
			state.error = null;
		},
		addDraftTemplate: (state, action: PayloadAction<DraftTemplate>) => {
			state.items.unshift(action.payload);
			state.error = null;
		},
		removeDraftTemplate: (state, action: PayloadAction<string>) => {
			state.items = state.items.filter((t) => t.id !== action.payload);
			state.error = null;
		},
		setDraftTemplatesLoading: (state, action: PayloadAction<boolean>) => {
			state.loading = action.payload;
		},
		setDraftTemplatesError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},
	},
});

export const {
	setDraftTemplates,
	addDraftTemplate,
	removeDraftTemplate,
	setDraftTemplatesLoading,
	setDraftTemplatesError,
} = draftTemplatesSlice.actions;

export const draftTemplatesReducer = draftTemplatesSlice.reducer;
