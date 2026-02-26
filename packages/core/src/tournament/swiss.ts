import {
	type SwissRound,
	type SwissPairing,
	type SwissStanding,
} from '@badminton/types';

/**
 * Calculate the number of Swiss rounds based on participant count.
 * 4 rounds for ≤8, 5 for 9-16, 6 for 17+.
 */
export function getSwissRoundCount(participantCount: number): number {
	if (participantCount <= 8) return 4;
	if (participantCount <= 16) return 5;
	return 6;
}

/**
 * Compute standings from completed Swiss rounds.
 * Includes GP, W, L, PF, PA, PD, Match Points, Buchholz score, and rank.
 */
export function computeSwissStandings(
	participantIds: string[],
	rounds: SwissRound[],
): SwissStanding[] {
	// Initialize standings
	const standingsMap = new Map<string, Omit<SwissStanding, 'buchholz' | 'rank'>>();
	for (const id of participantIds) {
		standingsMap.set(id, {
			participantId: id,
			gamesPlayed: 0,
			wins: 0,
			losses: 0,
			pointsFor: 0,
			pointsAgainst: 0,
			pointDifferential: 0,
			matchPoints: 0,
		});
	}

	// Track opponents for Buchholz calculation
	const opponentsMap = new Map<string, string[]>();
	for (const id of participantIds) {
		opponentsMap.set(id, []);
	}

	// Accumulate stats from completed rounds
	for (const round of rounds) {
		if (!round.completed) continue;
		for (const pairing of round.pairings) {
			if (pairing.isBye) {
				// BYE counts as a win
				const s = standingsMap.get(pairing.participantA);
				if (s) {
					s.gamesPlayed++;
					s.wins++;
					s.matchPoints += 2;
				}
				continue;
			}

			const { participantA, participantB, scoreA, scoreB, winner } = pairing;
			if (!participantB) continue;

			const sA = standingsMap.get(participantA);
			const sB = standingsMap.get(participantB);

			// Record opponents
			opponentsMap.get(participantA)?.push(participantB);
			opponentsMap.get(participantB)?.push(participantA);

			if (sA) {
				sA.gamesPlayed++;
				sA.pointsFor += scoreA ?? 0;
				sA.pointsAgainst += scoreB ?? 0;
			}
			if (sB) {
				sB.gamesPlayed++;
				sB.pointsFor += scoreB ?? 0;
				sB.pointsAgainst += scoreA ?? 0;
			}

			if (winner === participantA) {
				if (sA) { sA.wins++; sA.matchPoints += 2; }
				if (sB) { sB.losses++; }
			} else if (winner === participantB) {
				if (sB) { sB.wins++; sB.matchPoints += 2; }
				if (sA) { sA.losses++; }
			}
		}
	}

	// Compute PD
	for (const s of standingsMap.values()) {
		s.pointDifferential = s.pointsFor - s.pointsAgainst;
	}

	// Compute Buchholz (sum of opponents' wins)
	const standings: SwissStanding[] = [];
	for (const id of participantIds) {
		const s = standingsMap.get(id)!;
		const opponents = opponentsMap.get(id) ?? [];
		let buchholz = 0;
		for (const opp of opponents) {
			buchholz += standingsMap.get(opp)?.wins ?? 0;
		}
		standings.push({ ...s, buchholz, rank: 0 });
	}

	// Sort and rank with tiebreakers
	return rankStandings(standings, rounds);
}

/**
 * Check head-to-head result between two participants across all rounds.
 * Returns 1 if a beat b, -1 if b beat a, 0 if no direct match or tied.
 */
function headToHead(a: string, b: string, rounds: SwissRound[]): number {
	for (const round of rounds) {
		if (!round.completed) continue;
		for (const pairing of round.pairings) {
			if (pairing.isBye) continue;
			const isMatch =
				(pairing.participantA === a && pairing.participantB === b) ||
				(pairing.participantA === b && pairing.participantB === a);
			if (isMatch && pairing.winner) {
				return pairing.winner === a ? 1 : -1;
			}
		}
	}
	return 0;
}

/**
 * Sort standings by: Match Points → H2H → Buchholz → PD → PF → random (coin flip).
 */
function rankStandings(standings: SwissStanding[], rounds: SwissRound[]): SwissStanding[] {
	const sorted = [...standings].sort((a, b) => {
		// 1. Match Points (desc)
		if (b.matchPoints !== a.matchPoints) return b.matchPoints - a.matchPoints;
		// 2. Head-to-head
		const h2h = headToHead(a.participantId, b.participantId, rounds);
		if (h2h !== 0) return -h2h; // h2h returns 1 if a beat b → a should be higher
		// 3. Buchholz (desc)
		if (b.buchholz !== a.buchholz) return b.buchholz - a.buchholz;
		// 4. Point differential (desc)
		if (b.pointDifferential !== a.pointDifferential) return b.pointDifferential - a.pointDifferential;
		// 5. Total points scored (desc)
		if (b.pointsFor !== a.pointsFor) return b.pointsFor - a.pointsFor;
		// 6. Coin flip (random, stable per pair for this sort)
		return 0;
	});

	sorted.forEach((s, i) => { s.rank = i + 1; });
	return sorted;
}

/**
 * Generate pairings for the next Swiss round.
 * Round 1: random pairing.
 * Later rounds: pair teams with same W-L record, avoid repeats.
 * Odd number: assign BYE to lowest-ranked eligible team.
 */
