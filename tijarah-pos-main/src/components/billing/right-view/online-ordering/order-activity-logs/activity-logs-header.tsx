import React from "react";
import { View } from "react-native";
import { t } from "../../../../../../i18n";
import { useTheme } from "../../../../../context/theme-context";
import { useResponsive } from "../../../../../hooks/use-responsiveness";
import DefaultText from "../../../../text/Text";

export default function ActivityLogsHeader() {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();

  return (
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
            style={{ width: "22%", marginLeft: "1%", marginRight: "2%" }}
            fontSize="sm"
            fontWeight="medium"
          >
            {t("DATE & TIME")}
          </DefaultText>

          <DefaultText
            style={{ width: "23%", marginRight: "2%" }}
            fontSize="sm"
            fontWeight="medium"
          >
            {t("UPDATED BY")}
          </DefaultText>
        </>
      ) : (
        <View style={{ width: "32%", marginLeft: "1%", marginRight: "2%" }}>
          <DefaultText fontSize="sm" fontWeight="medium">
            {`${t("DATE & TIME")}/`}
          </DefaultText>

          <DefaultText fontSize="sm" fontWeight="medium">
            {t("UPDATED BY")}
          </DefaultText>
        </View>
      )}

      <DefaultText
        style={{ width: twoPaneView ? "49%" : "64%", marginRight: "1%" }}
        fontSize="sm"
        fontWeight="medium"
      >
        {t("EVENTS")}
      </DefaultText>
    </View>
  );
}
