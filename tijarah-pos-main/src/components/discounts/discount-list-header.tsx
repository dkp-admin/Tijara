import React from "react";
import { View } from "react-native";
import { t } from "../../../i18n";
import { useResponsive } from "../../hooks/use-responsiveness";
import SeparatorHorizontalView from "../common/separator-horizontal-view";
import DefaultText from "../text/Text";

export default function DiscountListHeader() {
  const { hp, twoPaneView } = useResponsive();

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
          style={{
            marginRight: "2%",
            width: twoPaneView ? "33%" : "38%",
          }}
          fontSize="sm"
          fontWeight="medium"
        >
          {t("DISCOUNT NAME")}
        </DefaultText>

        {twoPaneView && (
          <DefaultText
            style={{ width: "25%" }}
            fontSize="sm"
            fontWeight="medium"
          >
            {t("DISCOUNT TYPE")}
          </DefaultText>
        )}

        <DefaultText
          style={{
            marginRight: "2%",
            width: twoPaneView ? "18%" : "28%",
            textAlign: "right",
          }}
          fontSize="sm"
          fontWeight="medium"
        >
          {t("DISCOUNT VALUE")}
        </DefaultText>

        <DefaultText
          style={{
            marginRight: "2%",
            width: twoPaneView ? "18%" : "28%",
            textAlign: "right",
          }}
          fontSize="sm"
          fontWeight="medium"
        >
          {t("EXPIRY DATE")}
        </DefaultText>
      </View>

      <SeparatorHorizontalView />
    </>
  );
}
