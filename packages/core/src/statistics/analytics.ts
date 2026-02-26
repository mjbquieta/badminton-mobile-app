import { type MatchRecord, type Court } from '@badminton/types';

export type WinRateDataPoint = {
	date: string;
	winRate: number;
	matches: number;
};

export type HeadToHeadMatrixEntry = {
	playerIdA: string;
	playerIdB: string;
	winsA: number;
	winsB: number;
	total: number;
};

export type CourtUtilizationEntry = {
	courtId: string;
	courtName: string;
	matchCount: number;
	percentage: number;
};

export type ParticipationDataPoint = {
	date: string;
	activeCount: number;
	totalMatches: number;
};

export type AvailabilityHeatmapCell = {
	dayOfWeek: number;
	hour: number;
	count: number;
};

/**
 * Compute a player's win rate over time, grouped by day.
 */
export function computeWinRateOverTime(
	playerId: string,
	matches: MatchRecord[],
): WinRateDataPoint[] {
	const playerMatches = matches
		.filter((m) => m.playerIds.includes(playerId))
		.sort((a, b) => a.finishedAt - b.finishedAt);

	if (playerMatches.length === 0) return [];

	const buckets = new Map<string, { wins: number; total: number }>();

	for (const match of playerMatches) {
		const date = new Date(match.finishedAt).toISOString().split('T')[0];
		const bucket = buckets.get(date) ?? { wins: 0, total: 0 };
		bucket.total++;
		const winningTeam = match.winner === 'A' ? match.teamA : match.teamB;
		if (winningTeam.includes(playerId)) bucket.wins++;
		buckets.set(date, bucket);
	}

	// Compute cumulative win rate
	let totalWins = 0;
	let totalMatches = 0;
	const result: WinRateDataPoint[] = [];

	for (const [date, bucket] of buckets) {
		totalWins += bucket.wins;
		totalMatches += bucket.total;
		result.push({
			date,
			winRate: totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0,
			matches: totalMatches,
		});
	}

	return result;
}

/**
 * Compute head-to-head matrix for a set of players.
 */
export function computeHeadToHeadMatrix(
	playerIds: string[],
	matches: MatchRecord[],
): HeadToHeadMatrixEntry[] {
	const result: HeadToHeadMatrixEntry[] = [];

	for (let i = 0; i < playerIds.length; i++) {
		for (let j = i + 1; j < playerIds.length; j++) {
			const a = playerIds[i];
			const b = playerIds[j];
			let winsA = 0;
			let winsB = 0;

			for (const match of matches) {
				if (!match.playerIds.includes(a) || !match.playerIds.includes(b)) continue;

				const winningTeam = match.winner === 'A' ? match.teamA : match.teamB;
				const losingTeam = match.winner === 'A' ? match.teamB : match.teamA;

				if (winningTeam.includes(a) && losingTeam.includes(b)) winsA++;
				else if (winningTeam.includes(b) && losingTeam.includes(a)) winsB++;
			}

			if (winsA + winsB > 0) {
				result.push({ playerIdA: a, playerIdB: b, winsA, winsB, total: winsA + winsB });
			}
		}
	}

	return result;
}

/**
 * Compute court utilization from match history.
 */
export function computeCourtUtilization(
	matches: MatchRecord[],
	courts: Court[],
): CourtUtilizationEntry[] {
	const courtMap = new Map<string, number>();
	let matchesWithCourt = 0;

	for (const match of matches) {
		if (match.courtId) {
			courtMap.set(match.courtId, (courtMap.get(match.courtId) ?? 0) + 1);
			matchesWithCourt++;
		}
	}

	return courts.map((court) => {
		const count = courtMap.get(court.id) ?? 0;
		return {
			courtId: court.id,
			courtName: court.name,
			matchCount: count,
			percentage: matchesWithCourt > 0 ? Math.round((count / matchesWithCourt) * 100) : 0,
		};
	});
}

/**
 * Compute participation trend over time grouped by day.
 */
export function computeParticipationTrend(
	matches: MatchRecord[],
): ParticipationDataPoint[] {
	const sorted = [...matches].sort((a, b) => a.finishedAt - b.finishedAt);
	if (sorted.length === 0) return [];

	const buckets = new Map<string, { players: Set<string>; matchCount: number }>();

	for (const match of sorted) {
		const date = new Date(match.finishedAt).toISOString().split('T')[0];
		const bucket = buckets.get(date) ?? { players: new Set(), matchCount: 0 };
		bucket.matchCount++;
		for (const pid of match.playerIds) bucket.players.add(pid);
		buckets.set(date, bucket);
	}

	return Array.from(buckets.entries()).map(([date, bucket]) => ({
		date,
		activeCount: bucket.players.size,
		totalMatches: bucket.matchCount,
	}));
}

/**
 * Compute availability heatmap from scheduled session times.
 * dayOfWeek: 0 (Sun) - 6 (Sat), hour: 0-23
 */
export function computeAvailabilityHeatmap(
	sessions: { date: string; startTime: string; endTime: string }[],
): AvailabilityHeatmapCell[] {
	const grid = new Map<string, number>();

	for (const session of sessions) {
		const d = new Date(session.date + 'T00:00:00');
		const dow = d.getDay();
		const startHour = parseInt(session.startTime.split(':')[0], 10);
		const endHour = parseInt(session.endTime.split(':')[0], 10) || 24;

		for (let h = startHour; h < endHour; h++) {
			const key = `${dow}-${h}`;
			grid.set(key, (grid.get(key) ?? 0) + 1);
		}
	}

	const result: AvailabilityHeatmapCell[] = [];
	for (let dow = 0; dow < 7; dow++) {
		for (let h = 0; h < 24; h++) {
			const count = grid.get(`${dow}-${h}`) ?? 0;
			if (count > 0) {
				result.push({ dayOfWeek: dow, hour: h, count });
			}
		}
	}

	return result;
}
