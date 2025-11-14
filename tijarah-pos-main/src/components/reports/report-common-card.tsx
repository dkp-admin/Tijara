import React from "react";
import { View } from "react-native";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import CurrencyView from "../modal/currency-view-modal";
import Spacer from "../spacer";
import DefaultText from "../text/Text";
import ToolTip from "../tool-tip";

export default function ReportCommonCard({ data, amountColor }: any) {
  const theme = useTheme();
  const { hp } = useResponsive();

  return (
    <>
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          marginVertical: hp("2%"),
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <DefaultText
            style={{
              fontSize: 12,
              fontWeight: "700",
              fontFamily: theme.fonts.circulatStd,
            }}
            color="otherGrey.100"
          >
            {data.title}
          </DefaultText>

          {data?.infoMsg && (
            <View style={{ marginLeft: 8, marginBottom: 0 }}>
              <ToolTip infoMsg={data?.infoMsg} />
            </View>
          )}
        </View>

        <Spacer space={10} />

        {data?.amount ? (
          <CurrencyView
            amount={data.amount}
            symbolFontsize={16}
            amountFontsize={24}
            decimalFontsize={14}
            symbolColor={amountColor || theme.colors.text.primary}
            amountColor={amountColor || theme.colors.text.primary}
            decimalColor={amountColor || theme.colors.text.primary}
          />
        ) : (
          <DefaultText fontSize="3xl" fontWeight="medium">
            {data.value}
          </DefaultText>
        )}

        {data?.desc && (
          <>
            <Spacer space={10} />

            <DefaultText
              fontSize="sm"
              fontWeight="medium"
              color="otherGrey.100"
            >
              {data.desc}
            </DefaultText>
          </>
        )}
      </View>
    </>
  );
}
