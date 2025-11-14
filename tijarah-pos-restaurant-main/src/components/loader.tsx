import React from "react";
import { ActivityIndicator, StyleProp, View, ViewStyle } from "react-native";
import { useTheme } from "../context/theme-context";
import { useResponsive } from "../hooks/use-responsiveness";

export default function Loader({
  size = 40,
  marginTop,
  style = {},
}: {
  size?: number;
  marginTop?: number;
  style?: StyleProp<ViewStyle> | any;
}) {
  const theme = useTheme();

  const { hp } = useResponsive();

  return (
    <View
      style={{
        marginTop: marginTop || hp("50%"),
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      <ActivityIndicator color={theme.colors.primary[1000]} size={size} />
    </View>
  );
}
