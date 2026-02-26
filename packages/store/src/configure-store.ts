import { configureStore } from '@reduxjs/toolkit';
import { confirmationReducer } from './slices/confirmation';
import { courtsReducer } from './slices/courts';
import { draftsReducer } from './slices/drafts';
import { playersReducer } from './slices/players';
import { matchHistoryReducer } from './slices/match-history';
import { themeReducer } from './slices/theme';

export const configureAppStore = () => {
	return configureStore({
		reducer: {
			courts: courtsReducer,
			drafts: draftsReducer,
			players: playersReducer,
			confirmation: confirmationReducer,
			matchHistory: matchHistoryReducer,
			theme: themeReducer,
		},
	});
};

export type AppStore = ReturnType<typeof configureAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
