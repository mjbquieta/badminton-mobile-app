import { BadmintonPalette } from "@/constants/palette";
import { PlayerLevel } from "@badminton/types";
import React from "react";
import { Pressable, Text, View } from "react-native";

const levelOptions: { value: PlayerLevel; label: string; color: string }[] = [
  {
    value: PlayerLevel.BEGINNER,
    label: "Beginner",
    color: BadmintonPalette.levels.beginner,
  },
  {
    value: PlayerLevel.INTERMEDIATE,
    label: "Intermediate",
    color: BadmintonPalette.levels.intermediate,
  },
  {
    value: PlayerLevel.ADVANCED,
    label: "Advanced",
    color: BadmintonPalette.levels.advanced,
  },
  {
    value: PlayerLevel.PRO,
    label: "Pro",
    color: BadmintonPalette.levels.pro,
  },
];

interface PlayerLevelSelectorProps {
  selectedLevel: PlayerLevel;
  onSelectLevel: (level: PlayerLevel) => void;
}

export default function PlayerLevelSelector({
  selectedLevel,
  onSelectLevel,
}: PlayerLevelSelectorProps) {
  return (
    <View>
      <Text
        className="text-sm font-semibold mb-2"
        style={{ color: BadmintonPalette.text.secondary }}
      >
        Skill Level
      </Text>
      <View className="flex-row flex-wrap" style={{ gap: 8 }}>
        {levelOptions.map((option) => {
          const isSelected = selectedLevel === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onSelectLevel(option.value)}
              className={[
                "px-4 py-2.5 rounded-xl border",
                isSelected ? "border-2" : "bg-dark-200 border-dark-100",
              ].join(" ")}
              style={
                isSelected
                  ? {
                      backgroundColor: `${option.color}15`,
                      borderColor: option.color,
                    }
                  : undefined
              }
              accessibilityRole="button"
              accessibilityLabel={`Select ${option.label} level`}
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                className="font-bold text-sm"
                style={{
                  color: isSelected
                    ? option.color
                    : BadmintonPalette.text.secondary,
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
