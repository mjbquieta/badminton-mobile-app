import AntDesign from "@expo/vector-icons/AntDesign";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const PlayerTag = ({
  name,
  onDeleteTag,
}: {
  name: string;
  onDeleteTag?: () => void;
}) => {
  return (
    <View className="flex-row items-center gap-2 bg-dark-100 rounded-full px-3 py-2">
      <AntDesign name="user" size={15} color="#ab8bff" />
      <Text className="text-white text-sm font-bold">{name}</Text>
      {onDeleteTag ? (
        <TouchableOpacity
          onPress={onDeleteTag}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${name}`}
          className="p-2 rounded-full bg-primary items-center justify-center bg-red border border-red-500 border-opacity-50"
        >
          <AntDesign name="close" size={10} color="#ff0000" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default PlayerTag;
