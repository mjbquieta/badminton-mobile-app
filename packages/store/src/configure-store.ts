import { configureStore } from '@reduxjs/toolkit';
import { courtsReducer } from './slices/courts';
import { draftsReducer } from './slices/drafts';
import { playersReducer } from './slices/players';
import { queueReducer } from './slices/queue';

export const configureAppStore = () => {
	return configureStore({
		reducer: {
			courts: courtsReducer,
			drafts: draftsReducer,
			players: playersReducer,
			queue: queueReducer,
		},
	});
};

export type AppStore = ReturnType<typeof configureAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
