import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { VictoryAnimation, VictoryPie } from "victory-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import CurrencyView, { getAmount } from "../../modal/currency-view-modal";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import DefaultText, { getOriginalSize } from "../../text/Text";
import ToolTip from "../../tool-tip";
import LoadingRect from "../skeleton-loader/skeleton-loader";
import Spacer from "../../spacer";

const colorsArr = ["#0C7CD5", "#FFB547", "#7BC67E"];

export default function TransactionMode({
  transactionData,
  loading = false,
}: {
  transactionData: any;
  loading: boolean;
}) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();

  const [activeIndex, setActiveIndex] = useState(0);
  const [animation, setAnimation] = useState({
    startAngle: 0,
    endAngle: 0,
  });

  const transactionModeData = useMemo(() => {
    if (!transactionData) return [];

    let data: any[] = [];

    data.push({
      name: "Cash",
      amount: Number(transactionData?.txnWithCash || 0)?.toFixed(2),
      count: transactionData?.txnCountInCash || 0,
      color: colorsArr[0],
    });

    data.push({
      name: "Card",
      amount: Number(transactionData?.txnWithCard || 0)?.toFixed(2),
      count: transactionData?.txnCountInCard || 0,
      color: colorsArr[1],
    });

    data.push({
      name: "Credit",
      amount: Number(transactionData?.txnWithCredit || 0)?.toFixed(2),
      count: transactionData?.txnCountInCredit || 0,
      color: colorsArr[2],
    });

    data.push({
      name: "Wallet",
      amount: Number(transactionData?.txnWithWallet || 0)?.toFixed(2),
      count: transactionData?.txnCountInWallet || 0,
      color: colorsArr[3],
    });

    return data || [];
  }, [transactionData]);

  const handlePieClick = (props: any) => {
    setActiveIndex(props?.index);
  };

  useEffect(() => {
    if (transactionModeData?.length > 0 && !loading) {
      setAnimation({
        startAngle: 0,
        endAngle: 360,
      });
    } else {
      setAnimation({
        startAngle: 0,
        endAngle: 0,
      });
    }
  }, [transactionModeData, loading]);

  return (
    <View
      style={{
        borderRadius: getOriginalSize(10),
        paddingTop: hp("1.5%"),
        paddingBottom: hp("0.5%"),
        paddingHorizontal: hp("1.5%"),
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
        <DefaultText fontSize="md" fontWeight="semibold" color="otherGrey.100">
          {t("Transactions by mode")}
        </DefaultText>

        <ToolTip infoMsg={t("info_transaction_mode_analytics_in_sales")} />
      </View>

      {loading ? (
        <LoadingRect
          width={wp("83%")}
          height={hp("30%")}
          style={{ marginVertical: hp("1.5%") }}
        />
      ) : transactionModeData?.length > 0 ? (
        <View>
          <View style={{ alignItems: "center" }}>
            <VictoryAnimation duration={1000} data={animation} easing="linear">
              {(newProps) => (
                <VictoryPie
                  style={{
                    labels: {
                      fill: "white",
                      stroke: "none",
                      fontSize: getOriginalSize(10),
                      fontWeight: "bold",
                    },
                  }}
                  height={hp("26")}
                  innerRadius={hp("7.5%")}
                  animate={{ duration: 2000 }}
                  padding={{
                    top: getOriginalSize(15),
                    left: getOriginalSize(40),
                    right: getOriginalSize(40),
                    bottom: getOriginalSize(15),
                  }}
                  events={[
                    {
                      target: "data",
                      eventHandlers: {
                        onPressIn: () => ({
                          target: "data",
                          mutation: (props) => {
                            const fill = props.style && props.style.fill;
                            handlePieClick(props);
                            return fill === "#007AFFE5"
                              ? "white"
                              : {
                                  style: {
                                    ...props.style,
                                    fill: "white",
                                    stroke: "none",
                                    fontSize: getOriginalSize(10),
                                    fontWeight: "bold",
                                  },
                                };
                          },
                        }),
                        onPressOut: () => ({
                          target: "data",
                          mutation: () => {},
                        }),
                      },
                    },
                  ]}
                  data={transactionModeData?.map((transaction: any) => {
                    return transaction?.amount;
                  })}
                  colorScale={transactionModeData?.map((data: any) => {
                    return data?.color;
                  })}
                  {...newProps}
                />
              )}
            </VictoryAnimation>

            <View
              style={{
                width: hp("22%"),
                top: hp("11%"),
                position: "absolute",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DefaultText
                fontSize="2xl"
                fontWeight="bold"
                color={transactionModeData?.[activeIndex]?.color}
              >
                {`${t("SAR")} ${getAmount(
                  Number(transactionModeData?.[activeIndex]?.amount || 0)
                )}`}
              </DefaultText>

              <Spacer space={getOriginalSize(5)} />

              <DefaultText
                fontSize="xl"
                fontWeight="medium"
                color="otherGrey.200"
              >
                {`${t("in")} ${transactionModeData?.[activeIndex]?.name || ""}`}
              </DefaultText>
            </View>
          </View>

          <View
            style={{
              paddingTop: hp("1%"),
              paddingBottom: hp("1%"),
              paddingHorizontal: hp("0.25%"),
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <DefaultText
              style={{ letterSpacing: getOriginalSize(2) }}
              fontSize="md"
              fontWeight="bold"
            >
              {t("PAYMENT TYPE")}
            </DefaultText>

            <DefaultText
              style={{ textAlign: "right", letterSpacing: getOriginalSize(2) }}
              fontSize="md"
              fontWeight="bold"
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
                  paddingHorizontal: hp("0.25%"),
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: getOriginalSize(16),
                      height: getOriginalSize(16),
                      marginRight: getOriginalSize(8),
                      borderWidth: getOriginalSize(3),
                      borderRadius: 50,
                      borderColor: data?.color,
                    }}
                  />

                  <DefaultText
                    style={{ textTransform: "capitalize" }}
                    fontSize="lg"
                    fontWeight="semibold"
                  >
                    {data.name}
                  </DefaultText>
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
        </View>
      ) : (
        <View
          style={{
            marginTop: hp("-3.5%"),
            marginBottom: hp("1%"),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <NoDataPlaceholder
            title={t("no_data_transaction_mode_analytics_in_sales")}
          />
        </View>
      )}
    </View>
  );
}
