import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { endGameAndAdvanceQueue, rollDice } from "@/store/thunks";
import React, { useEffect, useMemo, useRef } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type QueueCardVariant = "in_game" | "waiting";

const QueueCard = ({
  queueNumber,
  playersText,
  assignedCourtText,
  variant,
  onEndGame,
}: {
  queueNumber: number;
  playersText: string;
  assignedCourtText: string;
  variant: QueueCardVariant;
  onEndGame?: () => void;
}) => {
  const isInGame = variant === "in_game";
  const badgeLabel = isInGame ? "IN GAME" : "WAITING";
  const containerClass = isInGame
    ? "bg-dark-100 border border-accent"
    : "bg-secondary/60 border border-dark-100";
  const titleClass = isInGame ? "text-white" : "text-light-200";
  const playersClass = isInGame ? "text-white" : "text-light-200";
  const badgeClass = isInGame
    ? "bg-success/15 border-success/40 text-success"
    : "bg-secondary border-dark-100 text-light-200";

  return (
    <View className={`rounded-2xl p-4 gap-3 ${containerClass}`}>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text className={`${titleClass} text-xl font-extrabold`}>
            Queue {queueNumber}
          </Text>
          <Text className="text-light-200 text-xs font-bold">
            Assigned Court: {assignedCourtText}
          </Text>
        </View>

        <View className={`px-3 py-1 rounded-full border ${badgeClass}`}>
          <Text className="text-xs font-bold">{badgeLabel}</Text>
        </View>
      </View>

      <View className="gap-1">
        <Text className="text-light-200 text-xs font-bold uppercase">
          Players
        </Text>
        <Text className={`${playersClass} text-sm`}>{playersText}</Text>
      </View>

      {isInGame && onEndGame ? (
        <TouchableOpacity
          className="bg-success/90 px-4 py-2 rounded-full self-start"
          onPress={onEndGame}
          accessibilityRole="button"
          accessibilityLabel={`End game for queue ${queueNumber}`}
        >
          <Text className="text-primary text-sm font-bold">End Game</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const activity = () => {
  const dispatch = useAppDispatch();
  const players = useAppSelector((s) => s.players.items);
  const courts = useAppSelector((s) => s.courts.items);
  const queueIds = useAppSelector((s) => s.queue.ids);

  const doublesCourtsCount = useMemo(
    () => courts.filter((c) => !c.isSingle).length,
    [courts]
  );

  const fullGroupsRemaining = Math.floor(queueIds.length / 4);
  const isQueueAlmostEmpty =
    doublesCourtsCount > 0 && fullGroupsRemaining < doublesCourtsCount;

  const warnedRef = useRef(false);
  useEffect(() => {
    if (!isQueueAlmostEmpty) {
      warnedRef.current = false;
      return;
    }
    if (warnedRef.current) return;
    warnedRef.current = true;
    Alert.alert(
      "Queue almost empty",
      "The queue is almost empty. Please re-roll the dice to add more players from the bench.",
      [
        { text: "Not now", style: "cancel" },
        { text: "Roll Dice", onPress: () => dispatch(rollDice()) },
      ]
    );
  }, [isQueueAlmostEmpty, dispatch]);

  const playerMap = useMemo(() => {
    const m = new Map(players.map((p) => [p.id, p]));
    return m;
  }, [players]);

  const queueGroups = useMemo(() => {
    const groups: { ids: string[]; index: number }[] = [];
    for (let i = 0; i < queueIds.length; i += 4) {
      const ids = queueIds.slice(i, i + 4);
      // Safety: only show full queues of 4.
      if (ids.length === 4) groups.push({ ids, index: i / 4 });
    }
    return groups;
  }, [queueIds]);

  const doublesCourts = useMemo(
    () => courts.filter((c) => !c.isSingle),
    [courts]
  );

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 40, gap: 20, paddingBottom: 140 }}
      >
        <Text className="text-white text-2xl font-bold text-center">
          Activity
        </Text>

        {isQueueAlmostEmpty ? (
          <View className="bg-dark-200 border border-accent rounded-xl p-4 gap-3">
            <Text className="text-white font-bold">
              Queue is almost empty — re-roll dice to add more players.
            </Text>
            <TouchableOpacity
              className="bg-accent/90 px-3 py-2 rounded-full self-start"
              onPress={() => dispatch(rollDice())}
              accessibilityRole="button"
              accessibilityLabel="Roll dice"
            >
              <Text className="text-primary text-sm font-bold">Roll Dice</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View className="bg-dark-200 border border-dark-100 rounded-2xl p-4 gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-lg font-bold">In Game</Text>
            <Text className="text-light-200 text-sm">
              {doublesCourts.length} courts assigned
            </Text>
          </View>

          <View className="gap-3">
            {/* Assigned (in-game) groups on doubles courts */}
            {doublesCourts.map((court, idx) => {
              const names = court.players.map((p) => p.name).join(", ");
              return (
                <QueueCard
                  key={court.id}
                  queueNumber={idx + 1}
                  playersText={
                    court.players.length === 0 ? "No players assigned" : names
                  }
                  assignedCourtText={court.name}
                  variant="in_game"
                  onEndGame={
                    court.players.length > 0
                      ? () => {
                          const result = dispatch(
                            endGameAndAdvanceQueue(court.id)
                          ) as any;
                          if (result?.warnedQueueEmpty) {
                            Alert.alert(
                              "Queue almost empty",
                              "The queue is almost empty. Please re-roll the dice to add more players from the bench."
                            );
                          }
                        }
                      : undefined
                  }
                />
              );
            })}

            {doublesCourts.length === 0 && queueGroups.length === 0 ? (
              <Text className="text-light-200 text-sm">
                No doubles courts and no queues yet.
              </Text>
            ) : null}
          </View>
        </View>

        {/* Waiting queue groups (FIFO) */}
        {queueGroups.length > 0 ? (
          <View className="gap-3 bg-dark-200 border border-dark-100 rounded-2xl p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-white text-lg font-bold">Queue</Text>
              <Text className="text-light-200 text-sm">
                {queueGroups.length} groups waiting
              </Text>
            </View>
            {queueGroups.map((g) => {
              const names = g.ids
                .map((id) => playerMap.get(id)?.name ?? "Unknown")
                .join(", ");
              return (
                <QueueCard
                  key={`waiting-${g.index}`}
                  queueNumber={doublesCourts.length + g.index + 1}
                  playersText={names}
                  assignedCourtText="Waiting"
                  variant="waiting"
                />
              );
            })}
          </View>
        ) : null}
      </ScrollView>

      {/* <TouchableOpacity
        className="absolute bottom-24 right-6 bg-dark-200 h-16 w-16 rounded-full overflow-hidden shadow-md items-center justify-center border border-accent"
        onPress={() => dispatch(rollDice())}
        accessibilityRole="button"
        accessibilityLabel="Roll dice"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        <FontAwesome5 name="dice" size={26} color={PotatoPalette.accent.gold} />
      </TouchableOpacity> */}
    </SafeAreaView>
  );
};

export default activity;
