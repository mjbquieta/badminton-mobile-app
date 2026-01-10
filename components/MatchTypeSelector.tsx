import { BadmintonPalette } from "@/constants/palette";
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
    <View>
      <Text 
        className="text-sm font-semibold mb-2"
        style={{ color: BadmintonPalette.text.secondary }}
      >
        Match Type
      </Text>
      <View className="bg-dark-200 rounded-xl p-1 flex-row border border-dark-100">
        <Pressable
          accessibilityRole="button"
          onPress={() => onChange("singles")}
          className={[
            "flex-1 rounded-lg py-3 items-center justify-center",
            isSingles ? "bg-info" : "bg-transparent",
          ].join(" ")}
        >
          <Text
            className="text-sm font-bold"
            style={{
              color: isSingles ? "#FFFFFF" : BadmintonPalette.text.secondary,
            }}
          >
            Singles (1v1)
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => onChange("doubles")}
          className={[
            "flex-1 rounded-lg py-3 items-center justify-center",
            !isSingles ? "bg-accent" : "bg-transparent",
          ].join(" ")}
        >
          <Text
            className="text-sm font-bold"
            style={{
              color: !isSingles ? BadmintonPalette.bg.base : BadmintonPalette.text.secondary,
            }}
          >
            Doubles (2v2)
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
