import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import {
  VictoryAnimation,
  VictoryLabel,
  VictoryLegend,
  VictoryPie,
} from "victory-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { colorsArr } from "../../../utils/get-colors";
import { trimText } from "../../../utils/trim-text";
import CurrencyView from "../../modal/currency-view-modal";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import Spacer from "../../spacer";
import DefaultText, { getOriginalSize } from "../../text/Text";
import ToolTip from "../../tool-tip";
import ScrollTabButton from "../common/scroll-tab-button";
import LoadingRect from "../skeleton-loader/skeleton-loader";

export default function VendorChartCard({
  activeTab = 0,
  setActiveTab,
  data,
  loading = false,
}: {
  activeTab: number;
  setActiveTab: any;
  data: any;
  loading: boolean;
}) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();

  const [activeIndex, setActiveIndex] = useState(0);
  const [animation, setAnimation] = useState({
    startAngle: 0,
    endAngle: 0,
  });

  const vendorOrders = useMemo(() => {
    const dataArr = data?.map((vendor: any, index: number) => {
      return {
        color: colorsArr[index],
        data: vendor.paidCount + vendor.unpaidCount || 0,
        amount: vendor.paid + vendor.unpaid || 0,
        name: vendor.name || "NA",
      };
    });

    return dataArr?.slice(0, 5) || [];
  }, [data]);

  const handleContainerClick = () => {
    setAnimation({
      startAngle: 0,
      endAngle: 0,
    });

    const timer = setTimeout(() => {
      setAnimation({
        startAngle: 0,
        endAngle: 0,
      });
      setAnimation({
        startAngle: 0,
        endAngle: 360,
      });
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  };

  const handlePieClick = (props: any) => {
    setActiveIndex(props?.index);
  };

  const getLegendHeight = () => {
    if (vendorOrders?.length == 0) {
      return getOriginalSize(1);
    } else if (vendorOrders?.length <= 2) {
      return getOriginalSize(30);
    } else if (vendorOrders?.length <= 4) {
      return getOriginalSize(60);
    } else {
      return getOriginalSize(100);
    }
  };

  useEffect(() => {
    if (vendorOrders?.length > 0 && !loading) {
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
  }, [vendorOrders, loading]);

  useEffect(() => {
    if (activeTab === 0) {
      handleContainerClick();
    }
  }, [activeTab]);

  return (
    <View
      style={{
        marginTop: getOriginalSize(16),
        borderRadius: getOriginalSize(10),
        paddingVertical: hp("1.75%"),
        paddingHorizontal: hp("1.5%"),
        backgroundColor: theme.colors.white[1000],
      }}
    >
      <View style={{ alignItems: "center", flexDirection: "row" }}>
        <DefaultText fontSize="md" fontWeight="semibold">
          {t("Vendor Orders")}
        </DefaultText>

        <View style={{ marginLeft: getOriginalSize(8) }}>
          <ToolTip infoMsg={t("info_vendor_orders_chart_in_others")} />
        </View>
      </View>

      <Spacer space={getOriginalSize(12)} />

      {loading ? (
        <LoadingRect width={wp("83%")} height={hp("30%")} />
      ) : (
        <View>
          <ScrollTabButton
            tabs={[t("Most"), t("Least")]}
            activeTab={activeTab}
            onChange={(tab: any) => {
              setActiveTab(tab);
            }}
          />

          {vendorOrders?.length > 0 ? (
            <View style={{ alignItems: "center" }}>
              <VictoryAnimation
                duration={1000}
                data={animation}
                easing="linear"
              >
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
                    height={hp("35%")}
                    padAngle={getOriginalSize(2)}
                    cornerRadius={getOriginalSize(8)}
                    innerRadius={hp("12%")}
                    padding={{
                      top: getOriginalSize(20),
                      left: getOriginalSize(40),
                      right: getOriginalSize(40),
                      bottom: getOriginalSize(20),
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
                    data={vendorOrders.map((vendor: any) => {
                      return vendor.data;
                    })}
                    colorScale={vendorOrders.map((data: any) => {
                      return data.color;
                    })}
                    {...newProps}
                  />
                )}
              </VictoryAnimation>

              <View
                style={{
                  width: hp("20%"),
                  top: hp("12%"),
                  position: "absolute",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <DefaultText
                  fontSize="4xl"
                  fontWeight="bold"
                  color={vendorOrders?.[activeIndex]?.color}
                >
                  {vendorOrders?.[activeIndex]?.data || 0}
                </DefaultText>

                <Spacer space={getOriginalSize(2)} />

                <CurrencyView
                  amount={`${Number(
                    vendorOrders?.[activeIndex]?.amount || 0
                  )?.toFixed(2)}`}
                  symbolColor="otherGrey.100"
                  amountColor="otherGrey.100"
                  decimalColor="otherGrey.100"
                  symbolFontsize={20}
                  amountFontsize={20}
                  decimalFontsize={20}
                />

                <Spacer space={getOriginalSize(4)} />

                <DefaultText
                  style={{ textAlign: "center" }}
                  fontSize="lg"
                  fontWeight="seminold"
                  color="text.secondary"
                  noOfLines={2}
                >
                  {vendorOrders?.[activeIndex]?.name || ""}
                </DefaultText>
              </View>

              <VictoryLegend
                x={wp("7.5%")}
                y={0}
                height={getLegendHeight()}
                orientation="horizontal"
                itemsPerRow={2}
                gutter={35}
                animate={{ duration: 500 }}
                style={{
                  border: { stroke: "transparent" },
                  labels: {
                    fontSize: getOriginalSize(16),
                    fontWeight: "400",
                    color: "#555555",
                  },
                }}
                colorScale={vendorOrders.map((data: any) => {
                  return data.color;
                })}
                labelComponent={<VictoryLabel />}
                data={vendorOrders.map((data: any) => {
                  return { name: trimText(data.name, 12) };
                })}
              />
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
                title={t("no_data_vendor_orders_chart_in_others")}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
}
