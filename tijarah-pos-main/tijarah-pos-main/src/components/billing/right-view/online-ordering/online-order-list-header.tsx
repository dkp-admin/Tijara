import React from "react";
import { View } from "react-native";
import { t } from "../../../../../i18n";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import SeparatorHorizontalView from "../../../common/separator-horizontal-view";
import DefaultText from "../../../text/Text";

export default function OnlineOrderListHeader() {
  const { hp, twoPaneView } = useResponsive();

  return (
    <>
      <View
        style={{
          paddingVertical: hp("1.5%"),
          paddingHorizontal: hp("2.5%"),
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {twoPaneView ? (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <DefaultText
              style={{ width: "11%", marginRight: "2%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {`${t("ORDER")}#`}
            </DefaultText>

            <DefaultText
              style={{ width: "12%", marginRight: "2%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("DATE & TIME")}
            </DefaultText>

            <DefaultText
              style={{ width: "22%", marginRight: "2%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("CUSTOMER")}
            </DefaultText>

            <DefaultText
              style={{ width: "10%", marginRight: "2%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("SOURCE")}
            </DefaultText>

            <DefaultText
              style={{ width: "10%", marginRight: "2%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("PAYMENT")}
            </DefaultText>

            <DefaultText
              style={{ width: "11%", marginRight: "2%", textAlign: "right" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("TOTAL BILL")}
            </DefaultText>

            <DefaultText
              style={{ width: "11%", marginRight: "1%", textAlign: "right" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("ORDER STATUS")}
            </DefaultText>
          </View>
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: "38%", marginRight: "2%" }}>
              <DefaultText fontSize="sm" fontWeight="medium">
                {`${t("ORDER")}#`}
              </DefaultText>

              <DefaultText fontSize="sm" fontWeight="medium">
                {t("DATE & TIME")}
              </DefaultText>
            </View>

            <DefaultText
              style={{ width: "22%", marginRight: "2%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("PAYMENT")}
            </DefaultText>

            <View style={{ width: "35%", marginRight: "1%" }}>
              <DefaultText
                style={{ textAlign: "right" }}
                fontSize="sm"
                fontWeight="medium"
              >
                {t("ORDER STATUS")}
              </DefaultText>

              <DefaultText
                style={{ textAlign: "right" }}
                fontSize="sm"
                fontWeight="medium"
              >
                {t("DELIVERY TYPE")}
              </DefaultText>
            </View>
          </View>
        )}
      </View>

      <SeparatorHorizontalView />
    </>
  );
}
