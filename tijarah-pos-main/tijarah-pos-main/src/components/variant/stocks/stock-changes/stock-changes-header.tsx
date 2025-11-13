import React from "react";
import { View } from "react-native";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import DefaultText from "../../../text/Text";

export default function StockChangesHeader() {
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
              style={{ width: "14%", marginRight: "2%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("DATE & TIME")}
            </DefaultText>

            <DefaultText
              style={{ width: "18%", marginRight: "2%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {`${t("NAME")}/${t("SKU")}`}
            </DefaultText>

            <DefaultText
              style={{ width: "12%", marginRight: "2%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("PACK/SIZE")}
            </DefaultText>

            <DefaultText
              style={{ width: "16%", marginRight: "2%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("VENDOR")}
            </DefaultText>

            <DefaultText
              style={{ width: "13%", marginRight: "2%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("TOTAL COST")}
            </DefaultText>

            <DefaultText
              style={{ width: "16%", marginRight: "1%", textAlign: "right" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("ADJUSTMENTS")}
            </DefaultText>
          </>
        ) : (
          <>
            <DefaultText
              style={{ width: "17%", marginRight: "3%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("DATE & TIME")}
            </DefaultText>

            <DefaultText
              style={{ width: "32%", marginRight: "3%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {`${t("NAME")}/${t("SKU")}`}
            </DefaultText>

            <DefaultText fontSize="sm" fontWeight="medium">
              {}
            </DefaultText>

            <DefaultText
              style={{ width: "44%", marginRight: "1%", textAlign: "right" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("ADJUSTMENTS")}
            </DefaultText>
          </>
        )}
      </View>
    </>
  );
}
