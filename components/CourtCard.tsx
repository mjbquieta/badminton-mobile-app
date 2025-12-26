import { Player } from "@/types/players";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { PotatoPalette } from "@/constants/palette";
import PlayerTag from "./PlayerTag";

const CourtCard = ({
  name,
  isSingle,
  players,
  onDelete,
  onEndGame,
  onAssignPlayers,
  onDeleteTag,
  onManuallyAddPlayers,
}: {
  name: string;
  isSingle: boolean;
  players: Player[];
  onDelete?: () => void;
  onDeleteTag?: (playerId: string) => void;
  onEndGame?: () => void;
  onAssignPlayers?: () => void;
  onManuallyAddPlayers?: () => void;
}) => {
  const matchLabel = isSingle ? "Singles" : "Doubles";
  const playersNeeded = isSingle ? 2 : 4;
  const playersAssigned = players.length;
  return (
    <View className="bg-dark-200 rounded-xl p-4 gap-3 border border-dark-100">
      <View className="flex-row items-center gap-3">
        <View className="size-10 rounded-full bg-primary items-center justify-center">
          <MaterialCommunityIcons
            name="file-cabinet"
            size={20}
            color={PotatoPalette.accent.gold}
          />
        </View>

        <Text
          className="flex-1 text-white text-lg font-bold uppercase"
          numberOfLines={1}
        >
          {name}
        </Text>

        {onDelete ? (
          <Pressable
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel={`Delete court ${name}`}
            className="size-10 rounded-full bg-primary items-center justify-center"
          >
            <FontAwesome5
              name="trash-alt"
              size={20}
              color={PotatoPalette.accent.danger}
            />
          </Pressable>
        ) : null}
      </View>

      <View className="gap-2">
        <Text className="text-white text-sm font-bold">Players</Text>

        {players.length === 0 ? (
          <Text className="text-light-200 text-sm">No players assigned</Text>
        ) : (
          <View className="flex-row flex-wrap gap-2">
            {players.map((p) => (
              <PlayerTag
                key={p.id}
                name={p.name}
                onDeleteTag={() => onDeleteTag?.(p.id)}
              />
            ))}
          </View>
        )}
      </View>

      <View className="flex-row items-center justify-between">
        <View className="px-3">
          <Text className="text-sm font-bold text-light-200">
            Match Type: {matchLabel}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          {playersAssigned === 0 ? (
            <>
              <TouchableOpacity
                className="bg-accent/90 px-3 py-1.5 rounded-full"
                onPress={onAssignPlayers}
                accessibilityRole="button"
                accessibilityLabel="Assign players"
              >
                <Text className="text-primary text-sm font-bold">
                  Assign Random Players
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-secondary border border-dark-100 px-3 py-1.5 rounded-full"
                onPress={onManuallyAddPlayers}
                accessibilityRole="button"
                accessibilityLabel="Manually add players"
              >
                <Text className="text-light-200 text-sm font-bold">
                  Manually Add Players
                </Text>
              </TouchableOpacity>
            </>
          ) : playersAssigned === playersNeeded ? (
            <TouchableOpacity
              className="bg-success/90 px-3 py-1.5 rounded-full"
              onPress={onEndGame}
              accessibilityRole="button"
              accessibilityLabel="End game"
            >
              <Text className="text-primary text-sm font-bold">End Game</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="bg-secondary border border-dark-100 px-3 py-1.5 rounded-full"
              onPress={onManuallyAddPlayers}
              accessibilityRole="button"
              accessibilityLabel="Manually add players"
            >
              <Text className="text-light-200 text-sm font-bold">
                Manually Add Players
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default CourtCard;
