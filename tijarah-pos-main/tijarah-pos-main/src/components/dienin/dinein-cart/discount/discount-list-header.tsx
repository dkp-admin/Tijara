import React from "react";
import { View } from "react-native";
import { t } from "../../../../../i18n";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import SeparatorHorizontalView from "../../../common/separator-horizontal-view";
import DefaultText from "../../../text/Text";

export default function DiscountListHeaderDinein() {
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
          style={{
            marginRight: "2%",
            width: "33%",
          }}
          fontSize="sm"
          fontWeight="medium"
        >
          {t("DISCOUNT NAME")}
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
          {t("DISCOUNT VALUE")}
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
          {t("EXPIRY DATE")}
        </DefaultText>

        <View style={{ width: "10%" }}>
          <DefaultText />
        </View>
      </View>

      <SeparatorHorizontalView />
    </>
  );
}
