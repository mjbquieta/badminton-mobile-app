import { BadmintonPalette } from "@/constants/palette";
import { Player } from "@/types/players";
import AntDesign from "@expo/vector-icons/AntDesign";
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
  onEndGame,
  onDissolve,
  onBackToQueue,
  onAssignPlayers,
  onAssignFromQueue,
  onDeleteTag,
  onManuallyAddPlayers,
}: {
  name: string;
  isSingle: boolean;
  players: Player[];
  onDelete?: () => void;
  onDeleteTag?: (playerId: string) => void;
  onEndGame?: () => void;
  onDissolve?: () => void;
  onBackToQueue?: () => void;
  onAssignPlayers?: () => void;
  onAssignFromQueue?: () => void;
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
      {/* ===== COURT DETAILS SECTION ===== */}
      <View className="flex-row items-center p-4 border-b border-dark-100">
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
      </View>

      {/* ===== PLAYERS SECTION ===== */}
      <View className="p-4 border-b border-dark-100">
        <Text
          className="text-xs font-medium mb-2"
          style={{ color: BadmintonPalette.text.muted }}
        >
          Players
        </Text>

        {players.length === 0 ? (
          <View className="py-3 px-3 rounded-xl bg-dark-200 border-4 border-dashed border-dark-100">
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
                gameCount={p.gameCount}
                onDeleteTag={() => onDeleteTag?.(p.id)}
              />
            ))}
          </View>
        )}
      </View>

      {/* ===== BUTTONS SECTION ===== */}
      <View className="p-4">
        <Text
          className="text-xs font-medium mb-3"
          style={{ color: BadmintonPalette.text.muted }}
        >
          Actions
        </Text>

        <View style={{ gap: 8 }}>
          {/* Primary Actions Row */}
          {isCourtFull ? (
            // When court is full: Finish Game, Dissolve, and Back to Queue buttons
            <View style={{ gap: 8 }}>
              <View className="flex-row" style={{ gap: 8 }}>
                {onEndGame && (
                  <TouchableOpacity
                    onPress={onEndGame}
                    className="flex-1 flex-row items-center justify-center py-2.5 rounded-xl bg-success active:opacity-80"
                    accessibilityRole="button"
                    accessibilityLabel="Finish game"
                  >
                    <AntDesign
                      name="check"
                      size={16}
                      color={BadmintonPalette.bg.base}
                    />
                    <Text
                      className="text-sm font-bold ml-1.5"
                      style={{ color: BadmintonPalette.bg.base }}
                    >
                      Finish Game
                    </Text>
                  </TouchableOpacity>
                )}

                {onDissolve && (
                  <TouchableOpacity
                    onPress={onDissolve}
                    className="flex-1 flex-row items-center justify-center py-2.5 rounded-xl bg-warning/15 border border-warning/30 active:bg-warning/25"
                    accessibilityRole="button"
                    accessibilityLabel="Dissolve game"
                  >
                    <MaterialCommunityIcons
                      name="account-off"
                      size={16}
                      color={BadmintonPalette.accent.warning}
                    />
                    <Text
                      className="text-sm font-bold ml-1.5"
                      style={{ color: BadmintonPalette.accent.warning }}
                    >
                      Dissolve
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {onBackToQueue && (
                <TouchableOpacity
                  onPress={onBackToQueue}
                  className="flex-row items-center justify-center py-2.5 rounded-xl bg-accent/15 border border-accent/30 active:bg-accent/25"
                  accessibilityRole="button"
                  accessibilityLabel="Back to queue"
                >
                  <MaterialCommunityIcons
                    name="reload"
                    size={16}
                    color={BadmintonPalette.accent.info}
                  />
                  <Text
                    className="text-sm font-bold ml-1.5"
                    style={{ color: BadmintonPalette.accent.info }}
                  >
                    Back to Queue
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : isCourtEmpty ? (
            // When court is empty: Auto, Manual, and From Queue buttons
            <View style={{ gap: 8 }}>
              {/* Auto Assign and Manual buttons hidden for now
              <View className="flex-row" style={{ gap: 8 }}>
                {onAssignPlayers && (
                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center bg-accent py-2.5 rounded-xl active:opacity-80"
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
                      Auto Assign
                    </Text>
                  </TouchableOpacity>
                )}

                {onManuallyAddPlayers && (
                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center bg-dark-200 border border-dark-100 py-2.5 rounded-xl active:bg-dark-100"
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
                )}
              </View>
              */}

              {onAssignFromQueue && (
                <TouchableOpacity
                  onPress={onAssignFromQueue}
                  className="flex-row items-center justify-center py-2.5 rounded-xl bg-court-deep/20 border border-court-lime/30 active:bg-court-deep/30"
                  accessibilityRole="button"
                  accessibilityLabel="Assign from queue"
                >
                  <MaterialCommunityIcons
                    name="account-group"
                    size={16}
                    color={BadmintonPalette.court.lime}
                  />
                  <Text
                    className="text-sm font-bold ml-1.5"
                    style={{ color: BadmintonPalette.court.lime }}
                  >
                    From Queue
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            // When court has some players but not full: Add more and Dissolve
            <View className="flex-row" style={{ gap: 8 }}>
              {onManuallyAddPlayers && (
                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center bg-accent py-2.5 rounded-xl active:opacity-80"
                  onPress={onManuallyAddPlayers}
                  accessibilityRole="button"
                  accessibilityLabel="Add more players"
                >
                  <AntDesign
                    name="plus"
                    size={14}
                    color={BadmintonPalette.bg.base}
                  />
                  <Text
                    className="text-sm font-bold ml-1.5"
                    style={{ color: BadmintonPalette.bg.base }}
                  >
                    Add {playersNeeded - playersAssigned} more
                  </Text>
                </TouchableOpacity>
              )}

              {onDissolve && (
                <TouchableOpacity
                  onPress={onDissolve}
                  className="flex-row items-center justify-center py-2.5 px-4 rounded-xl bg-warning/15 border border-warning/30 active:bg-warning/25"
                  accessibilityRole="button"
                  accessibilityLabel="Dissolve game"
                >
                  <MaterialCommunityIcons
                    name="account-off"
                    size={16}
                    color={BadmintonPalette.accent.warning}
                  />
                  <Text
                    className="text-sm font-bold ml-1.5"
                    style={{ color: BadmintonPalette.accent.warning }}
                  >
                    Dissolve
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Delete Court Button */}
          {onDelete && (
            <TouchableOpacity
              onPress={onDelete}
              className="flex-row items-center justify-center py-2.5 rounded-xl bg-danger/10 border border-danger/30 active:bg-danger/20"
              accessibilityRole="button"
              accessibilityLabel={`Delete court ${name}`}
            >
              <FontAwesome5
                name="trash-alt"
                size={14}
                color={BadmintonPalette.accent.danger}
              />
              <Text
                className="text-sm font-bold ml-1.5"
                style={{ color: BadmintonPalette.accent.danger }}
              >
                Delete Court
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default CourtCard;
