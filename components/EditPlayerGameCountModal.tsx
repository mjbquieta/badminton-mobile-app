import { BadmintonPalette } from "@/constants/palette";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const EditPlayerGameCountModal = ({
  visible,
  onClose,
  onSave,
  playerName,
  currentGameCount,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (gameCount: number) => void;
  playerName: string;
  currentGameCount: number;
}) => {
  const [count, setCount] = useState(currentGameCount);

  useEffect(() => {
    if (!visible) return;
    Keyboard.dismiss();
    setCount(currentGameCount);
  }, [visible, currentGameCount]);

  const handleSave = () => {
    onSave(count);
    onClose();
  };

  const hasChanged = count !== currentGameCount;

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
              Edit Games Played
            </Text>
            <Text
              className="text-sm mt-0.5"
              style={{ color: BadmintonPalette.text.muted }}
            >
              Change game count for {playerName}
            </Text>
          </View>

          {/* Counter */}
          <View className="p-6 items-center">
            <View className="flex-row items-center" style={{ gap: 16 }}>
              {/* Decrement */}
              <TouchableOpacity
                onPress={() => setCount((c) => Math.max(0, c - 1))}
                disabled={count <= 0}
                className="size-14 rounded-xl items-center justify-center border"
                style={{
                  backgroundColor:
                    count > 0
                      ? `${BadmintonPalette.accent.danger}15`
                      : BadmintonPalette.bg.elevated,
                  borderColor:
                    count > 0
                      ? `${BadmintonPalette.accent.danger}30`
                      : BadmintonPalette.bg.elevated,
                }}
                accessibilityRole="button"
                accessibilityLabel="Decrease game count"
              >
                <AntDesign
                  name="minus"
                  size={22}
                  color={
                    count > 0
                      ? BadmintonPalette.accent.danger
                      : BadmintonPalette.text.muted
                  }
                />
              </TouchableOpacity>

              {/* Count Display */}
              <View className="items-center" style={{ minWidth: 80 }}>
                <Text
                  className="text-5xl font-bold"
                  style={{ color: BadmintonPalette.court.lime }}
                >
                  {count}
                </Text>
                <Text
                  className="text-xs mt-1"
                  style={{ color: BadmintonPalette.text.muted }}
                >
                  {count === 1 ? "game" : "games"}
                </Text>
              </View>

              {/* Increment */}
              <TouchableOpacity
                onPress={() => setCount((c) => c + 1)}
                className="size-14 rounded-xl items-center justify-center border"
                style={{
                  backgroundColor: `${BadmintonPalette.accent.success}15`,
                  borderColor: `${BadmintonPalette.accent.success}30`,
                }}
                accessibilityRole="button"
                accessibilityLabel="Increase game count"
              >
                <AntDesign
                  name="plus"
                  size={22}
                  color={BadmintonPalette.accent.success}
                />
              </TouchableOpacity>
            </View>

            {/* Current value indicator */}
            {hasChanged && (
              <View className="flex-row items-center mt-4 px-3 py-1.5 rounded-full bg-dark-200 border border-dark-100">
                <MaterialCommunityIcons
                  name="history"
                  size={14}
                  color={BadmintonPalette.text.muted}
                />
                <Text
                  className="text-xs ml-1.5"
                  style={{ color: BadmintonPalette.text.muted }}
                >
                  Was {currentGameCount}
                </Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <View
            className="flex-row items-center p-4 border-t border-dark-100"
            style={{ gap: 12 }}
          >
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
                hasChanged ? "bg-accent active:opacity-80" : "bg-dark-100",
              ].join(" ")}
              onPress={handleSave}
              disabled={!hasChanged}
              accessibilityRole="button"
              accessibilityLabel="Save game count"
            >
              <Text
                className="font-bold"
                style={{
                  color: hasChanged
                    ? BadmintonPalette.bg.base
                    : BadmintonPalette.text.muted,
                }}
              >
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default EditPlayerGameCountModal;
