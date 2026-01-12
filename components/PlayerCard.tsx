import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import PlayerLevelBadge from "@/components/PlayerLevelBadge";
import { BadmintonPalette } from "@/constants/palette";
import type { PlayerLevel } from "@/types/players";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export type PlayerStatus = "in_game" | "in_queue" | "bench";

const statusConfig = {
  in_game: {
    icon: "badminton" as const,
    color: BadmintonPalette.status.inGame,
    label: "In Game",
    bgClass: "bg-danger/10",
    borderClass: "border-danger/30",
  },
  in_queue: {
    icon: "timer-sand" as const,
    color: BadmintonPalette.status.waiting,
    label: "In Queue",
    bgClass: "bg-success/10",
    borderClass: "border-success/30",
  },
  bench: {
    icon: "account-outline" as const,
    color: BadmintonPalette.status.bench,
    label: "Bench",
    bgClass: "bg-dark-100",
    borderClass: "border-dark-100",
  },
};

const PlayerCard = ({
  name,
  onDelete,
  onEditLevel,
  status,
  gameCount,
  level,
  courtName,
}: {
  name: string;
  onDelete?: () => void;
  onEditLevel?: () => void;
  status: PlayerStatus;
  gameCount: number;
  level: PlayerLevel;
  courtName?: string;
}) => {
  const config = statusConfig[status];
  const displayLabel =
    status === "in_game" && courtName
      ? `${config.label} · ${courtName}`
      : config.label;

  return (
    <View className="bg-secondary rounded-2xl overflow-hidden border border-dark-100">
      {/* Player Info Section */}
      <View className="flex-row items-center p-4">
        {/* Avatar */}
        <View className="size-12 rounded-xl bg-court-deep/20 items-center justify-center mr-4">
          <AntDesign
            name="user"
            size={20}
            color={BadmintonPalette.court.lime}
          />
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text
            className="text-base font-bold"
            style={{ color: BadmintonPalette.text.primary }}
            numberOfLines={1}
          >
            {name}
          </Text>

          <View className="flex-row items-center mt-1">
            <View className="flex-row items-center mr-3">
              <MaterialCommunityIcons
                name="trophy-outline"
                size={12}
                color={BadmintonPalette.text.secondary}
              />
              <Text
                className="text-xs ml-1"
                style={{ color: BadmintonPalette.text.secondary }}
              >
                {gameCount} {gameCount === 1 ? "game" : "games"}
              </Text>
            </View>

            <PlayerLevelBadge level={level} size="xs" />
          </View>
        </View>

        {/* Status Badge */}
        <View
          className={`flex-row items-center px-2.5 py-1 rounded-full border ${config.bgClass} ${config.borderClass} ml-2`}
        >
          <MaterialCommunityIcons
            name={config.icon}
            size={12}
            color={config.color}
          />
          <Text
            className="text-xs font-semibold ml-1.5"
            style={{ color: config.color }}
            numberOfLines={1}
          >
            {displayLabel}
          </Text>
        </View>
      </View>

      {/* Actions Section */}
      <View className="flex-row items-center px-4 pb-4" style={{ gap: 8 }}>
        {/* Edit Level Button */}
        {onEditLevel && (
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center py-2.5 rounded-xl bg-info/10 border border-info/30 active:bg-info/20"
            onPress={onEditLevel}
            accessibilityRole="button"
            accessibilityLabel={`Edit level for ${name}`}
          >
            <MaterialCommunityIcons
              name="pencil"
              size={14}
              color={BadmintonPalette.accent.info}
            />
            <Text
              className="text-sm font-bold ml-1.5"
              style={{ color: BadmintonPalette.accent.info }}
            >
              Edit Level
            </Text>
          </TouchableOpacity>
        )}

        {/* Delete Button */}
        {onDelete && (
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center py-2.5 rounded-xl bg-danger/10 border border-danger/30 active:bg-danger/20"
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${name}`}
          >
            <FontAwesome5
              name="trash-alt"
              size={12}
              color={BadmintonPalette.accent.danger}
            />
            <Text
              className="text-sm font-bold ml-1.5"
              style={{ color: BadmintonPalette.accent.danger }}
            >
              Delete
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default PlayerCard;
