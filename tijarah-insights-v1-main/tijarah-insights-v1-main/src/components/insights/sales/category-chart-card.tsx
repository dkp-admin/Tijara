import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import {
  VictoryAnimation,
  VictoryLabel,
  VictoryLegend,
  VictoryPie,
  VictoryTooltip,
} from "victory-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { checkDirection } from "../../../hooks/use-direction-check";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { colorsArr } from "../../../utils/get-colors";
import { trimText } from "../../../utils/trim-text";
import CurrencyView from "../../modal/currency-view-modal";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import Spacer from "../../spacer";
import DefaultText, { getOriginalSize } from "../../text/Text";
import showToast from "../../toast";
import ToolTip from "../../tool-tip";
import ScrollTabButton from "../common/scroll-tab-button";
import LoadingRect from "../skeleton-loader/skeleton-loader";

export default function CategoryChartCard({
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
  const isRTL = checkDirection();
  const { wp, hp } = useResponsive();

  const [activeIndex, setActiveIndex] = useState(0);
  const [animation, setAnimation] = useState({
    startAngle: 0,
    endAngle: 0,
  });

  const categories = useMemo(() => {
    const dataArr = data?.map((category: any, index: number) => {
      return {
        color: colorsArr[index],
        data: category.grossRevenue,
        grossRevenue: category.totalOrder,
        name: isRTL ? category.name.ar || "NA" : category.name.en || "NA",
      };
    });

    return dataArr?.slice(0, 5) || [];
  }, [data]);

  const getLegendHeight = () => {
    if (categories?.length == 0) {
      return getOriginalSize(1);
    } else if (categories?.length <= 2) {
      return getOriginalSize(30);
    } else if (categories?.length <= 4) {
      return getOriginalSize(60);
    } else {
      return getOriginalSize(100);
    }
  };

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

  useEffect(() => {
    if (categories?.length > 0 && !loading) {
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
  }, [categories, loading]);

  useEffect(() => {
    if (activeTab === 0) {
      handleContainerClick();
    }
  }, [activeTab]);

  return (
    <View
      style={{
        borderRadius: getOriginalSize(10),
        paddingVertical: hp("1.75%"),
        paddingHorizontal: hp("1.5%"),
        backgroundColor: theme.colors.white[1000],
      }}
    >
      <View style={{ alignItems: "center", flexDirection: "row" }}>
        <DefaultText fontSize="md" fontWeight="semibold">
          {t("Categories")}
        </DefaultText>

        <View style={{ marginLeft: getOriginalSize(8) }}>
          <ToolTip infoMsg={t("info_categories_analytics_in_sales")} />
        </View>
      </View>

      <Spacer space={getOriginalSize(12)} />

      {loading ? (
        <LoadingRect width={wp("83%")} height={hp("30%")} />
      ) : (
        <View>
          <ScrollTabButton
            tabs={[
              t("Top Selling"),
              t("Least Selling"),
              t("Most Profitable"),
              t("Least Profitable"),
            ]}
            activeTab={activeTab}
            onChange={(tab: any) => {
              if (tab !== 0) {
                showToast("info", `${t("Coming Soon")}...`);
                return;
              }
              setActiveTab(tab);
            }}
          />

          {categories?.length > 0 ? (
            <View style={{ alignItems: "center", zIndex: 999 }}>
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
                    labelComponent={<VictoryTooltip />}
                    labels={() => null}
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
                    data={categories.map((category: any) => {
                      return category.data;
                    })}
                    colorScale={categories.map((data: any) => {
                      return data.color;
                    })}
                    {...newProps}
                  />
                )}
              </VictoryAnimation>

              <View
                style={{
                  width: hp("22%"),
                  top: hp("13%"),
                  position: "absolute",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* <DefaultText
                  fontSize="4xl"
                  fontWeight="bold"
                  color={categories?.[activeIndex]?.color}
                >
                  {categories?.[activeIndex]?.data || 0}
                </DefaultText> */}

                <CurrencyView
                  large
                  amount={Number(categories?.[activeIndex]?.data || 0)?.toFixed(
                    2
                  )}
                  symbolFontweight="semibold"
                  amountFontweight="bold"
                  decimalFontweight="bold"
                  symbolFontsize={16}
                  amountFontsize={32}
                  decimalFontsize={32}
                />

                <Spacer space={getOriginalSize(5)} />

                <DefaultText
                  style={{ textAlign: "center" }}
                  fontSize="xl"
                  fontWeight="medium"
                  color="otherGrey.200"
                >
                  {`${t("Sales in")} ${categories?.[activeIndex]?.name || ""}`}
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
                colorScale={categories.map((data: any) => {
                  return data.color;
                })}
                labelComponent={<VictoryLabel />}
                data={categories.map((data: any) => {
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
                title={t("no_data_categories_analytics_in_sales")}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
}
