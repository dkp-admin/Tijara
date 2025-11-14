import { format } from "date-fns";
import React, { useMemo } from "react";
import {
  VictoryArea,
  VictoryAxis,
  VictoryChart,
  VictoryVoronoiContainer,
} from "victory-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import CurrencyView from "../../modal/currency-view-modal";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import Spacer from "../../spacer";
import DefaultText from "../../text/Text";
import ToolTip from "../../tool-tip";
import { View } from "react-native";
import { useCurrency } from "../../../store/get-currency";

const calculatePercentage = (prev: number, current: number) => {
  if (prev == 0 && current == 0) {
    return 0;
  }

  if (!prev) {
    return 100;
  }

  let percentage = ((current - prev) / prev) * 100;

  return percentage;
};

export default function CurrentMonthEarningsCard({ monthlyEarnings }: any) {
  const theme = useTheme();
  const { wp, hp, twoPaneView } = useResponsive();
  const { currency } = useCurrency();
  const infoMsg = useMemo(() => {
    let infoMsg = "";

    if (monthlyEarnings?.length > 0) {
      const startDate = format(new Date(monthlyEarnings[0].date), "do MMMM");
      const endDate = format(
        new Date(monthlyEarnings[monthlyEarnings.length - 1].date),
        "do MMMM"
      );

      infoMsg = `${t("Data is showing from")} ${startDate} ${t(
        "to"
      )} ${endDate}`;
    }

    return infoMsg;
  }, [monthlyEarnings]);

  const totalEarnings = useMemo(() => {
    if (monthlyEarnings?.length > 0) {
      return monthlyEarnings.reduce(
        (prev: any, cur: any) => prev + cur.grossRevenue,
        0
      );
    }

    return 0;
  }, [monthlyEarnings]);

  const earningData = useMemo(() => {
    const earningArr: any[] = monthlyEarnings?.map((earning: any) => {
      return {
        x: `${format(new Date(earning.date), "d")}\n${format(
          new Date(earning.date),
          "MMM"
        )}`,
        y: earning.grossRevenue,
      };
    });

    return earningArr || [];
  }, [monthlyEarnings]);

  return (
    <View
      style={{
        borderRadius: 10,
        paddingTop: hp("2.25%"),
        paddingBottom: hp("1.5%"),
        paddingHorizontal: hp("2%"),
        backgroundColor: theme.colors.white[1000],
      }}
    >
      <View style={{ alignItems: "center", flexDirection: "row" }}>
        <DefaultText fontSize="sm" fontWeight="medium" color="otherGrey.200">
          {t("THIS MONTH EARNINGS")}
        </DefaultText>

        {infoMsg && (
          <View style={{ marginLeft: hp("2%") }}>
            <ToolTip infoMsg={infoMsg} />
          </View>
        )}
      </View>

      <Spacer space={hp("2%")} />

      <CurrencyView
        amount={`${Number(totalEarnings)?.toFixed(2)}`}
        symbolFontweight="medium"
        amountFontweight="medium"
        decimalFontweight="medium"
        symbolFontsize={18}
        amountFontsize={32}
        decimalFontsize={16}
      />

      {/* <View style={{ alignItems: "flex-start" }}>
        <View style={{ alignItems: "center" }}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View
              container
              style={{
                marginTop: hp("2.5%"),
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 20,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor:
                  calculatePercentage(prevAmount, currentAmount) > 0
                    ? "#DEF6E4"
                    : "#FFDDE4",
              }}
            >
              <View
                style={
                  calculatePercentage(prevAmount, currentAmount) < 0 && {
                    transform: [{ rotateY: "180deg" }, { rotateZ: "180deg" }],
                  }
                }
              >
                <ICONS.IncreaseIcon
                  color={
                    calculatePercentage(prevAmount, currentAmount) > 0
                      ? "#34C759"
                      : "#FF2D55"
                  }
                />
              </View>

              <DefaultText
                style={{ marginLeft: 1, marginRight: 5 }}
                fontWeight="medium"
                fontSize="sm"
                color={
                  calculatePercentage(prevAmount, currentAmount) > 0
                    ? "#34C759"
                    : "#FF2D55"
                }
              >
                {
                  calculatePercentage(prevAmount, currentAmount).toFixed(
                    2
                  ) as any
                }
                %
              </DefaultText>
            </View>
          </View>

          <DefaultText
            style={{ marginTop: 3, fontSize: 10 }}
            color={theme.colors.placeholder}
          >
            {`vs Last Month`}
          </DefaultText>
        </View>
      </View> */}

      {monthlyEarnings?.length > 0 ? (
        <VictoryChart
          maxDomain={{ x: twoPaneView ? 30 : 9 }}
          containerComponent={<VictoryVoronoiContainer />}
          domainPadding={{ x: [10, 0], y: [0, 0] }}
          width={wp("95%")}
        >
          <VictoryArea
            padding={0}
            //   x={(datum) => datum.x}
            interpolation="natural"
            style={{
              data: {
                // fill:
                //   calculatePercentage(100, 500) > 0 ? "#006C35" : "#BFBFC14D",
                // stroke:
                //   calculatePercentage(100, 500) > 0
                //     ? theme.colors.primary[1000]
                //     : "#3C3C4354",
                fill: "#006C35",
                stroke: theme.colors.primary[1000],
                strokeWidth: 2,
              },
            }}
            data={earningData}
          />
          <VictoryAxis
            style={{
              axis: { stroke: "transparent" },
              grid: { stroke: theme.colors.dark[100], strokeWidth: 0.5 },
            }}
            offsetY={50}
            tickFormat={(x: any) => x}
            standalone={false}
          />
          <VictoryAxis
            // offsetX={50}
            style={{
              axis: { stroke: "transparent" },
              grid: { stroke: theme.colors.dark[100], strokeWidth: 0.12 },
            }}
            dependentAxis
            tickFormat={(y: any) => {
              if (y < 1000) {
                return `${currency}\n${y}`;
              } else if (y >= 1000 && y <= 100000) {
                return `${currency}\n${y / 1000 + "K"}`;
              } else if (y >= 100000 && y <= 10000000) {
                return `${currency}\n${y / 100000 + "L"}`;
              } else if (y >= 10000000 && y <= 1000000000) {
                return `${currency}\n${y / 10000000 + "M"}`;
              } else {
                return `${currency}\n${y / 1000000000 + "B"}`;
              }
            }}
            standalone={false}
          />
        </VictoryChart>
      ) : (
        <View
          style={{
            marginBottom: hp("20%"),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <NoDataPlaceholder
            marginTop={hp("15%")}
            title={`${t("Waiting for data to show graph")}.`}
          />
        </View>
      )}
    </View>
  );
}
