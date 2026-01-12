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

type CourtType = "singles" | "doubles";

const courtTypeOptions: {
  type: CourtType;
  label: string;
  players: string;
  icon: string;
  color: string;
}[] = [
  {
    type: "singles",
    label: "Singles",
    players: "1 vs 1",
    icon: "account",
    color: BadmintonPalette.accent.info,
  },
  {
    type: "doubles",
    label: "Doubles",
    players: "2 vs 2",
    icon: "account-group",
    color: BadmintonPalette.accent.primary,
  },
];

const AddCourtModal = ({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (isSingle: boolean) => void;
}) => {
  const [selectedType, setSelectedType] = useState<CourtType>("doubles");

  useEffect(() => {
    if (!visible) return;
    Keyboard.dismiss();
    setSelectedType("doubles");
  }, [visible]);

  const handleAdd = () => {
    onAdd(selectedType === "singles");
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
              Add New Court
            </Text>
            <Text
              className="text-sm mt-0.5"
              style={{ color: BadmintonPalette.text.muted }}
            >
              Select match type and add court
            </Text>
          </View>

          {/* Court Type Selection */}
          <View className="p-4">
            <Text
              className="text-xs font-medium mb-3"
              style={{ color: BadmintonPalette.text.secondary }}
            >
              Match Type
            </Text>

            <View className="flex-row" style={{ gap: 12 }}>
              {courtTypeOptions.map((option) => {
                const isSelected = selectedType === option.type;
                return (
                  <Pressable
                    key={option.type}
                    onPress={() => setSelectedType(option.type)}
                    className="flex-1 rounded-xl p-4"
                    style={{
                      backgroundColor: isSelected
                        ? `${option.color}15`
                        : BadmintonPalette.bg.elevated,
                      borderWidth: 2,
                      borderColor: isSelected ? option.color : "transparent",
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${option.label}`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    {/* Icon */}
                    <View
                      className="size-10 rounded-xl items-center justify-center mb-3"
                      style={{
                        backgroundColor: isSelected
                          ? option.color
                          : `${option.color}20`,
                      }}
                    >
                      <MaterialCommunityIcons
                        name={option.icon as any}
                        size={22}
                        color={isSelected ? BadmintonPalette.bg.base : option.color}
                      />
                    </View>

                    {/* Label */}
                    <Text
                      className="text-base font-bold"
                      style={{
                        color: isSelected
                          ? option.color
                          : BadmintonPalette.text.primary,
                      }}
                    >
                      {option.label}
                    </Text>

                    {/* Player count */}
                    <Text
                      className="text-sm mt-0.5"
                      style={{
                        color: isSelected
                          ? option.color
                          : BadmintonPalette.text.muted,
                      }}
                    >
                      {option.players}
                    </Text>

                    {/* Selection indicator */}
                    {isSelected && (
                      <View
                        className="absolute top-3 right-3 size-5 rounded-full items-center justify-center"
                        style={{ backgroundColor: option.color }}
                      >
                        <AntDesign
                          name="check"
                          size={12}
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
              className="flex-1 py-3 rounded-xl items-center flex-row justify-center active:opacity-80"
              style={{
                backgroundColor:
                  selectedType === "singles"
                    ? BadmintonPalette.accent.info
                    : BadmintonPalette.accent.primary,
              }}
              onPress={handleAdd}
              accessibilityRole="button"
              accessibilityLabel="Add court"
            >
              <AntDesign
                name="plus"
                size={16}
                color={BadmintonPalette.bg.base}
              />
              <Text
                className="font-bold ml-1"
                style={{ color: BadmintonPalette.bg.base }}
              >
                Add {selectedType === "singles" ? "Singles" : "Doubles"} Court
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default AddCourtModal;
