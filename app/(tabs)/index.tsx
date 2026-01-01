import { PotatoPalette } from "@/constants/palette";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { rollDice } from "@/store/thunks";
import AntDesign from "@expo/vector-icons/AntDesign";
import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const index = () => {
  const players = useAppSelector((s) => s.players.items);
  const courts = useAppSelector((s) => s.courts.items);
  const queueIds = useAppSelector((s) => s.queue.ids);

  const dispatch = useAppDispatch();

  const masterRollDice = () => {
    dispatch(rollDice());
  };

  const numberOfInGamePlayers = useMemo(() => {
    return courts.reduce((acc, court) => acc + court.players.length, 0);
  }, [courts]);

  const benchPlayers = useMemo(() => {
    const queued = new Set(queueIds);
    return players.filter(
      (player) =>
        !queued.has(player.id) &&
        !courts.some((court) => court.players.some((p) => p.id === player.id))
    );
  }, [players, courts, queueIds]);

  const waitingPlayersCount = useMemo(() => {
    const playersOnCourts = new Set(
      courts.flatMap((c) => c.players.map((p) => p.id))
    );
    return queueIds.filter((id) => !playersOnCourts.has(id)).length;
  }, [courts, queueIds]);

  const availableCourtsCount = useMemo(() => {
    return courts.filter((c) => c.players.length === 0).length;
  }, [courts]);

  const queueGroupsCount = useMemo(() => {
    return Math.floor(queueIds.length / 4);
  }, [queueIds.length]);

  return (
    <SafeAreaView className="flex-1 bg-primary ">
      <View className="flex-row items-center gap-2 p-4">
        <AntDesign name="home" size={20} color={PotatoPalette.accent.gold} />
        <Text className="text-white text-2xl font-bold text-center">
          Overview
        </Text>
      </View>

      <View className="flex-1 items-center justify-center">
        <View className="flex-row flex-wrap gap-6 justify-around px-6">
          <View className="w-[40%] rounded-2xl bg-dark-200 items-center p-6 shadow-md">
            <Text className="text-white text-base font-semibold mb-2">
              Total Players
            </Text>
            <Text className="text-accent text-5xl font-extrabold">
              {players.length}
            </Text>
          </View>
          <View className="w-[40%] rounded-2xl bg-dark-200 items-center p-6 shadow-md">
            <Text className="text-white text-base font-semibold mb-2">
              Waiting Players
            </Text>
            <Text className="text-accent text-5xl font-extrabold">
              {waitingPlayersCount}
            </Text>
          </View>
          <View className="w-[40%] rounded-2xl bg-dark-200 items-center p-6 shadow-md">
            <Text className="text-white text-base font-semibold mb-2">
              Courts
            </Text>
            <Text className="text-accent text-5xl font-extrabold">
              {availableCourtsCount}/{courts.length}
            </Text>
            <Text className="text-light-200 text-xs font-bold mt-2">
              Available courts / courts
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
          <View className="w-[40%] rounded-2xl bg-dark-200 items-center p-6 shadow-md">
            <Text className="text-white text-base font-semibold mb-2">
              Queue
            </Text>
            <Text className="text-accent text-5xl font-extrabold">
              {queueGroupsCount}
            </Text>
          </View>

          {/* Available courts is now included in the Courts tile above as available/total */}
        </View>

        {/* <TouchableOpacity
          className="bg-dark-200 h-40 w-40 rounded-full overflow-hidden shadow-md items-center justify-center self-center gap-2 border border-accent"
          onPress={masterRollDice}
        >
          <FontAwesome5
            name="dice"
            size={50}
            color={PotatoPalette.accent.gold}
          />
          <Text className="text-white text-lg font-semibold text-center">
            Roll
          </Text>
        </TouchableOpacity> */}
      </View>
    </SafeAreaView>
  );
};

export default index;
