import React from "react";
import { View } from "react-native";
import { t } from "../../../../../i18n";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import SeparatorHorizontalView from "../../../common/separator-horizontal-view";
import DefaultText from "../../../text/Text";

export default function PromotionsListHeader() {
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
            width: "30%",
          }}
          fontSize="sm"
          fontWeight="medium"
        >
          {t("PROMOTION NAME")}
        </DefaultText>

        {/* <DefaultText
          style={{
            marginRight: "2%",
            width: "20%",
            textAlign: "right",
          }}
          fontSize="sm"
          fontWeight="medium"
        >
          {t("PROMOTION VALUE")}
        </DefaultText> */}

        <DefaultText
          style={{
            marginRight: "2%",
            width: "20%",
          }}
          fontSize="sm"
          fontWeight="medium"
        >
          {t("PROMOTION CODE")}
        </DefaultText>

        <DefaultText
          style={{
            marginRight: "2%",
            width: "20%",
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
