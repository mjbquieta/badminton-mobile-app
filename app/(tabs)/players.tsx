import AddPInput from "@/components/AddInput";
import ConfirmationAlert from "@/components/ConfirmationAlert";
import PlayerCard from "@/components/PlayerCard";
import { icons } from "@/constants/icons";
import { RootState } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addPlayer,
  clearPlayers,
  clearPlayersError,
  removePlayer,
} from "@/store/playersSlice";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
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

const players = () => {
  const [newPlayerName, setNewPlayerName] = useState<string>("");

  const dispatch = useAppDispatch();
  const players = useAppSelector((s: RootState) => s.players.items);
  const courts = useAppSelector((s: RootState) => s.courts.items);
  const sliceError = useAppSelector((s: RootState) => s.players.error);

  useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const isInGamePlayer = useCallback(
    (playerId: string): boolean => {
      return courts.some((c) => c.players.some((p) => p.id === playerId));
    },
    [courts]
  );

  useEffect(() => {
    if (!sliceError) return;
    Alert.alert("Error", sliceError, [
      { text: "OK", onPress: () => dispatch(clearPlayersError()) },
    ]);
  }, [sliceError, dispatch]);

  return (
    <SafeAreaView className="flex-1 p-10 bg-primary gap-5">
      <Text className="text-white text-2xl font-bold text-center">
        Add Player
      </Text>

      <View className="flex-row items-center gap-3">
        <View className="flex-1">
          <AddPInput
            icon="player"
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
          <Image
            source={icons.add}
            className="size-6"
            resizeMode="contain"
            tintColor="#00A300"
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
                const message =
                  "Are you sure you want to clear the players list?";
                ConfirmationAlert({
                  title: "Confirm Clearing Players List",
                  message: message,
                  onConfirm: () => {
                    LayoutAnimation.configureNext(
                      LayoutAnimation.Presets.spring
                    );
                    dispatch(clearPlayers());
                  },
                });
              }}
              accessibilityRole="button"
              accessibilityLabel="Clear players list"
            >
              <Image
                source={icons.clear}
                className="size-7"
                resizeMode="contain"
                tintColor="#ab8bff"
              />
              <Text className="text-white text-sm font-bold text-center">
                Clear
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={players}
            renderItem={({ item }) => (
              <PlayerCard
                name={item.name}
                isInGame={isInGamePlayer(item.id)}
                onDelete={() => {
                  const message = `Are you sure you want to delete this player: ${item.name}?`;
                  ConfirmationAlert({
                    title: "Confirm Deletion",
                    message: message,
                    onConfirm: () => {
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
          />
        </>
      )}
    </SafeAreaView>
  );
};

export default players;
