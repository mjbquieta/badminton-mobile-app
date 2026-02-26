"use client";

import { getAvatarColor, getPlayerInitials } from "@badminton/core";
import type { Player } from "@badminton/types";

interface PlayerAvatarProps {
  player: Player;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-6 h-6 text-[10px]",
  md: "w-8 h-8 text-xs",
  lg: "w-10 h-10 text-sm",
};

export function PlayerAvatar({ player, size = "md" }: PlayerAvatarProps) {
  const initials = getPlayerInitials(player.name);
  const bgColor = player.avatarColor || getAvatarColor(player.id);

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
      style={{ backgroundColor: bgColor }}
    >
      {initials}
    </div>
  );
}
