import React from "react";
import { View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import DefaultText from "../../text/Text";

export default function OrderTopHeader() {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: hp("2%"),
        paddingRight: hp("3%"),
        paddingVertical: hp("2.25%"),
        backgroundColor: theme.colors.white[1000],
      }}
    >
      {twoPaneView ? (
        <>
          <DefaultText
            style={{ width: "15%" }}
            fontSize="sm"
            fontWeight="medium"
          >
            {t("ORDER ID")}
          </DefaultText>

          <DefaultText
            style={{ width: "12%" }}
            fontSize="sm"
            fontWeight="medium"
          >
            {t("TIME")}
          </DefaultText>
        </>
      ) : (
        <View style={{ width: "22%", marginRight: "3%" }}>
          <DefaultText fontSize="sm" fontWeight="medium">
            {`${t("ORDER ID")}/`}
          </DefaultText>

          <DefaultText fontSize="sm" fontWeight="medium">
            {t("TIME")}
          </DefaultText>
        </View>
      )}

      <DefaultText
        style={{ width: twoPaneView ? "37%" : "52%", marginRight: "3%" }}
        fontSize="sm"
        fontWeight="medium"
      >
        {t("ITEMS")}
      </DefaultText>

      {twoPaneView && (
        <DefaultText style={{ width: "13%" }} fontSize="sm" fontWeight="medium">
          {t("REFUND AMOUNT")}
        </DefaultText>
      )}

      <DefaultText
        style={{ width: "20%", textAlign: "right" }}
        fontSize="sm"
        fontWeight="medium"
      >
        {t("ORDER AMOUNT")}
      </DefaultText>
    </View>
  );
}
