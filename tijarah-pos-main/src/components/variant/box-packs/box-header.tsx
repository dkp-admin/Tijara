import React from "react";
import { View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import DefaultText from "../../text/Text";

export default function BoxPackHeader() {
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
              style={{ width: "19%", marginRight: "3%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("BOX SKU")}
            </DefaultText>

            <DefaultText
              style={{ width: "15%", marginRight: "3%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {`${t("NO")}. ${t("OF UNITS")}`}
            </DefaultText>

            <DefaultText
              style={{
                width: "27%",
                marginRight: "3%",
              }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("COST OF THE BOX")}
            </DefaultText>

            <DefaultText
              style={{
                width: "25%",
                textAlign: "right",
              }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("SELLING PRICE OF THE BOX")}
            </DefaultText>
          </>
        ) : (
          <>
            <DefaultText
              style={{ width: "32%", marginRight: "3%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("BOX SKU")}
            </DefaultText>

            <DefaultText
              style={{ width: "7%", marginRight: "3%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {`${t("NO")}. ${t("OF UNITS")}`}
            </DefaultText>

            <View
              style={{
                width: "50%",
                alignItems: "flex-end",
              }}
            >
              <DefaultText fontSize="sm" fontWeight="medium">
                {`${t("COST OF THE BOX")}/`}
              </DefaultText>

              <DefaultText fontSize="sm" fontWeight="medium">
                {t("SELLING PRICE OF THE BOX")}
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
