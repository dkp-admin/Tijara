import React from "react";
import { View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import DefaultText from "../../text/Text";

export default function ModifierHeader() {
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
              style={{ width: "42%", marginRight: "3%" }} // 32%
              fontSize="sm"
              fontWeight="medium"
            >
              {t("NAME")}
            </DefaultText>

            <DefaultText
              style={{ width: "19%", marginRight: "2%" }} // 18%
              fontSize="sm"
              fontWeight="medium"
            >
              {`${t("MIN")}. ${t("OPTIONS")}`}
            </DefaultText>

            <DefaultText
              style={{ width: "19%", marginRight: "2%" }} // 18%
              fontSize="sm"
              fontWeight="medium"
            >
              {`${t("MAX")}. ${t("OPTIONS")}`}
            </DefaultText>

            <DefaultText
              style={{ width: "6%", marginRight: "2%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("STATUS")}
            </DefaultText>

            {/* <DefaultText
              style={{ width: "18%", marginRight: "2%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("FREE OPTIONS")}
            </DefaultText> */}
          </>
        ) : (
          <>
            <DefaultText
              style={{ width: "48%", marginRight: "3%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("NAME")}
            </DefaultText>

            <DefaultText
              style={{ width: "20%", marginRight: "2%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {`${t("MIN")}. ${t("OPTIONS")}`}
            </DefaultText>

            <DefaultText
              style={{ width: "20%", marginRight: "2%" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {`${t("MAX")}. ${t("OPTIONS")}`}
            </DefaultText>
          </>
        )}

        <View style={{ width: "5%" }}>
          <DefaultText />
        </View>
      </View>
    </>
  );
}
