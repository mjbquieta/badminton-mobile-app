import AddInput from "@/components/AddInput";
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
    label: "B",
    color: BadmintonPalette.levels.beginner,
  },
  {
    value: PlayerLevel.INTERMEDIATE,
    label: "I",
    color: BadmintonPalette.levels.intermediate,
  },
  {
    value: PlayerLevel.ADVANCED,
    label: "A",
    color: BadmintonPalette.levels.advanced,
  },
  { value: PlayerLevel.PRO, label: "P", color: BadmintonPalette.levels.pro },
];

const levelLabels: Record<PlayerLevel, string> = {
  [PlayerLevel.BEGINNER]: "Beginner",
  [PlayerLevel.INTERMEDIATE]: "Intermediate",
  [PlayerLevel.ADVANCED]: "Advanced",
  [PlayerLevel.PRO]: "Pro",
};

const AddPlayerModal = ({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, level: PlayerLevel) => void;
}) => {
  const [playerName, setPlayerName] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<PlayerLevel>(
    PlayerLevel.BEGINNER
  );

  useEffect(() => {
    if (!visible) return;
    setPlayerName("");
    setSelectedLevel(PlayerLevel.BEGINNER);
  }, [visible]);

  const canAdd = playerName.trim().length > 0;
  const selectedLevelColor =
    levelOptions.find((l) => l.value === selectedLevel)?.color ||
    BadmintonPalette.court.lime;

  const handleAdd = () => {
    if (!canAdd) return;
    Keyboard.dismiss();
    onAdd(playerName.trim(), selectedLevel);
    onClose();
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
        onPress={() => {
          Keyboard.dismiss();
          onClose();
        }}
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
              Add New Player
            </Text>
            <Text
              className="text-sm mt-0.5"
              style={{ color: BadmintonPalette.text.muted }}
            >
              Enter player name and select skill level
            </Text>
          </View>

          {/* Form Content */}
          <View className="p-4">
            {/* Input */}
            <View className="mb-4">
              <Text
                className="text-xs font-medium mb-2"
                style={{ color: BadmintonPalette.text.secondary }}
              >
                Player Name
              </Text>
              <AddInput
                type="player"
                placeholder="Enter player name..."
                value={playerName}
                onChangeText={setPlayerName}
                onSubmitEditing={handleAdd}
              />
            </View>

            {/* Level Selection */}
            <View>
              <Text
                className="text-xs font-medium mb-2"
                style={{ color: BadmintonPalette.text.secondary }}
              >
                Skill Level
              </Text>
              <View className="flex-row" style={{ gap: 8 }}>
                {levelOptions.map((option) => {
                  const isSelected = selectedLevel === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => setSelectedLevel(option.value)}
                      className="items-center justify-center rounded-lg"
                      style={{
                        width: 44,
                        height: 44,
                        backgroundColor: isSelected
                          ? option.color
                          : `${option.color}15`,
                        borderWidth: isSelected ? 0 : 1,
                        borderColor: `${option.color}40`,
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${
                        levelLabels[option.value]
                      } level`}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <Text
                        className="text-sm font-bold"
                        style={{
                          color: isSelected
                            ? BadmintonPalette.bg.base
                            : option.color,
                        }}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text
                className="text-xs font-medium mt-2"
                style={{ color: selectedLevelColor }}
              >
                {levelLabels[selectedLevel]}
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View
            className="flex-row items-center p-4 border-t border-dark-100"
            style={{ gap: 12 }}
          >
            <TouchableOpacity
              className="flex-1 py-3 rounded-xl border border-dark-100 bg-dark-200 items-center active:bg-dark-100"
              onPress={() => {
                Keyboard.dismiss();
                onClose();
              }}
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
                "flex-1 py-3 rounded-xl items-center flex-row justify-center",
                canAdd ? "bg-accent active:opacity-80" : "bg-dark-100",
              ].join(" ")}
              onPress={handleAdd}
              disabled={!canAdd}
              accessibilityRole="button"
              accessibilityLabel="Add player"
            >
              <AntDesign
                name="plus"
                size={16}
                color={
                  canAdd
                    ? BadmintonPalette.bg.base
                    : BadmintonPalette.text.muted
                }
              />
              <Text
                className="font-bold ml-1"
                style={{
                  color: canAdd
                    ? BadmintonPalette.bg.base
                    : BadmintonPalette.text.muted,
                }}
              >
                Add Player
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default AddPlayerModal;
