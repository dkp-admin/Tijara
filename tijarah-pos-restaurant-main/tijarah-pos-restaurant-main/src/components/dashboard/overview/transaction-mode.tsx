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

const colorsArr = [
  "#E74C3C",
  "#3498DB",
  "#2ECC71",
  "#F39C12",
  "#9B59B6",
  "#1ABC9C",
  "#34495E",
  "#D35400",
  "#C0392B",
  "#16A085",
  "#2980B9",
  "#8E44AD",
  "#27AE60",
  "#D35400",
  "#7F8C8D",
  "#F1C40F",
  "#E67E22",
  "#95A5A6",
  "#D81B60",
  "#00ACC1",
  "#5E35B1",
  "#FB8C00",
  "#43A047",
  "#1E88E5",
  "#546E7A",
  "#6D4C41",
  "#00897B",
  "#FDD835",
  "#8D6E63",
  "#78909C",
];

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

    const obj: any = {
      cash: "Cash",
      wallet: "Wallet",
      credit: "Credit",
      card: "Card",
      HungerStation: "HungerStation",
      Jahez: "Jahez",
      ToYou: "ToYou",
      Barakah: "Barakah",
      Careem: "Careem",
      Ninja: "Ninja",
      "The Chef": "The Chef",
      "the chef": "The Chef",
      thechef: "The Chef",
      hungerstation: "HungerStation",
      jahez: "Jahez",
      toyou: "ToYou",
      barakah: "Barakah",
      careem: "Careem",
      ninja: "Ninja",
      nearpay: "Nearpay",
      stcpay: "STC Pay",
    };

    let data: any[] = [];

    transactionData?.txnStats?.map((tr: any, index: number) => {
      console.log(tr?.paymentName, "NAMES");
      data.push({
        name: t(obj[tr?.paymentName]),
        amount: Number(tr?.balanceAmount || 0)?.toFixed(2),
        count: tr?.noOfPayments || 0,
        color: colorsArr[index || 0],
      });
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
