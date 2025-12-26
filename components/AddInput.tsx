import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { PotatoPalette } from "@/constants/palette";

interface Props {
  type: "player" | "court";
  placeholder: string;
  onPress?: () => void;
  value?: string;
  onChangeText?: (text: string) => void;
}

const AddInput = ({
  type,
  placeholder,
  onPress,
  value,
  onChangeText,
}: Props) => {
  let icon = null;

  switch (type) {
    case "court":
      icon = (
        <FontAwesome6
          name="ping-pong-paddle-ball"
          size={15}
          color={PotatoPalette.accent.gold}
        />
      );
      break;
    default:
      icon = (
        <AntDesign
          name="user-add"
          size={15}
          color={PotatoPalette.accent.gold}
        />
      );
  }

  return (
    <View className="flex-row items-center justify-center bg-dark-200 rounded-full px-5 py-4">
      {icon}

      <TextInput
        onPress={onPress}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={PotatoPalette.text.placeholder}
        value={value}
        style={{ fontSize: 16 }}
        className="flex-1 ml-2 text-white h-8"
      />
    </View>
  );
};

export default AddInput;

const styles = StyleSheet.create({});
