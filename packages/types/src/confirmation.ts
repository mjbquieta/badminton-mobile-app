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
	description?: string;
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
	maxPlayers?: number;
};

export type ConfirmationMeta = {
	enabled: boolean;
	serialId: string;
	pin: string;
	locked: boolean;
};

export type JoinRequest = {
	id: string;
	name: string;
	level: PlayerLevel;
	description: string;
	status: 'pending' | 'approved' | 'rejected';
	createdAt: number;
};

export type ConfirmationDocument = {
	eventDetails: EventDetails;
	playerConfirmations: PlayerConfirmation[];
	joinRequests?: JoinRequest[];
	locked: boolean;
	ownerId: string;
	pin: string;
	createdAt: number | null;
	updatedAt: number | null;
};
