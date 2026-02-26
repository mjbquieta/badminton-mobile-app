import { BadmintonPalette } from "@/constants/palette";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";
import PlayerAvatar from "@/components/PlayerAvatar";
import { useAppSelector } from "@badminton/store";
import { computeAllPlayerStats } from "@badminton/core";
import type { MatchRecord } from "@badminton/types";
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

const WinRateBar = ({ rate }: { rate: number }) => (
  <View className="flex-row items-center" style={{ gap: 6 }}>
    <View className="flex-1 h-2 rounded-full bg-dark-200 overflow-hidden">
      <View
        className="h-full rounded-full"
        style={{
          width: `${Math.round(rate * 100)}%`,
          backgroundColor:
            rate >= 0.6
              ? BadmintonPalette.accent.success
              : rate >= 0.4
                ? BadmintonPalette.accent.warning
                : BadmintonPalette.accent.danger,
        }}
      />
    </View>
    <Text
      className="text-[10px] font-bold w-9 text-right"
      style={{ color: BadmintonPalette.text.secondary }}
    >
      {Math.round(rate * 100)}%
    </Text>
  </View>
);

const index = () => {
  const players = useAppSelector((s) => s.players.items);
  const courts = useAppSelector((s) => s.courts.items);
  const drafts = useAppSelector((s) => s.drafts.items);

  const finishedDrafts = useMemo(() => drafts.filter((d) => d.finished), [drafts]);
  const activePlayers = useMemo(() => players.filter((p) => p.active ?? true), [players]);

  // Convert finished drafts to MatchRecord format for stats computation
  const matchRecords = useMemo<MatchRecord[]>(() => {
    return finishedDrafts.map((d) => {
      const half = Math.ceil(d.playerIds.length / 2);
      return {
        id: d.id,
        sessionId: "",
        draftId: d.id,
        playerIds: d.playerIds,
        teamA: d.playerIds.slice(0, half),
        teamB: d.playerIds.slice(half),
        winner: d.winner as "A" | "B",
        scoreA: d.scoreA,
        scoreB: d.scoreB,
        isSingle: d.playerIds.length <= 2,
        finishedAt: Date.now(),
      };
    });
  }, [finishedDrafts]);

  const allPlayerStats = useMemo(
    () => computeAllPlayerStats(matchRecords),
    [matchRecords],
  );

  // Players with matches, sorted by win rate
  const statsRows = useMemo(() => {
    return players
      .map((p) => ({ player: p, stats: allPlayerStats.get(p.id) }))
      .filter((r) => r.stats && r.stats.totalMatches > 0)
      .sort((a, b) => (b.stats!.winRate - a.stats!.winRate) || (b.stats!.wins - a.stats!.wins));
  }, [players, allPlayerStats]);

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

        {/* Stats Grid */}
        <View style={{ gap: 12 }}>
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
          <View className="flex-row gap-4">
            <StatCard
              label="Matches"
              value={finishedDrafts.length}
              color={BadmintonPalette.accent.primary}
              icon={
                <MaterialCommunityIcons
                  name="trophy-outline"
                  size={20}
                  color={BadmintonPalette.accent.primary}
                />
              }
            />
            <StatCard
              label="Active"
              value={activePlayers.length}
              color={BadmintonPalette.accent.success}
              icon={
                <MaterialCommunityIcons
                  name="account-check"
                  size={20}
                  color={BadmintonPalette.accent.success}
                />
              }
            />
          </View>
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

                    {/* Avatar */}
                    <View className="mx-2">
                      <PlayerAvatar player={player} size="sm" />
                    </View>

                    {/* Level Badge */}
                    <View
                      className="size-6 rounded items-center justify-center mr-2"
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
        {/* Player Stats Table */}
        {statsRows.length > 0 && (
          <View className="rounded-2xl bg-secondary border border-dark-100 overflow-hidden">
            <View className="flex-row items-center gap-2 p-4 border-b border-dark-100">
              <MaterialCommunityIcons
                name="chart-bar"
                size={20}
                color={BadmintonPalette.accent.info}
              />
              <Text
                className="text-lg font-bold flex-1"
                style={{ color: BadmintonPalette.text.primary }}
              >
                Player Stats
              </Text>
            </View>

            {/* Column Headers */}
            <View className="flex-row items-center px-4 py-2 border-b border-dark-100">
              <Text
                className="flex-1 text-[10px] font-bold uppercase"
                style={{ color: BadmintonPalette.text.muted }}
              >
                Player
              </Text>
              <Text
                className="w-8 text-center text-[10px] font-bold uppercase"
                style={{ color: BadmintonPalette.text.muted }}
              >
                G
              </Text>
              <Text
                className="w-8 text-center text-[10px] font-bold uppercase"
                style={{ color: BadmintonPalette.text.muted }}
              >
                W
              </Text>
              <Text
                className="w-8 text-center text-[10px] font-bold uppercase"
                style={{ color: BadmintonPalette.text.muted }}
              >
                L
              </Text>
              <View className="w-20">
                <Text
                  className="text-[10px] font-bold uppercase text-right"
                  style={{ color: BadmintonPalette.text.muted }}
                >
                  Win Rate
                </Text>
              </View>
            </View>

            {statsRows.map(({ player, stats }, idx) => {
              const config = playerLevelConfig[player.level];
              return (
                <View
                  key={player.id}
                  className={`flex-row items-center px-4 py-2.5 ${
                    idx < statsRows.length - 1 ? "border-b border-dark-100" : ""
                  }`}
                >
                  {/* Player info */}
                  <View className="flex-1 flex-row items-center" style={{ gap: 6 }}>
                    <PlayerAvatar player={player} size="sm" />
                    <View
                      className="size-5 rounded items-center justify-center"
                      style={{ backgroundColor: `${config.color}26` }}
                    >
                      <Text className="text-[8px] font-bold" style={{ color: config.color }}>
                        {config.shortLabel}
                      </Text>
                    </View>
                    <Text
                      className="text-xs font-medium flex-shrink"
                      style={{ color: BadmintonPalette.text.primary }}
                      numberOfLines={1}
                    >
                      {player.name}
                    </Text>
                  </View>

                  {/* Games */}
                  <Text
                    className="w-8 text-center text-xs font-semibold"
                    style={{ color: BadmintonPalette.text.secondary }}
                  >
                    {stats!.totalMatches}
                  </Text>

                  {/* Wins */}
                  <Text
                    className="w-8 text-center text-xs font-semibold"
                    style={{ color: BadmintonPalette.accent.success }}
                  >
                    {stats!.wins}
                  </Text>

                  {/* Losses */}
                  <Text
                    className="w-8 text-center text-xs font-semibold"
                    style={{ color: BadmintonPalette.accent.danger }}
                  >
                    {stats!.losses}
                  </Text>

                  {/* Win Rate */}
                  <View className="w-20">
                    <WinRateBar rate={stats!.winRate} />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default index;
