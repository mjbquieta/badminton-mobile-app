import AddCourtModal from "@/components/AddCourtModal";
import ConfirmationAlert from "@/components/ConfirmationAlert";
import CourtCard from "@/components/CourtCard";
import ManualAddPlayersModal from "@/components/ManualAddPlayersModal";
import SelectQueueGroupModal, { type QueueGroup } from "@/components/SelectQueueGroupModal";
import { useToast } from "@/components/Toast";
import { BadmintonPalette } from "@/constants/palette";
import {
  type RootState,
  addCourt,
  addPlayersToCourtManually,
  assignPlayersToCourt,
  clearCourts,
  clearCourtsError,
  removeCourt,
  removePlayerFromCourt,
  useAppDispatch,
  useAppSelector,
  setQueue,
  backToQueue,
  dissolveCourt,
  endGameAndAdvanceQueue,
} from "@badminton/store";
import { type Player } from "@badminton/types";
import { shuffle } from "@badminton/core";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useEffect, useState } from "react";
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

export const CourtsContent = ({
  contentContainerClassName = "p-6",
}: {
  contentContainerClassName?: string;
}) => {
  const dispatch = useAppDispatch();
  const courts = useAppSelector((s: RootState) => s.courts.items);
  const players = useAppSelector((s: RootState) => s.players.items);
  const queueIds = useAppSelector((s: RootState) => s.queue.ids);
  const sliceError = useAppSelector((s: RootState) => s.courts.error);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [manualAdd, setManualAdd] = useState<{
    visible: boolean;
    courtId: string | null;
  }>({ visible: false, courtId: null });
  const [assignFromQueue, setAssignFromQueue] = useState<{
    visible: boolean;
    courtId: string | null;
  }>({ visible: false, courtId: null });

  const { showToast } = useToast();

  const animatePlayersUpdate = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
  };

  useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    if (!sliceError) return;
    Alert.alert("Error", sliceError, [
      { text: "OK", onPress: () => dispatch(clearCourtsError()) },
    ]);
  }, [sliceError, dispatch]);

  const onAddCourt = (isSingle: boolean) => {
    const name = `Court ${courts.length + 1}`;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    dispatch(
      addCourt({
        name,
        isSingle,
        id: uuidv4(),
        players: [],
      })
    );

    showToast({
      message: `${name} added (${isSingle ? "Singles" : "Doubles"})`,
      type: "success",
    });
  };

  const activeCourt = manualAdd.courtId
    ? courts.find((c) => c.id === manualAdd.courtId) ?? null
    : null;

  const playersOnAnyCourtIds = new Set(
    courts.flatMap((c) => c.players.map((p) => p.id))
  );

  const queuedIds = new Set(queueIds);
  const availablePlayers: Player[] = players.filter(
    (p) => !playersOnAnyCourtIds.has(p.id) && !queuedIds.has(p.id)
  );

  const maxToSelect = activeCourt
    ? Math.max(0, (activeCourt.isSingle ? 2 : 4) - activeCourt.players.length)
    : 0;

  const playerMap = new Map(players.map((p) => [p.id, p]));

  const fullQueueGroups: QueueGroup[] = (() => {
    const groups: QueueGroup[] = [];
    for (let i = 0; i < queueIds.length; i += 4) {
      const ids = queueIds.slice(i, i + 4);
      if (ids.length === 4) {
        groups.push({
          index: i / 4,
          ids,
          players: ids.map((id) => {
            const p = playerMap.get(id);
            return {
              id,
              name: p?.name ?? "Unknown",
              level: p?.level,
              gameCount: p?.gameCount,
            };
          }),
        });
      }
    }
    return groups;
  })();

  return (
    <View className={`flex-1 bg-primary ${contentContainerClassName}`}>
      {/* Add Court Button */}
      <TouchableOpacity
        onPress={() => setShowAddModal(true)}
        className="flex-row items-center justify-center py-3.5 rounded-2xl mb-6"
        style={{ backgroundColor: BadmintonPalette.accent.primary }}
        accessibilityRole="button"
        accessibilityLabel="Add court"
      >
        <AntDesign name="plus" size={18} color={BadmintonPalette.bg.base} />
        <Text
          className="text-base font-bold ml-2"
          style={{ color: BadmintonPalette.bg.base }}
        >
          Add Court
        </Text>
      </TouchableOpacity>

      {/* Courts List */}
      {courts.length > 0 && (
        <>
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Text
                className="text-lg font-bold mr-2"
                style={{ color: BadmintonPalette.text.primary }}
              >
                Courts
              </Text>
              <View
                className="px-2 py-0.5 rounded-md"
                style={{ backgroundColor: `${BadmintonPalette.court.lime}20` }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{ color: BadmintonPalette.court.lime }}
                >
                  {courts.length}
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
                    "Cannot clear courts",
                    `Some courts have active games (${names}). End the games first.`
                  );
                  return;
                }
                ConfirmationAlert({
                  title: "Clear All Courts",
                  message: "Remove all courts?",
                  onConfirm: () => {
                    LayoutAnimation.configureNext(
                      LayoutAnimation.Presets.spring
                    );
                    dispatch(clearCourts());
                  },
                });
              }}
              accessibilityRole="button"
              accessibilityLabel="Clear all courts"
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

          <FlatList
            data={courts}
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
                onDelete={() => {
                  ConfirmationAlert({
                    title: "Delete Court",
                    message: `Remove ${item.name}?`,
                    onConfirm: () => {
                      LayoutAnimation.configureNext(
                        LayoutAnimation.Presets.spring
                      );
                      dispatch(removeCourt(item.id));
                    },
                  });
                }}
                onEndGame={() => {
                  ConfirmationAlert({
                    title: "End Game",
                    message: `Mark the game on ${item.name} as finished and count the players' games?`,
                    onConfirm: () => {
                      animatePlayersUpdate();
                      const result = dispatch(
                        endGameAndAdvanceQueue(item.id)
                      ) as any;
                      if (result?.warnedQueueEmpty) {
                        Alert.alert(
                          "Queue almost empty",
                          "Use Auto Assign to add more players from the bench."
                        );
                      }
                    },
                  });
                }}
                onDissolve={() => {
                  ConfirmationAlert({
                    title: "Dissolve Game",
                    message: `Send players on ${item.name} back to the bench? Games will NOT be counted.`,
                    onConfirm: () => {
                      animatePlayersUpdate();
                      dispatch(dissolveCourt(item.id));
                    },
                  });
                }}
                onBackToQueue={() => {
                  ConfirmationAlert({
                    title: "Back to Queue",
                    message: `Send players on ${item.name} back to the queue? Games will NOT be counted.`,
                    onConfirm: () => {
                      animatePlayersUpdate();
                      dispatch(backToQueue(item.id));
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
                onAssignFromQueue={
                  fullQueueGroups.length > 0
                    ? () => setAssignFromQueue({ visible: true, courtId: item.id })
                    : undefined
                }
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 12, paddingBottom: 40 }}
          />
        </>
      )}

      {courts.length === 0 && (
        <View className="flex-1 items-center justify-center pb-20">
          <View className="size-16 rounded-2xl bg-secondary border border-dark-100 items-center justify-center mb-4">
            <MaterialCommunityIcons
              name="badminton"
              size={32}
              color={BadmintonPalette.text.muted}
            />
          </View>
          <Text
            className="text-lg font-bold mb-1"
            style={{ color: BadmintonPalette.text.primary }}
          >
            No Courts Yet
          </Text>
          <Text
            className="text-sm text-center"
            style={{ color: BadmintonPalette.text.muted }}
          >
            Tap "Add Court" to add your first court
          </Text>
        </View>
      )}

      <AddCourtModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={onAddCourt}
      />

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

      <SelectQueueGroupModal
        visible={assignFromQueue.visible}
        onClose={() => setAssignFromQueue({ visible: false, courtId: null })}
        courtName={
          courts.find((c) => c.id === assignFromQueue.courtId)?.name ?? ""
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
            })
          );

          showToast({
            type: "success",
            message: `Queue ${group.index + 1} assigned to court`,
          });
          setAssignFromQueue({ visible: false, courtId: null });
        }}
      />
    </View>
  );
};

const courts = () => {
  return (
    <SafeAreaView className="flex-1 bg-primary">
      <CourtsContent contentContainerClassName="p-6" />
    </SafeAreaView>
  );
};

export default courts;
