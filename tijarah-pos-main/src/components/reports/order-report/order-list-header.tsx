import { format } from "date-fns";
import React from "react";
import { View } from "react-native";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import SeparatorHorizontalView from "../../common/separator-horizontal-view";
import CurrencyView from "../../modal/currency-view-modal";
import DefaultText from "../../text/Text";

export default function OrderListHeader({ data }: any) {
  const theme = useTheme();
  const { hp } = useResponsive();

  return (
    <>
      <SeparatorHorizontalView />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: hp("2%"),
          paddingRight: hp("3%"),
          paddingVertical: hp("2%"),
          backgroundColor: "#E6E8F0",
        }}
      >
        <DefaultText
          style={{ fontFamily: theme.fonts.circulatStd }}
          fontSize="lg"
          fontWeight="medium"
        >
          {format(new Date(data?.date), "EEEE, do MMMM yyyy")}
        </DefaultText>

        <View style={{ alignSelf: "flex-end" }}>
          <CurrencyView
            amount={Number(data?.amount || 0)?.toFixed(2)}
            symbolFontsize={14}
            amountFontsize={22}
            decimalFontsize={22}
            symbolFontweight="medium"
            amountFontweight="medium"
            decimalFontweight="medium"
          />
        </View>
      </View>
    </>
  );
}
