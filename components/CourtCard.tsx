import { BadmintonPalette } from "@/constants/palette";
import { Player } from "@/types/players";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
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
  const isCourtFull = playersAssigned === playersNeeded;
  const isCourtEmpty = playersAssigned === 0;

  // Dynamic border color based on court status
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
      <View className="flex-row items-center justify-between p-4 border-b border-dark-100">
        <View className="flex-row items-center flex-1">
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
                {playersAssigned}/{playersNeeded}
              </Text>
            </View>
          </View>
        </View>

        {/* Header Actions */}
        <View className="flex-row items-center" style={{ gap: 8 }}>
          {/* End Game button in header when court is full */}
          {isCourtFull && onEndGame && (
            <TouchableOpacity
              onPress={onEndGame}
              className="flex-row items-center px-3 py-2 rounded-xl bg-success active:opacity-80"
              accessibilityRole="button"
              accessibilityLabel="End game"
            >
              <AntDesign
                name="check"
                size={14}
                color={BadmintonPalette.bg.base}
              />
              <Text
                className="text-xs font-bold ml-1"
                style={{ color: BadmintonPalette.bg.base }}
              >
                End
              </Text>
            </TouchableOpacity>
          )}

          {onDelete && (
            <Pressable
              onPress={onDelete}
              accessibilityRole="button"
              accessibilityLabel={`Delete court ${name}`}
              className="size-9 rounded-xl bg-danger/10 items-center justify-center active:bg-danger/20"
            >
              <FontAwesome5
                name="trash-alt"
                size={14}
                color={BadmintonPalette.accent.danger}
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* Players Section */}
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text
            className="text-xs font-medium"
            style={{ color: BadmintonPalette.text.muted }}
          >
            Players
          </Text>
          {isCourtFull && (
            <View className="flex-row items-center px-2 py-0.5 rounded-full bg-success/15">
              <View className="size-1.5 rounded-full bg-success mr-1" />
              <Text
                className="text-[10px] font-semibold"
                style={{ color: BadmintonPalette.accent.success }}
              >
                Ready to play
              </Text>
            </View>
          )}
        </View>

        {players.length === 0 ? (
          <View className="py-3 px-3 rounded-xl bg-dark-200 border border-dashed border-dark-100">
            <Text
              className="text-sm text-center"
              style={{ color: BadmintonPalette.text.muted }}
            >
              No players assigned
            </Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap" style={{ gap: 6 }}>
            {players.map((p) => (
              <PlayerTag
                key={p.id}
                name={p.name}
                level={p.level}
                onDeleteTag={() => onDeleteTag?.(p.id)}
              />
            ))}
          </View>
        )}

        {/* Actions - only show when court is NOT full */}
        {!isCourtFull && (
          <View className="flex-row items-center mt-3" style={{ gap: 8 }}>
            {isCourtEmpty ? (
              <>
                <TouchableOpacity
                  className="flex-row items-center justify-center flex-1 bg-accent py-2.5 rounded-xl active:opacity-80"
                  onPress={onAssignPlayers}
                  accessibilityRole="button"
                  accessibilityLabel="Assign random players"
                >
                  <MaterialCommunityIcons
                    name="shuffle-variant"
                    size={16}
                    color={BadmintonPalette.bg.base}
                  />
                  <Text
                    className="text-sm font-bold ml-1.5"
                    style={{ color: BadmintonPalette.bg.base }}
                  >
                    Auto
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center justify-center flex-1 bg-dark-200 border border-dark-100 py-2.5 rounded-xl active:bg-dark-100"
                  onPress={onManuallyAddPlayers}
                  accessibilityRole="button"
                  accessibilityLabel="Manually add players"
                >
                  <AntDesign
                    name="plus"
                    size={14}
                    color={BadmintonPalette.text.secondary}
                  />
                  <Text
                    className="text-sm font-bold ml-1.5"
                    style={{ color: BadmintonPalette.text.secondary }}
                  >
                    Manual
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                className="flex-row items-center justify-center bg-dark-200 border border-dark-100 py-2.5 px-4 rounded-xl active:bg-dark-100"
                onPress={onManuallyAddPlayers}
                accessibilityRole="button"
                accessibilityLabel="Add more players"
              >
                <AntDesign
                  name="plus"
                  size={14}
                  color={BadmintonPalette.text.secondary}
                />
                <Text
                  className="text-sm font-bold ml-1.5"
                  style={{ color: BadmintonPalette.text.secondary }}
                >
                  Add {playersNeeded - playersAssigned} more
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default CourtCard;
