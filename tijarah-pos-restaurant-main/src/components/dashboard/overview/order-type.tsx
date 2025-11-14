import React, { useContext, useMemo } from "react";
import { View } from "react-native";
import { VictoryPie } from "victory-native";
import { t } from "../../../../i18n";
import DeviceContext from "../../../context/device-context";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import CurrencyView from "../../modal/currency-view-modal";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import DefaultText from "../../text/Text";
import ToolTip from "../../tool-tip";

const colorsArr = ["#02A0FC", "#FF3A29", "#4339F2", "#FFB200"];

export default function OrdeerTypeCard({ data }: any) {
  const theme = useTheme();
  const { hp } = useResponsive();
  const deviceContext = useContext(DeviceContext) as any;

  const restaurant =
    deviceContext.user.company.industry?.toLowerCase() === "restaurant";

  const orderTypeData = useMemo(() => {
    if (!data) return [];

    let orderData: any[] = [];

    const order = data; //data?.current;

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

    return orderData || [];
  }, [data, restaurant]);

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
          {t("TRANSACTIONS BY ORDER")}
        </DefaultText>

        <ToolTip infoMsg={t("Data is showing for today's order")} />
      </View>

      {orderTypeData?.length > 0 ? (
        <View>
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
              data={orderTypeData.map((data: any) => {
                return data.amount;
              })}
              colorScale={orderTypeData.map((data: any) => {
                return data.color;
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
              {t("ORDER TYPE")}
            </DefaultText>

            <DefaultText
              style={{ textAlign: "right" }}
              fontSize="sm"
              fontWeight="medium"
            >
              {t("AMOUNT")}
            </DefaultText>
          </View>

          {orderTypeData.map((data: any) => {
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
