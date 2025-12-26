import { type Player } from "@/types/players";
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

  useEffect(() => {
    if (!visible) return;
    setSelectedIds([]);
  }, [visible, title]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

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
        className="flex-1 items-center justify-center bg-black/60 px-5"
        onPress={onClose}
      >
        <Pressable
          className="w-full max-w-xl rounded-2xl bg-dark-200 border border-dark-100 p-4 gap-3"
          onPress={() => {}}
        >
          <View className="gap-1">
            <Text className="text-white text-lg font-bold">{title}</Text>
            <Text className="text-light-200 text-sm">
              Select up to {maxSelect} player{maxSelect === 1 ? "" : "s"} (
              {selectedIds.length}/{maxSelect})
            </Text>
          </View>

          {players.length === 0 ? (
            <View className="py-6">
              <Text className="text-light-200 text-sm text-center">
                No available players (everyone is already on a court).
              </Text>
            </View>
          ) : (
            <FlatList
              data={players}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: 360 }}
              contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
              renderItem={({ item }) => {
                const isSelected = selectedSet.has(item.id);
                const isDisabled =
                  !isSelected && selectedIds.length >= maxSelect;
                return (
                  <Pressable
                    onPress={() => (isDisabled ? null : toggle(item.id))}
                    className={[
                      "flex-row items-center justify-between rounded-xl border px-3 py-3",
                      isSelected
                        ? "bg-primary border-accent"
                        : "bg-dark-100 border-dark-100",
                      isDisabled ? "opacity-50" : "",
                    ].join(" ")}
                    accessibilityRole="button"
                    accessibilityLabel={`Select player ${item.name}`}
                  >
                    <Text className="text-white font-semibold">
                      {item.name}
                    </Text>
                    <MaterialCommunityIcons
                      name={
                        isSelected
                          ? "checkbox-marked"
                          : "checkbox-blank-outline"
                      }
                      size={22}
                      color={isSelected ? "#00A300" : "#9CA3AF"}
                    />
                  </Pressable>
                );
              }}
            />
          )}

          <View className="flex-row items-center justify-end gap-2 pt-2">
            <TouchableOpacity
              className="px-4 py-2 rounded-full border border-gray-700 bg-gray-800"
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close manual add players modal"
            >
              <Text className="text-gray-200 font-bold">Close</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={[
                "px-4 py-2 rounded-full border",
                selectedIds.length > 0
                  ? "bg-accent border-accent"
                  : "bg-gray-800 border-gray-700",
              ].join(" ")}
              onPress={() => onConfirm(selectedIds)}
              disabled={selectedIds.length === 0}
              accessibilityRole="button"
              accessibilityLabel="Confirm add selected players"
            >
              <Text
                className={[
                  "font-bold",
                  selectedIds.length > 0 ? "text-dark-200" : "text-gray-400",
                ].join(" ")}
              >
                Add Players
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ManualAddPlayersModal;
