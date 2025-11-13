import React from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/check-direction";
import { ButtonProps } from "../../types/button";
import DefaultText from "../text/Text";

export function PrimaryButton({
  leftIcon,
  rightIcon,
  title,
  onPress,
  reverse = false,
  disabled = false,
  style = {},
  textStyle = {},
  loading = false,
}: ButtonProps) {
  const theme = useTheme();
  const isRTL = checkDirection();

  return (
    <>
      <TouchableOpacity
        style={{
          padding: 20,
          borderRadius: 16,
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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {leftIcon}

            <DefaultText
              fontWeight={"semibold"}
              color={reverse ? "primary.1000" : "white.1000"}
              style={{
                ...textStyle,
                textAlign: "center",
              }}
            >
              {title}
            </DefaultText>

            {rightIcon && (
              <View
                style={{
                  position: "absolute",
                  right: 0,
                  transform: [
                    {
                      rotate: isRTL ? "180deg" : "0deg",
                    },
                  ],
                }}
              >
                {rightIcon}
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </>
  );
}
