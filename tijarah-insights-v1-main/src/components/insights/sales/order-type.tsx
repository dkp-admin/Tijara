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
import { useAuth } from "../../../hooks/use-auth";

const colorsArr = ["#02A0FC", "#FF3A29", "#4339F2", "#FFB200"];

export default function OrdeerTypeCard({
  analyticsData,
  loading = false,
}: {
  analyticsData: any;
  loading: boolean;
}) {
  const theme = useTheme();
  const { user } = useAuth();
  const { wp, hp } = useResponsive();

  const restaurant = user?.company?.industry?.toLowerCase() === "restaurant";

  const [activeIndex, setActiveIndex] = useState(0);
  const [animation, setAnimation] = useState({
    startAngle: 0,
    endAngle: 0,
  });

  const orderTypeData = useMemo(() => {
    if (!analyticsData) return [];

    let orderData: any[] = [];

    const order = analyticsData;

    if (restaurant) {
      orderData.push({
        name: order?.pickup?.name,
        amount: Number(order?.pickup?.amount || 0)?.toFixed(2),
        count: order?.pickup?.count || 0,
        color: colorsArr[0],
      });

      orderData.push({
        name: order?.["dine-in"]?.name,
        amount: Number(order?.["dine-in"]?.amount || 0)?.toFixed(2),
        count: order?.["dine-in"]?.count || 0,
        color: colorsArr[1],
      });

      orderData.push({
        name: order?.delivery?.name,
        amount: Number(order?.delivery?.amount || 0)?.toFixed(2),
        count: order?.delivery?.count || 0,
        color: colorsArr[2],
      });

      orderData.push({
        name: order?.takeaway?.name,
        amount: Number(order?.takeaway?.amount || 0)?.toFixed(2),
        count: order?.takeaway?.count || 0,
        color: colorsArr[3],
      });
    } else {
      orderData.push({
        name: order?.walkin?.name,
        amount: Number(order?.walkin?.amount || 0)?.toFixed(2),
        count: order?.walkin?.count || 0,
        color: colorsArr[0],
      });

      orderData.push({
        name: order?.pickup?.name,
        amount: Number(order?.pickup?.amount || 0)?.toFixed(2),
        count: order?.pickup?.count || 0,
        color: colorsArr[0],
      });

      orderData.push({
        name: order?.delivery?.name,
        amount: Number(order?.delivery?.amount || 0)?.toFixed(2),
        count: order?.delivery?.count || 0,
        color: colorsArr[1],
      });
    }

    const filteredData: any[] = [];

    orderData.forEach((order: any) => {
      if (order.count !== 0) {
        filteredData.push(order);
      }
    });

    return filteredData;
  }, [analyticsData, restaurant]);

  const handlePieClick = (props: any) => {
    setActiveIndex(props?.index);
  };

  useEffect(() => {
    if (orderTypeData?.length > 0 && !loading) {
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
  }, [orderTypeData, loading]);

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
          {t("Transactions by order type")}
        </DefaultText>

        <ToolTip infoMsg={t("info_order_type_analytics_in_sales")} />
      </View>

      {loading ? (
        <LoadingRect
          width={wp("83%")}
          height={hp("30%")}
          style={{ marginVertical: hp("1.5%") }}
        />
      ) : orderTypeData?.length > 0 ? (
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
                  height={hp("30")}
                  innerRadius={hp("9.5%")}
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
                  data={orderTypeData?.map((data: any) => {
                    return data?.amount;
                  })}
                  colorScale={orderTypeData?.map((data: any) => {
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
              <CurrencyView
                amount={`${Number(
                  orderTypeData?.[activeIndex]?.amount || 0
                )?.toFixed(2)}`}
                symbolFontweight="bold"
                amountFontweight="bold"
                decimalFontweight="bold"
                symbolFontsize={20}
                amountFontsize={20}
                decimalFontsize={20}
                symbolColor={orderTypeData?.[activeIndex]?.color}
                amountColor={orderTypeData?.[activeIndex]?.color}
                decimalColor={orderTypeData?.[activeIndex]?.color}
              />

              <Spacer space={getOriginalSize(2)} />

              <DefaultText
                style={{ textAlign: "center" }}
                fontSize="2xl"
                fontWeight="medium"
              >
                {`${orderTypeData?.[activeIndex]?.count || 0} ${t("Orders")}`}
              </DefaultText>

              <Spacer space={getOriginalSize(4)} />

              <DefaultText
                style={{ textAlign: "center" }}
                fontSize="xl"
                fontWeight="medium"
                color="otherGrey.200"
              >
                {`${t("in")} ${orderTypeData?.[activeIndex]?.name || ""}`}
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
              {t("ORDER TYPE")}
            </DefaultText>

            <DefaultText
              style={{ textAlign: "right", letterSpacing: getOriginalSize(2) }}
              fontSize="md"
              fontWeight="bold"
            >
              {t("AMOUNT")}
            </DefaultText>
          </View>

          {orderTypeData?.map((data: any) => {
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

                <View style={{ flexDirection: "row", alignSelf: "flex-end" }}>
                  <CurrencyView
                    amount={data.amount}
                    symbolFontsize={14}
                    amountFontsize={16}
                    decimalFontsize={16}
                    symbolColor="otherGrey.100"
                    amountColor="otherGrey.100"
                    decimalColor="otherGrey.100"
                  />

                  <DefaultText fontSize="lg">
                    {`, ${t("Orders")}: ${data.count}`}
                  </DefaultText>
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
            title={t("no_data_order_type_analytics_in_sales")}
          />
        </View>
      )}
    </View>
  );
}
