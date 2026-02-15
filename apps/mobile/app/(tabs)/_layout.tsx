import { BadmintonPalette } from "@/constants/palette";
import { useAuth } from "@/contexts/AuthContext";
import { useFirebaseSync } from "@/hooks/useFirebaseSync";
import { ToastProvider } from "@/components/Toast";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { configureAppStore } from "@badminton/store";
import { Tabs } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { Provider } from "react-redux";

const store = configureAppStore();

function FirebaseSyncProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  useFirebaseSync(store, user!.uid);
  return <>{children}</>;
}

const TabIcon = ({
  focused,
  type,
  title,
}: {
  focused: boolean;
  type: "home" | "activity" | "players" | "courts" | "settings";
  title: string;
}) => {
  const iconColor = focused
    ? BadmintonPalette.court.lime
    : BadmintonPalette.text.muted;

  let icon = null;
  switch (type) {
    case "home":
      icon = <AntDesign name="home" size={20} color={iconColor} />;
      break;
    case "activity":
      icon = <Feather name="activity" size={20} color={iconColor} />;
      break;
    case "players":
      icon = <AntDesign name="team" size={20} color={iconColor} />;
      break;
    case "courts":
      icon = (
        <MaterialCommunityIcons name="badminton" size={20} color={iconColor} />
      );
      break;
    case "settings":
      icon = <AntDesign name="setting" size={20} color={iconColor} />;
      break;
  }

  if (!focused) {
    return (
      <View className="size-full justify-center items-center mt-4">{icon}</View>
    );
  }

  return (
    <View className="flex flex-row w-full flex-1 min-w-[112px] min-h-10 mt-4 justify-center items-center rounded-xl overflow-hidden gap-2 bg-court-deep/30">
      {icon}
      <Text className="text-court-lime text-sm font-semibold">{title}</Text>
    </View>
  );
};

const _layout = () => {
  return (
    <Provider store={store}>
      <FirebaseSyncProvider>
        <ToastProvider>
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
                backgroundColor: BadmintonPalette.bg.surface,
                borderRadius: 20,
                marginHorizontal: 16,
                marginBottom: 16,
                height: 60,
                position: "absolute",
                overflow: "hidden",
                borderWidth: 1,
                borderColor: BadmintonPalette.bg.border,
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
                title: "Activity",
                tabBarIcon: ({ focused }) => (
                  <TabIcon focused={focused} type="activity" title="Activity" />
                ),
              }}
            />
            <Tabs.Screen
              name="settings"
              options={{
                title: "Settings",
                tabBarIcon: ({ focused }) => (
                  <TabIcon focused={focused} type="settings" title="Settings" />
                ),
              }}
            />
          </Tabs>
        </ToastProvider>
      </FirebaseSyncProvider>
    </Provider>
  );
};

export default _layout;
