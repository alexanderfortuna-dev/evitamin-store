import React from "react";
import { StyleSheet, Text, Pressable, useColorScheme, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { getColors } from "@/constants/colors";

interface CategoryPillProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export function CategoryPill({ label, isActive, onPress }: CategoryPillProps) {
  const colorScheme = useColorScheme();
  const colors = getColors(colorScheme === "dark");

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.pill,
        {
          backgroundColor: isActive ? colors.primary : colors.card,
          borderColor: isActive ? colors.primary : colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: isActive ? "#fff" : colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
});
