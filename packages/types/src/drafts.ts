export type Draft = {
	id: string;
	name: string;
	playerIds: string[];
	courtId?: string;
	finished?: boolean;
	winner?: 'A' | 'B';
};
