import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const activity = () => {
  return (
    <SafeAreaView className="flex-1 p-10 bg-primary gap-5">
      <Text className="text-white text-2xl font-bold text-center">
        Activity
      </Text>
    </SafeAreaView>
  );
};

export default activity;
