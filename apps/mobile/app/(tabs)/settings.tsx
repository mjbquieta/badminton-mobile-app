import { BadmintonPalette } from "@/constants/palette";
import ConfirmationAlert from "@/components/ConfirmationAlert";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { getAuthErrorMessage } from "@badminton/firebase";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Constants from "expo-constants";
import React, { useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CourtsContent } from "../screens/courts";
import { PlayersContent } from "../screens/players";

const AboutContent = () => {
  return (
    <View className="flex-1 items-center justify-center px-6 pb-20">
      {/* Logo */}
      <Image
        source={require("../../assets/images/walking-potato.jpg")}
        className="size-32 rounded-3xl mb-6"
        resizeMode="cover"
      />

      {/* App Name */}
      <Text className="text-light-100 text-3xl font-bold mb-2">
        Smash Potato
      </Text>

      {/* Version */}
      <Text className="text-court-lime text-base font-semibold mb-8">
        Version {Constants.expoConfig?.version}
      </Text>

      {/* Ownership Message */}
      <View className="bg-secondary border border-dark-100 rounded-2xl p-6 w-full">
        <Text className="text-light-300 text-center text-sm leading-6">
          This application is intended for use only under the ownership of{" "}
          <Text className="text-court-lime font-semibold">Smash Potato</Text>.
          {"\n\n"}
          All rights reserved.
        </Text>
      </View>
    </View>
  );
};

const settings = () => {
  const { logout, emailVerified, sendVerificationEmail, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<
    "menu" | "manage_players" | "courts" | "about"
  >("menu");

  const handleVerifyEmail = () => {
    Alert.alert(
      "Verify Email",
      "Verify your email to unlock unlimited players and courts.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Resend Email",
          onPress: async () => {
            try {
              await sendVerificationEmail();
              showToast({ message: "Verification email sent!", type: "success" });
            } catch (err) {
              showToast({ message: getAuthErrorMessage(err), type: "error" });
            }
          },
        },
        {
          text: "I Already Verified",
          onPress: async () => {
            await refreshUser();
          },
        },
      ]
    );
  };

  const menuItems = [
    ...(!emailVerified ? [{
      key: "verify_email" as const,
      label: "Verify Email",
      description: "Unlock unlimited players & courts",
      icon: (
        <AntDesign name="mail" size={22} color={BadmintonPalette.accent.primary} />
      ),
    }] : []),
    {
      key: "manage_players" as const,
      label: "Players",
      description: "Manage player list",
      icon: (
        <AntDesign name="team" size={22} color={BadmintonPalette.court.lime} />
      ),
    },
    {
      key: "courts" as const,
      label: "Courts",
      description: "Manage court settings",
      icon: (
        <MaterialCommunityIcons
          name="badminton"
          size={22}
          color={BadmintonPalette.court.lime}
        />
      ),
    },
    {
      key: "about" as const,
      label: "About",
      description: "App information",
      icon: (
        <AntDesign name="info" size={22} color={BadmintonPalette.court.lime} />
      ),
    },
  ];

  const getTitle = () => {
    switch (activeTab) {
      case "manage_players":
        return "Players";
      case "courts":
        return "Courts";
      case "about":
        return "About";
      default:
        return "Settings";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      {/* Header */}
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row items-center gap-3">
          {activeTab !== "menu" ? (
            <TouchableOpacity
              onPress={() => setActiveTab("menu")}
              className="size-12 rounded-2xl bg-court-deep/30 items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel="Go back to settings menu"
            >
              <AntDesign
                name="left"
                size={24}
                color={BadmintonPalette.court.lime}
              />
            </TouchableOpacity>
          ) : (
            <View className="size-12 rounded-2xl bg-court-deep/30 items-center justify-center">
              <AntDesign
                name="setting"
                size={24}
                color={BadmintonPalette.court.lime}
              />
            </View>
          )}
          <View>
            <Text className="text-light-100 text-2xl font-bold">
              {getTitle()}
            </Text>
            {activeTab === "menu" && (
              <Text className="text-light-300 text-sm">
                Manage players and courts
              </Text>
            )}
          </View>
        </View>
      </View>

      {activeTab === "menu" ? (
        /* Vertical Menu */
        <View className="px-6 py-4">
          <View className="bg-secondary border border-dark-100 rounded-2xl overflow-hidden">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.key}
                className={`flex-row items-center px-4 py-4 ${
                  index !== menuItems.length - 1
                    ? "border-b border-dark-100"
                    : ""
                }`}
                onPress={() => {
                  if (item.key === "verify_email") {
                    handleVerifyEmail();
                  } else {
                    setActiveTab(item.key as "manage_players" | "courts" | "about");
                  }
                }}
                accessibilityRole="button"
                accessibilityLabel={`Open ${item.label}`}
              >
                <View className="size-10 rounded-xl bg-court-deep/30 items-center justify-center mr-4">
                  {item.icon}
                </View>
                <View className="flex-1">
                  <Text className="text-light-100 text-base font-semibold">
                    {item.label}
                  </Text>
                  <Text className="text-light-300 text-sm">
                    {item.description}
                  </Text>
                </View>
                <AntDesign
                  name="right"
                  size={18}
                  color={BadmintonPalette.text.muted}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Sign Out */}
          <TouchableOpacity
            onPress={() =>
              ConfirmationAlert({
                title: "Sign Out",
                message: "Are you sure you want to sign out?",
                onConfirm: logout,
              })
            }
            className="mt-4 bg-secondary border border-dark-100 rounded-2xl flex-row items-center px-4 py-4"
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            <View className="size-10 rounded-xl bg-red-500/10 items-center justify-center mr-4">
              <AntDesign
                name="logout"
                size={22}
                color={BadmintonPalette.accent.danger}
              />
            </View>
            <View className="flex-1">
              <Text className="text-red-500 text-base font-semibold">
                Sign Out
              </Text>
              <Text className="text-light-300 text-sm">
                Log out of your account
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-1">
          {activeTab === "manage_players" ? (
            <PlayersContent contentContainerClassName="px-6" />
          ) : activeTab === "courts" ? (
            <CourtsContent contentContainerClassName="px-6" />
          ) : (
            <AboutContent />
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

export default settings;
