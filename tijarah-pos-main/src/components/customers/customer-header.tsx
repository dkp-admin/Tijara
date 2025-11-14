import React from "react";
import { View } from "react-native";
import { t } from "../../../i18n";
import { useResponsive } from "../../hooks/use-responsiveness";
import SeparatorHorizontalView from "../common/separator-horizontal-view";
import DefaultText from "../text/Text";

export default function CustomerHeader() {
  const { wp, hp, twoPaneView } = useResponsive();

  return (
    <>
      <View
        style={{
          paddingVertical: hp("1.5%"),
          paddingHorizontal: hp("2%"),
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <DefaultText
          style={{ width: twoPaneView ? "25%" : "35%", marginRight: "5%" }}
          fontSize="sm"
          fontWeight="medium"
        >
          {t("CUSTOMER NAME")}
        </DefaultText>

        {twoPaneView ? (
          <>
            <DefaultText
              style={{ width: "20%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("TOTAL SPEND")}
            </DefaultText>

            <DefaultText
              style={{ width: "20%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("TOTAL REFUNDED")}
            </DefaultText>

            <DefaultText
              style={{ width: "10%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("TOTAL ORDER")}
            </DefaultText>
          </>
        ) : (
          <View style={{ width: "35%" }}>
            <DefaultText fontSize="sm" fontWeight="medium">
              {`${t("TOTAL SPEND")}/`}
            </DefaultText>

            <DefaultText fontSize="sm" fontWeight="medium">
              {t("TOTAL ORDER")}
            </DefaultText>
          </View>
        )}

        <DefaultText
          style={{
            width: twoPaneView ? "20%" : "25%",
            paddingRight: wp("2.5%"),
            textAlign: "right",
          }}
          fontSize="sm"
          fontWeight="medium"
        >
          {t("LAST ORDER")}
        </DefaultText>
      </View>

      <SeparatorHorizontalView />
    </>
  );
}
