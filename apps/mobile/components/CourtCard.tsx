import { BadmintonPalette } from "@/constants/palette";
import { Player } from "@badminton/types";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import PlayerTag from "./PlayerTag";

const CourtCard = ({
  name,
  isSingle,
  players,
  onDelete,
}: {
  name: string;
  isSingle: boolean;
  players: Player[];
  onDelete?: () => void;
}) => {
  const matchLabel = isSingle ? "Singles" : "Doubles";
  const playersNeeded = isSingle ? 2 : 4;
  const isCourtFull = players.length === playersNeeded;
  const isCourtEmpty = players.length === 0;

  const borderClass = isCourtFull
    ? "border-success/50"
    : isCourtEmpty
      ? "border-dark-100"
      : "border-accent/50";

  const matchTypeColor = isSingle
    ? BadmintonPalette.accent.info
    : BadmintonPalette.accent.primary;

  return (
    <View
      className={`bg-secondary rounded-2xl overflow-hidden border ${borderClass}`}
    >
      {/* Header */}
      <View className="flex-row items-center p-4">
        <View className="size-10 rounded-xl bg-court-deep/20 items-center justify-center mr-3">
          <MaterialCommunityIcons
            name="badminton"
            size={20}
            color={BadmintonPalette.court.lime}
          />
        </View>

        <View className="flex-1">
          <Text
            className="text-base font-bold"
            style={{ color: BadmintonPalette.text.primary }}
            numberOfLines={1}
          >
            {name}
          </Text>
          <View className="flex-row items-center mt-0.5">
            <View
              className="px-1.5 py-0.5 rounded mr-2"
              style={{ backgroundColor: `${matchTypeColor}20` }}
            >
              <Text
                className="text-[10px] font-semibold"
                style={{ color: matchTypeColor }}
              >
                {matchLabel}
              </Text>
            </View>
            <Text
              className="text-xs"
              style={{ color: BadmintonPalette.text.muted }}
            >
              {players.length}/{playersNeeded}
            </Text>
            {isCourtFull && (
              <View className="flex-row items-center ml-2 px-2 py-0.5 rounded-full bg-success/15">
                <View className="size-1.5 rounded-full bg-success mr-1" />
                <Text
                  className="text-[10px] font-semibold"
                  style={{ color: BadmintonPalette.accent.success }}
                >
                  Ready
                </Text>
              </View>
            )}
          </View>
        </View>

        {onDelete && (
          <TouchableOpacity
            onPress={onDelete}
            className="size-9 rounded-xl bg-danger/10 items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel={`Delete court ${name}`}
          >
            <FontAwesome5
              name="trash-alt"
              size={14}
              color={BadmintonPalette.accent.danger}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Players */}
      {players.length > 0 && (
        <View className="px-4 pb-4">
          <View className="flex-row flex-wrap" style={{ gap: 6 }}>
            {players.map((p) => (
              <PlayerTag
                key={p.id}
                name={p.name}
                level={p.level}
                gameCount={p.gameCount}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default CourtCard;
