export type TournamentFormat = 'singles' | 'doubles';

export type TournamentType = 'bracket' | 'swiss';

export type TournamentStatus = 'setup' | 'in_progress' | 'completed';

export type TournamentMatchStatus = 'pending' | 'ready' | 'completed';

export type TournamentSeed = {
	/** For singles: player ID. For doubles: team ID (key into Tournament.teams). */
	playerId: string;
	seedNumber: number;
};

export type TournamentMatch = {
	id: string;
	round: number;
	position: number;
	playerA?: string;
	playerB?: string;
	winner?: string;
	scoreA?: number;
	scoreB?: number;
	status: TournamentMatchStatus;
};

/** Swiss round: a set of pairings for one round. */
export type SwissRound = {
	roundNumber: number;
	pairings: SwissPairing[];
	completed: boolean;
};

export type SwissPairing = {
	id: string;
	participantA: string;
	participantB?: string; // undefined = BYE
	scoreA?: number;
	scoreB?: number;
	winner?: string;
	isBye: boolean;
};

/** Standing entry for Swiss standings table. */
export type SwissStanding = {
	participantId: string;
	gamesPlayed: number;
	wins: number;
	losses: number;
	pointsFor: number;
	pointsAgainst: number;
	pointDifferential: number;
	matchPoints: number;
	buchholz: number;
	rank: number;
};

export type Tournament = {
	id: string;
	name: string;
	format: TournamentFormat;
	/** 'bracket' for single elimination, 'swiss' for Swiss system. Defaults to 'bracket'. */
	type?: TournamentType;
	status: TournamentStatus;
	seeds: TournamentSeed[];
	matches: TournamentMatch[];
	/** For doubles: maps team IDs to player ID pairs. */
	teams?: Record<string, string[]>;
	/** Swiss rounds data. */
	swissRounds?: SwissRound[];
	/** Total Swiss rounds before playoffs. */
	swissRoundCount?: number;
	/** IDs of participants who received a BYE (each can only get one). */
	swissByeHistory?: string[];
	/** Whether Swiss is in playoff phase. */
	swissPlayoffStarted?: boolean;
	createdAt: number;
	completedAt?: number;
	winnerId?: string;
};
