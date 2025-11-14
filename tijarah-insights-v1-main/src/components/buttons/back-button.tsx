import React from "react";
import { TouchableOpacity } from "react-native";
import { checkDirection } from "../../hooks/use-direction-check";
import { BackButtonProps } from "../../types/button";
import ICONS from "../../utils/icons";
import { getOriginalSize } from "../text/Text";

export function BackButton({ onPress, style = {} }: BackButtonProps) {
  const isRTL = checkDirection();

  return (
    <TouchableOpacity
      style={{
        paddingRight: getOriginalSize(12),
        paddingVertical: getOriginalSize(15),
        marginTop: getOriginalSize(20),
        alignItems: isRTL ? "flex-end" : "flex-start",
        transform: [
          {
            rotate: isRTL ? "180deg" : "0deg",
          },
        ],
        ...style,
      }}
      onPress={onPress}
    >
      <ICONS.ArrowBackIcon
        width={getOriginalSize(40)}
        height={getOriginalSize(40)}
      />
    </TouchableOpacity>
  );
}
