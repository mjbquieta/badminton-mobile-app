import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { PotatoPalette } from "@/constants/palette";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export type PlayerStatus = "in_game" | "in_queue" | "bench";

const PlayerCard = ({
  name,
  onDelete,
  status,
  gameCount,
  courtName,
}: {
  name: string;
  onDelete?: () => void;
  status: PlayerStatus;
  gameCount: number;
  courtName?: string;
}) => {
  const isInGame = status === "in_game";
  const isInQueue = status === "in_queue";
  const iconName = isInGame
    ? "badminton"
    : isInQueue
    ? "timer-sand"
    : "bench-back";
  const iconColor = isInGame
    ? PotatoPalette.accent.danger
    : isInQueue
    ? PotatoPalette.accent.sprout
    : PotatoPalette.text.muted;
  const baseLabel = isInGame ? "In Game" : isInQueue ? "In Queue" : "Bench";
  const label =
    isInGame && courtName ? `${baseLabel} · ${courtName}` : baseLabel;
  const labelClass = isInGame
    ? "text-danger bg-danger/10 border border-danger"
    : isInQueue
    ? "text-success bg-success/10 border border-accent"
    : "text-light-300 bg-dark-100/50 border border-dark-100";

  return (
    <TouchableOpacity
      className="bg-dark-200 rounded-xl p-4 gap-3 border border-dark-100"
      onPress={onDelete}
    >
      <View className="flex-row items-center gap-3">
        <View className="size-10 rounded-full bg-primary items-center justify-center">
          <AntDesign name="user" size={15} color={PotatoPalette.accent.gold} />
        </View>

        <View className="flex-1">
          <Text className="text-white text-lg font-bold" numberOfLines={1}>
            {name}
          </Text>
          <Text className="text-light-200 text-xs font-bold">
            Completed Games: {gameCount}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          <MaterialCommunityIcons
            name={iconName as any}
            size={15}
            color={iconColor}
          />

          <Text
            className={[
              "text-sm font-bold uppercase text-center rounded-full px-3 py-1",
              labelClass,
            ].join(" ")}
            numberOfLines={1}
          >
            {label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PlayerCard;
