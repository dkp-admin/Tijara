import React from "react";
import { View } from "react-native";
import { t } from "../../../i18n";
import { useResponsive } from "../../hooks/use-responsiveness";
import SeparatorHorizontalView from "../common/separator-horizontal-view";
import DefaultText from "../text/Text";

export default function PrintListHeader() {
  const { hp } = useResponsive();

  return (
    <>
      <View
        style={{
          paddingVertical: hp("1.5%"),
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <DefaultText
          style={{
            marginRight: "3%",
            width: "60%",
          }}
          fontSize="sm"
          fontWeight="medium"
        >
          {t("PRODUCT")}
        </DefaultText>

        <DefaultText
          style={{
            width: "15%",
            textAlign: "left",
          }}
          fontSize="sm"
          fontWeight="medium"
        >
          {t("LABELS")}
        </DefaultText>

        <DefaultText
          style={{
            width: "12%",
            textAlign: "center",
          }}
          fontSize="sm"
          fontWeight="medium"
        >
          {t("EXPIRY DATE")}
        </DefaultText>
        <DefaultText
          style={{
            marginLeft: "3.5%",
            width: "5%",
            textAlign: "right",
          }}
          fontSize="sm"
          fontWeight="medium"
        >
          {t("ACTION")}
        </DefaultText>
      </View>

      <SeparatorHorizontalView />
    </>
  );
}
