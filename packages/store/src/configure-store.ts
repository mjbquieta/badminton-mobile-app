import { configureStore } from '@reduxjs/toolkit';
import { confirmationReducer } from './slices/confirmation';
import { courtsReducer } from './slices/courts';
import { draftsReducer } from './slices/drafts';
import { playersReducer } from './slices/players';

export const configureAppStore = () => {
	return configureStore({
		reducer: {
			courts: courtsReducer,
			drafts: draftsReducer,
			players: playersReducer,
			confirmation: confirmationReducer,
		},
	});
};

export type AppStore = ReturnType<typeof configureAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
