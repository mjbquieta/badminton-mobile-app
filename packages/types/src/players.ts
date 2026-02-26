export enum PlayerLevel {
	BEGINNER = "BEGINNER",
	INTERMEDIATE = "INTERMEDIATE",
	ADVANCED = "ADVANCED",
	PRO = "PRO",
}

export type Player = {
	id: string;
	name: string;
	gameCount: number;
	level: PlayerLevel;
	trophies: number;
	active?: boolean;
	avatarUrl?: string;
	avatarColor?: string;
};
