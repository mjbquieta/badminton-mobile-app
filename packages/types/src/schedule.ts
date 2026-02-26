export type RecurrenceType = 'none' | 'weekly' | 'biweekly' | 'monthly';

export type ScheduledSession = {
	id: string;
	title: string;
	/** ISO date string: YYYY-MM-DD */
	date: string;
	startTime: string;
	endTime: string;
	location?: string;
	notes?: string;
	recurrence: RecurrenceType;
	/** ISO date string: YYYY-MM-DD */
	recurrenceEndDate?: string;
	courtCount?: number;
	createdAt: number;
};
