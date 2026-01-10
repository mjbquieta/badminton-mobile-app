import { BadmintonPalette } from "@/constants/palette";
import type { Player } from "@/types/players";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useMemo } from "react";
import { Text, View } from "react-native";

export type PlayerLiveStatus = "in_game" | "waiting" | "bench";

const statusLabel: Record<PlayerLiveStatus, string> = {
  in_game: "In Game",
  waiting: "Waiting",
  bench: "Bench",
};

const statusPillClass: Record<PlayerLiveStatus, string> = {
  in_game: "bg-danger/15 border-danger/40",
  waiting: "bg-success/15 border-success/40",
  bench: "bg-dark-100 border-dark-100",
};

const statusTextClass: Record<PlayerLiveStatus, string> = {
  in_game: "text-danger",
  waiting: "text-success",
  bench: "text-light-300",
};

const statusRank: Record<PlayerLiveStatus, number> = {
  in_game: 0,
  waiting: 1,
  bench: 2,
};

export function PlayerGameCounts({
  players,
  statusByPlayerId,
}: {
  players: Player[];
  statusByPlayerId: Record<
    string,
    { status: PlayerLiveStatus; courtName?: string } | undefined
  >;
}) {
  const groups = useMemo(() => {
    const byCount = new Map<number, Player[]>();
    for (const p of players) {
      const arr = byCount.get(p.gameCount) ?? [];
      arr.push(p);
      byCount.set(p.gameCount, arr);
    }

    const counts = [...byCount.keys()].sort((a, b) => b - a);
    return counts.map((count) => ({
      count,
      players: (byCount.get(count) ?? []).slice().sort((a, b) => {
        const sa = statusByPlayerId[a.id]?.status ?? "bench";
        const sb = statusByPlayerId[b.id]?.status ?? "bench";
        const sr = statusRank[sa] - statusRank[sb];
        if (sr !== 0) return sr;
        return a.name.localeCompare(b.name);
      }),
    }));
  }, [players, statusByPlayerId]);

  if (players.length === 0) {
    return (
      <View className="bg-secondary border border-dark-100 rounded-2xl p-6 items-center">
        <Text className="text-light-300 text-sm">No players yet.</Text>
      </View>
    );
  }

  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-2">
        <MaterialCommunityIcons
          name="trophy-outline"
          size={22}
          color={BadmintonPalette.court.lime}
        />
        <Text className="text-light-100 text-lg font-bold">
          Game Counts
        </Text>
      </View>

      <View className="gap-4">
        {groups.map((g, idx) => {
          const isLast = idx === groups.length - 1;
          return (
            <View
              key={`gamecount-${g.count}`}
              className="flex-row items-stretch gap-3"
            >
              {/* Timeline */}
              <View className="w-12 items-center">
                {/* Top connector */}
                <View className={`h-2 w-0.5 ${idx === 0 ? "bg-transparent" : "bg-dark-100"}`} />

                {/* Circle */}
                <View className="size-10 rounded-xl bg-court-deep items-center justify-center">
                  <Text className="text-court-lime font-bold text-base">
                    {g.count}
                  </Text>
                </View>

                {/* Bottom connector */}
                <View className={`flex-1 w-0.5 ${isLast ? "bg-transparent" : "bg-dark-100"}`} />
              </View>

              {/* Card */}
              <View className="flex-1 bg-secondary border border-dark-100 rounded-xl overflow-hidden">
                <View className="px-4 py-3 border-b border-dark-100">
                  <Text className="text-light-100 font-bold text-sm">
                    {g.players.length} player{g.players.length === 1 ? "" : "s"}
                  </Text>
                  <Text className="text-light-300 text-xs">
                    {g.count} game{g.count === 1 ? "" : "s"} completed
                  </Text>
                </View>

                <View className="px-4 py-3 gap-2">
                  {g.players.map((p) => {
                    const meta = statusByPlayerId[p.id];
                    const status = meta?.status ?? "bench";
                    const pillLabel =
                      status === "in_game" && meta?.courtName
                        ? `${statusLabel[status]} · ${meta.courtName}`
                        : statusLabel[status];
                    return (
                      <View
                        key={p.id}
                        className="flex-row items-center justify-between gap-3"
                      >
                        <Text className="text-light-100 text-sm font-medium flex-1" numberOfLines={1}>
                          {p.name}
                        </Text>
                        <View
                          className={`px-2.5 py-1 rounded-lg border ${statusPillClass[status]}`}
                        >
                          <Text
                            className={`text-xs font-bold ${statusTextClass[status]}`}
                          >
                            {pillLabel}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
