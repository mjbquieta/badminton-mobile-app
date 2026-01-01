import ConfirmationAlert from "@/components/ConfirmationAlert";
import CourtCard from "@/components/CourtCard";
import ManualAddPlayersModal from "@/components/ManualAddPlayersModal";
import MatchTypeSelector, {
  type MatchType,
} from "@/components/MatchTypeSelector";
import { PotatoPalette } from "@/constants/palette";
import { RootState } from "@/store";
import {
  addCourt,
  addPlayersToCourtManually,
  assignPlayersToCourt,
  clearCourts,
  clearCourtsError,
  removeCourt,
  removePlayerFromCourt,
} from "@/store/courtSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { endGameAndAdvanceQueue } from "@/store/thunks";
import { type Player } from "@/types/players";
import { shuffle } from "@/utils/shuffle";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
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

interface CourtForm {
  isSingle: boolean;
}

export const CourtsContent = ({
  contentContainerClassName = "p-10",
}: {
  contentContainerClassName?: string;
}) => {
  const dispatch = useAppDispatch();
  const courts = useAppSelector((s: RootState) => s.courts.items);
  const players = useAppSelector((s: RootState) => s.players.items);
  const queueIds = useAppSelector((s: RootState) => s.queue.ids);
  const sliceError = useAppSelector((s: RootState) => s.courts.error);
  const [court, setCourt] = useState<CourtForm>({
    isSingle: false,
  });
  const [manualAdd, setManualAdd] = useState<{
    visible: boolean;
    courtId: string | null;
  }>({ visible: false, courtId: null });

  const matchType: MatchType = court.isSingle ? "singles" : "doubles";

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

  const onAddCourt = () => {
    // Court naming is managed here automatically (no input):
    // Court 1, Court 2, ...
    const name = `Court ${courts.length + 1}`;

    dispatch(
      addCourt({
        name,
        isSingle: court.isSingle,
        id: uuidv4(),
        players: [],
      })
    );

    setCourt({ isSingle: false });
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

  return (
    <View className={`flex-1 bg-primary gap-5 ${contentContainerClassName}`}>
      <Text className="text-white text-2xl font-bold text-center">
        Add Court
      </Text>

      <View className="flex-row items-center gap-3">
        <View className="flex-1">
          <MatchTypeSelector
            value={matchType}
            onChange={(next) => {
              setCourt((prev) => ({ ...prev, isSingle: next === "singles" }));
              dispatch(clearCourtsError());
            }}
          />
        </View>

        <TouchableOpacity
          className="size-14 rounded-full bg-primary items-center justify-center border border-accent self-end"
          onPress={onAddCourt}
          accessibilityRole="button"
          accessibilityLabel="Add court"
        >
          <FontAwesome5
            name="plus"
            size={24}
            color={PotatoPalette.accent.sprout}
          />
        </TouchableOpacity>
      </View>

      {courts.length > 0 && (
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
                    "Cannot clear courts",
                    `Some courts still have players (${names}). Please end the game first.`
                  );
                  return;
                }
                ConfirmationAlert({
                  title: "Confirm Clearing Courts List",
                  message: "Are you sure you want to clear the list?",
                  onConfirm: () => {
                    LayoutAnimation.configureNext(
                      LayoutAnimation.Presets.spring
                    );
                    dispatch(clearCourts());
                  },
                });
              }}
              accessibilityRole="button"
              accessibilityLabel="Clear courts list"
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
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
                  ConfirmationAlert({
                    title: "Confirm Deletion",
                    message: "Are you sure you want to delete this court?",
                    onConfirm: () => {
                      dispatch(removeCourt(item.id));
                    },
                  });
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
                          "The queue is almost empty. Please go to the Activity page and re-roll the dice to add more players from the bench."
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
            contentContainerStyle={{ gap: 10 }}
          />
        </>
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
    </View>
  );
};

const courts = () => {
  return (
    <SafeAreaView className="flex-1 bg-primary">
      <CourtsContent contentContainerClassName="p-10" />
    </SafeAreaView>
  );
};

export default courts;
