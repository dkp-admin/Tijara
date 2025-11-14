import { format } from "date-fns";
import React from "react";
import { View } from "react-native";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import CurrencyView from "../modal/currency-view-modal";
import Spacer from "../spacer";
import DefaultText from "../text/Text";
import Label from "../text/label";

export default function CustomerWalletHistory({
  walletHistory,
}: {
  walletHistory: any[];
}) {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();

  const getAmount = (wallet: any) => {
    if (wallet.transactionType === "credit") {
      return `+${Number(wallet.amount || 0)?.toFixed(2)}`;
    } else {
      return `-${Number(wallet.amount || 0)?.toFixed(2)}`;
    }
  };

  return (
    <View>
      <Spacer space={hp("5%")} />

      <Label>
        {`${t("Wallet History")} - (${t("Showing latest 5 history")})`}
      </Label>

      {walletHistory.map((wallet: any, index: number) => {
        const length = walletHistory.length - 1;

        return (
          <View key={wallet._id}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: hp("2%"),
                paddingHorizontal: hp("2.5%"),
                borderWidth: 0,
                borderBottomWidth: index === length ? 0 : 1.1,
                borderColor: "#E5E9EC",
                borderTopLeftRadius: index === 0 ? 16 : 0,
                borderTopRightRadius: index === 0 ? 16 : 0,
                borderBottomLeftRadius: index === length ? 16 : 0,
                borderBottomRightRadius: index === length ? 16 : 0,
                backgroundColor: theme.colors.white[1000],
              }}
            >
              {twoPaneView ? (
                <DefaultText fontSize="xl" color="otherGrey.200">
                  {format(new Date(wallet.createdAt), "dd MMM, yyyy, h:mm a")}
                </DefaultText>
              ) : (
                <View>
                  <DefaultText fontSize="xl" color="otherGrey.200">
                    {format(new Date(wallet.createdAt), "dd MMM, yyyy")}
                  </DefaultText>
                  <DefaultText fontSize="xl" color="otherGrey.200">
                    {format(new Date(wallet.createdAt), "hh:mm a")}
                  </DefaultText>
                </View>
              )}

              <CurrencyView
                amount={getAmount(wallet)}
                symbolFontsize={16}
                amountFontsize={19}
                decimalFontsize={19}
                symbolFontweight="normal"
                amountFontweight="normal"
                decimalFontweight="normal"
                symbolColor={
                  wallet.transactionType === "credit"
                    ? theme.colors.primary[1000]
                    : theme.colors.red.default
                }
                amountColor={
                  wallet.transactionType === "credit"
                    ? theme.colors.primary[1000]
                    : theme.colors.red.default
                }
                decimalColor={
                  wallet.transactionType === "credit"
                    ? theme.colors.primary[1000]
                    : theme.colors.red.default
                }
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
