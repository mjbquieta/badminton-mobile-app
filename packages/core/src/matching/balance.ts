import { type Player, type TeamBalanceMetrics } from '@badminton/types';
import { levelIndex } from './level-index';

function avgLevel(players: Player[]): number {
	if (players.length === 0) return 0;
	const sum = players.reduce((acc, p) => acc + levelIndex[p.level], 0);
	return sum / players.length;
}

export function computeTeamBalance(teamA: Player[], teamB: Player[]): TeamBalanceMetrics {
	const teamAAvg = avgLevel(teamA);
	const teamBAvg = avgLevel(teamB);
	const diff = Math.abs(teamAAvg - teamBAvg);
	const maxPossibleDiff = 3; // PRO(3) vs BEGINNER(0)
	const score = Math.round((1 - diff / maxPossibleDiff) * 100);

	return {
		teamAAvgLevel: teamAAvg,
		teamBAvgLevel: teamBAvg,
		levelDifference: diff,
		isBalanced: diff <= 0.5,
		balanceScore: score,
	};
}

export function computeBalanceScore(teamA: Player[], teamB: Player[]): number {
	return computeTeamBalance(teamA, teamB).balanceScore;
}

export function findOptimalSplit(players: Player[]): {
	teamA: Player[];
	teamB: Player[];
	metrics: TeamBalanceMetrics;
} {
	const half = Math.floor(players.length / 2);
	let bestMetrics: TeamBalanceMetrics | null = null;
	let bestA: Player[] = [];
	let bestB: Player[] = [];

	// Generate all combinations of half-size from players
	const indices = Array.from({ length: players.length }, (_, i) => i);
	const combos = generateIndexCombos(indices, half);

	for (const combo of combos) {
		const teamASet = new Set(combo);
		const teamA = combo.map((i) => players[i]);
		const teamB = indices.filter((i) => !teamASet.has(i)).map((i) => players[i]);
		const metrics = computeTeamBalance(teamA, teamB);

		if (!bestMetrics || metrics.balanceScore > bestMetrics.balanceScore) {
			bestMetrics = metrics;
			bestA = teamA;
			bestB = teamB;
		}
	}

	return {
		teamA: bestA,
		teamB: bestB,
		metrics: bestMetrics ?? computeTeamBalance([], []),
	};
}

function generateIndexCombos(indices: number[], size: number): number[][] {
	const result: number[][] = [];

	function backtrack(start: number, current: number[]) {
		if (current.length === size) {
			result.push([...current]);
			return;
		}
		for (let i = start; i < indices.length; i++) {
			current.push(indices[i]);
			backtrack(i + 1, current);
			current.pop();
		}
	}

	backtrack(0, []);
	return result;
}
