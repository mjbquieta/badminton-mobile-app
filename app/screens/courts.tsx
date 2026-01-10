import ConfirmationAlert from "@/components/ConfirmationAlert";
import CourtCard from "@/components/CourtCard";
import ManualAddPlayersModal from "@/components/ManualAddPlayersModal";
import { useToast } from "@/components/Toast";
import { BadmintonPalette } from "@/constants/palette";
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
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useEffect, useState } from "react";
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

type CourtType = "singles" | "doubles";

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
  const [selectedType, setSelectedType] = useState<CourtType>("doubles");
  const [manualAdd, setManualAdd] = useState<{
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

  const onAddCourt = () => {
    const name = `Court ${courts.length + 1}`;
    const isSingle = selectedType === "singles";

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

  const courtTypeOptions: {
    type: CourtType;
    label: string;
    players: string;
    icon: string;
    color: string;
  }[] = [
    {
      type: "singles",
      label: "Singles",
      players: "1 vs 1",
      icon: "account",
      color: BadmintonPalette.accent.info,
    },
    {
      type: "doubles",
      label: "Doubles",
      players: "2 vs 2",
      icon: "account-group",
      color: BadmintonPalette.accent.primary,
    },
  ];

  return (
    <View className={`flex-1 bg-primary ${contentContainerClassName}`}>
      {/* Add Court Section */}
      <View className="bg-secondary border border-dark-100 rounded-2xl overflow-hidden mb-6">
        {/* Header */}
        <View className="p-4 border-b border-dark-100">
          <Text
            className="text-base font-bold"
            style={{ color: BadmintonPalette.text.primary }}
          >
            Add New Court
          </Text>
          <Text
            className="text-xs mt-0.5"
            style={{ color: BadmintonPalette.text.muted }}
          >
            Select match type and tap add
          </Text>
        </View>

        {/* Court Type Selection */}
        <View className="p-4">
          <Text
            className="text-xs font-medium mb-3"
            style={{ color: BadmintonPalette.text.secondary }}
          >
            Match Type
          </Text>

          <View className="flex-row" style={{ gap: 12 }}>
            {courtTypeOptions.map((option) => {
              const isSelected = selectedType === option.type;
              return (
                <Pressable
                  key={option.type}
                  onPress={() => setSelectedType(option.type)}
                  className="flex-1 rounded-xl p-4"
                  style={{
                    backgroundColor: isSelected
                      ? `${option.color}15`
                      : BadmintonPalette.bg.elevated,
                    borderWidth: 2,
                    borderColor: isSelected ? option.color : "transparent",
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${option.label}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  {/* Icon */}
                  <View
                    className="size-10 rounded-xl items-center justify-center mb-3"
                    style={{
                      backgroundColor: isSelected
                        ? option.color
                        : `${option.color}20`,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={option.icon as any}
                      size={22}
                      color={isSelected ? BadmintonPalette.bg.base : option.color}
                    />
                  </View>

                  {/* Label */}
                  <Text
                    className="text-base font-bold"
                    style={{
                      color: isSelected
                        ? option.color
                        : BadmintonPalette.text.primary,
                    }}
                  >
                    {option.label}
                  </Text>

                  {/* Player count */}
                  <Text
                    className="text-sm mt-0.5"
                    style={{
                      color: isSelected
                        ? option.color
                        : BadmintonPalette.text.muted,
                    }}
                  >
                    {option.players}
                  </Text>

                  {/* Selection indicator */}
                  {isSelected && (
                    <View
                      className="absolute top-3 right-3 size-5 rounded-full items-center justify-center"
                      style={{ backgroundColor: option.color }}
                    >
                      <AntDesign
                        name="check"
                        size={12}
                        color={BadmintonPalette.bg.base}
                      />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Add Button */}
        <View className="px-4 pb-4">
          <TouchableOpacity
            onPress={onAddCourt}
            className="flex-row items-center justify-center py-3.5 rounded-xl"
            style={{
              backgroundColor:
                selectedType === "singles"
                  ? BadmintonPalette.accent.info
                  : BadmintonPalette.accent.primary,
            }}
            accessibilityRole="button"
            accessibilityLabel="Add court"
          >
            <AntDesign
              name="plus"
              size={18}
              color={BadmintonPalette.bg.base}
            />
            <Text
              className="text-sm font-bold ml-2"
              style={{ color: BadmintonPalette.bg.base }}
            >
              Add {selectedType === "singles" ? "Singles" : "Doubles"} Court
            </Text>
          </TouchableOpacity>
        </View>
      </View>

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
                    message: `End the game on ${item.name}?`,
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
            Select a match type above to add your first court
          </Text>
        </View>
      )}

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
