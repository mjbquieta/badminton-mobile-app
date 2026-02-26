export type PlayerStats = {
	playerId: string;
	totalMatches: number;
	wins: number;
	losses: number;
	winRate: number;
	singlesMatches: number;
	singlesWins: number;
	doublesMatches: number;
	doublesWins: number;
	currentStreak: number;
	bestStreak: number;
};

export type HeadToHeadRecord = {
	playerIdA: string;
	playerIdB: string;
	matchesPlayed: number;
	winsA: number;
	winsB: number;
	lastPlayed: number;
};
