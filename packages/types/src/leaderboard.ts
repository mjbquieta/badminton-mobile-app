import { type PlayerLevel } from './players';

export type LeaderboardEntry = {
	playerId: string;
	playerName: string;
	playerLevel: PlayerLevel;
	gameCount: number;
	trophies: number;
	wins: number;
	losses: number;
	winRate: number;
};

export type LeaderboardSnapshot = {
	id: string;
	totalMatches: number;
	entries: LeaderboardEntry[];
	createdAt: number;
};
