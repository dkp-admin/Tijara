import React from "react";
import { View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import DefaultText from "../../text/Text";

export default function ActivityLogsTopHeader() {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();

  return (
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
        style={{ width: twoPaneView ? "35%" : "45%" }}
        fontSize="sm"
        fontWeight="medium"
      >
        {t("EVENT")}
      </DefaultText>

      <DefaultText
        style={{ width: twoPaneView ? "10%" : "15%" }}
        fontSize="sm"
        fontWeight="medium"
      >
        {t("TIME")}
      </DefaultText>

      {twoPaneView && (
        <DefaultText style={{ width: "25%" }} fontSize="sm" fontWeight="medium">
          {t("Response")}
        </DefaultText>
      )}

      <DefaultText
        style={{ width: twoPaneView ? "10%" : "25%", textAlign: "right" }}
        fontSize="sm"
        fontWeight="medium"
      >
        {t("TRIGGERED BY")}
      </DefaultText>

      <DefaultText
        style={{ width: "15%", textAlign: "right" }}
        fontSize="sm"
        fontWeight="medium"
      >
        {t("STATUS")}
      </DefaultText>
    </View>
  );
}
