"use client";

import { FiAward } from "react-icons/fi";

interface PlayerTrophyBadgeProps {
	trophies: number;
}

export function PlayerTrophyBadge({ trophies }: PlayerTrophyBadgeProps) {
	if (trophies <= 0) return null;

	return (
		<span className="inline-flex items-center gap-1 text-accent text-sm font-medium">
			<FiAward size={14} />
			{trophies}
		</span>
	);
}
