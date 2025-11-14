import React from "react";
import { View } from "react-native";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import DefaultText from "../../../text/Text";

export default function BatchesHeader() {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();

  return (
    <>
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
        {twoPaneView ? (
          <>
            <DefaultText
              style={{ width: "12%", marginRight: "2%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("Batch")}
            </DefaultText>

            <DefaultText
              style={{ width: "34%", marginRight: "2%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("VENDOR")}
            </DefaultText>

            <View style={{ width: "15%", marginRight: "2%" }}>
              <DefaultText fontSize="sm" fontWeight="medium">
                {t("RECEIVED")}
              </DefaultText>

              <DefaultText fontSize="sm" fontWeight="medium">
                {` ${t("QTY")}.`}
              </DefaultText>
            </View>

            <DefaultText
              style={{ width: "15%", marginRight: "2%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("BATCH TRANSFERS")}
            </DefaultText>

            <View style={{ width: "15%", marginRight: "1%" }}>
              <DefaultText
                style={{ textAlign: "right" }}
                fontSize="sm"
                fontWeight="medium"
              >
                {t("AVAILABLE")}
              </DefaultText>

              <DefaultText
                style={{ textAlign: "right" }}
                fontSize="sm"
                fontWeight="medium"
              >
                {` ${t("QTY")}.`}
              </DefaultText>
            </View>
          </>
        ) : (
          <>
            <DefaultText
              style={{ width: "17%", marginRight: "3%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("BATCH")}
            </DefaultText>

            <View style={{ width: "38%", marginRight: "2%" }}>
              <DefaultText fontSize="sm" fontWeight="medium">
                {t("RECEIVED")}
              </DefaultText>

              <DefaultText fontSize="sm" fontWeight="medium">
                {` ${t("QTY")}.`}
              </DefaultText>
            </View>

            <View style={{ width: "39%", marginRight: "1%" }}>
              <DefaultText
                style={{ textAlign: "right" }}
                fontSize="sm"
                fontWeight="medium"
              >
                {t("AVAILABLE")}
              </DefaultText>

              <DefaultText
                style={{ textAlign: "right" }}
                fontSize="sm"
                fontWeight="medium"
              >
                {` ${t("QTY")}.`}
              </DefaultText>
            </View>
          </>
        )}
      </View>
    </>
  );
}
