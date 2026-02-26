export type DraftTemplate = {
	id: string;
	name: string;
	mode: 'balanced' | 'random' | 'skill-match';
	draftCount: number;
	selectedPlayerIds: string[];
	selectedLevels?: string[];
	courtIds: string[];
	createdAt: number;
};
