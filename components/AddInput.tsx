import { icons } from "@/constants/icons";
import React from "react";
import { Image, StyleSheet, TextInput, View } from "react-native";

interface Props {
  icon: keyof typeof icons;
  placeholder: string;
  onPress?: () => void;
  value?: string;
  onChangeText?: (text: string) => void;
}

const AddInput = ({
  icon,
  placeholder,
  onPress,
  value,
  onChangeText,
}: Props) => {
  return (
    <View className="flex-row items-center justify-center bg-dark-200 rounded-full px-5 py-4">
      <Image
        source={icons[icon]}
        className="size-5"
        resizeMode="contain"
        tintColor="#ab8bff"
      />

      <TextInput
        onPress={onPress}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#ab8bff"
        value={value}
        className="flex-1 ml-2 text-white"
      />
    </View>
  );
};

export default AddInput;

const styles = StyleSheet.create({});
