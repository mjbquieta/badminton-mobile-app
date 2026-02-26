import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type UndoRedoState = {
	canUndo: boolean;
	canRedo: boolean;
	pastCount: number;
	futureCount: number;
};

const initialState: UndoRedoState = {
	canUndo: false,
	canRedo: false,
	pastCount: 0,
	futureCount: 0,
};

const undoRedoSlice = createSlice({
	name: 'undoRedo',
	initialState,
	reducers: {
		setUndoRedoState: (
			state,
			action: PayloadAction<{ canUndo: boolean; canRedo: boolean; pastCount: number; futureCount: number }>,
		) => {
			state.canUndo = action.payload.canUndo;
			state.canRedo = action.payload.canRedo;
			state.pastCount = action.payload.pastCount;
			state.futureCount = action.payload.futureCount;
		},
		resetUndoRedo: (state) => {
			state.canUndo = false;
			state.canRedo = false;
			state.pastCount = 0;
			state.futureCount = 0;
		},
	},
});

export const { setUndoRedoState, resetUndoRedo } = undoRedoSlice.actions;
export const undoRedoReducer = undoRedoSlice.reducer;
