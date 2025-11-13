import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import {
  VictoryArea,
  VictoryAxis,
  VictoryChart,
  VictoryScatter,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from "victory-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import CurrencyView, { getAmount } from "../../modal/currency-view-modal";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import Spacer from "../../spacer";
import DefaultText, { getOriginalSize } from "../../text/Text";
import ToolTip from "../../tool-tip";
import PercentageView from "../common/percentage-view";
import LoadingRect from "../skeleton-loader/skeleton-loader";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const currentDay = (date: Date) => {
  return days[new Date(date).getDay()];
};

export const getDayCompareText = (activeDateTab: number, date: Date) => {
  if (activeDateTab === 0) {
    return `${t("Prev")} ${currentDay(date)}`;
  } else if (activeDateTab === 1) {
    return t("Previous week");
  } else {
    return t("Previous month");
  }
};

export default function SalesEarningsCard({
  activeDateTab,
  endDate,
  prevNetSales,
  currentMetSales,
  totalOrders,
  earningData,
  loading,
}: {
  activeDateTab: number;
  endDate: any;
  prevNetSales: any;
  currentMetSales: any;
  totalOrders: any;
  earningData: any;
  loading: boolean;
}) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();

  const earnings = useMemo(() => {
    const earningArr = earningData?.map((data: any) => {
      return { x: data.date, y: data.totalGrossRevenue };
    });

    const earnings = earningArr?.splice(0, 30);

    return earnings || [];
  }, [earningData]);

  return (
    <View
      style={{
        marginTop: getOriginalSize(8),
        borderRadius: getOriginalSize(16),
        // borderTopLeftRadius: getOriginalSize(16),
        // borderTopRightRadius: getOriginalSize(16),
        marginBottom: getOriginalSize(5),
        paddingBottom: getOriginalSize(10),
        backgroundColor: theme.colors.bgColor2,
      }}
    >
      <View style={styles.earnings}>
        <View style={styles.containerView}>
          <View>
            <View style={styles.netSalesView}>
              <DefaultText fontSize="md" fontWeight="semibold">
                {t("Sales")}
              </DefaultText>

              <View style={{ marginTop: getOriginalSize(1) }}>
                <ToolTip infoMsg={t("info_net_sales_card_in_sales")} />
              </View>
            </View>

            <View style={{ marginTop: getOriginalSize(16) }}>
              {loading ? (
                <LoadingRect
                  width={getOriginalSize(150)}
                  height={getOriginalSize(27)}
                />
              ) : (
                <CurrencyView
                  large
                  amount={Number(currentMetSales || 0)?.toFixed(2)}
                  symbolFontweight="semibold"
                  amountFontweight="bold"
                  decimalFontweight="bold"
                  symbolFontsize={16}
                  amountFontsize={32}
                  decimalFontsize={32}
                />
              )}

              {loading ? (
                <LoadingRect
                  width={getOriginalSize(150)}
                  height={getOriginalSize(23)}
                  style={{ marginTop: getOriginalSize(12) }}
                />
              ) : (
                <View style={styles.salesView}>
                  <DefaultText fontSize="xl" fontWeight="bold">
                    {totalOrders}
                  </DefaultText>

                  <DefaultText
                    fontSize="md"
                    fontWeight="medium"
                    color="dark.800"
                  >
                    {` ${t("Sales")}`}
                  </DefaultText>
                </View>
              )}
            </View>
          </View>

          {/* <View style={{ alignItems: "flex-end" }}>
            {loading ? (
              <LoadingRect
                width={getOriginalSize(70)}
                height={getOriginalSize(30)}
                style={{ borderRadius: getOriginalSize(20) }}
              />
            ) : (
              <PercentageView
                prev={Number(prevNetSales)}
                current={Number(currentMetSales)}
              />
            )}

            <View style={{ alignItems: "flex-end" }}>
              {loading ? (
                <LoadingRect
                  width={getOriginalSize(70)}
                  height={getOriginalSize(16)}
                  style={{ marginTop: getOriginalSize(6) }}
                />
              ) : (
                <DefaultText
                  style={{
                    marginTop: getOriginalSize(3),
                    marginBottom: getOriginalSize(1),
                  }}
                  fontSize="sm"
                  color="text.secondary"
                >
                  {`${t("vs")}. ${t("SAR")} ${getAmount(prevNetSales)}`}
                </DefaultText>
              )}

              {loading ? (
                <LoadingRect
                  width={getOriginalSize(70)}
                  height={getOriginalSize(16)}
                  style={{ marginTop: getOriginalSize(6) }}
                />
              ) : (
                <DefaultText fontSize="sm" color="text.secondary">
                  {getDayCompareText(activeDateTab, endDate)}
                </DefaultText>
              )}
            </View>
          </View> */}
        </View>
      </View>

      {/* {loading ? (
        <LoadingRect
          width={wp("83%")}
          height={hp("15%")}
          style={{ margin: hp("1.5%") }}
        />
      ) : earnings?.length === 0 ? (
        <View style={{ marginTop: hp("-3.5%") }}>
          <NoDataPlaceholder title={t("no_data_net_sales_card_in_sales")} />

          <Spacer space={hp("3%")} />
        </View>
      ) : (
        <View
          style={{
            borderRadius: getOriginalSize(16),
            height: hp("18%"),
            backgroundColor: theme.colors.bgColor2,
          }}
        >
          <Spacer space={getOriginalSize(hp("2.5%"))} />

          <VictoryChart
            containerComponent={<VictoryVoronoiContainer />}
            // domainPadding={{ x: [1, 1], y: [0, 0] }}
            padding={{
              top: getOriginalSize(5),
              bottom: 0,
              left: 0.5,
              right: 0.5,
            }}
            width={wp("90%")}
            height={hp("16%")}
            animate={{ duration: 1000, onLoad: { duration: 500 } }}
          >
            <VictoryArea
              animate={{ duration: 1000, onLoad: { duration: 500 } }}
              interpolation="natural"
              style={{
                data: {
                  fill: "#006C354D",
                  stroke: theme.colors.primary[1000],
                  strokeWidth: 2,
                },
              }}
              data={earnings}
            />

            <VictoryScatter
              animate={{ duration: 1000, onLoad: { duration: 500 } }}
              style={{
                data: {
                  fill: "#006C354D",
                  stroke: theme.colors.primary[1000],
                  strokeWidth: 2,
                },
              }}
              labels={({ datum }: any) =>
                `${t("SAR")} ${getAmount(datum.y)}\n${t("on")} ${datum.x}`
              }
              labelComponent={
                <VictoryTooltip
                  dx={1}
                  dy={-35}
                  constrainToVisibleArea
                  renderInPortal={false}
                  pointerLength={10}
                  style={{
                    fill: theme.colors.white[1000],
                    fontSize: getOriginalSize(14),
                  }}
                  flyoutPadding={{ top: 6, bottom: 6, left: 12, right: 12 }}
                  flyoutStyle={{
                    stroke: "none",
                    fill: theme.colors.text.primary,
                  }}
                />
              }
              events={[
                {
                  target: "data",
                  eventHandlers: {
                    onPressIn: () => {
                      return [
                        {
                          target: "data",
                          mutation: (props) => {
                            const fill = props.style && props.style.fill;
                            return fill === "#006C354D"
                              ? "#007AFF33"
                              : {
                                  style: {
                                    ...props.style,
                                    fill: "#006C354D",
                                    stroke: theme.colors.primary[1000],
                                    strokeWidth: 2,
                                  },
                                };
                          },
                        },
                      ];
                    },
                    onPressOut: () => ({
                      target: "data",
                      mutation: (props) => {
                        const fill = props.style && props.style.fill;
                        return fill === "#006C354D"
                          ? "#007AFF33"
                          : {
                              style: {
                                ...props.style,
                                fill: "#006C354D",
                                stroke: theme.colors.primary[1000],
                                strokeWidth: 2,
                              },
                            };
                      },
                    }),
                  },
                },
              ]}
              data={earnings}
            />

            <VictoryAxis style={{ axis: { stroke: "none", strokeWidth: 0 } }} />
          </VictoryChart>
        </View>
      )} */}
    </View>
  );
}

const styles = StyleSheet.create({
  earnings: {
    paddingTop: getOriginalSize(16),
    borderRadius: getOriginalSize(16),
    paddingHorizontal: getOriginalSize(16),
  },
  containerView: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  netSalesView: { alignItems: "center", flexDirection: "row" },
  salesView: {
    marginTop: getOriginalSize(5),
    flexDirection: "row",
    alignItems: "center",
  },
});
