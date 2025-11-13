import React from "react";
import { View } from "react-native";
import { t } from "../../../../../i18n";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import DefaultText from "../../../text/Text";

export default function TopProductsHeader() {
  const { wp, hp, twoPaneView } = useResponsive();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingTop: hp("3.5%"),
        paddingBottom: hp("1%"),
        marginHorizontal: wp("1.7%"),
      }}
    >
      <DefaultText style={{ width: "12%" }} fontSize="sm" color="otherGrey.100">
        {"SN"}
      </DefaultText>

      <DefaultText
        style={{ width: twoPaneView ? "70%" : "65%" }} //{{ width: twoPaneView ? "45%" : "40%" }}
        fontSize="sm"
        color="otherGrey.100"
      >
        {t("Name")}
      </DefaultText>

      {/* <DefaultText style={{ width: "16%" }} fontSize="sm" color="otherGrey.100">
        {t("Price")}
      </DefaultText> */}

      {/* <DefaultText style={{ width: "25%" }} fontSize="sm" color="otherGrey.100">
        {t("Total Order")}
      </DefaultText> */}

      <DefaultText style={{ width: "25%" }} fontSize="sm" color="otherGrey.100">
        {t("Total Sales")}
      </DefaultText>
    </View>
  );
}
