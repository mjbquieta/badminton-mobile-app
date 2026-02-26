import { getPlayerInitials, getAvatarColor } from "@badminton/core";
import type { Player } from "@badminton/types";
import React from "react";
import { Text, View } from "react-native";

type PlayerAvatarProps = {
  player: Player;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: { container: 24, text: 10 },
  md: { container: 32, text: 12 },
  lg: { container: 40, text: 14 },
};

const PlayerAvatar = ({ player, size = "md" }: PlayerAvatarProps) => {
  const { container, text } = sizeMap[size];
  const initials = getPlayerInitials(player.name);
  const bgColor = getAvatarColor(player.id);

  return (
    <View
      style={{
        width: container,
        height: container,
        borderRadius: container * 0.35,
        backgroundColor: bgColor,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: text,
          fontWeight: "700",
          color: "#FFFFFF",
        }}
      >
        {initials}
      </Text>
    </View>
  );
};

export default PlayerAvatar;
