import { type PlayerLevel } from './players';

export type ConfirmationStatus = 'pending' | 'confirmed' | 'declined';

export type PlayerConfirmation = {
	playerId: string;
	playerName: string;
	playerLevel: PlayerLevel;
	status: ConfirmationStatus;
	confirmedAt?: number;
};

export type CostItem = {
	item: string;
	cost: number;
};

export type EventDetails = {
	location: string;
	courts: number;
	date: string;
	startTime: string;
	endTime: string;
	courtCost: number;
	additionalCosts: CostItem[];
	notes?: string;
};

export type ConfirmationMeta = {
	enabled: boolean;
	serialId: string;
	pin: string;
	locked: boolean;
};

export type ConfirmationDocument = {
	eventDetails: EventDetails;
	playerConfirmations: PlayerConfirmation[];
	locked: boolean;
	ownerId: string;
	pin: string;
	createdAt: unknown;
	updatedAt: unknown;
};
