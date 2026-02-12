import { BadmintonPalette } from "@/constants/palette";
import type { PlayerLevel } from "@badminton/types";
import React, { useMemo } from "react";
import { Text, View } from "react-native";

const levelMeta: Record<
  PlayerLevel,
  {
    label: string;
    shortLabel: string;
    color: string;
    bgClass: string;
  }
> = {
  BEGINNER: {
    label: "Beginner",
    shortLabel: "B",
    color: BadmintonPalette.levels.beginner,
    bgClass: "bg-beginner/15 border-beginner/40",
  },
  INTERMEDIATE: {
    label: "Intermediate",
    shortLabel: "I",
    color: BadmintonPalette.levels.intermediate,
    bgClass: "bg-intermediate/15 border-intermediate/40",
  },
  ADVANCED: {
    label: "Advanced",
    shortLabel: "A",
    color: BadmintonPalette.levels.advanced,
    bgClass: "bg-advanced/15 border-advanced/40",
  },
  PRO: {
    label: "Pro",
    shortLabel: "P",
    color: BadmintonPalette.levels.pro,
    bgClass: "bg-pro/15 border-pro/40",
  },
};

export default function PlayerLevelBadge({
  level,
  size = "sm",
  showLabel = true,
}: {
  level: PlayerLevel;
  size?: "sm" | "xs";
  showLabel?: boolean;
}) {
  const meta = useMemo(() => levelMeta[level], [level]);
  const fontSize = size === "xs" ? 10 : 12;
  const paddingClass = size === "xs" ? "px-1.5 py-0.5" : "px-2 py-0.5";

  return (
    <View className={`rounded-md border ${paddingClass} ${meta.bgClass} self-start`}>
      <Text 
        className="font-bold"
        style={{ fontSize, color: meta.color }}
      >
        {showLabel ? meta.label : meta.shortLabel}
      </Text>
    </View>
  );
}
