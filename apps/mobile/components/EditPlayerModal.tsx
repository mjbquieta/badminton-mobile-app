import { BadmintonPalette } from "@/constants/palette";
import { PlayerLevel } from "@badminton/types";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const levelOptions: { value: PlayerLevel; label: string; color: string }[] = [
  {
    value: PlayerLevel.BEGINNER,
    label: "Beginner",
    color: BadmintonPalette.levels.beginner,
  },
  {
    value: PlayerLevel.INTERMEDIATE,
    label: "Intermediate",
    color: BadmintonPalette.levels.intermediate,
  },
  {
    value: PlayerLevel.ADVANCED,
    label: "Advanced",
    color: BadmintonPalette.levels.advanced,
  },
  {
    value: PlayerLevel.PRO,
    label: "Pro",
    color: BadmintonPalette.levels.pro,
  },
];

const EditPlayerModal = ({
  visible,
  onClose,
  onSave,
  playerName,
  currentLevel,
  currentGameCount,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (level: PlayerLevel, gameCount: number) => void;
  playerName: string;
  currentLevel: PlayerLevel;
  currentGameCount: number;
}) => {
  const [selectedLevel, setSelectedLevel] = useState<PlayerLevel>(currentLevel);
  const [gameCount, setGameCount] = useState(currentGameCount);

  useEffect(() => {
    if (!visible) return;
    Keyboard.dismiss();
    setSelectedLevel(currentLevel);
    setGameCount(currentGameCount);
  }, [visible, currentLevel, currentGameCount]);

  const handleSave = () => {
    onSave(selectedLevel, gameCount);
    onClose();
  };

  const hasChanged =
    selectedLevel !== currentLevel || gameCount !== currentGameCount;

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
              Edit Player
            </Text>
            <Text
              className="text-sm mt-0.5"
              style={{ color: BadmintonPalette.text.muted }}
            >
              {playerName}
            </Text>
          </View>

          <ScrollView style={{ maxHeight: 480 }}>
            {/* Game Count Section */}
            <View className="p-4 border-b border-dark-100">
              <Text
                className="text-xs font-medium mb-3"
                style={{ color: BadmintonPalette.text.secondary }}
              >
                Games Played
              </Text>

              <View className="flex-row items-center justify-center" style={{ gap: 16 }}>
                {/* Decrement */}
                <TouchableOpacity
                  onPress={() => setGameCount((c) => Math.max(0, c - 1))}
                  disabled={gameCount <= 0}
                  className="size-12 rounded-xl items-center justify-center border"
                  style={{
                    backgroundColor:
                      gameCount > 0
                        ? `${BadmintonPalette.accent.danger}15`
                        : BadmintonPalette.bg.elevated,
                    borderColor:
                      gameCount > 0
                        ? `${BadmintonPalette.accent.danger}30`
                        : BadmintonPalette.bg.elevated,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Decrease game count"
                >
                  <AntDesign
                    name="minus"
                    size={20}
                    color={
                      gameCount > 0
                        ? BadmintonPalette.accent.danger
                        : BadmintonPalette.text.muted
                    }
                  />
                </TouchableOpacity>

                {/* Count Display */}
                <View className="items-center" style={{ minWidth: 60 }}>
                  <Text
                    className="text-4xl font-bold"
                    style={{ color: BadmintonPalette.court.lime }}
                  >
                    {gameCount}
                  </Text>
                  <Text
                    className="text-[10px]"
                    style={{ color: BadmintonPalette.text.muted }}
                  >
                    {gameCount === 1 ? "game" : "games"}
                  </Text>
                </View>

                {/* Increment */}
                <TouchableOpacity
                  onPress={() => setGameCount((c) => c + 1)}
                  className="size-12 rounded-xl items-center justify-center border"
                  style={{
                    backgroundColor: `${BadmintonPalette.accent.success}15`,
                    borderColor: `${BadmintonPalette.accent.success}30`,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Increase game count"
                >
                  <AntDesign
                    name="plus"
                    size={20}
                    color={BadmintonPalette.accent.success}
                  />
                </TouchableOpacity>
              </View>

              {gameCount !== currentGameCount && (
                <View className="flex-row items-center justify-center mt-2">
                  <MaterialCommunityIcons
                    name="history"
                    size={12}
                    color={BadmintonPalette.text.muted}
                  />
                  <Text
                    className="text-[10px] ml-1"
                    style={{ color: BadmintonPalette.text.muted }}
                  >
                    Was {currentGameCount}
                  </Text>
                </View>
              )}
            </View>

            {/* Level Section */}
            <View className="p-4">
              <Text
                className="text-xs font-medium mb-3"
                style={{ color: BadmintonPalette.text.secondary }}
              >
                Skill Level
              </Text>

              <View style={{ gap: 8 }}>
                {levelOptions.map((option) => {
                  const isSelected = selectedLevel === option.value;
                  const isCurrent = currentLevel === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => setSelectedLevel(option.value)}
                      className="flex-row items-center rounded-xl p-3"
                      style={{
                        backgroundColor: isSelected
                          ? `${option.color}15`
                          : BadmintonPalette.bg.elevated,
                        borderWidth: 2,
                        borderColor: isSelected ? option.color : "transparent",
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${option.label} level`}
                      accessibilityState={{ selected: isSelected }}
                    >
                      {/* Level indicator */}
                      <View
                        className="size-10 rounded-xl items-center justify-center mr-3"
                        style={{
                          backgroundColor: isSelected
                            ? option.color
                            : `${option.color}20`,
                        }}
                      >
                        <Text
                          className="text-base font-bold"
                          style={{
                            color: isSelected
                              ? BadmintonPalette.bg.base
                              : option.color,
                          }}
                        >
                          {option.label[0]}
                        </Text>
                      </View>

                      {/* Label */}
                      <View className="flex-1">
                        <Text
                          className="text-base font-semibold"
                          style={{
                            color: isSelected
                              ? option.color
                              : BadmintonPalette.text.primary,
                          }}
                        >
                          {option.label}
                        </Text>
                        {isCurrent && (
                          <Text
                            className="text-xs"
                            style={{ color: BadmintonPalette.text.muted }}
                          >
                            Current level
                          </Text>
                        )}
                      </View>

                      {/* Selection indicator */}
                      {isSelected && (
                        <View
                          className="size-6 rounded-full items-center justify-center"
                          style={{ backgroundColor: option.color }}
                        >
                          <AntDesign
                            name="check"
                            size={14}
                            color={BadmintonPalette.bg.base}
                          />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

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
              accessibilityLabel="Save changes"
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

export default EditPlayerModal;
