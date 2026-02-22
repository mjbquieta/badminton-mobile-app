import { BadmintonPalette } from "@/constants/palette";
import type { PlayerLevel } from "@badminton/types";
import AntDesign from "@expo/vector-icons/AntDesign";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import PlayerLevelBadge from "./PlayerLevelBadge";

const PlayerTag = ({
  name,
  level,
  gameCount,
  onDeleteTag,
  onPress,
}: {
  name: string;
  level?: PlayerLevel;
  gameCount?: number;
  onDeleteTag?: () => void;
  onPress?: () => void;
}) => {
  const content = (
    <View className="flex-row items-center bg-dark-200 rounded-xl px-3 py-2 border border-dark-100">
      <View className="size-7 rounded-lg bg-court-deep/20 items-center justify-center mr-2">
        <AntDesign name="user" size={12} color={BadmintonPalette.court.lime} />
      </View>

      <View className="flex-shrink">
        <View className="flex-row items-center">
          <Text
            className="text-sm font-semibold"
            style={{ color: BadmintonPalette.text.primary }}
            numberOfLines={1}
          >
            {name}
          </Text>
          {typeof gameCount === "number" && (
            <View
              className="ml-1.5 px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${BadmintonPalette.court.lime}20` }}
            >
              <Text
                className="text-[10px] font-bold"
                style={{ color: BadmintonPalette.court.lime }}
              >
                {gameCount}
              </Text>
            </View>
          )}
        </View>
        {level ? <PlayerLevelBadge level={level} size="xs" /> : null}
      </View>

      {onDeleteTag ? (
        <TouchableOpacity
          onPress={onDeleteTag}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${name}`}
          className="size-6 rounded-lg items-center justify-center bg-danger/15 active:bg-danger/25 ml-2"
        >
          <AntDesign
            name="close"
            size={10}
            color={BadmintonPalette.accent.danger}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} accessibilityRole="button">
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

export default PlayerTag;
