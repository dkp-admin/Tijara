import React from "react";
import { View } from "react-native";
import {
  Bar,
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryLabel,
  VictoryLegend,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from "victory-native";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import { trimText } from "../../utils/trim-text";
import { getOriginalSize } from "../text/Text";

const viewHeightConstraint = [
  getOriginalSize(80),
  getOriginalSize(135),
  getOriginalSize(210),
  getOriginalSize(250),
  getOriginalSize(325),
];
const chartHeightConstraint = [
  getOriginalSize(70),
  getOriginalSize(175),
  getOriginalSize(220),
  getOriginalSize(260),
  getOriginalSize(305),
];
const dataTopConstraint = [
  getOriginalSize(40),
  getOriginalSize(90),
  getOriginalSize(130),
  getOriginalSize(170),
  getOriginalSize(210),
];

const getAmount = (amount: number) => {
  if (amount < 1000) {
    return `${t("SAR")} ${amount?.toFixed(2)}`;
  } else if (amount >= 1000 && amount <= 100000) {
    return `${t("SAR")} ${(amount / 1000)?.toFixed(2) + "K"}`;
  } else if (amount >= 100000 && amount <= 10000000) {
    return `${t("SAR")} ${(amount / 100000)?.toFixed(2) + "L"}`;
  } else if (amount >= 10000000 && amount <= 1000000000) {
    return `${t("SAR")} ${(amount / 10000000)?.toFixed(2) + "M"}`;
  } else {
    return `${t("SAR")} ${(amount / 1000000000)?.toFixed(2) + "B"}`;
  }
};

export default function CustomBarChartHorizontal({
  vendor = false,
  chartData,
}: {
  vendor?: boolean;
  chartData: any;
}) {
  const theme = useTheme();
  const { wp } = useResponsive();

  return (
    <View
      style={{
        marginBottom: -getOriginalSize(15),
        height: viewHeightConstraint[chartData?.length - 1],
        alignItems: "center",
      }}
    >
      <VictoryChart
        horizontal
        height={chartHeightConstraint[chartData?.length - 1]}
        width={wp("95%")}
        containerComponent={<VictoryVoronoiContainer />}
        domainPadding={{ x: [30, 0], y: [0, -50] }}
        animate={{ duration: 1000, onLoad: { duration: 500 } }}
      >
        <VictoryBar
          cornerRadius={7}
          labels={({ datum }) => [
            datum.x,
            `${vendor ? t("Profits") : t("Sales")} : ${getAmount(datum.y)}`,
          ]}
          dataComponent={
            <Bar
              style={{
                fill: (props: any) => {
                  return chartData?.length > 0
                    ? chartData[props?.index]?.color
                    : "transparent";
                },
                width: 14,
                transform: `translate(-25,-35)`,
              }}
            />
          }
          labelComponent={
            <VictoryTooltip
              dx={1}
              dy={-37}
              pointerLength={15}
              constrainToVisibleArea
              style={{
                fill: theme.colors.text.primary,
                fontSize: getOriginalSize(14),
              }}
              flyoutPadding={{ top: 6, bottom: 6, left: 16, right: 16 }}
              flyoutStyle={{
                strokeWidth: 1,
                stroke: (props: any) => {
                  return chartData?.length > 0
                    ? chartData[props?.index]?.color
                    : theme.colors.primary[1000];
                },
                fill: (props: any) => {
                  return chartData?.length > 0
                    ? chartData[props?.index]?.bgColor
                    : theme.colors.bgColor;
                },
                fontSize: getOriginalSize(16),
              }}
            />
          }
          style={{ data: { fill: "#E3E7F7", width: 30 } }}
          animate={{ duration: 1000, onLoad: { duration: 500 } }}
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
                        return fill === "#4463eb"
                          ? "#E3E7F7"
                          : {
                              style: {
                                ...props.style,
                                fill: "#4463eb",
                                width: 14,
                                transform: `translate(-25,-35)`,
                              },
                            };
                      },
                    },
                  ];
                },
                onPressOut: () => {
                  return [
                    {
                      target: "data",
                      mutation: (props) => {
                        const fill = props.style && props.style.fill;
                        return fill === "#4463eb"
                          ? "#E3E7F7"
                          : {
                              style: {
                                ...props.style,
                                fill: "#4463eb",
                                width: 14,
                                transform: `translate(-25,-35)`,
                              },
                            };
                      },
                    },
                  ];
                },
              },
            },
          ]}
          data={chartData?.map((data: any) => {
            return { x: data.name, y: data.data > 0 ? data.data : -data.data };
          })}
        />

        <VictoryAxis
          style={{
            axis: { stroke: "transparent" },
            ticks: { stroke: "transparent" },
            tickLabels: { fill: "transparent" },
          }}
        />

        <VictoryLegend
          x={20}
          y={dataTopConstraint[chartData?.length - 1]}
          orientation="horizontal"
          itemsPerRow={2}
          gutter={35}
          style={{
            border: { stroke: "transparent" },
            labels: { fontSize: getOriginalSize(16), fontWeight: "400" },
          }}
          colorScale={chartData?.map((data: any) => {
            return data.color;
          })}
          labelComponent={<VictoryLabel />}
          data={chartData?.map((data: any) => {
            return { name: trimText(data.name, 12) };
          })}
        />
      </VictoryChart>
    </View>
  );
}
