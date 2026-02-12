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
	setPlayersAtEndOfQueue,
	setPlayersError,
	clearPlayersError,
	clearPlayers,
	updatePlayerLevel,
	updatePlayerGameCount,
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
	courtsReducer,
} from './slices/courts';

// Queue slice
export { setQueue, clearQueue, queueReducer } from './slices/queue';

// Thunks
export {
	fillDoublesCourtsFromQueue,
	rollDice,
	endGameAndAdvanceQueue,
	dissolveCourt,
	backToQueue,
} from './thunks';
