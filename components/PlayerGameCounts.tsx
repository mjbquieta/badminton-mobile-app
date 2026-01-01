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
  in_game: "bg-success/20 border-success/50",
  waiting: "bg-secondary/80 border-dark-100",
  bench: "bg-dark-100/60 border-dark-100",
};

const statusTextClass: Record<PlayerLiveStatus, string> = {
  in_game: "text-success",
  waiting: "text-light-100",
  bench: "text-light-200",
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
      <View className="bg-dark-200 border border-dark-100 rounded-2xl p-4">
        <Text className="text-light-200 text-sm">No players yet.</Text>
      </View>
    );
  }

  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-2">
        <MaterialCommunityIcons name="party-popper" size={24} color="white" />
        <Text className="text-white text-lg font-extrabold">
          Player Game Counts
        </Text>
      </View>

      <View className="gap-4">
        {groups.map((g, idx) => {
          const isLast = idx === groups.length - 1;
          return (
            <View
              key={`gamecount-${g.count}`}
              className="flex-row items-stretch gap-4"
            >
              {/* Timeline */}
              <View className="w-14 items-center">
                {/* Top connector */}
                {idx === 0 ? (
                  <View className="h-2 w-0.5 bg-transparent" />
                ) : (
                  <View className="h-2 w-0.5 bg-dark-100" />
                )}

                {/* Circle */}
                <View className="h-12 w-12 rounded-full bg-dark-200 border-4 border-accent items-center justify-center">
                  <Text className="text-white font-extrabold text-base">
                    {g.count}
                  </Text>
                </View>

                {/* Bottom connector */}
                {!isLast ? (
                  <View className="flex-1 w-0.5 bg-dark-100" />
                ) : (
                  <View className="flex-1 w-0.5 bg-transparent" />
                )}
              </View>

              {/* Card */}
              <View className="flex-1 bg-dark-200 border border-dark-100 rounded-2xl overflow-hidden">
                <View className="bg-dark-200 px-4 py-3 border-b border-dark-100">
                  <Text className="text-white font-extrabold text-base">
                    {g.players.length} player{g.players.length === 1 ? "" : "s"}
                  </Text>
                  <Text className="text-light-200 text-xs font-bold">
                    Games finished: {g.count}
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
                        <Text className="text-white text-sm font-semibold flex-1">
                          {p.name}
                        </Text>
                        <View
                          className={`px-3 py-1 rounded-full border ${statusPillClass[status]}`}
                        >
                          <Text
                            className={`text-sm font-extrabold ${statusTextClass[status]}`}
                          >
                            {pillLabel}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Right accent bar */}
                <View className="absolute right-0 top-0 bottom-0 w-2 bg-accent/80" />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
