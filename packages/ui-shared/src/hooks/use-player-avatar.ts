import { type Player } from '@badminton/types';
import { getPlayerInitials, getAvatarColor } from '@badminton/core';

export function usePlayerAvatarViewModel(player: Player) {
	const initials = getPlayerInitials(player.name);
	const backgroundColor = player.avatarColor || getAvatarColor(player.id);
	const avatarUrl = player.avatarUrl || null;
	const hasAvatar = !!avatarUrl;

	return {
		initials,
		backgroundColor,
		avatarUrl,
		hasAvatar,
	};
}
