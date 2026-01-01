import { PotatoPalette } from "@/constants/palette";
import AntDesign from "@expo/vector-icons/AntDesign";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CourtsContent } from "../screens/courts";
import { PlayersContent } from "../screens/players";

const settings = () => {
  const [activeTab, setActiveTab] = useState<"manage_players" | "courts">(
    "manage_players"
  );

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-row items-center gap-2 p-4">
        <AntDesign name="setting" size={20} color={PotatoPalette.accent.gold} />
        <Text className="text-white text-2xl font-bold text-center">
          Settings
        </Text>
      </View>

      <View className="px-6 pt-4">
        <View className="flex-row border-b border-dark-100">
          <TouchableOpacity
            className="flex-1 items-center py-3"
            onPress={() => setActiveTab("manage_players")}
            accessibilityRole="button"
            accessibilityLabel="Show Manage Players tab"
          >
            <Text
              className={`text-sm font-semibold ${
                activeTab === "manage_players"
                  ? "text-accent"
                  : "text-light-200"
              }`}
            >
              Manage Players
            </Text>
            {activeTab === "manage_players" ? (
              <View className="absolute bottom-0 h-0.5 w-12 bg-accent rounded-full" />
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 items-center py-3"
            onPress={() => setActiveTab("courts")}
            accessibilityRole="button"
            accessibilityLabel="Show Courts tab"
          >
            <Text
              className={`text-sm font-semibold ${
                activeTab === "courts" ? "text-accent" : "text-light-200"
              }`}
            >
              Courts
            </Text>
            {activeTab === "courts" ? (
              <View className="absolute bottom-0 h-0.5 w-12 bg-accent rounded-full" />
            ) : null}
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1">
        {activeTab === "manage_players" ? (
          <PlayersContent contentContainerClassName="p-10" />
        ) : (
          <CourtsContent contentContainerClassName="p-10" />
        )}
      </View>
    </SafeAreaView>
  );
};

export default settings;