export function generateSwissPairings(
	participantIds: string[],
	completedRounds: SwissRound[],
	byeHistory: string[],
	idGenerator: () => string,
): SwissPairing[] {
	const roundNumber = completedRounds.length + 1;

	// Get previous matchup set to avoid repeats
	const playedPairs = new Set<string>();
	for (const round of completedRounds) {
		for (const pairing of round.pairings) {
			if (!pairing.isBye && pairing.participantB) {
				const key = pairKey(pairing.participantA, pairing.participantB);
				playedPairs.add(key);
			}
		}
	}

	let ids = [...participantIds];
	const pairings: SwissPairing[] = [];
	let byeParticipant: string | undefined;

	// Handle odd number: assign BYE
	if (ids.length % 2 !== 0) {
		if (roundNumber === 1) {
			// Random BYE for round 1
			const eligible = ids.filter((id) => !byeHistory.includes(id));
			const byeIdx = Math.floor(Math.random() * eligible.length);
			byeParticipant = eligible[byeIdx] ?? ids[ids.length - 1];
		} else {
			// BYE goes to lowest-ranked eligible team
			const standings = computeSwissStandings(participantIds, completedRounds);
			// Find lowest ranked who hasn't had a BYE
			for (let i = standings.length - 1; i >= 0; i--) {
				if (!byeHistory.includes(standings[i].participantId)) {
					byeParticipant = standings[i].participantId;
					break;
				}
			}
			// Fallback if everyone had a BYE
			if (!byeParticipant) {
				byeParticipant = standings[standings.length - 1].participantId;
			}
		}

		ids = ids.filter((id) => id !== byeParticipant);
		pairings.push({
			id: idGenerator(),
			participantA: byeParticipant!,
			isBye: true,
			winner: byeParticipant!,
		});
	}

	if (roundNumber === 1) {
		// Round 1: random pairing
		const shuffled = [...ids].sort(() => Math.random() - 0.5);
		for (let i = 0; i < shuffled.length; i += 2) {
			pairings.push({
				id: idGenerator(),
				participantA: shuffled[i],
				participantB: shuffled[i + 1],
				isBye: false,
			});
		}
	} else {
		// Later rounds: group by W-L, pair within groups, avoid repeats
		const standings = computeSwissStandings(participantIds, completedRounds);
		const standingsById = new Map(standings.map((s) => [s.participantId, s]));

		// Sort remaining IDs by standings (highest first)
		const sorted = [...ids].sort((a, b) => {
			const sa = standingsById.get(a)!;
			const sb = standingsById.get(b)!;
			return sa.rank - sb.rank;
		});

		// Group by win count
		const groups = new Map<number, string[]>();
		for (const id of sorted) {
			const wins = standingsById.get(id)?.wins ?? 0;
			if (!groups.has(wins)) groups.set(wins, []);
			groups.get(wins)!.push(id);
		}

		// Flatten groups in order (highest wins first) for pairing
		const unpaired: string[] = [];
		const winCounts = [...groups.keys()].sort((a, b) => b - a);
		for (const w of winCounts) {
			unpaired.push(...groups.get(w)!);
		}

		// Greedy pairing: match adjacent players, skip if already played
		const paired = new Set<string>();
		for (let i = 0; i < unpaired.length; i++) {
			if (paired.has(unpaired[i])) continue;
			const a = unpaired[i];

			// Find best opponent: first unpaired in same or adjacent group
			let bestOpponent: string | null = null;
			for (let j = i + 1; j < unpaired.length; j++) {
				if (paired.has(unpaired[j])) continue;
				const b = unpaired[j];
				if (!playedPairs.has(pairKey(a, b))) {
					bestOpponent = b;
					break;
				}
			}

			// If no non-repeat match found, allow repeat as fallback
			if (!bestOpponent) {
				for (let j = i + 1; j < unpaired.length; j++) {
					if (!paired.has(unpaired[j])) {
						bestOpponent = unpaired[j];
						break;
					}
				}
			}

			if (bestOpponent) {
				paired.add(a);
				paired.add(bestOpponent);
				pairings.push({
					id: idGenerator(),
					participantA: a,
					participantB: bestOpponent,
					isBye: false,
				});
			}
		}
	}

	return pairings;
}

/**
 * Record a match result in a Swiss round.
 */
export function recordSwissResult(
	round: SwissRound,
	pairingId: string,
	winnerId: string,
	scoreA: number,
	scoreB: number,
): SwissRound {
	const updatedPairings = round.pairings.map((p) => {
		if (p.id !== pairingId) return p;
		return { ...p, winner: winnerId, scoreA, scoreB };
	});

	const allCompleted = updatedPairings.every((p) => p.winner != null);

	return {
		...round,
		pairings: updatedPairings,
		completed: allCompleted,
	};
}

/**
 * Check if all Swiss rounds are complete.
 */
export function isSwissPhaseComplete(rounds: SwissRound[], totalRounds: number): boolean {
	return rounds.length >= totalRounds && rounds.every((r) => r.completed);
}

/**
 * Get top N participants from standings for playoffs.
 */
export function getPlayoffParticipants(
	standings: SwissStanding[],
	count: number = 4,
): SwissStanding[] {
	return standings.slice(0, count);
}

/** Create a canonical key for a pair (order-independent). */
function pairKey(a: string, b: string): string {
	return a < b ? `${a}:${b}` : `${b}:${a}`;
}
