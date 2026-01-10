import { BadmintonPalette } from "@/constants/palette";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CourtsContent } from "../screens/courts";
import { PlayersContent } from "../screens/players";

const settings = () => {
  const [activeTab, setActiveTab] = useState<"manage_players" | "courts">(
    "manage_players"
  );

  const tabs = [
    {
      key: "manage_players",
      label: "Players",
      icon: (focused: boolean) => (
        <AntDesign
          name="team"
          size={18}
          color={focused ? BadmintonPalette.court.lime : BadmintonPalette.text.muted}
        />
      ),
    },
    {
      key: "courts",
      label: "Courts",
      icon: (focused: boolean) => (
        <MaterialCommunityIcons
          name="badminton"
          size={18}
          color={focused ? BadmintonPalette.court.lime : BadmintonPalette.text.muted}
        />
      ),
    },
  ] as const;

  return (
    <SafeAreaView className="flex-1 bg-primary">
      {/* Header */}
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row items-center gap-3">
          <View className="size-12 rounded-2xl bg-court-deep/30 items-center justify-center">
            <AntDesign
              name="setting"
              size={24}
              color={BadmintonPalette.court.lime}
            />
          </View>
          <View>
            <Text className="text-light-100 text-2xl font-bold">Settings</Text>
            <Text className="text-light-300 text-sm">
              Manage players and courts
            </Text>
          </View>
        </View>
      </View>

      {/* Tab Bar */}
      <View className="px-6 py-4">
        <View className="flex-row bg-secondary border border-dark-100 rounded-xl p-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-lg ${
                  isActive ? "bg-court-deep" : "bg-transparent"
                }`}
                onPress={() => setActiveTab(tab.key)}
                accessibilityRole="button"
                accessibilityLabel={`Show ${tab.label} tab`}
              >
                {tab.icon(isActive)}
                <Text
                  className={`text-sm font-bold ${
                    isActive ? "text-court-lime" : "text-light-300"
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View className="flex-1">
        {activeTab === "manage_players" ? (
          <PlayersContent contentContainerClassName="px-6" />
        ) : (
          <CourtsContent contentContainerClassName="px-6" />
        )}
      </View>
    </SafeAreaView>
  );
};

export default settings;
