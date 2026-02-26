import { type MatchRecord, type PlayerStats, type HeadToHeadRecord } from '@badminton/types';

function isWinner(playerId: string, match: MatchRecord): boolean {
	const winningTeam = match.winner === 'A' ? match.teamA : match.teamB;
	return winningTeam.includes(playerId);
}

export function computePlayerStats(playerId: string, matches: MatchRecord[]): PlayerStats {
	const playerMatches = matches
		.filter((m) => m.playerIds.includes(playerId))
		.sort((a, b) => a.finishedAt - b.finishedAt);

	let wins = 0;
	let losses = 0;
	let singlesMatches = 0;
	let singlesWins = 0;
	let doublesMatches = 0;
	let doublesWins = 0;
	let currentStreak = 0;
	let bestStreak = 0;
	let tempStreak = 0;

	for (const match of playerMatches) {
		const won = isWinner(playerId, match);
		if (won) {
			wins++;
			tempStreak = tempStreak >= 0 ? tempStreak + 1 : 1;
		} else {
			losses++;
			tempStreak = tempStreak <= 0 ? tempStreak - 1 : -1;
		}
		if (tempStreak > bestStreak) bestStreak = tempStreak;
		currentStreak = tempStreak;

		if (match.isSingle) {
			singlesMatches++;
			if (won) singlesWins++;
		} else {
			doublesMatches++;
			if (won) doublesWins++;
		}
	}

	const totalMatches = playerMatches.length;

	return {
		playerId,
		totalMatches,
		wins,
		losses,
		winRate: totalMatches > 0 ? wins / totalMatches : 0,
		singlesMatches,
		singlesWins,
		doublesMatches,
		doublesWins,
		currentStreak,
		bestStreak,
	};
}

export function computeAllPlayerStats(matches: MatchRecord[]): Map<string, PlayerStats> {
	const playerIds = new Set<string>();
	for (const match of matches) {
		for (const id of match.playerIds) {
			playerIds.add(id);
		}
	}
	const result = new Map<string, PlayerStats>();
	for (const id of playerIds) {
		result.set(id, computePlayerStats(id, matches));
	}
	return result;
}

export function computeHeadToHead(
	playerIdA: string,
	playerIdB: string,
	matches: MatchRecord[],
): HeadToHeadRecord {
	let matchesPlayed = 0;
	let winsA = 0;
	let winsB = 0;
	let lastPlayed = 0;

	for (const match of matches) {
		if (!match.playerIds.includes(playerIdA) || !match.playerIds.includes(playerIdB)) continue;

		matchesPlayed++;
		if (match.finishedAt > lastPlayed) lastPlayed = match.finishedAt;

		const aWon = isWinner(playerIdA, match);
		const bWon = isWinner(playerIdB, match);

		if (aWon) winsA++;
		if (bWon) winsB++;
	}

	return { playerIdA, playerIdB, matchesPlayed, winsA, winsB, lastPlayed };
}

export function getTopPlayers(matches: MatchRecord[], limit = 10): PlayerStats[] {
	const allStats = computeAllPlayerStats(matches);
	return Array.from(allStats.values())
		.filter((s) => s.totalMatches > 0)
		.sort((a, b) => b.winRate - a.winRate || b.wins - a.wins)
		.slice(0, limit);
}

export function getRecentForm(
	playerId: string,
	matches: MatchRecord[],
	lastN = 5,
): { wins: number; losses: number } {
	const playerMatches = matches
		.filter((m) => m.playerIds.includes(playerId))
		.sort((a, b) => b.finishedAt - a.finishedAt)
		.slice(0, lastN);

	let wins = 0;
	let losses = 0;
	for (const match of playerMatches) {
		if (isWinner(playerId, match)) wins++;
		else losses++;
	}
	return { wins, losses };
}
