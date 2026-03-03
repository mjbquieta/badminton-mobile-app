export type MatchRecord = {
	id: string;
	sessionId: string;
	draftId: string;
	playerIds: string[];
	teamA: string[];
	teamB: string[];
	teamANames?: string[];
	teamBNames?: string[];
	winner: 'A' | 'B';
	scoreA?: number;
	scoreB?: number;
	courtId?: string;
	courtName?: string;
	isSingle: boolean;
	finishedAt: number;
};
