import React from "react";
import { View } from "react-native";
import { t } from "../../../../i18n";
import { useResponsive } from "../../../hooks/use-responsiveness";
import SeparatorHorizontalView from "../../common/separator-horizontal-view";
import DefaultText from "../../text/Text";
import { useCurrency } from "../../../store/get-currency";

export default function BillingOrderHeader() {
  const { wp, hp, twoPaneView } = useResponsive();
  const { currency } = useCurrency();
  return (
    <>
      <View
        style={{
          paddingVertical: hp("1%"),
          paddingHorizontal: hp("2%"),
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {twoPaneView ? (
          <>
            <View style={{ width: "45%", marginRight: "2%" }}>
              <DefaultText fontSize="sm" fontWeight="medium">
                {t("PRODUCT NAME")}
              </DefaultText>

              <DefaultText fontSize="sm" fontWeight="medium">
                {t("QUANTITY")}
              </DefaultText>
            </View>

            <View style={{ width: "13%", marginRight: "2%" }}>
              <DefaultText fontSize="sm" fontWeight="medium">
                {t("SELLING")}
              </DefaultText>

              <DefaultText fontSize="sm" fontWeight="medium">
                {t("PRICE")}
              </DefaultText>
            </View>

            <View style={{ width: "13%", marginRight: "2%" }}>
              <DefaultText fontSize="sm" fontWeight="medium">
                {`${t("VAT")} ${t("AMOUNT")}.`}
              </DefaultText>

              {/* {businessData?.company?.industry?.toLowerCase() === "retail" && (
                <DefaultText fontSize="sm" fontWeight="medium">
                  {`${t("VAT")}%`}
                </DefaultText>
              )} */}
            </View>
          </>
        ) : (
          <>
            <DefaultText
              style={{ width: "48%", marginRight: "2%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("PRODUCT NAME")}
            </DefaultText>

            <DefaultText
              style={{ width: "13%", marginRight: "2%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("VAT")}
            </DefaultText>
          </>
        )}

        <View
          style={{
            width: twoPaneView ? "21%" : "33%",
            marginLeft: "2%",
            marginRight: wp("1.8%"),
          }}
        >
          <DefaultText
            style={{ textAlign: "right" }}
            fontSize="sm"
            fontWeight="medium"
          >
            {`${t("TOTAL")} (${currency})`}
          </DefaultText>
        </View>
      </View>

      <SeparatorHorizontalView />
    </>
  );
}
