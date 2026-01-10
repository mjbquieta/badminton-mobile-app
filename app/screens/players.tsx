import AddPInput from "@/components/AddInput";
import ConfirmationAlert from "@/components/ConfirmationAlert";
import PlayerCard from "@/components/PlayerCard";
import { useToast } from "@/components/Toast";
import { BadmintonPalette } from "@/constants/palette";
import { RootState } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addPlayer,
  clearPlayers,
  clearPlayersError,
  removePlayer,
} from "@/store/playersSlice";
import { clearQueue, setQueue } from "@/store/queueSlice";
import { PlayerLevel } from "@/types/players";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  LayoutAnimation,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import "react-native-get-random-values";
import { SafeAreaView } from "react-native-safe-area-context";
import { v4 as uuidv4 } from "uuid";

// Compact inline level selector
const levelOptions: { value: PlayerLevel; label: string; color: string }[] = [
  {
    value: PlayerLevel.BEGINNER,
    label: "B",
    color: BadmintonPalette.levels.beginner,
  },
  {
    value: PlayerLevel.INTERMEDIATE,
    label: "I",
    color: BadmintonPalette.levels.intermediate,
  },
  {
    value: PlayerLevel.ADVANCED,
    label: "A",
    color: BadmintonPalette.levels.advanced,
  },
  { value: PlayerLevel.PRO, label: "P", color: BadmintonPalette.levels.pro },
];

const levelLabels: Record<PlayerLevel, string> = {
  [PlayerLevel.BEGINNER]: "Beginner",
  [PlayerLevel.INTERMEDIATE]: "Intermediate",
  [PlayerLevel.ADVANCED]: "Advanced",
  [PlayerLevel.PRO]: "Pro",
};

