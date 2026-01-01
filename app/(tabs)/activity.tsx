import AddPInput from "@/components/AddInput";
import ConfirmationAlert from "@/components/ConfirmationAlert";
import CourtCard from "@/components/CourtCard";
import ManualAddPlayersModal from "@/components/ManualAddPlayersModal";
import PlayerCard from "@/components/PlayerCard";
import { PlayerGameCounts } from "@/components/PlayerGameCounts";
import PlayerTag from "@/components/PlayerTag";
import { PotatoPalette } from "@/constants/palette";
import {
  addPlayersToCourtManually,
  assignPlayersToCourt,
  clearCourtsError,
  removePlayerFromCourt,
} from "@/store/courtSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removePlayer } from "@/store/playersSlice";
import { setQueue } from "@/store/queueSlice";
import { endGameAndAdvanceQueue, rollDice } from "@/store/thunks";
import { type Player } from "@/types/players";
import { shuffle } from "@/utils/shuffle";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  LayoutAnimation,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type QueueCardVariant = "in_game" | "waiting";

const QueueCard = ({
  queueNumber,
  playersText,
  players,
  assignedCourtText,
  variant,
  onEndGame,
  onRemovePlayer,
  onDissolve,
  onManuallyAddPlayers,
  showManuallyAddPlayers,
}: {
  queueNumber: number;
  playersText: string;
  players?: { id: string; name: string }[];
  assignedCourtText: string;
  variant: QueueCardVariant;
  onEndGame?: () => void;
  onRemovePlayer?: (playerId: string) => void;
  onDissolve?: () => void;
  onManuallyAddPlayers?: () => void;
  showManuallyAddPlayers?: boolean;
}) => {
  const isInGame = variant === "in_game";
  const badgeLabel = isInGame ? "IN GAME" : "WAITING";
  const containerClass = isInGame
    ? "bg-dark-100 border border-accent"
    : "bg-secondary/60 border border-dark-100";
  const titleClass = isInGame ? "text-white" : "text-light-200";
  const playersClass = isInGame ? "text-white" : "text-light-200";
  const badgeClass = isInGame
    ? "bg-success/15 border-success/40 text-success"
    : "bg-secondary border-dark-100 text-light-200";

  return (
    <View className={`rounded-2xl p-4 gap-3 ${containerClass}`}>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text className={`${titleClass} text-xl font-extrabold`}>
            Queue {queueNumber}
          </Text>
          <Text className="text-light-200 text-xs font-bold">
            Assigned Court: {assignedCourtText}
          </Text>
        </View>

        <View className={`px-3 py-1 rounded-full border ${badgeClass}`}>
          <Text className="text-xs font-bold text-white">{badgeLabel}</Text>
        </View>
      </View>

      <View className="gap-1">
        <Text className="text-light-200 text-xs font-bold uppercase">
          Players
        </Text>
        {players ? (
          players.length === 0 ? (
            <Text className={`${playersClass} text-sm`}>No players</Text>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {players.map((p) => (
                <PlayerTag
                  key={p.id}
                  name={p.name}
                  onDeleteTag={
                    onRemovePlayer ? () => onRemovePlayer(p.id) : undefined
                  }
                />
              ))}
            </View>
          )
        ) : (
          <Text className={`${playersClass} text-sm`}>{playersText}</Text>
        )}
      </View>

      {/* {isInGame && onEndGame ? (
        <TouchableOpacity
          className="bg-success/90 px-4 py-2 rounded-full self-start"
          onPress={onEndGame}
          accessibilityRole="button"
          accessibilityLabel={`End game for queue ${queueNumber}`}
        >
          <Text className="text-primary text-sm font-bold">End Game</Text>
        </TouchableOpacity>
      ) : null} */}

      {!isInGame ? (
        <View className="flex-row flex-wrap items-center gap-2">
          {onDissolve ? (
            <TouchableOpacity
              className="bg-secondary border border-dark-100 px-4 py-2 rounded-full"
              onPress={onDissolve}
              accessibilityRole="button"
              accessibilityLabel={`Dissolve queue ${queueNumber}`}
            >
              <Text
                className="text-sm font-bold"
                style={{ color: PotatoPalette.accent.danger }}
              >
                Dissolve
              </Text>
            </TouchableOpacity>
          ) : null}

          {showManuallyAddPlayers && onManuallyAddPlayers ? (
            <TouchableOpacity
              className="bg-secondary border border-dark-100 px-4 py-2 rounded-full"
              onPress={onManuallyAddPlayers}
              accessibilityRole="button"
              accessibilityLabel={`Manually add players to queue ${queueNumber}`}
            >
              <Text className="text-light-200 text-sm font-bold">
                Manually Add Players
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const activity = () => {
  const dispatch = useAppDispatch();
  const players = useAppSelector((s) => s.players.items);
  const courts = useAppSelector((s) => s.courts.items);
  const queueIds = useAppSelector((s) => s.queue.ids);
  const [activeTab, setActiveTab] = useState<
    "queueing" | "status" | "players" | "in_games"
  >("queueing");
  const [playersSearchQuery, setPlayersSearchQuery] = useState<string>("");
  const [inGamesSearchQuery, setInGamesSearchQuery] = useState<string>("");
  const [manualAdd, setManualAdd] = useState<{
    visible: boolean;
    courtId: string | null;
  }>({ visible: false, courtId: null });
  const [manualAddQueue, setManualAddQueue] = useState<{
    visible: boolean;
    insertIndex: number;
    missingCount: number;
    queueNumber: number;
  }>({ visible: false, insertIndex: 0, missingCount: 0, queueNumber: 0 });

  useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const doublesCourtsCount = useMemo(
    () => courts.filter((c) => !c.isSingle).length,
    [courts]
  );

  const fullGroupsRemaining = Math.floor(queueIds.length / 4);
  const isQueueAlmostEmpty =
    doublesCourtsCount > 0 && fullGroupsRemaining < doublesCourtsCount;

  const warnedRef = useRef(false);
  useEffect(() => {
    if (!isQueueAlmostEmpty) {
      warnedRef.current = false;
      return;
    }
    if (warnedRef.current) return;
    warnedRef.current = true;
    Alert.alert(
      "Queue almost empty",
      "The queue is almost empty. Please re-roll the dice to add more players from the bench.",
      [
        { text: "Not now", style: "cancel" },
        { text: "Roll Dice", onPress: () => dispatch(rollDice()) },
      ]
    );
  }, [isQueueAlmostEmpty, dispatch]);

  const playerMap = useMemo(() => {
    const m = new Map(players.map((p) => [p.id, p]));
    return m;
  }, [players]);

  const queueGroups = useMemo(() => {
    const groups: { ids: string[]; index: number; start: number }[] = [];
    for (let i = 0; i < queueIds.length; i += 4) {
      const ids = queueIds.slice(i, i + 4);
      // Show partial last group as well (needed for manual add).
      if (ids.length > 0) groups.push({ ids, index: i / 4, start: i });
    }
    return groups;
  }, [queueIds]);

  const doublesCourts = useMemo(
    () => courts.filter((c) => !c.isSingle),
    [courts]
  );

  const animatePlayersUpdate = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
  };

  const removeFirstOccurrence = (ids: string[], idToRemove: string) => {
    const idx = ids.indexOf(idToRemove);
    if (idx < 0) return ids;
    return [...ids.slice(0, idx), ...ids.slice(idx + 1)];
  };

  const activeCourt = manualAdd.courtId
    ? courts.find((c) => c.id === manualAdd.courtId) ?? null
    : null;

  const playersOnAnyCourtIds = useMemo(() => {
    return new Set(courts.flatMap((c) => c.players.map((p) => p.id)));
  }, [courts]);

  const availablePlayers: Player[] = useMemo(() => {
    const queuedIds = new Set(queueIds);
    return players.filter(
      (p) => !playersOnAnyCourtIds.has(p.id) && !queuedIds.has(p.id)
    );
  }, [players, playersOnAnyCourtIds, queueIds]);

  const maxToSelect = useMemo(() => {
    if (!activeCourt) return 0;
    return Math.max(
      0,
      (activeCourt.isSingle ? 2 : 4) - activeCourt.players.length
    );
  }, [activeCourt]);

  const statusByPlayerId = useMemo(() => {
    const map: Record<
      string,
      { status: "in_game" | "waiting" | "bench"; courtName?: string }
    > = {};

    // Default: bench
    for (const p of players) map[p.id] = { status: "bench" };

    // Waiting: if in queue and not in game
    for (const id of queueIds) {
      if (map[id]) map[id] = { status: "waiting" };
    }

    // In game: override and attach court name
    for (const c of courts) {
      for (const p of c.players) {
        map[p.id] = { status: "in_game", courtName: c.name };
      }
    }

    return map;
  }, [courts, queueIds, players]);

  const playerCardMetaById = useMemo(() => {
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
    const q = playersSearchQuery.trim().toLowerCase();
    if (!q) return players;
    return players.filter((p) => p.name.trim().toLowerCase().includes(q));
  }, [players, playersSearchQuery]);

  const inGameCourts = useMemo(() => {
    // Match courts.tsx behavior: show courts list with the same card actions.
    // (This tab is still labeled "IN GAMES", but the list behaves like courts.tsx.)
    return courts;
  }, [courts]);

  const filteredInGameCourts = useMemo(() => {
    const q = inGamesSearchQuery.trim().toLowerCase();
    if (!q) return inGameCourts;
    return inGameCourts.filter((c) => {
      if (c.name.trim().toLowerCase().includes(q)) return true;
      return c.players.some((p) => p.name.trim().toLowerCase().includes(q));
    });
  }, [inGameCourts, inGamesSearchQuery]);

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-row items-center gap-2 p-4">
        <Feather name="activity" size={20} color={PotatoPalette.accent.gold} />
        <Text className="text-white text-2xl font-bold text-center">
          Activities
        </Text>
      </View>

      <View className="px-6 pt-4">
        <View className="flex-row bg-dark-200 border border-dark-100 rounded-full p-1">
          <TouchableOpacity
            className={`flex-1 px-3 py-2 rounded-full ${
              activeTab === "queueing" ? "bg-accent/90" : "bg-transparent"
            }`}
            onPress={() => setActiveTab("queueing")}
            accessibilityRole="button"
            accessibilityLabel="Show Queueing tab"
          >
            <Text
              className={`text-center text-sm font-bold ${
                activeTab === "queueing" ? "text-primary" : "text-light-200"
              }`}
            >
              QUEUEING
            </Text>
          </TouchableOpacity>

          {/* <TouchableOpacity
            className={`flex-1 px-3 py-2 rounded-full ${
              activeTab === "status" ? "bg-accent/90" : "bg-transparent"
            }`}
            onPress={() => setActiveTab("status")}
            accessibilityRole="button"
            accessibilityLabel="Show Player Game Counts tab"
          >
            <Text
              className={`text-center text-sm font-bold ${
                activeTab === "status" ? "text-primary" : "text-light-200"
              }`}
            >
              PLAYER GAME COUNTS
            </Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            className={`flex-1 px-3 py-2 rounded-full ${
              activeTab === "players" ? "bg-accent/90" : "bg-transparent"
            }`}
            onPress={() => setActiveTab("players")}
            accessibilityRole="button"
            accessibilityLabel="Show Players tab"
          >
            <Text
              className={`text-center text-sm font-bold ${
                activeTab === "players" ? "text-primary" : "text-light-200"
              }`}
            >
              PLAYERS
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 px-3 py-2 rounded-full ${
              activeTab === "in_games" ? "bg-accent/90" : "bg-transparent"
            }`}
            onPress={() => setActiveTab("in_games")}
            accessibilityRole="button"
            accessibilityLabel="Show In Games tab"
          >
            <Text
              className={`text-center text-sm font-bold ${
                activeTab === "in_games" ? "text-primary" : "text-light-200"
              }`}
            >
              IN GAMES
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === "players" ? (
        <View className="flex-1 px-6 pt-4">
          <View className="flex-row items-center justify-between mb-4">
            <AddPInput
              type="search"
              placeholder="Search player name"
              value={playersSearchQuery}
              onChangeText={(text) => setPlayersSearchQuery(text)}
            />
          </View>

          <FlatList
            data={filteredPlayers}
            renderItem={({ item }) => (
              <PlayerCard
                name={item.name}
                gameCount={item.gameCount}
                status={playerCardMetaById[item.id]?.status ?? "bench"}
                courtName={playerCardMetaById[item.id]?.courtName}
                onDelete={() => {
                  const meta = playerCardMetaById[item.id];
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

                  LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
                  dispatch(removePlayer(item.id));
                }}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              gap: 10,
              paddingTop: 16,
              paddingBottom: 140,
            }}
            ListEmptyComponent={
              <View className="bg-dark-200 border border-dark-100 rounded-2xl p-4">
                <Text className="text-light-200 text-sm">
                  No players match "{playersSearchQuery.trim()}".
                </Text>
              </View>
            }
            className="mb-20"
          />
        </View>
      ) : activeTab === "in_games" ? (
        <View className="flex-1 px-6 pt-4">
          <View className="flex-row items-center justify-between mb-4">
            <AddPInput
              type="search"
              placeholder="Search court or player"
              value={inGamesSearchQuery}
              onChangeText={(text) => setInGamesSearchQuery(text)}
            />
          </View>

          <FlatList
            data={filteredInGameCourts}
            className="mb-20"
            renderItem={({ item }) => (
              <CourtCard
                name={item.name}
                players={item.players}
                isSingle={item.isSingle}
                onDeleteTag={(playerId) => {
                  animatePlayersUpdate();
                  dispatch(
                    removePlayerFromCourt({ courtId: item.id, playerId })
                  );
                }}
                onEndGame={() => {
                  ConfirmationAlert({
                    title: "Confirm End Game",
                    message: `Are you sure you want to end the game on ${item.name}?`,
                    onConfirm: () => {
                      animatePlayersUpdate();
                      const result = dispatch(
                        endGameAndAdvanceQueue(item.id)
                      ) as any;
                      if (result?.warnedQueueEmpty) {
                        Alert.alert(
                          "Queue almost empty",
                          "The queue is almost empty. Please re-roll the dice to add more players from the bench."
                        );
                      }
                    },
                  });
                }}
                onAssignPlayers={() => {
                  animatePlayersUpdate();
                  dispatch(
                    assignPlayersToCourt({
                      courtId: item.id,
                      players: shuffle([...availablePlayers]),
                    })
                  );
                }}
                onManuallyAddPlayers={() => {
                  dispatch(clearCourtsError());
                  setManualAdd({ visible: true, courtId: item.id });
                }}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 10, paddingBottom: 140 }}
            ListEmptyComponent={
              <View className="bg-dark-200 border border-dark-100 rounded-2xl p-4">
                <Text className="text-light-200 text-sm">
                  No in-game courts match.
                </Text>
              </View>
            }
          />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24, gap: 20, paddingBottom: 140 }}
        >
          {activeTab === "status" ? (
            <PlayerGameCounts
              players={players}
              statusByPlayerId={statusByPlayerId}
            />
          ) : null}

          {activeTab === "queueing" ? (
            <>
              {isQueueAlmostEmpty ? (
                <View className="bg-dark-200 border border-accent rounded-xl p-4 gap-3">
                  <Text className="text-white font-bold">
                    Queue is almost empty — re-roll dice to add more players.
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                      className="flex-row items-center gap-2 bg-accent/90 px-3 py-2 rounded-full"
                      onPress={() => dispatch(rollDice())}
                      accessibilityRole="button"
                      accessibilityLabel="Roll dice"
                    >
                      <FontAwesome5
                        name="dice"
                        size={20}
                        className="text-primary"
                      />
                      <Text className="text-primary text-sm font-bold text-center">
                        Roll Dice
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="bg-secondary border border-dark-100 px-3 py-2 rounded-full"
                      onPress={() => {
                        const remainder = queueIds.length % 4;
                        const missingCount =
                          remainder === 0 ? 4 : 4 - remainder;
                        const groupIndex = Math.floor(queueIds.length / 4);
                        const queueNumber =
                          doublesCourts.length + groupIndex + 1;
                        setManualAddQueue({
                          visible: true,
                          insertIndex: queueIds.length,
                          missingCount,
                          queueNumber,
                        });
                      }}
                      accessibilityRole="button"
                      accessibilityLabel="Manually add players to queue"
                    >
                      <Text className="text-light-200 text-sm font-bold">
                        Manually Add Players
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}

              <View className="bg-dark-200 border border-dark-100 rounded-2xl p-4 gap-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-white text-lg font-bold">In Game</Text>
                  <Text className="text-light-200 text-sm">
                    {doublesCourts.length} courts assigned
                  </Text>
                </View>

                <View className="gap-3">
                  {/* Assigned (in-game) groups on doubles courts */}
                  {doublesCourts.map((court, idx) => {
                    const names = court.players.map((p) => p.name).join(", ");
                    return (
                      <QueueCard
                        key={court.id}
                        queueNumber={idx + 1}
                        playersText={
                          court.players.length === 0
                            ? "No players assigned"
                            : names
                        }
                        assignedCourtText={court.name}
                        variant="in_game"
                        onEndGame={
                          court.players.length > 0
                            ? () => {
                                const result = dispatch(
                                  endGameAndAdvanceQueue(court.id)
                                ) as any;
                                if (result?.warnedQueueEmpty) {
                                  Alert.alert(
                                    "Queue almost empty",
                                    "The queue is almost empty. Please re-roll the dice to add more players from the bench."
                                  );
                                }
                              }
                            : undefined
                        }
                      />
                    );
                  })}

                  {doublesCourts.length === 0 && queueGroups.length === 0 ? (
                    <Text className="text-light-200 text-sm">
                      No doubles courts and no queues yet.
                    </Text>
                  ) : null}
                </View>
              </View>

              {/* Waiting queue groups (FIFO) */}
              {queueGroups.length > 0 ? (
                <View className="gap-3 bg-dark-200 border border-dark-100 rounded-2xl p-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-white text-lg font-bold">Queue</Text>
                    <Text className="text-light-200 text-sm">
                      {queueGroups.length} groups waiting
                    </Text>
                  </View>
                  {queueGroups.map((g) => {
                    const groupPlayers = g.ids.map((id) => ({
                      id,
                      name: playerMap.get(id)?.name ?? "Unknown",
                    }));
                    const names = groupPlayers.map((p) => p.name).join(", ");
                    const isIncomplete = g.ids.length < 4;
                    return (
                      <QueueCard
                        key={`waiting-${g.index}`}
                        queueNumber={doublesCourts.length + g.index + 1}
                        playersText={names}
                        players={groupPlayers}
                        assignedCourtText="Waiting"
                        variant="waiting"
                        onRemovePlayer={(playerId) => {
                          animatePlayersUpdate();
                          dispatch(
                            setQueue(removeFirstOccurrence(queueIds, playerId))
                          );
                        }}
                        onDissolve={() => {
                          const queueNumber =
                            doublesCourts.length + g.index + 1;
                          Alert.alert(
                            "Dissolve queue",
                            `Dissolve Queue ${queueNumber}? All players in this queue will return to the bench.`,
                            [
                              { text: "Cancel", style: "cancel" },
                              {
                                text: "Dissolve",
                                style: "destructive",
                                onPress: () => {
                                  const groupSet = new Set(g.ids);
                                  animatePlayersUpdate();
                                  dispatch(
                                    setQueue(
                                      queueIds.filter((id) => !groupSet.has(id))
                                    )
                                  );
                                },
                              },
                            ]
                          );
                        }}
                        showManuallyAddPlayers={isIncomplete}
                        onManuallyAddPlayers={() => {
                          const queueNumber =
                            doublesCourts.length + g.index + 1;
                          const missingCount = Math.max(0, 4 - g.ids.length);
                          const insertIndex = g.start + g.ids.length;
                          setManualAddQueue({
                            visible: true,
                            insertIndex,
                            missingCount,
                            queueNumber,
                          });
                        }}
                      />
                    );
                  })}
                </View>
              ) : null}
            </>
          ) : null}
        </ScrollView>
      )}

      <ManualAddPlayersModal
        visible={manualAdd.visible}
        onClose={() => setManualAdd({ visible: false, courtId: null })}
        title={
          activeCourt
            ? `Manually add players to ${activeCourt.name}`
            : "Manually add players"
        }
        players={availablePlayers}
        maxSelect={maxToSelect}
        onConfirm={(selectedIds) => {
          if (!activeCourt) return;
          const selectedPlayers = availablePlayers.filter((p) =>
            selectedIds.includes(p.id)
          );
          animatePlayersUpdate();
          dispatch(
            addPlayersToCourtManually({
              courtId: activeCourt.id,
              players: selectedPlayers,
            })
          );
          setManualAdd({ visible: false, courtId: null });
        }}
      />

      <ManualAddPlayersModal
        visible={manualAddQueue.visible}
        onClose={() =>
          setManualAddQueue({
            visible: false,
            insertIndex: 0,
            missingCount: 0,
            queueNumber: 0,
          })
        }
        title={`Manually add players to Queue ${manualAddQueue.queueNumber}`}
        players={availablePlayers}
        maxSelect={manualAddQueue.missingCount}
        onConfirm={(selectedIds) => {
          if (selectedIds.length === 0) return;
          animatePlayersUpdate();
          const next = [...queueIds];
          next.splice(manualAddQueue.insertIndex, 0, ...selectedIds);
          dispatch(setQueue(next));
          setManualAddQueue({
            visible: false,
            insertIndex: 0,
            missingCount: 0,
            queueNumber: 0,
          });
        }}
      />

      {/* <TouchableOpacity
        className="absolute bottom-24 right-6 bg-dark-200 h-16 w-16 rounded-full overflow-hidden shadow-md items-center justify-center border border-accent"
        onPress={() => dispatch(rollDice())}
        accessibilityRole="button"
        accessibilityLabel="Roll dice"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        <FontAwesome5 name="dice" size={26} color={PotatoPalette.accent.gold} />
      </TouchableOpacity> */}
    </SafeAreaView>
  );
};

export default activity;
