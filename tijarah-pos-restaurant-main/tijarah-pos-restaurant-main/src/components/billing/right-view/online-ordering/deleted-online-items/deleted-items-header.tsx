import React from "react";
import { View } from "react-native";
import { t } from "../../../../../../i18n";
import { useTheme } from "../../../../../context/theme-context";
import { useResponsive } from "../../../../../hooks/use-responsiveness";
import DefaultText from "../../../../text/Text";

export default function DeletedItemsHeader() {
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
      <DefaultText
        style={{
          width: twoPaneView ? "50%" : "65%",
          marginLeft: "1%",
          marginRight: "4%",
        }}
        fontSize="sm"
        fontWeight="medium"
      >
        {t("ITEMS")}
      </DefaultText>

      {twoPaneView ? (
        <>
          <DefaultText
            style={{ width: "18%", marginRight: "2%" }}
            fontSize="sm"
            fontWeight="medium"
          >
            {t("QTY")}
          </DefaultText>

          <DefaultText
            style={{ width: "24%", marginRight: "1%", textAlign: "right" }}
            fontSize="sm"
            fontWeight="medium"
          >
            {t("TOTAL")}
          </DefaultText>
        </>
      ) : (
        <View
          style={{ width: "29%", marginRight: "1%", alignItems: "flex-end" }}
        >
          <DefaultText fontSize="sm" fontWeight="medium">
            {`${t("TOTAL")}/`}
          </DefaultText>

          <DefaultText fontSize="sm" fontWeight="medium">
            {t("QTY")}
          </DefaultText>
        </View>
      )}
    </View>
  );
}
