import AddPInput from "@/components/AddInput";
import AddPlayerModal from "@/components/AddPlayerModal";
import ConfirmationAlert from "@/components/ConfirmationAlert";
import EditPlayerModal from "@/components/EditPlayerModal";
import PlayerCard from "@/components/PlayerCard";
import { useToast } from "@/components/Toast";
import { BadmintonPalette } from "@/constants/palette";
import { RootState } from "@/store";
import { useAppDispatch, useAppSelector } from "@badminton/store";
import {
  addPlayer,
  clearPlayers,
  clearPlayersError,
  removePlayer,
  updatePlayerGameCount,
  updatePlayerLevel,
} from "@badminton/store";
import { clearQueue, setQueue } from "@badminton/store";
import { Player, PlayerLevel } from "@badminton/types";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  LayoutAnimation,
  Platform,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import "react-native-get-random-values";
import { SafeAreaView } from "react-native-safe-area-context";
import { v4 as uuidv4 } from "uuid";

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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

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

  const handleAddPlayer = (name: string, level: PlayerLevel) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    dispatch(addPlayer({ id: uuidv4(), name, level }));
    showToast({
      message: `${name} added as ${levelLabels[level]}`,
      type: "success",
    });
  };

  const handleUpdatePlayer = (
    playerId: string,
    newLevel: PlayerLevel,
    newGameCount: number
  ) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    if (player.level !== newLevel) {
      dispatch(updatePlayerLevel({ id: playerId, level: newLevel }));
    }
    if (player.gameCount !== newGameCount) {
      dispatch(updatePlayerGameCount({ id: playerId, gameCount: newGameCount }));
    }
    showToast({
      message: `${player.name} updated`,
      type: "success",
    });
  };

  return (
    <View className={`flex-1 bg-primary ${contentContainerClassName}`}>
      {/* Add Player Button */}
      <TouchableOpacity
        onPress={() => setShowAddModal(true)}
        className="flex-row items-center justify-center py-3.5 rounded-2xl mb-6"
        style={{ backgroundColor: BadmintonPalette.accent.primary }}
        accessibilityRole="button"
        accessibilityLabel="Add player"
      >
        <AntDesign name="plus" size={18} color={BadmintonPalette.bg.base} />
        <Text
          className="text-base font-bold ml-2"
          style={{ color: BadmintonPalette.bg.base }}
        >
          Add Player
        </Text>
      </TouchableOpacity>

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
                onEdit={() => setEditingPlayer(item)}
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
            Tap "Add Player" to add your first player
          </Text>
        </View>
      )}

      <AddPlayerModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddPlayer}
      />

      <EditPlayerModal
        visible={editingPlayer !== null}
        onClose={() => setEditingPlayer(null)}
        onSave={(level, gameCount) => {
          if (editingPlayer) {
            handleUpdatePlayer(editingPlayer.id, level, gameCount);
          }
        }}
        playerName={editingPlayer?.name ?? ""}
        currentLevel={editingPlayer?.level ?? PlayerLevel.BEGINNER}
        currentGameCount={editingPlayer?.gameCount ?? 0}
      />
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
