import { BadmintonPalette } from "@/constants/palette";
import { useAppDispatch, useAppSelector } from "@badminton/store";
import { rollDice } from "@badminton/store";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useMemo } from "react";
import { Alert, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type StatCardProps = {
  label: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  icon: React.ReactNode;
};

const StatCard = ({ label, value, subtitle, color, icon }: StatCardProps) => (
  <View className="w-[47%] rounded-2xl bg-secondary border border-dark-100 p-4">
    <View className="flex-row items-center justify-between mb-3">
      <View className="size-10 rounded-xl bg-court-deep/20 items-center justify-center">
        {icon}
      </View>
    </View>
    <Text
      className="text-4xl font-extrabold mb-1"
      style={{ color: color || BadmintonPalette.court.lime }}
    >
      {value}
    </Text>
    <Text className="text-light-100 text-sm font-semibold">{label}</Text>
    {subtitle ? (
      <Text className="text-light-300 text-xs mt-0.5">{subtitle}</Text>
    ) : null}
  </View>
);

const index = () => {
  const players = useAppSelector((s) => s.players.items);
  const courts = useAppSelector((s) => s.courts.items);
  const queueIds = useAppSelector((s) => s.queue.ids);

  const dispatch = useAppDispatch();

  const masterRollDice = () => {
    const res = dispatch(rollDice());
    if (res?.needsConfirmation) {
      Alert.alert("Confirm mismatched levels", res.message, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Proceed",
          style: "destructive",
          onPress: () => dispatch(rollDice({ allowIncompatible: true })),
        },
      ]);
    }
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
    <SafeAreaView className="flex-1 bg-primary">
      {/* Header */}
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row items-center gap-3">
          <View className="size-12 rounded-2xl bg-court-deep/30 items-center justify-center">
            <MaterialCommunityIcons
              name="badminton"
              size={28}
              color={BadmintonPalette.court.lime}
            />
          </View>
          <View>
            <Text className="text-light-100 text-2xl font-bold">
              Dashboard
            </Text>
            <Text className="text-light-300 text-sm">
              Live session overview
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View className="flex-1 px-6 pt-6">
        <View className="flex-row flex-wrap gap-4 justify-between">
          <StatCard
            label="Total Players"
            value={players.length}
            icon={
              <MaterialCommunityIcons
                name="account-group"
                size={20}
                color={BadmintonPalette.court.lime}
              />
            }
          />

          <StatCard
            label="In Game"
            value={numberOfInGamePlayers}
            color={BadmintonPalette.status.inGame}
            icon={
              <MaterialCommunityIcons
                name="badminton"
                size={20}
                color={BadmintonPalette.status.inGame}
              />
            }
          />

          <StatCard
            label="In Queue"
            value={waitingPlayersCount}
            color={BadmintonPalette.status.waiting}
            icon={
              <MaterialCommunityIcons
                name="timer-sand"
                size={20}
                color={BadmintonPalette.status.waiting}
              />
            }
          />

          <StatCard
            label="On Bench"
            value={benchPlayers.length}
            color={BadmintonPalette.text.secondary}
            icon={
              <MaterialCommunityIcons
                name="seat"
                size={20}
                color={BadmintonPalette.text.secondary}
              />
            }
          />

          <StatCard
            label="Courts"
            value={`${availableCourtsCount}/${courts.length}`}
            subtitle="Available / Total"
            icon={
              <MaterialCommunityIcons
                name="table-tennis"
                size={20}
                color={BadmintonPalette.court.lime}
              />
            }
          />

          <StatCard
            label="Queue Groups"
            value={queueGroupsCount}
            subtitle="Waiting to play"
            color={BadmintonPalette.accent.primary}
            icon={
              <MaterialCommunityIcons
                name="format-list-numbered"
                size={20}
                color={BadmintonPalette.accent.primary}
              />
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default index;
