import React from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { useTheme } from "../../context/theme-context";
import { ButtonProps } from "../../types/button";
import DefaultText, { getOriginalSize } from "../text/Text";

export function PrimaryButton({
  title,
  onPress,
  reverse = false,
  disabled = false,
  style = {},
  textStyle = {},
  loading = false,
}: ButtonProps) {
  const theme = useTheme();

  return (
    <>
      <TouchableOpacity
        style={{
          padding: getOriginalSize(20),
          borderRadius: getOriginalSize(16),
          alignItem: "center",
          backgroundColor: disabled
            ? theme.colors.dark[400]
            : reverse
            ? style.backgroundColor || theme.colors.primary[100]
            : style.backgroundColor || theme.colors.primary[1000],
          ...style,
        }}
        disabled={disabled || loading}
        onPress={onPress}
      >
        {loading ? (
          <ActivityIndicator size={"small"} />
        ) : (
          <DefaultText
            fontWeight={"bold"}
            color={reverse ? "primary.1000" : "white.1000"}
            style={{
              ...textStyle,
              textAlign: "center",
            }}
          >
            {title}
          </DefaultText>
        )}
      </TouchableOpacity>
    </>
  );
}
