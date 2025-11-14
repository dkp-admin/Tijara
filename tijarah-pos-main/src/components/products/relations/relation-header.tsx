import React from "react";
import { View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import DefaultText from "../../text/Text";

export default function RelationHeader() {
  const theme = useTheme();
  const { hp } = useResponsive();

  return (
    <View
      style={{
        paddingVertical: hp("1.25%"),
        paddingHorizontal: hp("1.75%"),
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.colors.primary[100],
      }}
    >
      <DefaultText
        style={{ width: "33%", marginRight: "3%" }}
        fontSize="sm"
        fontWeight="medium"
      >
        {t("CRATE")}
      </DefaultText>

      <DefaultText
        style={{ width: "33%", marginRight: "3%" }}
        fontSize="sm"
        fontWeight="medium"
      >
        {t("BOX")}
      </DefaultText>

      <DefaultText
        style={{ width: "27%", marginRight: "1%" }}
        fontSize="sm"
        fontWeight="medium"
      >
        {t("PRODUCT")}
      </DefaultText>
    </View>
  );
}
