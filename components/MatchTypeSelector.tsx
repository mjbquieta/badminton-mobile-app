import React from "react";
import { Pressable, Text, View } from "react-native";

export type MatchType = "singles" | "doubles";

type Props = {
  value: MatchType;
  onChange: (next: MatchType) => void;
};

export default function MatchTypeSelector({ value, onChange }: Props) {
  const isSingles = value === "singles";

  return (
    <View className="bg-dark-200 rounded-full p-1 flex-row">
      <Pressable
        accessibilityRole="button"
        onPress={() => onChange("singles")}
        className={[
          "flex-1 rounded-full py-3 items-center justify-center",
          isSingles ? "bg-accent" : "bg-transparent",
        ].join(" ")}
      >
        <Text
          className={[
            "text-base font-bold",
            isSingles ? "text-primary" : "text-white",
          ].join(" ")}
        >
          Singles
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={() => onChange("doubles")}
        className={[
          "flex-1 rounded-full py-3 items-center justify-center",
          !isSingles ? "bg-accent" : "bg-transparent",
        ].join(" ")}
      >
        <Text
          className={[
            "text-base font-bold",
            !isSingles ? "text-primary" : "text-white",
          ].join(" ")}
        >
          Doubles
        </Text>
      </Pressable>
    </View>
  );
}
