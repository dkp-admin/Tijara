import React from "react";
import { View } from "react-native";
import { t } from "../../../i18n";
import { useResponsive } from "../../hooks/use-responsiveness";
import SeparatorHorizontalView from "../common/separator-horizontal-view";
import DefaultText from "../text/Text";
import { useCurrency } from "../../store/get-currency";

export default function GlobalProductHeader() {
  const { wp, hp, twoPaneView } = useResponsive();
  const { currency } = useCurrency();

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
        <View style={{ width: "5%", marginRight: wp("1.8%") }}>
          <DefaultText />
        </View>

        {twoPaneView ? (
          <>
            <DefaultText
              style={{ width: "45%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("PRODUCT NAME")}
            </DefaultText>

            <DefaultText
              style={{ width: "20%", textAlign: "right" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("CATEGORY")}
            </DefaultText>
          </>
        ) : (
          <View style={{ width: "55%", marginLeft: "5%", marginRight: "5%" }}>
            <DefaultText fontSize="sm" fontWeight="medium">
              {`${t("PRODUCT NAME")}/`}
            </DefaultText>

            <DefaultText fontSize="sm" fontWeight="medium">
              {t("CATEGORY")}
            </DefaultText>
          </View>
        )}

        <View style={{ width: "23%" }}>
          <DefaultText
            style={{ alignSelf: "flex-end" }}
            fontSize="sm"
            fontWeight="medium"
          >
            {`${t("PRICE")} (${currency})/`}
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
