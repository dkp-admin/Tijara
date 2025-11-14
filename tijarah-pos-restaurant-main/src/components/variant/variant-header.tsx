import React from "react";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import DefaultText from "../text/Text";
import { View } from "react-native";

export default function VariantHeader() {
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
              style={{ width: "27%", marginRight: "3%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("VARIANT NAME")}
            </DefaultText>

            <DefaultText
              style={{ width: "17%", marginRight: "3%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("SKU")}
            </DefaultText>

            <DefaultText
              style={{ width: "22%", marginRight: "3%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("PRICE")}
            </DefaultText>

            <DefaultText
              style={{
                width: "17%",
                marginRight: "3%",
                textAlign: "right",
              }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("STOCK")}
            </DefaultText>
          </>
        ) : (
          <>
            <View style={{ width: "52%", marginRight: "3%" }}>
              <DefaultText fontSize="sm" fontWeight="medium">
                {`${t("VARIANT NAME")}/`}
              </DefaultText>

              <DefaultText fontSize="sm" fontWeight="medium">
                {t("SKU")}
              </DefaultText>
            </View>

            <View
              style={{
                width: "37%",
                marginRight: "3%",
                alignItems: "flex-end",
              }}
            >
              <DefaultText fontSize="sm" fontWeight="medium">
                {`${t("PRICE")}/`}
              </DefaultText>

              <DefaultText fontSize="sm" fontWeight="medium">
                {t("STOCK")}
              </DefaultText>
            </View>
          </>
        )}

        <View style={{ width: "5%" }}>
          <DefaultText />
        </View>
      </View>
    </>
  );
}
