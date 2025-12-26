import { configureStore } from "@reduxjs/toolkit";
import { courtsReducer } from "./courtSlice";
import { playersReducer } from "./playersSlice";

export const store = configureStore({
	reducer: {
		courts: courtsReducer,
		players: playersReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
