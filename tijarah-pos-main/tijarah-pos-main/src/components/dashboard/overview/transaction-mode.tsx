import React, { useMemo } from "react";
import { View } from "react-native";
import { VictoryPie } from "victory-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import CurrencyView from "../../modal/currency-view-modal";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import DefaultText from "../../text/Text";
import ToolTip from "../../tool-tip";

const colorsArr = ["#FFB547", "#0C7CD5", "#4339F2", "#FFB200"];

export default function TransactionMode({
  transactionData,
  handleBtnTap,
}: any) {
  const theme = useTheme();
  const { hp } = useResponsive();

  // const transactionModeData = useMemo(() => {
  //   const transaction: any[] = transactionData.map(
  //     (mode: any, index: number) => {
  //       return {
  //         name: mode.name,
  //         amount: Number(mode.grossRevenue || 0)?.toFixed(2),
  //         color: colorsArr[index],
  //       };
  //     }
  //   );

  //   return transaction || [];
  // }, [transactionData]);

  const transactionModeData = useMemo(() => {
    if (!transactionData) return [];

    let data: any[] = [];

    data.push({
      name: t("Cash"),
      amount: Number(transactionData?.txnWithCash || 0)?.toFixed(2),
      count: transactionData?.txnCountInCash || 0,
      color: colorsArr[0],
    });

    data.push({
      name: t("Card"),
      amount: Number(transactionData?.txnWithCard || 0)?.toFixed(2),
      count: transactionData?.txnCountInCard || 0,
      color: colorsArr[1],
    });

    data.push({
      name: t("Credit"),
      amount: Number(transactionData?.txnWithCredit || 0)?.toFixed(2),
      count: transactionData?.txnCountInCredit || 0,
      color: colorsArr[2],
    });

    data.push({
      name: t("Wallet"),
      amount: Number(transactionData?.txnWithWallet || 0)?.toFixed(2),
      count: transactionData?.txnCountInWallet || 0,
      color: colorsArr[3],
    });

    return data || [];
  }, [transactionData]);

  return (
    <View
      style={{
        borderRadius: 10,
        paddingTop: hp("2.5%"),
        paddingBottom: hp("2%"),
        paddingHorizontal: hp("1.75%"),
        backgroundColor: theme.colors.white[1000],
      }}
    >
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <DefaultText fontSize="sm" fontWeight="medium" color="dark.800">
          {t("TRANSACTIONS BY MODE")}
        </DefaultText>

        <ToolTip infoMsg={t("Data is showing for today's order")} />
        {/* <ToolTip infoMsg={t("Data is showing for last 30 days")} /> */}
      </View>

      {transactionModeData?.length > 0 ? (
        <>
          <View style={{ alignItems: "center" }}>
            <VictoryPie
              style={{
                labels: {
                  fill: "white",
                  stroke: "none",
                  fontSize: 10,
                  fontWeight: "bold",
                },
              }}
              height={hp("30")}
              innerRadius={hp("7.5%")}
              animate={{ duration: 2000 }}
              padding={{ top: 40, left: 40, right: 40, bottom: 20 }}
              data={transactionModeData?.map((transaction: any) => {
                return transaction?.amount;
              })}
              colorScale={transactionModeData?.map((data: any) => {
                return data?.color;
              })}
            />
          </View>

          <View
            style={{
              paddingVertical: hp("2.25%"),
              paddingHorizontal: hp("1%"),
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <DefaultText fontSize="sm" fontWeight="medium">
              {t("PAYMENT TYPE")}
            </DefaultText>

            <DefaultText
              style={{ textAlign: "right" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("AMOUNT")}
            </DefaultText>
          </View>

          {transactionModeData?.map((data: any) => {
            return (
              <View
                key={data.name}
                style={{
                  paddingBottom: hp("1.7%"),
                  paddingHorizontal: hp("1%"),
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 16,
                      height: 16,
                      marginRight: 8,
                      borderWidth: 3,
                      borderRadius: 50,
                      borderColor: data?.color,
                    }}
                  />

                  <DefaultText fontSize="lg">{data.name}</DefaultText>
                </View>

                <View style={{ alignSelf: "flex-end" }}>
                  <CurrencyView
                    amount={data.amount}
                    symbolFontsize={14}
                    amountFontsize={16}
                    decimalFontsize={16}
                    symbolColor="otherGrey.100"
                    amountColor="otherGrey.100"
                    decimalColor="otherGrey.100"
                  />
                </View>
              </View>
            );
          })}

          {/* <View
            style={{
              height: 1,
              marginTop: hp("0.5%"),
              marginHorizontal: -hp("2%"),
              backgroundColor: "#E6E8F0",
            }}
          />

          <TouchableOpacity
            style={{
              marginTop: hp("2.25%"),
              marginLeft: wp("1%"),
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => handleBtnTap()}
          >
            <DefaultText
              style={{ marginRight: 10 }}
              fontSize="md"
              fontWeight="medium"
              color={theme.colors.primary[1000]}
            >
              {t("See all modes")}
            </DefaultText>

            <View
              style={{
                transform: [
                  {
                    rotate: isRTL ? "180deg" : "0deg",
                  },
                ],
              }}
            >
              <ICONS.ArrowForwardIcon color={theme.colors.primary[1000]} />
            </View>
          </TouchableOpacity> */}
        </>
      ) : (
        <View
          style={{
            marginBottom: hp("2%"),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <NoDataPlaceholder
            marginTop={hp("5%")}
            title={`${t("Waiting for data to show graph")}.`}
          />
        </View>
      )}
    </View>
  );
}
