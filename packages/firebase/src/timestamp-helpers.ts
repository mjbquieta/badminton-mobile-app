/**
 * Safely converts a Firestore Timestamp (or number/null/undefined) to milliseconds.
 */
export function toTimestampMs(value: unknown): number | null {
	if (value === null || value === undefined) return null;
	if (typeof value === 'number') return value;
	if (
		typeof value === 'object' &&
		value !== null &&
		'toMillis' in value &&
		typeof (value as { toMillis: unknown }).toMillis === 'function'
	) {
		return (value as { toMillis: () => number }).toMillis();
	}
	return null;
}
