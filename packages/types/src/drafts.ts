export type Draft = {
	id: string;
	name: string;
	playerIds: string[];
	courtId?: string;
	finished?: boolean;
	winner?: 'A' | 'B';
	scoreA?: number;
	scoreB?: number;
};

export type TeamBalanceMetrics = {
	teamAAvgLevel: number;
	teamBAvgLevel: number;
	levelDifference: number;
	isBalanced: boolean;
	balanceScore: number;
};
