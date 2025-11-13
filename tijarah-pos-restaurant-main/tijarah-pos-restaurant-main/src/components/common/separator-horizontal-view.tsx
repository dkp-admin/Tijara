import React from "react";
import { View } from "react-native";
import { useTheme } from "../../context/theme-context";

export default function SeparatorHorizontalView() {
  const theme = useTheme();

  return (
    <View
      style={{
        height: 1,
        width: "100%",
        backgroundColor: theme.colors.dividerColor.secondary,
      }}
    />
  );
}
