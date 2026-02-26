export class MatchupTracker {
	private usedCombos: Set<string>;

	constructor(existingDrafts?: Array<{ playerIds: string[] }>) {
		this.usedCombos = new Set();
		if (existingDrafts) {
			for (const draft of existingDrafts) {
				this.markUsed(draft.playerIds);
			}
		}
	}

	static toKey(playerIds: string[]): string {
		return [...playerIds].sort().join(',');
	}

	hasBeenUsed(playerIds: string[]): boolean {
		return this.usedCombos.has(MatchupTracker.toKey(playerIds));
	}

	markUsed(playerIds: string[]): void {
		this.usedCombos.add(MatchupTracker.toKey(playerIds));
	}

	clear(): void {
		this.usedCombos.clear();
	}

	get size(): number {
		return this.usedCombos.size;
	}
}
