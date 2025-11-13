import React from "react";
import { View } from "react-native";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import SeparatorHorizontalView from "../common/separator-horizontal-view";
import DefaultText from "../text/Text";

export default function ExpensesListHeader() {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();

  return (
    <>
      <View
        style={{
          paddingVertical: hp("1.5%"),
          paddingHorizontal: hp("2%"),
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.colors.bgColor2,
        }}
      >
        {twoPaneView ? (
          <>
            <DefaultText
              style={{ width: "16%", marginRight: "2%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("EXPENSE NAME")}
            </DefaultText>

            <DefaultText
              style={{ width: "16%", marginRight: "2%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("EXPENSE TYPE")}
            </DefaultText>

            <View style={{ width: "13%", marginRight: "2%" }}>
              <DefaultText fontSize="sm" fontWeight="medium">
                {t("USER")}
              </DefaultText>

              <DefaultText fontSize="sm" fontWeight="medium">
                {t("DEVICE")}
              </DefaultText>
            </View>

            <DefaultText
              style={{ width: "13%", marginRight: "2%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("PAYMENT METHOD")}
            </DefaultText>

            <DefaultText
              style={{ width: "10%", marginRight: "2%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("AMOUNT")}
            </DefaultText>

            <View style={{ width: "10%", marginRight: "2%" }}>
              <DefaultText fontSize="sm" fontWeight="medium">
                {t("PAYMENT DATE")}
              </DefaultText>

              <DefaultText fontSize="sm" fontWeight="medium">
                {t("DUE DATE")}
              </DefaultText>
            </View>

            <DefaultText
              style={{ width: "10%", textAlign: "right" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("STATUS")}
            </DefaultText>
          </>
        ) : (
          <>
            <DefaultText
              style={{ width: "28%", marginRight: "2%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("EXPENSE NAME")}
            </DefaultText>

            <View style={{ width: "23%", marginRight: "2%" }}>
              <DefaultText fontSize="sm" fontWeight="medium">
                {t("USER")}
              </DefaultText>

              <DefaultText fontSize="sm" fontWeight="medium">
                {t("DEVICE")}
              </DefaultText>
            </View>

            <View style={{ width: "23%", marginRight: "2%" }}>
              <DefaultText fontSize="sm" fontWeight="medium">
                {t("AMOUNT")}
              </DefaultText>

              <DefaultText fontSize="sm" fontWeight="medium">
                {t("PAYMENT METHOD")}
              </DefaultText>
            </View>

            <View style={{ width: "18%", alignItems: "flex-end" }}>
              <DefaultText fontSize="sm" fontWeight="medium">
                {t("DATE")}
              </DefaultText>

              <DefaultText fontSize="sm" fontWeight="medium">
                {t("STATUS")}
              </DefaultText>
            </View>
          </>
        )}
      </View>

      <SeparatorHorizontalView />
    </>
  );
}
