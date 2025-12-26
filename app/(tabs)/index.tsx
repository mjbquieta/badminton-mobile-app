import { icons } from "@/constants/icons";
import { assignPlayersToCourts } from "@/store/courtSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import React, { useMemo } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const index = () => {
  const players = useAppSelector((s) => s.players.items);
  const courts = useAppSelector((s) => s.courts.items);

  const dispatch = useAppDispatch();

  const masterRollDice = () => {
    const inGamePlayers = courts.flatMap((court) => court.players);
    if (!(inGamePlayers.length <= 0)) {
      Alert.alert("Cannot roll dice, some players must be in game.");
    } else {
      dispatch(assignPlayersToCourts({ players }));
    }
  };

  const numberOfInGamePlayers = useMemo(() => {
    return courts.reduce((acc, court) => acc + court.players.length, 0);
  }, [courts]);

  const benchPlayers = useMemo(() => {
    return players.filter(
      (player) =>
        !courts.some((court) => court.players.some((p) => p.id === player.id))
    );
  }, [players, courts]);

  return (
    <SafeAreaView className="flex-1 p-10 bg-primary ">
      <Text className="text-white text-2xl font-bold text-center mb-6">
        Overview
      </Text>

      <View className="flex-1 gap-5 items-center justify-center gap-y-10">
        <View className="flex-row flex-wrap gap-6 justify-around">
          <View className="w-[40%] rounded-2xl bg-dark-200 items-center p-6 shadow-md">
            <Text className="text-white text-base font-semibold mb-2">
              Players
            </Text>
            <Text className="text-accent text-5xl font-extrabold">
              {players.length}
            </Text>
          </View>
          <View className="w-[40%] rounded-2xl bg-dark-200 items-center p-6 shadow-md">
            <Text className="text-white text-base font-semibold mb-2">
              Courts
            </Text>
            <Text className="text-accent text-5xl font-extrabold">
              {courts.length}
            </Text>
          </View>
          <View className="w-[40%] rounded-2xl bg-dark-200 items-center p-6 shadow-md">
            <Text className="text-white text-base font-semibold mb-2">
              In Game
            </Text>
            <Text className="text-accent text-5xl font-extrabold">
              {numberOfInGamePlayers}
            </Text>
          </View>
          <View className="w-[40%] rounded-2xl bg-dark-200 items-center p-6 shadow-md">
            <Text className="text-white text-base font-semibold mb-2">
              Bench
            </Text>
            <Text className="text-accent text-5xl font-extrabold">
              {benchPlayers.length}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className="bg-dark-200 h-40 w-40 rounded-full overflow-hidden shadow-md items-center justify-center self-center gap-2 border border-accent"
          onPress={masterRollDice}
        >
          <Image
            source={icons.dice}
            className="size-20"
            resizeMode="contain"
            tintColor="#AB8BFF"
          />
          <Text className="text-white text-lg font-semibold text-center">
            Roll
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default index;
