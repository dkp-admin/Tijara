import React from "react";
import DefaultText, { getOriginalSize } from "../text/Text";
import { t } from "../../../i18n";
import { checkDirection } from "../../hooks/use-direction-check";
import { View } from "react-native";

export const getAmount = (amount: number) => {
  if (amount < 1000) {
    return `${amount?.toFixed(2)}`;
  } else if (amount >= 1000 && amount <= 100000) {
    return `${(amount / 1000)?.toFixed(2) + "K"}`;
  } else if (amount >= 100000 && amount <= 10000000) {
    return `${(amount / 100000)?.toFixed(2) + "L"}`;
  } else if (amount >= 10000000 && amount <= 1000000000) {
    return `${(amount / 10000000)?.toFixed(2) + "M"}`;
  } else {
    return `${(amount / 1000000000)?.toFixed(2) + "B"}`;
  }
};

export default function CurrencyView({
  amount,
  strikethrough,
  large,
  report,
  symbolFontsize,
  amountFontsize,
  decimalFontsize,
  symbolFontweight,
  amountFontweight,
  decimalFontweight,
  symbolColor = "text.primary",
  amountColor = "text.primary",
  decimalColor = "text.primary",
}: {
  amount: string;
  strikethrough?: boolean;
  large?: boolean;
  report?: boolean;
  perTrip?: boolean;
  symbolFontsize?: number | string;
  amountFontsize?: number | string;
  decimalFontsize?: number | string;
  symbolFontweight?: string;
  amountFontweight?: string;
  decimalFontweight?: string;
  symbolColor?: string;
  amountColor?: string;
  decimalColor?: string;
}) {
  const isRTL = checkDirection();

  // const amt = amount?.split(".");

  // function currencyFormat(num: string) {
  //   return num.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  // }

  return (
    <View
      style={{
        flexDirection: isRTL ? "row-reverse" : "row",
        justifyContent: isRTL ? "flex-end" : "flex-start",
      }}
    >
      <View
        style={{
          flexDirection: isRTL ? "row-reverse" : "row",
          alignItems: "baseline",
        }}
      >
        <DefaultText
          style={{
            textDecorationLine: strikethrough && ("line-through" as any),
            fontSize:
              getOriginalSize(symbolFontsize) || (getOriginalSize(12) as any),
            letterSpacing: getOriginalSize(-0.2) as any,
          }}
          fontWeight={symbolFontweight || "medium"}
          color={symbolColor}
        >
          {t("SAR")}
        </DefaultText>

        <DefaultText
          fontWeight={amountFontweight || "medium"}
          color={amountColor}
          style={{
            marginLeft: isRTL ? 0 : getOriginalSize(4),
            marginRight: isRTL ? getOriginalSize(4) : 0,
            textDecorationLine: strikethrough && ("line-through" as any),
            fontSize:
              getOriginalSize(amountFontsize) || (getOriginalSize(20) as any),
            letterSpacing: getOriginalSize(-0.2) as any,
          }}
        >
          {getAmount(Number(amount))}
          {/* {amt?.length > 1
            ? currencyFormat(amt[0]) + "."
            : currencyFormat(amt[0])} */}
        </DefaultText>
      </View>

      {/* {amt?.length > 1 && (
        <View
          style={{
            flexDirection: isRTL ? "row-reverse" : "row",
            alignItems: "flex-start",
          }}
        >
          <DefaultText
            color={decimalColor}
            style={{
              textDecorationLine: strikethrough && ("line-through" as any),
              fontSize: decimalFontsize || (20 as any),
              letterSpacing: large && (-0.2 as any),
              marginTop: report && (0.5 as any),
            }}
            fontWeight={decimalFontweight || "medium"}
          >
            {amt[1]}
          </DefaultText>
        </View>
      )} */}
    </View>
  );
}
