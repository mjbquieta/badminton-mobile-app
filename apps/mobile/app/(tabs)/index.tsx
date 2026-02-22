import { BadmintonPalette } from "@/constants/palette";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";
import { useAppSelector } from "@badminton/store";
import { playerLevelConfig } from "@badminton/ui-shared";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type StatCardProps = {
  label: string;
  value: string | number;
  color?: string;
  icon: React.ReactNode;
};

const StatCard = ({ label, value, color, icon }: StatCardProps) => (
  <View className="flex-1 rounded-2xl bg-secondary border border-dark-100 p-4">
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
  </View>
);

const RANK_COLORS = {
  1: "#FACC15",
  2: "#D1D5DB",
  3: "#D97706",
} as Record<number, string>;

const index = () => {
  const players = useAppSelector((s) => s.players.items);
  const courts = useAppSelector((s) => s.courts.items);

  const leaderboard = useMemo(() => {
    return [...players]
      .filter((p) => p.trophies > 0)
      .sort((a, b) => b.trophies - a.trophies);
  }, [players]);

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

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, gap: 20, paddingBottom: 120 }}
      >
        {/* Verification Banner */}
        <EmailVerificationBanner />

        {/* Stats - Players & Courts */}
        <View className="flex-row gap-4">
          <StatCard
            label="Players"
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
            label="Courts"
            value={courts.length}
            color={BadmintonPalette.accent.info}
            icon={
              <MaterialCommunityIcons
                name="badminton"
                size={20}
                color={BadmintonPalette.accent.info}
              />
            }
          />
        </View>

        {/* Leaderboard */}
        <View className="rounded-2xl bg-secondary border border-dark-100 overflow-hidden">
          {/* Leaderboard Header */}
          <View className="flex-row items-center gap-2 p-4 border-b border-dark-100">
            <MaterialCommunityIcons
              name="trophy"
              size={20}
              color={BadmintonPalette.accent.primary}
            />
            <Text
              className="text-lg font-bold flex-1"
              style={{ color: BadmintonPalette.text.primary }}
            >
              Leaderboard
            </Text>
            {leaderboard.length > 0 && (
              <View
                className="px-2 py-0.5 rounded-md"
                style={{ backgroundColor: `${BadmintonPalette.accent.primary}20` }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{ color: BadmintonPalette.accent.primary }}
                >
                  {leaderboard.length}
                </Text>
              </View>
            )}
          </View>

          {leaderboard.length > 0 ? (
            <View>
              {leaderboard.map((player, index) => {
                const rank = index + 1;
                const rankColor =
                  RANK_COLORS[rank] || BadmintonPalette.text.muted;
                const config = playerLevelConfig[player.level];

                return (
                  <View
                    key={player.id}
                    className={`flex-row items-center px-4 py-3 ${
                      index < leaderboard.length - 1
                        ? "border-b border-dark-100"
                        : ""
                    }`}
                  >
                    {/* Rank */}
                    <Text
                      className="w-7 text-center font-bold text-base"
                      style={{ color: rankColor }}
                    >
                      {rank}
                    </Text>

                    {/* Level Badge */}
                    <View
                      className="size-6 rounded items-center justify-center mx-2"
                      style={{ backgroundColor: `${config.color}26` }}
                    >
                      <Text
                        className="text-[10px] font-bold"
                        style={{ color: config.color }}
                      >
                        {config.shortLabel}
                      </Text>
                    </View>

                    {/* Name */}
                    <Text
                      className="flex-1 text-sm font-medium"
                      style={{ color: BadmintonPalette.text.primary }}
                      numberOfLines={1}
                    >
                      {player.name}
                    </Text>

                    {/* Trophies */}
                    <View className="flex-row items-center gap-1.5">
                      <MaterialCommunityIcons
                        name="trophy"
                        size={14}
                        color={BadmintonPalette.accent.primary}
                      />
                      <Text
                        className="text-sm font-semibold"
                        style={{ color: BadmintonPalette.accent.primary }}
                      >
                        {player.trophies}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="p-8 items-center">
              <MaterialCommunityIcons
                name="trophy-outline"
                size={40}
                color={BadmintonPalette.text.muted}
              />
              <Text
                className="text-sm font-semibold mt-3"
                style={{ color: BadmintonPalette.text.secondary }}
              >
                No trophies yet
              </Text>
              <Text
                className="text-xs mt-1 text-center"
                style={{ color: BadmintonPalette.text.muted }}
              >
                Finish matches to see the leaderboard
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default index;
