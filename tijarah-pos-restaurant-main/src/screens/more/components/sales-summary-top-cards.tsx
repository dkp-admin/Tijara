import React from "react";
import { View } from "react-native";
import CurrencyView from "../../../components/modal/currency-view-modal";
import DefaultText from "../../../components/text/Text";
import ICONS from "../../../utils/icons";
import { currencyValue } from "../../../utils/get-value-currency";

const SalesSummaryTopCards = ({
  title = "",
  bottomCount = 0,
  bottomText = "",
  topAmount = 0,
  showSar = true,
  Icon = <ICONS.WalletIcon />,
}: {
  title: string;
  bottomCount: any;
  bottomText: string;
  topAmount: number;
  showSar?: boolean;
  Icon: any;
}) => {
  return (
    <View
      style={{
        flex: 1,
        borderWidth: 2,
        borderColor: "#ededed",
        padding: 20,
        borderRadius: 20,
        backgroundColor: "#fff",
        width: "100%",
      }}
    >
      <DefaultText style={{ fontSize: 12, marginBottom: 10 }}>
        {title}
      </DefaultText>
      <View
        style={{
          marginBottom: 10,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {Icon}
        <View style={{ marginLeft: 10 }}>
          {showSar ? (
            <CurrencyView
              amountFontsize={28}
              decimalFontsize={24}
              symbolFontsize={20}
              amount={currencyValue(topAmount)}
            />
          ) : (
            <DefaultText style={{ fontSize: 28 }}>
              {topAmount.toString()}
            </DefaultText>
          )}
        </View>
      </View>
      <DefaultText style={{ marginTop: 10, textTransform: "capitalize" }}>
        {bottomText}
      </DefaultText>
      <DefaultText>{bottomCount}</DefaultText>
    </View>
  );
};

export default SalesSummaryTopCards;
