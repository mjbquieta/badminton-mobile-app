import AddCourtScreen from "@/components/courts/AddCourtScreen";
import ConfirmationAlert from "@/components/ConfirmationAlert";
import CourtCard from "@/components/CourtCard";
import { useToast } from "@/components/Toast";
import { BadmintonPalette } from "@/constants/palette";
import {
  type RootState,
  addCourt,
  clearCourts,
  clearCourtsError,
  removeCourt,
  useAppDispatch,
  useAppSelector,
} from "@badminton/store";
import { useAuth } from "@/contexts/AuthContext";
import { UNVERIFIED_LIMITS } from "@badminton/ui-shared";
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
  const { emailVerified } = useAuth();
  const dispatch = useAppDispatch();
  const courts = useAppSelector((s: RootState) => s.courts.items);
  const sliceError = useAppSelector((s: RootState) => s.courts.error);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const { showToast } = useToast();

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
        maxCourts: emailVerified ? undefined : UNVERIFIED_LIMITS.MAX_COURTS,
      })
    );

    showToast({
      message: `${name} added (${isSingle ? "Singles" : "Doubles"})`,
      type: "success",
    });
  };

  // ── Sub-screen early return ──

  if (showAddModal) {
    return (
      <AddCourtScreen
        onAdd={onAddCourt}
        onBack={() => setShowAddModal(false)}
      />
    );
  }

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
                  const names = courtsWithPlayers
                    .map((c) => c.name)
                    .join(", ");
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
                onDelete={() => {
                  if (item.players.length > 0) {
                    Alert.alert(
                      "Cannot delete",
                      `${item.name} has players. End the game first.`
                    );
                    return;
                  }
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
