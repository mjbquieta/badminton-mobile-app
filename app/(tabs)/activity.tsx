import ConfirmationAlert from "@/components/ConfirmationAlert";
import CourtCard from "@/components/CourtCard";
import ManualAddPlayersModal from "@/components/ManualAddPlayersModal";
import PlayerTag from "@/components/PlayerTag";
import SelectQueueGroupModal, {
  type QueueGroup,
} from "@/components/SelectQueueGroupModal";
import { useToast } from "@/components/Toast";
import { BadmintonPalette } from "@/constants/palette";
import {
  addPlayersToCourtManually,
  assignPlayersToCourt,
  clearCourtsError,
  removePlayerFromCourt,
} from "@/store/courtSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setQueue } from "@/store/queueSlice";
import {
  backToQueue,
  dissolveCourt,
  endGameAndAdvanceQueue,
  rollDice,
} from "@/store/thunks";
import { type Player, type PlayerLevel } from "@/types/players";
import { shuffle } from "@/utils/shuffle";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
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
  players?: {
    id: string;
    name: string;
    level?: PlayerLevel;
    gameCount?: number;
  }[];
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

  return (
    <View
      className={`rounded-2xl overflow-hidden ${
        isInGame
          ? "bg-secondary border border-danger/30"
          : "bg-dark-200 border-4 border-dashed border-dark-100"
      }`}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-dark-100">
        <View className="flex-1 gap-0.5">
          <Text className="text-light-100 text-lg font-bold">
            Queue {queueNumber}
          </Text>
          <Text className="text-light-300 text-xs">
            Court: {assignedCourtText}
          </Text>
        </View>

        <View
          className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full ${
            isInGame ? "bg-danger/15" : "bg-success/15"
          }`}
        >
          <View
            className={`size-2 rounded-full ${
              isInGame ? "bg-danger" : "bg-success"
            }`}
          />
          <Text
            className={`text-xs font-bold ${
              isInGame ? "text-danger" : "text-success"
            }`}
          >
            {badgeLabel}
          </Text>
        </View>
      </View>

      {/* Players */}
      <View className="p-4 gap-3">
        <Text className="text-light-300 text-xs font-semibold uppercase tracking-wide">
          Players
        </Text>
        {players ? (
          players.length === 0 ? (
            <Text className="text-light-300 text-sm">No players assigned</Text>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {players.map((p) => (
                <PlayerTag
                  key={p.id}
                  name={p.name}
                  level={p.level}
                  gameCount={p.gameCount}
                  onDeleteTag={
                    onRemovePlayer && !isInGame
                      ? () => onRemovePlayer(p.id)
                      : undefined
                  }
                />
              ))}
            </View>
          )
        ) : (
          <Text className="text-light-200 text-sm">{playersText}</Text>
        )}
      </View>

      {/* Actions for waiting queues */}
      {!isInGame ? (
        <View className="flex-row items-center gap-2 px-4 pb-4">
          {onDissolve ? (
            <TouchableOpacity
              className="bg-danger/10 border border-danger/30 px-4 py-2.5 rounded-xl active:bg-danger/20"
              onPress={onDissolve}
              accessibilityRole="button"
              accessibilityLabel={`Dissolve queue ${queueNumber}`}
            >
              <Text className="text-danger text-sm font-bold">Dissolve</Text>
            </TouchableOpacity>
          ) : null}

          {showManuallyAddPlayers && onManuallyAddPlayers ? (
            <TouchableOpacity
              className="flex-1 bg-dark-100 border border-dark-100 px-4 py-2.5 rounded-xl items-center active:bg-dark-200"
              onPress={onManuallyAddPlayers}
              accessibilityRole="button"
              accessibilityLabel={`Manually add players to queue ${queueNumber}`}
            >
              <Text className="text-light-200 text-sm font-bold">
                Add Players
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
  const { showToast } = useToast();
  const players = useAppSelector((s) => s.players.items);
  const courts = useAppSelector((s) => s.courts.items);
  const queueIds = useAppSelector((s) => s.queue.ids);
  const [manualAdd, setManualAdd] = useState<{
    visible: boolean;
    courtId: string | null;
  }>({ visible: false, courtId: null });
  const [assignFromQueue, setAssignFromQueue] = useState<{
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
    [courts],
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
        { text: "Auto Queue", onPress: () => handleRollDice() },
      ],
    );
  }, [isQueueAlmostEmpty, dispatch]);

  const handleRollDice = () => {
    const res = dispatch(rollDice()) as any;
    if (res?.needsConfirmation) {
      Alert.alert("Confirm mismatched levels", res.message, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Proceed",
          style: "destructive",
          onPress: () => {
            dispatch(rollDice({ allowIncompatible: true }));
            showToast({
              type: "success",
              message: "Players auto-assigned to queue",
            });
          },
        },
      ]);
    } else if (res?.playersAdded && res.playersAdded > 0) {
      showToast({
        type: "success",
        message: `${res.playersAdded} player${
          res.playersAdded > 1 ? "s" : ""
        } added to queue`,
      });
    } else if (!res?.needsConfirmation) {
      showToast({
        type: "info",
        message: "No available players to assign",
      });
    }
  };

  const playerMap = useMemo(() => {
    const m = new Map(players.map((p) => [p.id, p]));
    return m;
  }, [players]);

  const queueGroups = useMemo(() => {
    const groups: { ids: string[]; index: number; start: number }[] = [];
    for (let i = 0; i < queueIds.length; i += 4) {
      const ids = queueIds.slice(i, i + 4);
      if (ids.length > 0) groups.push({ ids, index: i / 4, start: i });
    }
    return groups;
  }, [queueIds]);

  const doublesCourts = useMemo(
    () => courts.filter((c) => !c.isSingle),
    [courts],
  );

  const fullQueueGroups: QueueGroup[] = useMemo(() => {
    return queueGroups
      .filter((g) => g.ids.length === 4)
      .map((g) => ({
        index: g.index,
        ids: g.ids,
        players: g.ids.map((id) => {
          const p = playerMap.get(id);
          return {
            id,
            name: p?.name ?? "Unknown",
            level: p?.level,
            gameCount: p?.gameCount,
          };
        }),
      }));
  }, [queueGroups, playerMap]);

  const animatePlayersUpdate = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
  };

  const removeFirstOccurrence = (ids: string[], idToRemove: string) => {
    const idx = ids.indexOf(idToRemove);
    if (idx < 0) return ids;
    return [...ids.slice(0, idx), ...ids.slice(idx + 1)];
  };

  const playersOnAnyCourtIds = useMemo(() => {
    return new Set(courts.flatMap((c) => c.players.map((p) => p.id)));
  }, [courts]);

  const availablePlayers: Player[] = useMemo(() => {
    const queuedIds = new Set(queueIds);
    return players.filter(
      (p) => !playersOnAnyCourtIds.has(p.id) && !queuedIds.has(p.id),
    );
  }, [players, playersOnAnyCourtIds, queueIds]);

  const activeCourt = manualAdd.courtId
    ? (courts.find((c) => c.id === manualAdd.courtId) ?? null)
    : null;

  const maxToSelect = useMemo(() => {
    if (!activeCourt) return 0;
    return Math.max(
      0,
      (activeCourt.isSingle ? 2 : 4) - activeCourt.players.length,
    );
  }, [activeCourt]);

  return (
    <SafeAreaView className="flex-1 bg-primary">
      {/* Header */}
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row items-center gap-3">
          <View className="size-12 rounded-2xl bg-court-deep/30 items-center justify-center">
            <Feather
              name="activity"
              size={24}
              color={BadmintonPalette.court.lime}
            />
          </View>
          <View>
            <Text className="text-light-100 text-2xl font-bold">Activity</Text>
            <Text className="text-light-300 text-sm">
              Manage matches and queues
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, gap: 16, paddingBottom: 140 }}
      >
        {/* Quick Actions */}
        <View className="bg-secondary border border-dark-100 rounded-2xl overflow-hidden">
          {/* Stats Row */}
          <View className="flex-row border-b border-dark-100">
            <View className="flex-1 p-3 items-center border-r border-dark-100">
              <Text
                className="text-2xl font-bold"
                style={{ color: BadmintonPalette.court.lime }}
              >
                {availablePlayers.length}
              </Text>
              <Text
                className="text-xs"
                style={{ color: BadmintonPalette.text.muted }}
              >
                On Bench
              </Text>
            </View>
            <View className="flex-1 p-3 items-center border-r border-dark-100">
              <Text
                className="text-2xl font-bold"
                style={{ color: BadmintonPalette.status.waiting }}
              >
                {queueGroups.length}
              </Text>
              <Text
                className="text-xs"
                style={{ color: BadmintonPalette.text.muted }}
              >
                In Queue
              </Text>
            </View>
            <View className="flex-1 p-3 items-center">
              <Text
                className="text-2xl font-bold"
                style={{ color: BadmintonPalette.court.lime }}
              >
                {doublesCourts.filter((c) => c.players.length === 0).length}
              </Text>
              <Text
                className="text-xs"
                style={{ color: BadmintonPalette.text.muted }}
              >
                Available Courts
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View className="p-4">
            {/* Low queue warning */}
            {isQueueAlmostEmpty && (
              <View
                className="flex-row items-center p-3 rounded-xl mb-3"
                style={{
                  backgroundColor: `${BadmintonPalette.accent.primary}15`,
                }}
              >
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={18}
                  color={BadmintonPalette.accent.primary}
                />
                <Text
                  className="text-xs font-medium ml-2 flex-1"
                  style={{ color: BadmintonPalette.accent.primary }}
                >
                  Queue is running low. Auto queue to add more players!
                </Text>
              </View>
            )}

            {/* Auto Queue - Primary Action */}
            <TouchableOpacity
              onPress={handleRollDice}
              className="flex-row items-center p-4 rounded-xl mb-3"
              style={{ backgroundColor: BadmintonPalette.accent.primary }}
              accessibilityRole="button"
              accessibilityLabel="Auto queue bench players"
            >
              <View
                className="size-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
              >
                <MaterialCommunityIcons
                  name="shuffle-variant"
                  size={22}
                  color={BadmintonPalette.bg.base}
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-bold"
                  style={{ color: BadmintonPalette.bg.base }}
                >
                  Auto Queue
                </Text>
                <Text className="text-xs" style={{ color: "rgba(0,0,0,0.6)" }}>
                  Randomly add bench players to queue
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={BadmintonPalette.bg.base}
              />
            </TouchableOpacity>

            {/* Manual Queue - Secondary Action */}
            <TouchableOpacity
              onPress={() => {
                const remainder = queueIds.length % 4;
                const missingCount = remainder === 0 ? 4 : 4 - remainder;
                const groupIndex = Math.floor(queueIds.length / 4);
                const queueNumber = doublesCourts.length + groupIndex + 1;
                setManualAddQueue({
                  visible: true,
                  insertIndex: queueIds.length,
                  missingCount,
                  queueNumber,
                });
              }}
              className="flex-row items-center p-4 rounded-xl border border-dark-100"
              style={{ backgroundColor: BadmintonPalette.bg.elevated }}
              accessibilityRole="button"
              accessibilityLabel="Manually queue specific players"
            >
              <View
                className="size-10 rounded-xl items-center justify-center mr-3"
                style={{
                  backgroundColor: `${BadmintonPalette.court.lime}20`,
                }}
              >
                <MaterialCommunityIcons
                  name="account-plus"
                  size={20}
                  color={BadmintonPalette.court.lime}
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-bold"
                  style={{ color: BadmintonPalette.text.primary }}
                >
                  Manual Queue
                </Text>
                <Text
                  className="text-xs"
                  style={{ color: BadmintonPalette.text.muted }}
                >
                  Choose specific players to add
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={BadmintonPalette.text.muted}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* In Game Section */}
        <View style={{ gap: 12 }}>
          <View className="flex-row items-center gap-2">
            <View className="size-2 rounded-full bg-danger" />
            <Text className="text-light-100 text-lg font-bold">In Game</Text>
            <Text className="text-light-300 text-sm ml-auto">
              {doublesCourts.length} courts
            </Text>
          </View>

          {doublesCourts.length === 0 ? (
            <View className="bg-secondary border border-dark-100 rounded-2xl p-8 items-center">
              <MaterialCommunityIcons
                name="badminton"
                size={40}
                color={BadmintonPalette.text.muted}
              />
              <Text className="text-light-300 text-sm mt-3 text-center">
                No doubles courts configured
              </Text>
            </View>
          ) : (
            doublesCourts.map((court) => (
              <CourtCard
                key={court.id}
                name={court.name}
                players={court.players}
                isSingle={court.isSingle}
                onDeleteTag={(playerId) => {
                  animatePlayersUpdate();
                  dispatch(
                    removePlayerFromCourt({ courtId: court.id, playerId }),
                  );
                }}
                onEndGame={() => {
                  ConfirmationAlert({
                    title: "End Game",
                    message: `Mark the game on ${court.name} as finished and count the players' games?`,
                    onConfirm: () => {
                      animatePlayersUpdate();
                      const result = dispatch(
                        endGameAndAdvanceQueue(court.id),
                      ) as any;
                      showToast({
                        type: "success",
                        message: `Game ended on ${court.name}`,
                      });
                      if (result?.warnedQueueEmpty) {
                        Alert.alert(
                          "Queue almost empty",
                          "Use Auto Queue to add more players from the bench.",
                        );
                      }
                    },
                  });
                }}
                onDissolve={() => {
                  ConfirmationAlert({
                    title: "Dissolve Game",
                    message: `Send players on ${court.name} back to the bench? Games will NOT be counted.`,
                    onConfirm: () => {
                      animatePlayersUpdate();
                      dispatch(dissolveCourt(court.id));
                      showToast({
                        type: "info",
                        message: `${court.name} dissolved`,
                      });
                    },
                  });
                }}
                onBackToQueue={() => {
                  ConfirmationAlert({
                    title: "Back to Queue",
                    message: `Send players on ${court.name} back to the queue? Games will NOT be counted.`,
                    onConfirm: () => {
                      animatePlayersUpdate();
                      dispatch(backToQueue(court.id));
                      showToast({
                        type: "info",
                        message: `${court.name} players sent back to queue`,
                      });
                    },
                  });
                }}
                onAssignPlayers={() => {
                  animatePlayersUpdate();
                  dispatch(
                    assignPlayersToCourt({
                      courtId: court.id,
                      players: shuffle([...availablePlayers]),
                    }),
                  );
                }}
                onManuallyAddPlayers={() => {
                  dispatch(clearCourtsError());
                  setManualAdd({ visible: true, courtId: court.id });
                }}
                onAssignFromQueue={
                  fullQueueGroups.length > 0
                    ? () =>
                        setAssignFromQueue({ visible: true, courtId: court.id })
                    : undefined
                }
              />
            ))
          )}
        </View>

        {/* Waiting Queue Section */}
        {queueGroups.length > 0 ? (
          <View className="bg-secondary border border-dark-100 rounded-2xl overflow-hidden">
            <View className="flex-row items-center justify-between p-4 border-b border-dark-100">
              <View className="flex-row items-center gap-2">
                <View className="size-2 rounded-full bg-success" />
                <Text className="text-light-100 text-lg font-bold">
                  Waiting Queue
                </Text>
              </View>
              <Text className="text-light-300 text-sm">
                {queueGroups.length} groups
              </Text>
            </View>

            <View className="p-4 gap-3">
              {queueGroups.map((g) => {
                const groupPlayers = g.ids.map((id) => {
                  const player = playerMap.get(id);
                  return {
                    id,
                    name: player?.name ?? "Unknown",
                    level: player?.level,
                    gameCount: player?.gameCount,
                  };
                });
                const isIncomplete = g.ids.length < 4;
                return (
                  <QueueCard
                    key={`waiting-${g.index}`}
                    queueNumber={g.index + 1}
                    playersText={groupPlayers.map((p) => p.name).join(", ")}
                    players={groupPlayers}
                    assignedCourtText="Waiting"
                    variant="waiting"
                    onRemovePlayer={(playerId) => {
                      animatePlayersUpdate();
                      dispatch(
                        setQueue(removeFirstOccurrence(queueIds, playerId)),
                      );
                    }}
                    onDissolve={() => {
                      const queueNumber = g.index + 1;
                      Alert.alert(
                        "Dissolve Queue",
                        `Return Queue ${queueNumber} players to bench?`,
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
                                  queueIds.filter((id) => !groupSet.has(id)),
                                ),
                              );
                            },
                          },
                        ],
                      );
                    }}
                    showManuallyAddPlayers={isIncomplete}
                    onManuallyAddPlayers={() => {
                      const queueNumber = g.index + 1;
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
          </View>
        ) : (
          <View className="bg-secondary border border-dark-100 rounded-2xl p-8 items-center">
            <MaterialCommunityIcons
              name="timer-sand-empty"
              size={48}
              color={BadmintonPalette.text.muted}
            />
            <Text className="text-light-300 text-sm mt-3 text-center">
              No players in queue{"\n"}Tap Auto Queue to start
            </Text>
          </View>
        )}
      </ScrollView>

      <ManualAddPlayersModal
        visible={manualAdd.visible}
        onClose={() => setManualAdd({ visible: false, courtId: null })}
        title={
          activeCourt ? `Add players to ${activeCourt.name}` : "Add players"
        }
        players={availablePlayers}
        maxSelect={maxToSelect}
        onConfirm={(selectedIds) => {
          if (!activeCourt) return;
          const selectedPlayers = availablePlayers.filter((p) =>
            selectedIds.includes(p.id),
          );
          animatePlayersUpdate();
          dispatch(
            addPlayersToCourtManually({
              courtId: activeCourt.id,
              players: selectedPlayers,
            }),
          );
          showToast({
            type: "success",
            message: `${selectedPlayers.length} player${
              selectedPlayers.length > 1 ? "s" : ""
            } added to ${activeCourt.name}`,
          });
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
        title={`Add to Queue ${manualAddQueue.queueNumber}`}
        players={availablePlayers}
        maxSelect={manualAddQueue.missingCount}
        onConfirm={(selectedIds) => {
          if (selectedIds.length === 0) return;
          animatePlayersUpdate();
          const next = [...queueIds];
          next.splice(manualAddQueue.insertIndex, 0, ...selectedIds);
          dispatch(setQueue(next));
          showToast({
            type: "success",
            message: `${selectedIds.length} player${
              selectedIds.length > 1 ? "s" : ""
            } added to queue`,
          });
          setManualAddQueue({
            visible: false,
            insertIndex: 0,
            missingCount: 0,
            queueNumber: 0,
          });
        }}
      />

      <SelectQueueGroupModal
        visible={assignFromQueue.visible}
        onClose={() => setAssignFromQueue({ visible: false, courtId: null })}
        courtName={
          courts.find((c) => c.id === assignFromQueue.courtId)?.name ?? "Court"
        }
        queueGroups={fullQueueGroups}
        onSelect={(group) => {
          if (!assignFromQueue.courtId) return;
          const selectedPlayers = group.ids
            .map((id) => playerMap.get(id))
            .filter(Boolean) as Player[];
          if (selectedPlayers.length === 0) return;

          animatePlayersUpdate();
          const groupSet = new Set(group.ids);
          dispatch(setQueue(queueIds.filter((id) => !groupSet.has(id))));
          dispatch(
            addPlayersToCourtManually({
              courtId: assignFromQueue.courtId,
              players: selectedPlayers,
            }),
          );
          showToast({
            type: "success",
            message: `Queue ${group.index + 1} assigned to court`,
          });
          setAssignFromQueue({ visible: false, courtId: null });
        }}
      />
    </SafeAreaView>
  );
};

export default activity;
