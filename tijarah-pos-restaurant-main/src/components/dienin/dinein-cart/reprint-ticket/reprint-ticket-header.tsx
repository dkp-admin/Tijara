import React from "react";
import { View } from "react-native";
import { t } from "../../../../../i18n";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import SeparatorHorizontalView from "../../../common/separator-horizontal-view";
import DefaultText from "../../../text/Text";

export default function ReprintTicketHeader() {
  const { hp } = useResponsive();

  return (
    <>
      <View
        style={{
          paddingVertical: hp("1.5%"),
          paddingHorizontal: hp("3%"),
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <DefaultText
          style={{ marginRight: "2%", width: "33%" }}
          fontSize="sm"
          fontWeight="medium"
        >
          {t("KOT NUMBER")}
        </DefaultText>

        <DefaultText
          style={{ marginRight: "2%", width: "23%" }}
          fontSize="sm"
          fontWeight="medium"
        >
          {t("TIME")}
        </DefaultText>

        <DefaultText
          style={{ marginRight: "2%", width: "23%" }}
          fontSize="sm"
          fontWeight="medium"
        >
          {t("NO OF ITEMS")}
        </DefaultText>

        <DefaultText
          style={{ width: "15%", textAlign: "right" }}
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
