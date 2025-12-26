import { icons } from "@/constants/icons";
import { Tabs } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";

const TabIcon = ({
  focused,
  icon,
  title,
}: {
  focused: boolean;
  icon: any;
  title: string;
}) => {
  if (!focused) {
    return (
      <View className="size-full justify-center items-center mt-4 rounded-full">
        <Image
          source={icon}
          className="size-5"
          style={{ tintColor: "#A8B5DB" }}
        />
      </View>
    );
  }

  return (
    <View className="flex flex-row w-full flex-1 min-w-[112px] min-h-16 mt-4 justify-center items-center rounded-full overflow-hidden gap-2">
      <Image
        source={icon}
        className="size-5"
        style={{ tintColor: "#964B00" }}
      />
      <Text className="text-white text-base font-semibold ml-2">{title}</Text>
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
          backgroundColor: "#0f0D23",
          borderRadius: 50,
          marginHorizontal: 20,
          marginBottom: 20,
          height: 52,
          position: "absolute",
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "#0f0D23",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Overview",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.home} title="Overview" />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={icons.badminton}
              title="Activity"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="players"
        options={{
          title: "Players",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.player} title="Players" />
          ),
        }}
      />
      <Tabs.Screen
        name="courts"
        options={{
          title: "Courts",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.court} title="Courts" />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;
