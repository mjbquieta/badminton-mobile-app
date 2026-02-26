import { type PlayerLevel } from '@badminton/types';
import { shuffle } from '../utils/shuffle';

export type ShuffleMode = 'balanced' | 'random' | 'skill-match';

export type CourtSpec = {
	id: string;
	isSingle: boolean;
};

export type AutoDraftOptions = {
	mode: ShuffleMode;
	draftCount: number;
	playerIds: string[];
	playerLevels: Map<string, PlayerLevel>;
	courts: CourtSpec[];
	existingDrafts: Array<{ playerIds: string[] }>;
	existingDraftCount: number;
	selectedLevels?: Set<PlayerLevel>;
	idGenerator: () => string;
};

export type GeneratedDraft = {
	id: string;
	playerIds: string[];
	courtId?: string;
};

export type AutoDraftResult = {
	drafts: GeneratedDraft[];
};

/** Compute C(n, k) */
export function combinations(n: number, k: number): number {
	if (k > n) return 0;
	let result = 1;
	for (let i = 0; i < k; i++) result = (result * (n - i)) / (i + 1);
	return Math.round(result);
}

/** Generate all combinations of `size` elements from a pool, shuffled */
export function generateCombos<T>(pool: T[], size: number): T[][] {
	const combos: T[][] = [];
	function build(start: number, current: T[]) {
		if (current.length === size) {
			combos.push([...current]);
			return;
		}
		for (let i = start; i < pool.length; i++) {
			current.push(pool[i]);
			build(i + 1, current);
			current.pop();
		}
	}
	build(0, []);
	return shuffle(combos);
}

/**
 * Pure function that generates auto-draft matchups.
 * Extracted from the duplicated logic in web/mobile apps.
 */
export function generateAutoDrafts(options: AutoDraftOptions): AutoDraftResult {
	const {
		mode,
		draftCount,
		playerIds: allPlayerIds,
		playerLevels,
		courts,
		existingDrafts,
		existingDraftCount,
		selectedLevels,
		idGenerator,
	} = options;

	const usedCombos = new Set(
		existingDrafts.map((d) => [...d.playerIds].sort().join(',')),
	);

	const roundSize = courts.length > 0 ? courts.length : Infinity;
	const usedInRound = new Set<string>();
	const pendingDrafts: GeneratedDraft[] = [];

	function getComboSize(draftIndex: number): number {
		if (courts.length === 0) return 4;
		const courtIndex = (existingDraftCount + draftIndex) % courts.length;
		return courts[courtIndex].isSingle ? 2 : 4;
	}

	function commitDraft(combo: string[], draftIndex: number) {
		shuffle(combo);
		const key = [...combo].sort().join(',');
		usedCombos.add(key);
		const courtId =
			courts.length > 0
				? courts[(existingDraftCount + draftIndex) % courts.length].id
				: undefined;
		pendingDrafts.push({ id: idGenerator(), playerIds: combo, courtId });
	}

	function findAndCommit(
		sorted: string[],
		comboSize: number,
		draftIndex: number,
		checkUsedCombos: boolean,
	): boolean {
		for (let poolSize = comboSize; poolSize <= sorted.length; poolSize++) {
			const pool = sorted.slice(0, poolSize);
			const combos = generateCombos(pool, comboSize);

			for (const combo of combos) {
				if (combo.some((id) => usedInRound.has(id))) continue;
				if (checkUsedCombos) {
					const key = [...combo].sort().join(',');
					if (usedCombos.has(key)) continue;
				}

				for (const id of combo) usedInRound.add(id);
				commitDraft(combo, draftIndex);
				return true;
			}
		}
		return false;
	}

	function sortByGameCount(ids: string[], counts: Map<string, number>): string[] {
		const sorted = [...ids].sort((a, b) => counts.get(a)! - counts.get(b)!);
		let idx = 0;
		while (idx < sorted.length) {
			const count = counts.get(sorted[idx])!;
			let end = idx;
			while (end < sorted.length && counts.get(sorted[end])! === count) end++;
			const tier = sorted.slice(idx, end);
			shuffle(tier);
			for (let t = 0; t < tier.length; t++) sorted[idx + t] = tier[t];
			idx = end;
		}
		return sorted;
	}

	if (mode === 'skill-match') {
		const filteredIds = allPlayerIds.filter(
			(id) => selectedLevels?.has(playerLevels.get(id)!),
		);

		if (filteredIds.length < 2) return { drafts: [] };

		const maxCombos = Math.min(
			draftCount,
			combinations(filteredIds.length, 2) + combinations(filteredIds.length, 4),
		);
		const counts = new Map(filteredIds.map((id) => [id, 0]));

		for (let i = 0; i < maxCombos; i++) {
			if (i % roundSize === 0) usedInRound.clear();
			const comboSize = getComboSize(i);
			const sorted = sortByGameCount(filteredIds, counts);

			let found = findAndCommit(sorted, comboSize, i, true);
			if (!found) {
				usedCombos.clear();
				found = findAndCommit(sorted, comboSize, i, false);
			}
			if (!found) {
				if (i % roundSize === 0) break;
				const nextRound = (Math.floor(i / roundSize) + 1) * roundSize;
				i = nextRound - 1;
			} else {
				const lastDraft = pendingDrafts[pendingDrafts.length - 1];
				for (const id of lastDraft.playerIds) {
					counts.set(id, (counts.get(id) ?? 0) + 1);
				}
			}
		}
	} else {
		const ids = allPlayerIds;
		if (ids.length < 2) return { drafts: [] };

		const maxCombos = Math.min(
			draftCount,
			combinations(ids.length, 2) + combinations(ids.length, 4),
		);
		const counts = new Map(ids.map((id) => [id, 0]));

		for (let i = 0; i < maxCombos; i++) {
			if (i % roundSize === 0) usedInRound.clear();
			const comboSize = getComboSize(i);

			let sorted: string[];
			if (mode === 'random') {
				sorted = shuffle([...ids]);
			} else {
				sorted = sortByGameCount(ids, counts);
			}

			let found = findAndCommit(sorted, comboSize, i, true);
			if (!found) {
				usedCombos.clear();
				found = findAndCommit(sorted, comboSize, i, false);
			}
			if (!found) {
				if (i % roundSize === 0) break;
				const nextRound = (Math.floor(i / roundSize) + 1) * roundSize;
				i = nextRound - 1;
			} else {
				const lastDraft = pendingDrafts[pendingDrafts.length - 1];
				for (const id of lastDraft.playerIds) {
					counts.set(id, (counts.get(id) ?? 0) + 1);
				}
			}
		}
	}

	return { drafts: pendingDrafts };
}
