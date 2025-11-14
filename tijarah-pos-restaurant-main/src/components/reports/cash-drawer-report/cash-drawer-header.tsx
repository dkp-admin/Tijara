import React from "react";
import { View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import SeparatorHorizontalView from "../../common/separator-horizontal-view";
import DefaultText from "../../text/Text";

export default function CashDrawerHeader() {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: hp("2%"),
          paddingRight: hp("3%"),
          paddingVertical: hp("1.75%"),
          backgroundColor: theme.colors.white[1000],
        }}
      >
        <DefaultText
          style={{ width: twoPaneView ? "15%" : "42%", marginRight: "3%" }}
          fontSize="sm"
          fontWeight="medium"
        >
          {t("STAFF")}
        </DefaultText>

        <DefaultText
          style={{ width: twoPaneView ? "10%" : "25%" }}
          fontSize="sm"
          fontWeight="medium"
        >
          {t("SHIFT IN")}
        </DefaultText>

        <DefaultText
          style={{ width: twoPaneView ? "10%" : "25%" }}
          fontSize="sm"
          fontWeight="medium"
        >
          {t("SHIFT OUT")}
        </DefaultText>

        {twoPaneView && (
          <>
            <DefaultText
              style={{ width: "10%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("OPENING EXPECTED")}
            </DefaultText>

            <DefaultText
              style={{ width: "10%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("OPENING ACTUAL")}
            </DefaultText>

            <DefaultText
              style={{ width: "10%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("CLOSING EXPECTED")}
            </DefaultText>

            <DefaultText
              style={{ width: "10%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("CLOSING ACTUAL")}
            </DefaultText>

            <DefaultText
              style={{ width: "10%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("DIFFERENCE")}
            </DefaultText>

            <DefaultText
              style={{ width: "12%", textAlign: "right" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("TOTAL SALES")}
            </DefaultText>
          </>
        )}
      </View>

      <SeparatorHorizontalView />
    </>
  );
}
