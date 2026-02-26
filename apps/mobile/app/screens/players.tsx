import AddPInput from "@/components/AddInput";
import ConfirmationAlert from "@/components/ConfirmationAlert";
import PlayerCard from "@/components/PlayerCard";
import AddPlayerScreen from "@/components/players/AddPlayerScreen";
import EditPlayerScreen from "@/components/players/EditPlayerScreen";
import ImportPlayersScreen from "@/components/players/ImportPlayersScreen";
import { useToast } from "@/components/Toast";
import { BadmintonPalette } from "@/constants/palette";
import {
  type RootState,
  useAppDispatch,
  useAppSelector,
  addPlayer,
  clearPlayers,
  clearPlayersError,
  removePlayer,
  setPlayersActive,
  togglePlayerActive,
  updatePlayerGameCount,
  updatePlayerLevel,
} from "@badminton/store";
import { Player, PlayerLevel } from "@badminton/types";
import { useAuth } from "@/contexts/AuthContext";
import { UNVERIFIED_LIMITS } from "@badminton/ui-shared";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import "react-native-get-random-values";
import { SafeAreaView } from "react-native-safe-area-context";
import { v4 as uuidv4 } from "uuid";

const levelLabels: Record<PlayerLevel, string> = {
  [PlayerLevel.BEGINNER]: "Beginner",
  [PlayerLevel.INTERMEDIATE]: "Intermediate",
  [PlayerLevel.ADVANCED]: "Advanced",
  [PlayerLevel.PRO]: "Pro",
};

