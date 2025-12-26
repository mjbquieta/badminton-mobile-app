import { icons } from "@/constants/icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const PlayerTag = ({
  name,
  onDeleteTag,
}: {
  name: string;
  onDeleteTag?: () => void;
}) => {
  return (
    <View className="flex-row items-center gap-2 bg-dark-100 rounded-full px-3 py-2">
      <Image
        source={icons.player}
        className="size-4"
        resizeMode="contain"
        tintColor="#ab8bff"
      />
      <Text className="text-white text-sm font-bold">{name}</Text>
      {onDeleteTag ? (
        <TouchableOpacity
          onPress={onDeleteTag}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${name}`}
          className="p-2 rounded-full bg-primary items-center justify-center bg-red border border-red-500 border-opacity-50"
        >
          <Image
            source={icons.close}
            className="size-3"
            resizeMode="contain"
            tintColor="#ff0000"
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default PlayerTag;
