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

// Tournament bracket
export {
	seedPlayers,
	pairTeamsBalanced,
	seedTeams,
	generateBracket,
	generateBracketManual,
	generateSingleEliminationBracket,
	advanceWinner,
	isTournamentComplete,
	getTournamentWinner,
} from './tournament';

// Tournament Swiss
export {
	getSwissRoundCount,
	computeSwissStandings,
	generateSwissPairings,
	recordSwissResult,
	isSwissPhaseComplete,
	getPlayoffParticipants,
} from './tournament';

// Analytics
export {
	computeWinRateOverTime,
	computeHeadToHeadMatrix,
	computeCourtUtilization,
	computeParticipationTrend,
	computeAvailabilityHeatmap,
} from './statistics/analytics';
export type {
	WinRateDataPoint,
	HeadToHeadMatrixEntry,
	CourtUtilizationEntry,
	ParticipationDataPoint,
	AvailabilityHeatmapCell,
} from './statistics/analytics';
