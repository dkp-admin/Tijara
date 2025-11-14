import { useNavigation } from "@react-navigation/native";
import React from "react";
import { TouchableOpacity } from "react-native";
import { checkDirection } from "../../hooks/check-direction";
import { useResponsive } from "../../hooks/use-responsiveness";
import ICONS from "../../utils/icons";

export default function FloatingBackButton() {
  const { wp, hp } = useResponsive();
  const isRTL = checkDirection();
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity
      style={{
        position: "absolute",
        top: hp("1.5%"),
        left: wp("1%"),
        paddingVertical: hp("2%"),
        paddingHorizontal: wp("1.75%"),
        transform: [
          {
            rotate: isRTL ? "180deg" : "0deg",
          },
        ],
      }}
      onPress={() => navigation.goBack()}
    >
      <ICONS.ArrowBackIcon />
    </TouchableOpacity>
  );
}
