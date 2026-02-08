import { BadmintonPalette } from "@/constants/palette";
import type { PlayerLevel } from "@/types/players";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PlayerTag from "./PlayerTag";

export type QueueGroup = {
  index: number;
  ids: string[];
  players: {
    id: string;
    name: string;
    level?: PlayerLevel;
    gameCount?: number;
  }[];
};

const SelectQueueGroupModal = ({
  visible,
  onClose,
  courtName,
  queueGroups,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  courtName: string;
  queueGroups: QueueGroup[];
  onSelect: (group: QueueGroup) => void;
}) => {
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
              Assign to {courtName}
            </Text>
            <Text
              className="text-sm mt-1"
              style={{ color: BadmintonPalette.text.muted }}
            >
              Select a queue group to assign
            </Text>
          </View>

          {/* Queue Groups */}
          <ScrollView style={{ maxHeight: 400 }} contentContainerStyle={{ padding: 16, gap: 12 }}>
            {queueGroups.length === 0 ? (
              <View className="py-8 items-center">
                <MaterialCommunityIcons
                  name="timer-sand-empty"
                  size={40}
                  color={BadmintonPalette.text.muted}
                />
                <Text
                  className="text-sm mt-3 text-center"
                  style={{ color: BadmintonPalette.text.muted }}
                >
                  No groups in queue
                </Text>
              </View>
            ) : (
              queueGroups.map((group) => (
                <TouchableOpacity
                  key={`group-${group.index}`}
                  className="rounded-xl border border-dark-100 bg-dark-200 overflow-hidden active:bg-dark-100"
                  onPress={() => onSelect(group)}
                  accessibilityRole="button"
                  accessibilityLabel={`Assign queue group ${group.index + 1}`}
                >
                  <View className="flex-row items-center justify-between p-3 border-b border-dark-100">
                    <Text
                      className="text-sm font-bold"
                      style={{ color: BadmintonPalette.text.primary }}
                    >
                      Queue {group.index + 1}
                    </Text>
                    <View className="flex-row items-center px-2 py-1 rounded-md bg-success/15">
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: BadmintonPalette.accent.success }}
                      >
                        {group.players.length} players
                      </Text>
                    </View>
                  </View>
                  <View className="p-3 flex-row flex-wrap" style={{ gap: 6 }}>
                    {group.players.map((p) => (
                      <PlayerTag
                        key={p.id}
                        name={p.name}
                        level={p.level}
                        gameCount={p.gameCount}
                      />
                    ))}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          {/* Footer */}
          <View className="p-4 border-t border-dark-100">
            <TouchableOpacity
              className="py-3 rounded-xl border border-dark-100 bg-dark-200 items-center active:bg-dark-100"
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
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default SelectQueueGroupModal;
