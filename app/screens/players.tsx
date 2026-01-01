import AddPInput from "@/components/AddInput";
import ConfirmationAlert from "@/components/ConfirmationAlert";
import PlayerCard from "@/components/PlayerCard";
import { PotatoPalette } from "@/constants/palette";
import { RootState } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addPlayer,
  clearPlayers,
  clearPlayersError,
  removePlayer,
} from "@/store/playersSlice";
import { clearQueue, setQueue } from "@/store/queueSlice";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
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

export const PlayersContent = ({
  contentContainerClassName = "p-10",
}: {
  contentContainerClassName?: string;
}) => {
  const [newPlayerName, setNewPlayerName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const dispatch = useAppDispatch();
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

  return (
    <View className={`flex-1 bg-primary gap-5 ${contentContainerClassName}`}>
      <Text className="text-white text-2xl font-bold text-center">
        Add Player
      </Text>

      <View className="flex-row items-center gap-3">
        <View className="flex-1">
          <AddPInput
            type="player"
            placeholder="Player Name"
            value={newPlayerName}
            onChangeText={(text) => {
              setNewPlayerName(text);
              dispatch(clearPlayersError());
            }}
          />
        </View>

        <TouchableOpacity
          className="size-14 rounded-full bg-primary items-center justify-center border border-accent"
          onPress={() => {
            const trimmed = newPlayerName.trim();
            if (!trimmed) return;
            dispatch(addPlayer({ id: uuidv4(), name: trimmed }));
            setNewPlayerName("");
          }}
          accessibilityRole="button"
          accessibilityLabel="Add player"
        >
          <FontAwesome5
            name="plus"
            size={24}
            color={PotatoPalette.accent.sprout}
          />
        </TouchableOpacity>
      </View>

      {players.length > 0 && (
        <>
          <View className="flex-row items-center my-6">
            <View className="flex-1 border-t border-accent" />
            <TouchableOpacity
              className="flex-row items-center gap-2 bg-primary px-4 py-1 rounded-full border border-accent"
              onPress={() => {
                const courtsWithPlayers = courts.filter(
                  (c) => c.players.length > 0
                );
                if (courtsWithPlayers.length > 0) {
                  const names = courtsWithPlayers.map((c) => c.name).join(", ");
                  Alert.alert(
                    "Cannot clear players",
                    `Some players are currently in the game (${names}). Please end the game first.`
                  );
                  return;
                }

                const message =
                  "Are you sure you want to clear the players list?";
                ConfirmationAlert({
                  title: "Confirm Clearing Players List",
                  message: message,
                  onConfirm: () => {
                    LayoutAnimation.configureNext(
                      LayoutAnimation.Presets.spring
                    );
                    // Keep state consistent: clearing players must also clear the queue.
                    dispatch(clearQueue());
                    dispatch(clearPlayers());
                  },
                });
              }}
              accessibilityRole="button"
              accessibilityLabel="Clear players list"
            >
              <MaterialCommunityIcons
                name="broom"
                size={24}
                color={PotatoPalette.accent.gold}
              />
              <Text className="text-white text-sm font-bold text-center">
                Clear
              </Text>
            </TouchableOpacity>
          </View>

          <AddPInput
            type="search"
            placeholder="Search player name"
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />

          <FlatList
            data={filteredPlayers}
            renderItem={({ item }) => (
              <PlayerCard
                name={item.name}
                gameCount={item.gameCount}
                status={statusMetaById[item.id]?.status ?? "bench"}
                courtName={statusMetaById[item.id]?.courtName}
                onDelete={() => {
                  const meta = statusMetaById[item.id];
                  const status = meta?.status ?? "bench";

                  // Validation: don't allow deleting players who are currently in a game.
                  if (status === "in_game") {
                    Alert.alert(
                      "Cannot delete player",
                      `${item.name} is currently in a game${
                        meta?.courtName ? ` on ${meta.courtName}` : ""
                      }. Please end the game first.`
                    );
                    return;
                  }

                  const message = `Are you sure you want to delete this player: ${item.name}?`;
                  ConfirmationAlert({
                    title: "Confirm Deletion",
                    message,
                    onConfirm: () => {
                      // If the player is in the queue, dissolve their entire queue group (groups are sets of 4).
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
            contentContainerStyle={{ gap: 10 }}
            ListEmptyComponent={
              <View className="bg-dark-200 border border-dark-100 rounded-2xl p-4">
                <Text className="text-light-200 text-sm">
                  No players match "{searchQuery.trim()}".
                </Text>
              </View>
            }
            className="mb-20"
          />
        </>
      )}
    </View>
  );
};

const players = () => {
  return (
    <SafeAreaView className="flex-1 bg-primary">
      <PlayersContent contentContainerClassName="p-10" />
    </SafeAreaView>
  );
};

export default players;
