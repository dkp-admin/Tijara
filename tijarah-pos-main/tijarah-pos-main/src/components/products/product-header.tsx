import React from "react";
import { View } from "react-native";
import { t } from "../../../i18n";
import { useResponsive } from "../../hooks/use-responsiveness";
import SeparatorHorizontalView from "../common/separator-horizontal-view";
import DefaultText from "../text/Text";

export default function ProductHeader() {
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
        <View style={{ width: twoPaneView ? "55%" : "70%" }}>
          <DefaultText fontSize="sm" fontWeight="medium">
            {t("PRODUCT NAME")}
          </DefaultText>

          <DefaultText fontSize="sm" fontWeight="medium">
            {t("QUANTITY")}
          </DefaultText>
        </View>

        {twoPaneView && (
          <>
            <DefaultText
              style={{ width: "10%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("STOCK")}
            </DefaultText>

            <DefaultText
              style={{ width: "8%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("STATUS")}
            </DefaultText>
          </>
        )}

        <View style={{ width: twoPaneView ? "20%" : "23%" }}>
          <DefaultText
            style={{ alignSelf: "flex-end" }}
            fontSize="sm"
            fontWeight="medium"
          >
            {`${t("PRICE")} (${t("SAR")})/`}
          </DefaultText>

          <DefaultText
            style={{ alignSelf: "flex-end" }}
            fontSize="sm"
            fontWeight="medium"
          >
            {t("VARIANTS")}
          </DefaultText>
        </View>

        <View
          style={{ width: "7%", marginLeft: wp("2.5%"), marginRight: wp("2%") }}
        >
          <DefaultText />
        </View>
      </View>

      <SeparatorHorizontalView />
    </>
  );
}
