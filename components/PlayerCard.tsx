import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const PlayerCard = ({
  name,
  onDelete,
  isInGame = false,
}: {
  name: string;
  onDelete?: () => void;
  isInGame: boolean;
}) => {
  return (
    <TouchableOpacity
      className="bg-dark-200 rounded-xl p-4 gap-3 border border-dark-100"
      onPress={onDelete}
    >
      <View className="flex-row items-center gap-3">
        <View className="size-10 rounded-full bg-primary items-center justify-center">
          <AntDesign name="user" size={15} color="#ab8bff" />
        </View>

        <Text className="flex-1 text-white text-lg font-bold" numberOfLines={1}>
          {name}
        </Text>

        <View className="flex-row items-center gap-2">
          {isInGame ? (
            <MaterialCommunityIcons
              name="badminton"
              size={15}
              color="#FFD600"
            />
          ) : (
            <MaterialCommunityIcons
              name="bench-back"
              size={15}
              color="#00A300"
            />
          )}

          <Text
            className={[
              "text-sm font-bold",
              isInGame ? "text-yellow-400" : "text-green-800",
            ].join(" ")}
          >
            {isInGame ? "In Game" : "Bench"}
          </Text>
        </View>

        {/* {onDelete && !isInGame ? (
          <Pressable
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel={`Delete player ${name}`}
            className="size-10 rounded-full bg-primary items-center justify-center"
          >
            <Image
              source={icons.trash}
              className="size-5"
              resizeMode="contain"
              tintColor="#ff0000"
            />
          </Pressable>
        ) : null} */}
      </View>
    </TouchableOpacity>
  );
};

export default PlayerCard;
