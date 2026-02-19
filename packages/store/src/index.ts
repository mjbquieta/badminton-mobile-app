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
	removeDraft,
	updateDraftPlayers,
	updateDraftCourt,
	finishDraft,
	clearDrafts,
	clearDraftsError,
	setDrafts,
	draftsReducer,
} from './slices/drafts';
