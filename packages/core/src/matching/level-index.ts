import { PlayerLevel } from '@badminton/types';

export const levelIndex: Record<PlayerLevel, number> = {
	[PlayerLevel.BEGINNER]: 0,
	[PlayerLevel.INTERMEDIATE]: 1,
	[PlayerLevel.ADVANCED]: 2,
	[PlayerLevel.PRO]: 3,
};
