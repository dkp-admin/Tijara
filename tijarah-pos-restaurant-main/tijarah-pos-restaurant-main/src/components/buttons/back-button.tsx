import React from "react";
import { TouchableOpacity } from "react-native";
import { checkDirection } from "../../hooks/check-direction";
import { BackButtonProps } from "../../types/button";
import ICONS from "../../utils/icons";

export function BackButton({ onPress, style = {} }: BackButtonProps) {
  const isRTL = checkDirection();

  return (
    <TouchableOpacity
      style={{
        paddingRight: 12,
        paddingVertical: 15,
        marginTop: 20,
        alignItems: "flex-start",
        transform: [
          {
            rotate: isRTL ? "180deg" : "0deg",
          },
        ],
        ...style,
      }}
      onPress={onPress}
    >
      <ICONS.ArrowBackIcon />
    </TouchableOpacity>
  );
}
