import { type ThemeMode } from '@badminton/types';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type ThemeState = {
	mode: ThemeMode;
};

const initialState: ThemeState = {
	mode: 'dark',
};

const themeSlice = createSlice({
	name: 'theme',
	initialState,
	reducers: {
		setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
			state.mode = action.payload;
		},
	},
});

export const { setThemeMode } = themeSlice.actions;
export const themeReducer = themeSlice.reducer;
