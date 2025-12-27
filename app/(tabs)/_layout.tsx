import { PotatoPalette } from "@/constants/palette";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const TabIcon = ({
  focused,
  type,
  title,
}: {
  focused: boolean;
  type: "home" | "activity" | "players" | "courts";
  title: string;
}) => {
  let icon = null;
  const iconColor = focused
    ? PotatoPalette.accent.gold
    : PotatoPalette.text.placeholder;

  switch (type) {
    case "home":
      icon = <AntDesign name="home" size={20} color={iconColor} />;
      break;
    case "activity":
      icon = (
        <MaterialCommunityIcons
          name="human-queue"
          size={20}
          color={iconColor}
        />
      );
      break;
    case "players":
      icon = <AntDesign name="usergroup-add" size={20} color={iconColor} />;
      break;
    case "courts":
      icon = <AntDesign name="box-plot" size={20} color={iconColor} />;
      break;
  }
  if (!focused) {
    return (
      <View className="size-full justify-center items-center mt-4 rounded-full">
        {icon}
      </View>
    );
  }

  return (
    <View className="flex flex-row w-full flex-1 min-w-[117px] min-h-10 mt-4 justify-center items-center rounded-full overflow-hidden gap-2 bg-dark-200/50">
      {icon}
      <Text className="text-light-100 text-base font-semibold ml-2">
        {title}
      </Text>
    </View>
  );
};

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarStyle: {
          backgroundColor: PotatoPalette.bg.surface,
          borderRadius: 50,
          marginHorizontal: 20,
          marginBottom: 20,
          height: 55,
          position: "absolute",
          overflow: "hidden",
          borderWidth: 1,
          borderColor: PotatoPalette.bg.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} type="home" title="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activities",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} type="activity" title="Activities" />
          ),
        }}
      />
      <Tabs.Screen
        name="players"
        options={{
          title: "Players",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} type="players" title="Players" />
          ),
        }}
      />
      <Tabs.Screen
        name="courts"
        options={{
          title: "Courts",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} type="courts" title="Courts" />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;
