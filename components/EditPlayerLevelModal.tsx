import { BadmintonPalette } from "@/constants/palette";
import { PlayerLevel } from "@/types/players";
import AntDesign from "@expo/vector-icons/AntDesign";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const levelOptions: { value: PlayerLevel; label: string; color: string }[] = [
  {
    value: PlayerLevel.BEGINNER,
    label: "Beginner",
    shortLabel: "B",
    color: BadmintonPalette.levels.beginner,
  },
  {
    value: PlayerLevel.INTERMEDIATE,
    label: "Intermediate",
    shortLabel: "I",
    color: BadmintonPalette.levels.intermediate,
  },
  {
    value: PlayerLevel.ADVANCED,
    label: "Advanced",
    shortLabel: "A",
    color: BadmintonPalette.levels.advanced,
  },
  {
    value: PlayerLevel.PRO,
    label: "Pro",
    shortLabel: "P",
    color: BadmintonPalette.levels.pro,
  },
].map((opt) => ({ ...opt, shortLabel: opt.label[0] }));

const EditPlayerLevelModal = ({
  visible,
  onClose,
  onSave,
  playerName,
  currentLevel,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (level: PlayerLevel) => void;
  playerName: string;
  currentLevel: PlayerLevel;
}) => {
  const [selectedLevel, setSelectedLevel] = useState<PlayerLevel>(currentLevel);

  useEffect(() => {
    if (!visible) return;
    Keyboard.dismiss();
    setSelectedLevel(currentLevel);
  }, [visible, currentLevel]);

  const handleSave = () => {
    onSave(selectedLevel);
    onClose();
  };

  const hasChanged = selectedLevel !== currentLevel;

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
              Edit Player Level
            </Text>
            <Text
              className="text-sm mt-0.5"
              style={{ color: BadmintonPalette.text.muted }}
            >
              Change skill level for {playerName}
            </Text>
          </View>

          {/* Level Selection */}
          <View className="p-4">
            <Text
              className="text-xs font-medium mb-3"
              style={{ color: BadmintonPalette.text.secondary }}
            >
              Select Level
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
              accessibilityLabel="Save level"
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

export default EditPlayerLevelModal;
