/**
 * Generate initials from a player name.
 * "Sam Kap" -> "SK", "Sam" -> "SA"
 */
export function getPlayerInitials(name: string): string {
	const parts = name.trim().split(/\s+/);
	if (parts.length >= 2) {
		return (parts[0][0] + parts[1][0]).toUpperCase();
	}
	return name.trim().slice(0, 2).toUpperCase();
}

/**
 * Generate a deterministic hex color from a player ID.
 * Produces consistent pastel-ish colors.
 */
export function getAvatarColor(playerId: string): string {
	let hash = 0;
	for (let i = 0; i < playerId.length; i++) {
		hash = playerId.charCodeAt(i) + ((hash << 5) - hash);
	}
	const h = Math.abs(hash) % 360;
	return `hsl(${h}, 60%, 50%)`;
}
