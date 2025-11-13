import React from "react";
import { View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import DefaultText from "../../text/Text";

export default function OrderTypeHeader() {
  const theme = useTheme();
  const { wp, hp } = useResponsive();

  return (
    <>
      <View
        style={{
          paddingVertical: hp("1.25%"),
          paddingHorizontal: hp("2.25%"),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: theme.colors.primary[100],
        }}
      >
        <DefaultText fontSize="sm" fontWeight="medium">
          {t("ORDER TYPE NAME")}
        </DefaultText>

        <DefaultText
          style={{ marginRight: wp("1%"), alignSelf: "flex-end" }}
          fontSize="sm"
          fontWeight="medium"
        >
          {t("STATUS")}
        </DefaultText>
      </View>
    </>
  );
}
