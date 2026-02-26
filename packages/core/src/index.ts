// Utilities
export { shuffle, chunkBy, buildPlayerMap, getPlayerInitials, getAvatarColor } from './utils';
export { generateSerialId, generatePin } from './utils';

// Matching engine
export {
	canPlayTogether,
	levelIndex,
	computeTeamBalance,
	computeBalanceScore,
	findOptimalSplit,
	MatchupTracker,
} from './matching';

// Statistics
export {
	computePlayerStats,
	computeAllPlayerStats,
	computeHeadToHead,
	getTopPlayers,
	getRecentForm,
} from './statistics';

// Drafting engine
export {
	generateAutoDrafts,
	combinations,
	generateCombos,
} from './drafting';
export type {
	ShuffleMode,
	CourtSpec,
	AutoDraftOptions,
	GeneratedDraft,
	AutoDraftResult,
} from './drafting';

// Auth / Permissions
export { ROLE_PERMISSIONS, hasPermission, getPermissions } from './auth';
