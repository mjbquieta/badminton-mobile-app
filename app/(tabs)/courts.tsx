import ConfirmationAlert from "@/components/ConfirmationAlert";
import CourtCard from "@/components/CourtCard";
import MatchTypeSelector, {
  type MatchType,
} from "@/components/MatchTypeSelector";
import { icons } from "@/constants/icons";
import { RootState } from "@/store";
import {
  addCourt,
  assignPlayersToCourt,
  clearCourts,
  clearCourtsError,
  endGame,
  removeCourt,
  removePlayerFromCourt,
} from "@/store/courtSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPlayersAtEndOfQueue } from "@/store/playersSlice";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
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

interface CourtForm {
  isSingle: boolean;
}

const courts = () => {
  const dispatch = useAppDispatch();
  const courts = useAppSelector((s: RootState) => s.courts.items);
  const players = useAppSelector((s: RootState) => s.players.items);
  const sliceError = useAppSelector((s: RootState) => s.courts.error);
  const [court, setCourt] = useState<CourtForm>({
    isSingle: false,
  });

  const matchType: MatchType = court.isSingle ? "singles" : "doubles";

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

  return (
    <SafeAreaView className="flex-1 p-10 bg-primary gap-5">
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
          <Image
            source={icons.add}
            className="size-6"
            resizeMode="contain"
            tintColor="#00A300"
          />
        </TouchableOpacity>
      </View>

      {courts.length > 0 && (
        <>
          <View className="border-t border-accent my-6" />

          <FlatList
            data={courts}
            renderItem={({ item }) => (
              <CourtCard
                name={item.name}
                players={item.players}
                isSingle={item.isSingle}
                onDeleteTag={(playerId) => {
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
                  dispatch(
                    setPlayersAtEndOfQueue(item.players.map((p) => p.id))
                  );
                  dispatch(endGame(item.players.map((p) => p.id)));
                }}
                onAssignPlayers={() => {
                  dispatch(assignPlayersToCourt({ courtId: item.id, players }));
                }}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 10 }}
          />

          <Pressable
            className="bg-primary px-5 py-4 flex-row items-center justify-center gap-2 mt-4 w-full mb-2"
            onPress={() =>
              ConfirmationAlert({
                title: "Confirm Clearing Courts List",
                message: "Are you sure you want to clear the list?",
                onConfirm: () => {
                  dispatch(clearCourts());
                },
              })
            }
          >
            <Image
              source={icons.clear}
              className="size-5"
              resizeMode="contain"
              tintColor="#ab8bff"
            />
            <Text className="text-white text-lg font-bold text-center">
              Clear List
            </Text>
          </Pressable>
        </>
      )}
    </SafeAreaView>
  );
};

export default courts;
