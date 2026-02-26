import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import PlayerAvatar from "@/components/PlayerAvatar";
import PlayerLevelBadge from "@/components/PlayerLevelBadge";
import { BadmintonPalette } from "@/constants/palette";
import type { Player, PlayerLevel } from "@badminton/types";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export type PlayerStatus = "in_game" | "bench";

const statusConfig = {
  in_game: {
    icon: "badminton" as const,
    color: BadmintonPalette.status.inGame,
    label: "In Game",
    bgClass: "bg-danger/10",
    borderClass: "border-danger/30",
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
  player,
  name,
  onDelete,
  onEdit,
  onToggleActive,
  onSelect,
  selected,
  inactive,
  status,
  gameCount,
  level,
  courtName,
}: {
  player?: Player;
  name: string;
  onDelete?: () => void;
  onEdit?: () => void;
  onToggleActive?: () => void;
  onSelect?: () => void;
  selected?: boolean;
  inactive?: boolean;
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

  const isSelectMode = !!onSelect;

  const cardContent = (
    <View
      className={`bg-secondary rounded-2xl overflow-hidden border ${
        isSelectMode && selected
          ? "border-accent/50 bg-accent/5"
          : "border-dark-100"
      }`}
    >
      {/* Player Info Section */}
      <View className="flex-row items-center p-4">
        {/* Checkbox (select mode) */}
        {isSelectMode && (
          <View
            className={`size-6 rounded-lg items-center justify-center mr-3 ${
              selected
                ? "bg-court-lime"
                : "bg-dark-100 border border-dark-100"
            }`}
          >
            {selected && (
              <MaterialCommunityIcons
                name="check"
                size={16}
                color={BadmintonPalette.bg.base}
              />
            )}
          </View>
        )}

        {/* Avatar */}
        {!isSelectMode && player && (
          <View className="mr-4">
            <PlayerAvatar player={player} size="lg" />
          </View>
        )}

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
        {!isSelectMode && (
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
        )}
      </View>

      {/* Actions Section (hidden in select mode) */}
      {!isSelectMode && (
        <View className="flex-row items-center px-4 pb-4" style={{ gap: 8 }}>
          {/* Toggle Active Button */}
          {onToggleActive && (
            <TouchableOpacity
              className={`flex-row items-center justify-center py-2.5 px-3 rounded-xl border active:opacity-70 ${
                inactive
                  ? "bg-success/10 border-success/30"
                  : "bg-warning/10 border-warning/30"
              }`}
              onPress={onToggleActive}
              accessibilityRole="button"
              accessibilityLabel={
                inactive ? `Enable ${name}` : `Disable ${name}`
              }
            >
              <MaterialCommunityIcons
                name={inactive ? "eye" : "eye-off"}
                size={14}
                color={
                  inactive
                    ? BadmintonPalette.accent.success
                    : BadmintonPalette.accent.warning
                }
              />
            </TouchableOpacity>
          )}

          {/* Edit Player Button */}
          {onEdit && (
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center py-2.5 rounded-xl bg-info/10 border border-info/30 active:bg-info/20"
              onPress={onEdit}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${name}`}
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
                Edit Player
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
      )}
    </View>
  );

  if (isSelectMode) {
    return (
      <TouchableOpacity
        onPress={onSelect}
        activeOpacity={0.7}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={`Select ${name}`}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

export default PlayerCard;