export const PlayersContent = ({
  contentContainerClassName = "p-6",
}: {
  contentContainerClassName?: string;
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"name" | "level" | "games" | "trophies">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive">("all");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  // Multi-select state
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showMenu, setShowMenu] = useState(false);

  const { emailVerified, isAdmin } = useAuth();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
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

  const statusMetaById = useMemo(() => {
    const map: Record<
      string,
      { status: "in_game" | "bench"; courtName?: string }
    > = {};

    for (const p of players) map[p.id] = { status: "bench" };

    for (const c of courts) {
      for (const p of c.players) {
        map[p.id] = { status: "in_game", courtName: c.name };
      }
    }

    return map;
  }, [players, courts]);

  const levelOrder: Record<PlayerLevel, number> = {
    [PlayerLevel.BEGINNER]: 0,
    [PlayerLevel.INTERMEDIATE]: 1,
    [PlayerLevel.ADVANCED]: 2,
    [PlayerLevel.PRO]: 3,
  };

  const activeCounts = useMemo(() => {
    let active = 0;
    let inactive = 0;
    for (const p of players) {
      if (p.active ?? true) active++;
      else inactive++;
    }
    return { active, inactive };
  }, [players]);

  const filteredPlayers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = players.filter((p) => {
      const isActive = p.active ?? true;
      if (activeTab === "active" && !isActive) return false;
      if (activeTab === "inactive" && isActive) return false;
      return !q || p.name.trim().toLowerCase().includes(q);
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return dir * a.name.localeCompare(b.name);
        case "level":
          return dir * (levelOrder[a.level] - levelOrder[b.level]);
        case "games":
          return dir * (a.gameCount - b.gameCount);
        case "trophies":
          return dir * ((a.trophies ?? 0) - (b.trophies ?? 0));
        default:
          return 0;
      }
    });
  }, [players, searchQuery, sortBy, sortDir, activeTab]);

  useEffect(() => {
    if (!sliceError) return;
    Alert.alert("Error", sliceError, [
      { text: "OK", onPress: () => dispatch(clearPlayersError()) },
    ]);
  }, [sliceError, dispatch]);

  const handleAddPlayer = (name: string, level: PlayerLevel) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    dispatch(addPlayer({ id: uuidv4(), name, level, maxPlayers: emailVerified ? undefined : UNVERIFIED_LIMITS.MAX_PLAYERS }));
    showToast({
      message: `${name} added as ${levelLabels[level]}`,
      type: "success",
    });
  };

  const handleUpdatePlayer = (
    playerId: string,
    newLevel: PlayerLevel,
    newGameCount: number
  ) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    if (player.level !== newLevel) {
      dispatch(updatePlayerLevel({ id: playerId, level: newLevel }));
    }
    if (player.gameCount !== newGameCount) {
      dispatch(updatePlayerGameCount({ id: playerId, gameCount: newGameCount }));
    }
    showToast({
      message: `${player.name} updated`,
      type: "success",
    });
  };

  // ── Sub-screen early returns ──

  if (editingPlayer) {
    return (
      <EditPlayerScreen
        playerName={editingPlayer.name}
        currentLevel={editingPlayer.level}
        currentGameCount={editingPlayer.gameCount}
        onSave={(level, gameCount) => {
          handleUpdatePlayer(editingPlayer.id, level, gameCount);
        }}
        onBack={() => setEditingPlayer(null)}
      />
    );
  }

  if (showAddModal) {
    return (
      <AddPlayerScreen
        onAdd={handleAddPlayer}
        onBack={() => setShowAddModal(false)}
      />
    );
  }

  if (showImportModal) {
    return (
      <ImportPlayersScreen
        onImport={(entries) => {
          let imported = 0;
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          for (const entry of entries) {
            dispatch(
              addPlayer({
                id: uuidv4(),
                name: entry.name,
                level: entry.level,
                maxPlayers: emailVerified
                  ? undefined
                  : UNVERIFIED_LIMITS.MAX_PLAYERS,
              })
            );
            imported++;
          }
          showToast({
            message: `Imported ${imported} players`,
            type: "success",
          });
          return { imported, skipped: 0 };
        }}
        onBack={() => setShowImportModal(false)}
      />
    );
  }

  return (
    <View className={`flex-1 bg-primary ${contentContainerClassName}`}>
      {/* Add Player Button */}
      {isAdmin && (
        <View className="mb-6">
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            className="flex-row items-center justify-center py-3.5 rounded-2xl"
            style={{ backgroundColor: BadmintonPalette.accent.primary }}
            accessibilityRole="button"
            accessibilityLabel="Add player"
          >
            <AntDesign name="plus" size={18} color={BadmintonPalette.bg.base} />
            <Text
              className="text-base font-bold ml-2"
              style={{ color: BadmintonPalette.bg.base }}
            >
              Add Player
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Players List */}
      {players.length > 0 && (
        <>
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Text
                className="text-lg font-bold mr-2"
                style={{ color: BadmintonPalette.text.primary }}
              >
                Players
              </Text>
              <View
                className="px-2 py-0.5 rounded-md"
                style={{ backgroundColor: `${BadmintonPalette.court.lime}20` }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{ color: BadmintonPalette.court.lime }}
                >
                  {players.length}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setShowMenu(true)}
              className="w-10 h-10 rounded-xl border border-dark-100 bg-secondary items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel="More options"
            >
              <MaterialCommunityIcons
                name="dots-vertical"
                size={20}
                color={BadmintonPalette.text.secondary}
              />
            </TouchableOpacity>
          </View>

          {/* Status Tabs */}
          <View className="flex-row mb-4 rounded-xl bg-dark-200 p-1" style={{ gap: 4 }}>
            {(["all", "active", "inactive"] as const).map((tab) => {
              const count =
                tab === "all"
                  ? players.length
                  : tab === "active"
                    ? activeCounts.active
                    : activeCounts.inactive;
              const isSelected = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  className={`flex-1 py-2 px-3 rounded-lg items-center ${
                    isSelected ? "bg-secondary" : ""
                  }`}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    className="text-xs font-bold capitalize"
                    style={{
                      color: isSelected
                        ? BadmintonPalette.text.primary
                        : BadmintonPalette.text.muted,
                    }}
                  >
                    {tab} ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View className="mb-4">
            <AddPInput
              type="search"
              placeholder="Search players..."
              value={searchQuery}
              onChangeText={(text) => setSearchQuery(text)}
            />
          </View>

          <View className="flex-row items-center gap-2 mb-4">
            {(["name", "level", "games", "trophies"] as const).map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  if (sortBy === option) {
                    setSortDir(sortDir === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy(option);
                    setSortDir("asc");
                  }
                }}
                className={`flex-row items-center px-3 py-1.5 rounded-lg border ${
                  sortBy === option
                    ? "border-accent/50 bg-accent/10"
                    : "border-dark-100 bg-dark-200"
                }`}
              >
                <Text
                  className="text-xs font-semibold capitalize"
                  style={{
                    color: sortBy === option
                      ? BadmintonPalette.accent.primary
                      : BadmintonPalette.text.secondary,
                  }}
                >
                  {option}
                </Text>
                {sortBy === option && (
                  <Text
                    className="text-xs ml-1"
                    style={{ color: BadmintonPalette.accent.primary }}
                  >
                    {sortDir === "asc" ? "↑" : "↓"}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Select All / Deselect All */}
          {selecting && filteredPlayers.length > 0 && (
            <View className="flex-row items-center justify-between mb-3">
              <Text
                className="text-xs"
                style={{ color: BadmintonPalette.text.muted }}
              >
                {selectedIds.size} selected
              </Text>
              <View className="flex-row" style={{ gap: 12 }}>
                <TouchableOpacity
                  onPress={() =>
                    setSelectedIds(new Set(filteredPlayers.map((p) => p.id)))
                  }
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: BadmintonPalette.accent.primary }}
                  >
                    Select All
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedIds(new Set())}>
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: BadmintonPalette.text.muted }}
                  >
                    Deselect All
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <FlatList
            data={filteredPlayers}
            renderItem={({ item }) =>
              selecting ? (
                <PlayerCard
                  player={item}
                  name={item.name}
                  gameCount={item.gameCount}
                  level={item.level}
                  status={statusMetaById[item.id]?.status ?? "bench"}
                  inactive={!(item.active ?? true)}
                  selected={selectedIds.has(item.id)}
                  onSelect={() =>
                    setSelectedIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(item.id)) next.delete(item.id);
                      else next.add(item.id);
                      return next;
                    })
                  }
                />
              ) : (
                <PlayerCard
                  player={item}
                  name={item.name}
                  gameCount={item.gameCount}
                  level={item.level}
                  status={statusMetaById[item.id]?.status ?? "bench"}
                  courtName={statusMetaById[item.id]?.courtName}
                  inactive={!(item.active ?? true)}
                  onToggleActive={isAdmin ? () => dispatch(togglePlayerActive(item.id)) : undefined}
                  onEdit={isAdmin ? () => setEditingPlayer(item) : undefined}
                  onDelete={isAdmin ? () => {
                    const meta = statusMetaById[item.id];
                    const status = meta?.status ?? "bench";

                    if (status === "in_game") {
                      Alert.alert(
                        "Cannot delete",
                        `${item.name} is in a game${
                          meta?.courtName ? ` on ${meta.courtName}` : ""
                        }. End the game first.`
                      );
                      return;
                    }

                    ConfirmationAlert({
                      title: "Delete Player",
                      message: `Remove ${item.name}?`,
                      onConfirm: () => {
                        LayoutAnimation.configureNext(
                          LayoutAnimation.Presets.spring
                        );
                        dispatch(removePlayer(item.id));
                      },
                    });
                  } : undefined}
                />
              )
            }
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 10, paddingBottom: 40 }}
            ListEmptyComponent={
              <View className="bg-secondary border border-dark-100 rounded-2xl p-6 items-center">
                <Text
                  className="text-sm text-center"
                  style={{ color: BadmintonPalette.text.muted }}
                >
                  No players match "{searchQuery.trim()}"
                </Text>
              </View>
            }
            className="mb-20"
          />
        </>
      )}

      {players.length === 0 && (
        <View className="flex-1 items-center justify-center pb-20">
          <View className="size-16 rounded-2xl bg-secondary border border-dark-100 items-center justify-center mb-4">
            <AntDesign
              name="team"
              size={32}
              color={BadmintonPalette.text.muted}
            />
          </View>
          <Text
            className="text-lg font-bold mb-1"
            style={{ color: BadmintonPalette.text.primary }}
          >
            No Players Yet
          </Text>
          <Text
            className="text-sm text-center"
            style={{ color: BadmintonPalette.text.muted }}
          >
            Tap "Add Player" to add your first player
          </Text>
        </View>
      )}

      {/* Selection Action Bar */}
      {selecting && selectedIds.size > 0 && (
        <View
          className="absolute bottom-0 left-0 right-0 bg-secondary border-t border-dark-100 px-4 py-3"
          style={{ paddingBottom: 24 }}
        >
          <Text
            className="text-xs font-semibold mb-3"
            style={{ color: BadmintonPalette.text.secondary }}
          >
            {selectedIds.size} player{selectedIds.size !== 1 ? "s" : ""} selected
          </Text>
          <View className="flex-row" style={{ gap: 8 }}>
            <TouchableOpacity
              onPress={() => {
                dispatch(
                  setPlayersActive({ ids: [...selectedIds], active: true })
                );
                setSelectedIds(new Set());
                setSelecting(false);
              }}
              className="flex-1 py-3 rounded-xl bg-success/10 border border-success/30 items-center active:bg-success/20"
            >
              <Text
                className="text-sm font-bold"
                style={{ color: BadmintonPalette.accent.success }}
              >
                Set Active
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                dispatch(
                  setPlayersActive({ ids: [...selectedIds], active: false })
                );
                setSelectedIds(new Set());
                setSelecting(false);
              }}
              className="flex-1 py-3 rounded-xl bg-warning/10 border border-warning/30 items-center active:bg-warning/20"
            >
              <Text
                className="text-sm font-bold"
                style={{ color: BadmintonPalette.accent.warning }}
              >
                Set Inactive
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Ellipsis Menu (inline overlay) */}
      {showMenu && (
        <>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowMenu(false)}
          />
          <View
            className="w-48 bg-secondary border border-dark-100 rounded-2xl overflow-hidden"
            style={{
              position: "absolute",
              top: 52,
              right: 0,
              zIndex: 10,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            {players.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSelecting(!selecting);
                  setSelectedIds(new Set());
                  setShowMenu(false);
                }}
                className="flex-row items-center px-4 py-3.5 border-b border-dark-100"
                accessibilityRole="button"
              >
                <MaterialCommunityIcons
                  name={selecting ? "close" : "checkbox-multiple-outline"}
                  size={18}
                  color={selecting ? BadmintonPalette.accent.primary : BadmintonPalette.text.secondary}
                />
                <Text
                  className="text-sm font-semibold ml-3"
                  style={{
                    color: selecting
                      ? BadmintonPalette.accent.primary
                      : BadmintonPalette.text.primary,
                  }}
                >
                  {selecting ? "Cancel Select" : "Select"}
                </Text>
              </TouchableOpacity>
            )}
            {isAdmin && (
              <TouchableOpacity
                onPress={() => {
                  setShowImportModal(true);
                  setShowMenu(false);
                }}
                className="flex-row items-center px-4 py-3.5 border-b border-dark-100"
                accessibilityRole="button"
              >
                <AntDesign
                  name="download"
                  size={18}
                  color={BadmintonPalette.text.secondary}
                />
                <Text
                  className="text-sm font-semibold ml-3"
                  style={{ color: BadmintonPalette.text.primary }}
                >
                  Import
                </Text>
              </TouchableOpacity>
            )}
            {isAdmin && players.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setShowMenu(false);
                  const courtsWithPlayers = courts.filter(
                    (c) => c.players.length > 0
                  );
                  if (courtsWithPlayers.length > 0) {
                    const names = courtsWithPlayers.map((c) => c.name).join(", ");
                    Alert.alert(
                      "Cannot clear players",
                      `Some players are in games (${names}). End the games first.`
                    );
                    return;
                  }
                  ConfirmationAlert({
                    title: "Clear All Players",
                    message: "Remove all players from the list?",
                    onConfirm: () => {
                      LayoutAnimation.configureNext(
                        LayoutAnimation.Presets.spring
                      );
                      dispatch(clearPlayers());
                    },
                  });
                }}
                className="flex-row items-center px-4 py-3.5"
                accessibilityRole="button"
              >
                <MaterialCommunityIcons
                  name="delete-sweep"
                  size={18}
                  color={BadmintonPalette.accent.danger}
                />
                <Text
                  className="text-sm font-semibold ml-3"
                  style={{ color: BadmintonPalette.accent.danger }}
                >
                  Clear All
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </View>
  );
};

const players = () => {
  return (
    <SafeAreaView className="flex-1 bg-primary">
      <PlayersContent contentContainerClassName="p-6" />
    </SafeAreaView>
  );
};

export default players;
