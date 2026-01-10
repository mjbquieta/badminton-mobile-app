import AddInput from "@/components/AddInput";
import PlayerLevelBadge from "@/components/PlayerLevelBadge";
import { BadmintonPalette } from "@/constants/palette";
import { type Player } from "@/types/players";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ManualAddPlayersModal = ({
  visible,
  onClose,
  title,
  players,
  maxSelect,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  players: Player[];
  maxSelect: number;
  onConfirm: (selectedPlayerIds: string[]) => void;
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState<string>("");

  useEffect(() => {
    if (!visible) return;
    setSelectedIds([]);
    setQuery("");
  }, [visible, title]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const filteredPlayers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter((p) => p.name.toLowerCase().includes(q));
  }, [players, query]);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const isSelected = prev.includes(id);
      if (isSelected) return prev.filter((x) => x !== id);
      if (prev.length >= maxSelect) return prev;
      return [...prev, id];
    });
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/70 px-5"
        onPress={onClose}
      >
        <Pressable
          className="w-full max-w-xl rounded-2xl bg-secondary border border-dark-100 overflow-hidden"
          onPress={() => {}}
        >
          {/* Header */}
          <View className="p-4 border-b border-dark-100">
            <Text 
              className="text-lg font-bold"
              style={{ color: BadmintonPalette.text.primary }}
            >
              {title}
            </Text>
            <View className="flex-row items-center mt-1">
              <View className="flex-row items-center px-2 py-0.5 rounded-md bg-accent/15 mr-2">
                <Text 
                  className="text-xs font-semibold"
                  style={{ color: BadmintonPalette.accent.primary }}
                >
                  {selectedIds.length}/{maxSelect}
                </Text>
              </View>
              <Text 
                className="text-sm"
                style={{ color: BadmintonPalette.text.muted }}
              >
                player{maxSelect === 1 ? "" : "s"} selected
              </Text>
            </View>
          </View>

          {/* Search */}
          <View className="p-4 border-b border-dark-100">
            <AddInput
              type="search"
              placeholder="Search players..."
              value={query}
              onChangeText={setQuery}
            />
          </View>

          {/* Player List */}
          <View className="px-4">
            {players.length === 0 ? (
              <View className="py-10">
                <Text 
                  className="text-sm text-center"
                  style={{ color: BadmintonPalette.text.muted }}
                >
                  No available players{"\n"}
                  (everyone is in a game or queue)
                </Text>
              </View>
            ) : filteredPlayers.length === 0 ? (
              <View className="py-10">
                <Text 
                  className="text-sm text-center"
                  style={{ color: BadmintonPalette.text.muted }}
                >
                  No players match "{query.trim()}"
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredPlayers}
                keyExtractor={(item) => item.id}
                style={{ maxHeight: 320 }}
                contentContainerStyle={{ gap: 8, paddingVertical: 12 }}
                renderItem={({ item }) => {
                  const isSelected = selectedSet.has(item.id);
                  const isDisabled =
                    !isSelected && selectedIds.length >= maxSelect;
                  return (
                    <Pressable
                      onPress={() => (isDisabled ? null : toggle(item.id))}
                      className={[
                        "flex-row items-center rounded-xl border p-3",
                        isSelected
                          ? "bg-court-deep/20 border-court-lime/40"
                          : "bg-dark-200 border-dark-100",
                        isDisabled ? "opacity-40" : "",
                      ].join(" ")}
                      accessibilityRole="button"
                      accessibilityLabel={`Select player ${item.name}`}
                    >
                      {/* Avatar */}
                      <View className="size-10 rounded-lg bg-court-deep/20 items-center justify-center mr-3">
                        <AntDesign
                          name="user"
                          size={16}
                          color={BadmintonPalette.court.lime}
                        />
                      </View>

                      {/* Info */}
                      <View className="flex-1">
                        <Text
                          className="font-semibold"
                          style={{ color: BadmintonPalette.text.primary }}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <Text 
                            className="text-xs mr-2"
                            style={{ color: BadmintonPalette.text.muted }}
                          >
                            {item.gameCount} games
                          </Text>
                          <PlayerLevelBadge level={item.level} size="xs" />
                        </View>
                      </View>

                      {/* Checkbox */}
                      <View
                        className={[
                          "size-6 rounded-lg items-center justify-center",
                          isSelected ? "bg-court-lime" : "bg-dark-100 border border-dark-100",
                        ].join(" ")}
                      >
                        {isSelected && (
                          <MaterialCommunityIcons
                            name="check"
                            size={16}
                            color={BadmintonPalette.bg.base}
                          />
                        )}
                      </View>
                    </Pressable>
                  );
                }}
              />
            )}
          </View>

          {/* Footer */}
          <View className="flex-row items-center p-4 border-t border-dark-100" style={{ gap: 12 }}>
            <TouchableOpacity
              className="flex-1 py-3 rounded-xl border border-dark-100 bg-dark-200 items-center active:bg-dark-100"
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text 
                className="font-bold"
                style={{ color: BadmintonPalette.text.secondary }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={[
                "flex-1 py-3 rounded-xl items-center",
                selectedIds.length > 0
                  ? "bg-accent active:opacity-80"
                  : "bg-dark-100",
              ].join(" ")}
              onPress={() => onConfirm(selectedIds)}
              disabled={selectedIds.length === 0}
              accessibilityRole="button"
              accessibilityLabel="Add selected players"
            >
              <Text
                className="font-bold"
                style={{ 
                  color: selectedIds.length > 0 
                    ? BadmintonPalette.bg.base 
                    : BadmintonPalette.text.muted 
                }}
              >
                Add {selectedIds.length > 0 ? `(${selectedIds.length})` : "Players"}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ManualAddPlayersModal;
