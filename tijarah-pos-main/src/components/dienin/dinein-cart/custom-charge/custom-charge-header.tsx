import React from "react";
import { View } from "react-native";
import { t } from "../../../../../i18n";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import SeparatorHorizontalView from "../../../common/separator-horizontal-view";
import DefaultText from "../../../text/Text";

export default function CustomChargeHaederDinein() {
  const { hp } = useResponsive();

  return (
    <View>
      <View
        style={{
          paddingVertical: hp("1.5%"),
          paddingHorizontal: hp("3%"),
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <DefaultText
          style={{
            marginRight: "2%",
            width: "33%",
          }}
          fontSize="sm"
          fontWeight="medium"
        >
          {t("CHARGE NAME")}
        </DefaultText>

        <DefaultText
          style={{
            marginRight: "2%",
            width: "23%",
            textAlign: "right",
          }}
          fontSize="sm"
          fontWeight="medium"
        >
          {t("CHARGE VALUE")}
        </DefaultText>

        <DefaultText
          style={{
            marginRight: "2%",
            width: "28%",
            textAlign: "right",
          }}
          fontSize="sm"
          fontWeight="medium"
        >
          {t("CHARGE TYPE")}
        </DefaultText>

        <View style={{ width: "10%" }}>
          <DefaultText />
        </View>
      </View>

      <SeparatorHorizontalView />
    </View>
  );
}
