import React from "react";
import { View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import DefaultText from "../../text/Text";

export default function TimeEventHeader() {
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
            style={{ width: "20%", marginRight: "3%" }}
            fontSize="sm"
            fontWeight="medium"
          >
            {t("NAME")}
          </DefaultText>

          <DefaultText
            style={{ width: "24%", marginRight: "3%" }}
            fontSize="sm"
            fontWeight="medium"
          >
            {t("TYPE")}
          </DefaultText>

          <DefaultText
            style={{ width: "30%", marginRight: "3%" }}
            fontSize="sm"
            fontWeight="medium"
          >
            {t("PERIOD")}
          </DefaultText>

          <DefaultText
            style={{ width: "17%", textAlign: "right" }}
            fontSize="sm"
            fontWeight="medium"
          >
            {t("STATUS")}
          </DefaultText>
        </>
      ) : (
        <>
          <View style={{ width: "37%", marginRight: "3%" }}>
            <DefaultText fontSize="sm" fontWeight="medium">
              {`${t("NAME")}/`}
            </DefaultText>

            <DefaultText fontSize="sm" fontWeight="medium">
              {t("TYPE")}
            </DefaultText>
          </View>

          <View style={{ width: "60%", alignItems: "flex-end" }}>
            <DefaultText fontSize="sm" fontWeight="medium">
              {`${t("PERIOD")}/`}
            </DefaultText>

            <DefaultText fontSize="sm" fontWeight="medium">
              {t("STATUS")}
            </DefaultText>
          </View>
        </>
      )}
    </View>
  );
}