export const PlayersContent = ({
  contentContainerClassName = "p-6",
}: {
  contentContainerClassName?: string;
}) => {
  const [newPlayerName, setNewPlayerName] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<PlayerLevel>(
    PlayerLevel.BEGINNER
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const players = useAppSelector((s: RootState) => s.players.items);
  const courts = useAppSelector((s: RootState) => s.courts.items);
  const queueIds = useAppSelector((s: RootState) => s.queue.ids);
  const sliceError = useAppSelector((s: RootState) => s.players.error);

  useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const statusMetaById = useMemo(() => {
    const map: Record<
      string,
      { status: "in_game" | "in_queue" | "bench"; courtName?: string }
    > = {};

    for (const p of players) map[p.id] = { status: "bench" };

    for (const id of queueIds) {
      if (map[id]) map[id] = { status: "in_queue" };
    }

    for (const c of courts) {
      for (const p of c.players) {
        map[p.id] = { status: "in_game", courtName: c.name };
      }
    }

    return map;
  }, [players, queueIds, courts]);

  const filteredPlayers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return players;
    return players.filter((p) => p.name.trim().toLowerCase().includes(q));
  }, [players, searchQuery]);

  useEffect(() => {
    if (!sliceError) return;
    Alert.alert("Error", sliceError, [
      { text: "OK", onPress: () => dispatch(clearPlayersError()) },
    ]);
  }, [sliceError, dispatch]);

  const handleAddPlayer = () => {
    const trimmed = newPlayerName.trim();
    if (!trimmed) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    dispatch(addPlayer({ id: uuidv4(), name: trimmed, level: selectedLevel }));
    setNewPlayerName("");
    showToast({
      message: `${trimmed} added as ${levelLabels[selectedLevel]}`,
      type: "success",
    });
  };

  const canAdd = newPlayerName.trim().length > 0;
  const selectedLevelColor =
    levelOptions.find((l) => l.value === selectedLevel)?.color ||
    BadmintonPalette.court.lime;

  return (
    <View className={`flex-1 bg-primary ${contentContainerClassName}`}>
      {/* Simplified Add Player Form */}
      <View className="bg-secondary border border-dark-100 rounded-2xl overflow-hidden mb-6">
        {/* Input Row */}
        <View className="p-4">
          <AddPInput
            type="player"
            placeholder="Enter player name..."
            value={newPlayerName}
            onChangeText={(text) => {
              setNewPlayerName(text);
              dispatch(clearPlayersError());
            }}
          />
        </View>

        {/* Level & Add Row */}
        <View className="flex-row items-center px-4 pb-4">
          {/* Level Pills */}
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text
                className="text-xs font-medium mr-3"
                style={{ color: BadmintonPalette.text.muted }}
              >
                Level:
              </Text>
              <View className="flex-row" style={{ gap: 8 }}>
                {levelOptions.map((option) => {
                  const isSelected = selectedLevel === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => setSelectedLevel(option.value)}
                      className="items-center justify-center rounded-lg"
                      style={{
                        width: 36,
                        height: 36,
                        backgroundColor: isSelected
                          ? option.color
                          : `${option.color}15`,
                        borderWidth: isSelected ? 0 : 1,
                        borderColor: `${option.color}40`,
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${
                        levelLabels[option.value]
                      } level`}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <Text
                        className="text-sm font-bold"
                        style={{
                          color: isSelected
                            ? BadmintonPalette.bg.base
                            : option.color,
                        }}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <Text
              className="text-xs font-medium mt-1.5 ml-10"
              style={{ color: selectedLevelColor }}
            >
              {levelLabels[selectedLevel]}
            </Text>
          </View>

          {/* Add Button */}
          <TouchableOpacity
            onPress={handleAddPlayer}
            disabled={!canAdd}
            className="flex-row items-center px-4 py-2 rounded-xl"
            style={{
              backgroundColor: canAdd
                ? BadmintonPalette.accent.primary
                : BadmintonPalette.bg.elevated,
            }}
            accessibilityRole="button"
            accessibilityLabel="Add player"
          >
            <AntDesign
              name="plus"
              size={16}
              color={
                canAdd ? BadmintonPalette.bg.base : BadmintonPalette.text.muted
              }
            />
            <Text
              className="text-sm font-bold ml-1"
              style={{
                color: canAdd
                  ? BadmintonPalette.bg.base
                  : BadmintonPalette.text.muted,
              }}
            >
              Add
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Players List */}
      {players.length > 0 && (
        <>
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Text
                className="text-lg font-bold mr-2"
                style={{ color: BadmintonPalette.text.primary }}
              >
                Players
              </Text>
              <View
                className="px-2 py-0.5 rounded-md"
                style={{ backgroundColor: `${BadmintonPalette.court.lime}20` }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{ color: BadmintonPalette.court.lime }}
                >
                  {players.length}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              className="flex-row items-center px-3 py-2 rounded-xl bg-danger/10 border border-danger/30 active:bg-danger/20"
              onPress={() => {
                const courtsWithPlayers = courts.filter(
                  (c) => c.players.length > 0
                );
                if (courtsWithPlayers.length > 0) {
                  const names = courtsWithPlayers.map((c) => c.name).join(", ");
                  Alert.alert(
                    "Cannot clear players",
                    `Some players are in games (${names}). End the games first.`
                  );
                  return;
                }

                ConfirmationAlert({
                  title: "Clear All Players",
                  message: "Remove all players from the list?",
                  onConfirm: () => {
                    LayoutAnimation.configureNext(
                      LayoutAnimation.Presets.spring
                    );
                    dispatch(clearQueue());
                    dispatch(clearPlayers());
                  },
                });
              }}
              accessibilityRole="button"
              accessibilityLabel="Clear all players"
            >
              <MaterialCommunityIcons
                name="delete-sweep"
                size={16}
                color={BadmintonPalette.accent.danger}
              />
              <Text
                className="text-xs font-bold ml-1"
                style={{ color: BadmintonPalette.accent.danger }}
              >
                Clear
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mb-4">
            <AddPInput
              type="search"
              placeholder="Search players..."
              value={searchQuery}
              onChangeText={(text) => setSearchQuery(text)}
            />
          </View>

          <FlatList
            data={filteredPlayers}
            renderItem={({ item }) => (
              <PlayerCard
                name={item.name}
                gameCount={item.gameCount}
                level={item.level}
                status={statusMetaById[item.id]?.status ?? "bench"}
                courtName={statusMetaById[item.id]?.courtName}
                onDelete={() => {
                  const meta = statusMetaById[item.id];
                  const status = meta?.status ?? "bench";

                  if (status === "in_game") {
                    Alert.alert(
                      "Cannot delete",
                      `${item.name} is in a game${
                        meta?.courtName ? ` on ${meta.courtName}` : ""
                      }. End the game first.`
                    );
                    return;
                  }

                  ConfirmationAlert({
                    title: "Delete Player",
                    message: `Remove ${item.name}?`,
                    onConfirm: () => {
                      if (status === "in_queue") {
                        const idx = queueIds.indexOf(item.id);
                        if (idx >= 0) {
                          const groupStart = Math.floor(idx / 4) * 4;
                          const groupIds = queueIds.slice(
                            groupStart,
                            groupStart + 4
                          );
                          const groupSet = new Set(groupIds);
                          dispatch(
                            setQueue(queueIds.filter((id) => !groupSet.has(id)))
                          );
                        }
                      }

                      LayoutAnimation.configureNext(
                        LayoutAnimation.Presets.spring
                      );
                      dispatch(removePlayer(item.id));
                    },
                  });
                }}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 10, paddingBottom: 40 }}
            ListEmptyComponent={
              <View className="bg-secondary border border-dark-100 rounded-2xl p-6 items-center">
                <Text
                  className="text-sm text-center"
                  style={{ color: BadmintonPalette.text.muted }}
                >
                  No players match "{searchQuery.trim()}"
                </Text>
              </View>
            }
            className="mb-20"
          />
        </>
      )}

      {players.length === 0 && (
        <View className="flex-1 items-center justify-center pb-20">
          <View className="size-16 rounded-2xl bg-secondary border border-dark-100 items-center justify-center mb-4">
            <AntDesign
              name="team"
              size={32}
              color={BadmintonPalette.text.muted}
            />
          </View>
          <Text
            className="text-lg font-bold mb-1"
            style={{ color: BadmintonPalette.text.primary }}
          >
            No Players Yet
          </Text>
          <Text
            className="text-sm text-center"
            style={{ color: BadmintonPalette.text.muted }}
          >
            Enter a name above to add your first player
          </Text>
        </View>
      )}
    </View>
  );
};

const players = () => {
  return (
    <SafeAreaView className="flex-1 bg-primary">
      <PlayersContent contentContainerClassName="p-6" />
    </SafeAreaView>
  );
};

export default players;
