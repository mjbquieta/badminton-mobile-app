import { BadmintonPalette } from "@/constants/palette";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { TextInput, View } from "react-native";

interface Props {
  type: "player" | "court" | "search";
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
  const iconColor = BadmintonPalette.court.lime;
  
  let icon = null;
  switch (type) {
    case "court":
      icon = (
        <MaterialCommunityIcons
          name="badminton"
          size={18}
          color={iconColor}
        />
      );
      break;
    case "search":
      icon = (
        <FontAwesome5
          name="search"
          size={16}
          color={BadmintonPalette.text.muted}
        />
      );
      break;
    default:
      icon = (
        <AntDesign
          name="user"
          size={18}
          color={iconColor}
        />
      );
  }

  return (
    <View className="flex-row items-center bg-dark-200 rounded-xl px-4 py-3 border border-dark-100">
      <View className="size-8 rounded-lg bg-court-deep/20 items-center justify-center mr-3">
        {icon}
      </View>

      <TextInput
        onPress={onPress}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={BadmintonPalette.text.muted}
        value={value}
        className="flex-1"
        style={{ 
          fontSize: 16, 
          color: BadmintonPalette.text.primary,
        }}
      />
    </View>
  );
};

export default AddInput;
