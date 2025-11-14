import React from "react";
import { View } from "react-native";
import { t } from "../../../../../../i18n";
import { useTheme } from "../../../../../context/theme-context";
import { useResponsive } from "../../../../../hooks/use-responsiveness";
import DefaultText from "../../../../text/Text";

export default function OnlineOrderItemsHeader() {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();

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
        style={{
          width: twoPaneView ? "45%" : "51%",
          marginLeft: "1%",
          marginRight: "4%",
        }}
        fontSize="sm"
        fontWeight="medium"
      >
        {t("ITEMS")}
      </DefaultText>

      <DefaultText
        style={{ width: twoPaneView ? "13%" : "10%", marginRight: "4%" }}
        fontSize="sm"
        fontWeight="medium"
      >
        {t("QTY")}
      </DefaultText>

      <DefaultText
        style={{
          width: twoPaneView ? "23%" : "20%",
          marginRight: "2%",
        }}
        fontSize="sm"
        fontWeight="medium"
      >
        {t("TOTAL")}
      </DefaultText>

      <View style={{ width: "7%", marginRight: "1%", alignItems: "flex-end" }}>
        <DefaultText />
      </View>
    </View>
  );
}
