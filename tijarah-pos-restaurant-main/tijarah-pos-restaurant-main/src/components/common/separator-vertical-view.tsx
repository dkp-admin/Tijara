import React from "react";
import { View } from "react-native";
import { useTheme } from "../../context/theme-context";

export default function SeparatorVerticalView() {
  const theme = useTheme();

  return (
    <View
      style={{
        width: 1,
        height: "100%",
        backgroundColor: theme.colors.dividerColor.secondary,
      }}
    />
  );
}
