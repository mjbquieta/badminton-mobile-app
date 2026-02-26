// Store configuration
export { configureAppStore } from './configure-store';
export type { RootState, AppDispatch, AppStore } from './configure-store';

// Hooks
export { useAppDispatch, useAppSelector } from './hooks';

// Players slice
export {
	addPlayer,
	removePlayer,
	incrementPlayersGameCount,
	incrementPlayersTrophies,
	setPlayersError,
	clearPlayersError,
	clearPlayers,
	updatePlayerLevel,
	updatePlayerGameCount,
	resetAllGameCounts,
	togglePlayerActive,
	setPlayersActive,
	updatePlayerAvatar,
	setPlayers,
	playersReducer,
} from './slices/players';

// Courts slice
export {
	addCourt,
	removeCourt,
	clearCourts,
	clearCourtsError,
	assignPlayersToCourts,
	assignPlayersToCourt,
	addPlayersToCourtManually,
	assignPlayersToCourtsBulk,
	endGame,
	removePlayerFromCourt,
	dissolveAllCourts,
	setCourts,
	courtsReducer,
} from './slices/courts';

// Drafts slice
export {
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
	draftsReducer,
} from './slices/drafts';

// Confirmation slice
export {
	enableConfirmation,
	disableConfirmation,
	setEventDetails,
	setPlayerConfirmations,
	updatePlayerConfirmationStatus,
	lockConfirmation,
	unlockConfirmation,
	setConfirmationMeta,
	setConfirmationError,
	clearConfirmationError,
	confirmationReducer,
} from './slices/confirmation';

// Match History slice
export {
	setMatchHistory,
	addMatchRecord,
	addMatchRecordsBatch,
	removeMatchRecord,
	clearMatchHistory,
	setMatchHistoryLoading,
	setMatchHistoryError,
	matchHistoryReducer,
} from './slices/match-history';

// Theme slice
export { setThemeMode, themeReducer } from './slices/theme';

// Undo/Redo slice
export { setUndoRedoState, resetUndoRedo, undoRedoReducer } from './slices/undo-redo';
