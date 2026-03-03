import {
	type ConfirmationMeta,
	type EventDetails,
	type JoinRequest,
	type PlayerConfirmation,
} from "@badminton/types";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type ConfirmationState = {
	meta: ConfirmationMeta;
	eventDetails: EventDetails | null;
	playerConfirmations: PlayerConfirmation[];
	joinRequests: JoinRequest[];
	error: string | null;
};

const initialState: ConfirmationState = {
	meta: {
		enabled: false,
		serialId: "",
		pin: "",
		locked: false,
	},
	eventDetails: null,
	playerConfirmations: [],
	joinRequests: [],
	error: null,
};

const confirmationSlice = createSlice({
	name: "confirmation",
	initialState,
	reducers: {
		enableConfirmation: (
			state,
			action: PayloadAction<{ serialId: string; pin: string }>,
		) => {
			state.meta.enabled = true;
			state.meta.serialId = action.payload.serialId;
			state.meta.pin = action.payload.pin;
			state.meta.locked = false;
			state.error = null;
		},
		disableConfirmation: (state) => {
			state.meta.enabled = false;
			state.meta.serialId = "";
			state.meta.pin = "";
			state.meta.locked = false;
			state.eventDetails = null;
			state.playerConfirmations = [];
			state.joinRequests = [];
			state.error = null;
		},
		setEventDetails: (state, action: PayloadAction<EventDetails>) => {
			state.eventDetails = action.payload;
			state.error = null;
		},
		setPlayerConfirmations: (
			state,
			action: PayloadAction<PlayerConfirmation[]>,
		) => {
			state.playerConfirmations = action.payload;
			state.error = null;
		},
		updatePlayerConfirmationStatus: (
			state,
			action: PayloadAction<{
				playerId: string;
				status: "confirmed" | "declined";
				confirmedAt: number;
			}>,
		) => {
			const pc = state.playerConfirmations.find(
				(p) => p.playerId === action.payload.playerId,
			);
			if (pc) {
				pc.status = action.payload.status;
				pc.confirmedAt = action.payload.confirmedAt;
			}
			state.error = null;
		},
		lockConfirmation: (state) => {
			state.meta.locked = true;
			state.error = null;
		},
		unlockConfirmation: (state) => {
			state.meta.locked = false;
			state.error = null;
		},
		setConfirmationMeta: (state, action: PayloadAction<ConfirmationMeta>) => {
			state.meta = action.payload;
			state.error = null;
		},
		setJoinRequests: (state, action: PayloadAction<JoinRequest[]>) => {
			state.joinRequests = action.payload;
			state.error = null;
		},
		updateJoinRequest: (
			state,
			action: PayloadAction<{ id: string; status: 'approved' | 'rejected' }>,
		) => {
			const req = state.joinRequests.find((r) => r.id === action.payload.id);
			if (req) {
				req.status = action.payload.status;
			}
			state.error = null;
		},
		setConfirmationError: (state, action: PayloadAction<string>) => {
			state.error = action.payload;
		},
		clearConfirmationError: (state) => {
			state.error = null;
		},
	},
});

export const {
	enableConfirmation,
	disableConfirmation,
	setEventDetails,
	setPlayerConfirmations,
	updatePlayerConfirmationStatus,
	lockConfirmation,
	unlockConfirmation,
	setConfirmationMeta,
	setJoinRequests,
	updateJoinRequest,
	setConfirmationError,
	clearConfirmationError,
} = confirmationSlice.actions;

export const confirmationReducer = confirmationSlice.reducer;
