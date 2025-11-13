import React, { useMemo } from "react";
import { VictoryLabel, VictoryLegend, VictoryPie } from "victory-native";
import i18n, { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { colorsArr } from "../../../utils/get-colors";
import CurrencyView from "../../modal/currency-view-modal";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import DefaultText from "../../text/Text";
import ToolTip from "../../tool-tip";
import { View } from "react-native";

export default function TopCategories({ title, categoryData }: any) {
  const theme = useTheme();
  const { wp, hp, twoPaneView } = useResponsive();

  const topCategories = useMemo(() => {
    let category: any[] = [];

    if (categoryData?.length > 0) {
      categoryData.map((data: any, index: number) => {
        if (index < 5) {
          category.push({
            color: colorsArr[index],
            data: data.grossRevenue,
            name:
              i18n.currentLocale() == "ar"
                ? data?.name?.ar || "NA"
                : data?.name?.en || "NA",
          });
        } else {
          return;
        }
      });
    }

    return category;
  }, [categoryData]);

  const totalRevenue = useMemo(() => {
    if (categoryData?.length > 0) {
      return categoryData.reduce(
        (prev: any, cur: any) => prev + cur.grossRevenue,
        0
      );
    }

    return 0;
  }, [categoryData]);

  const getLegendHeight = () => {
    if (topCategories?.length == 0) {
      return 1;
    } else if (topCategories?.length <= 2) {
      return 30;
    } else if (topCategories?.length <= 4) {
      return 60;
    } else {
      return 100;
    }
  };

  return (
    <View
      style={{
        borderRadius: 10,
        paddingVertical: hp("2.25%"),
        paddingHorizontal: hp("1.5%"),
        backgroundColor: theme.colors.white[1000],
      }}
    >
      <View style={{ alignItems: "center", flexDirection: "row" }}>
        <DefaultText fontSize="sm" fontWeight="medium" color="dark.800">
          {title}
        </DefaultText>

        <View style={{ marginLeft: 8 }}>
          <ToolTip
            infoMsg={`${t(
              "The figures being shown are for the top five categories from last 30 days"
            )}.`}
          />
        </View>
      </View>

      {topCategories?.length > 0 ? (
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
            height={twoPaneView ? hp("42.5%") : hp("30%")}
            padAngle={2}
            cornerRadius={8}
            innerRadius={twoPaneView ? hp("15%") : hp("10%")}
            padding={{ top: 20, left: 40, right: 40, bottom: 20 }}
            animate={{ duration: 2000 }}
            data={topCategories.map((category: any) => {
              return category.data;
            })}
            colorScale={topCategories.map((data: any) => {
              return data.color;
            })}
          />

          <View
            style={{
              top: twoPaneView ? hp("19%") : hp("13.5%"),
              position: "absolute",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CurrencyView
              amount={`${Number(totalRevenue)?.toFixed(2)}`}
              symbolFontsize={hp("2%")}
              amountFontsize={hp("3.5%")}
              decimalFontsize={hp("2%")}
            />
          </View>

          <VictoryLegend
            x={twoPaneView ? wp("35.5%") : wp("7.5%")}
            y={0}
            height={getLegendHeight()}
            orientation="horizontal"
            itemsPerRow={2}
            gutter={40}
            style={{
              border: { stroke: "transparent" },
              labels: { fontSize: 16, fontWeight: "400", color: "#555555" },
            }}
            colorScale={topCategories.map((data: any) => {
              return data.color;
            })}
            labelComponent={<VictoryLabel />}
            data={topCategories.map((category: any) => {
              return { name: category.name };
            })}
          />
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
