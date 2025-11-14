import { format } from "date-fns";
import React, { useState } from "react";
import { View } from "react-native";
import {
  Bar,
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from "victory-native";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/use-direction-check";
import { useResponsive } from "../../hooks/use-responsiveness";
import { getOriginalSize } from "../text/Text";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
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

export default function CustomBarChart({
  activeTab = 2,
  weekly = true,
  data,
}: {
  activeTab: number;
  weekly: boolean;
  data: any;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { wp, hp } = useResponsive();

  const currentDay = days[new Date().getDay()];
  const currentMonth = months[new Date().getMonth()];

  return (
    <View
      style={{
        alignItems: "center",
        marginTop: hp("-1%"),
        marginBottom: hp("-2%"),
        paddingLeft: isRTL ? 0 : getOriginalSize(20),
        paddingRight: isRTL ? getOriginalSize(30) : 0,
      }}
    >
      <VictoryChart
        containerComponent={<VictoryVoronoiContainer />}
        domainPadding={{ x: [20, 0], y: [0, 0] }}
        width={wp("90%")}
        animate={{ duration: 1000, onLoad: { duration: 500 } }}
      >
        <VictoryBar
          cornerRadius={14}
          labels={({ datum }) => getAmount(datum.y)}
          dataComponent={
            <Bar
              style={{
                transform: `translate(0, -25)`,
                fill: ({ datum }: any) => {
                  return datum?.x === format(new Date(), "d MMM") //datum?.x === (weekly ? currentDay : currentMonth)
                    ? "#007AFFE5"
                    : "#007AFF33";
                },
                width: 32,
              }}
            />
          }
          labelComponent={
            <VictoryTooltip
              dy={-35}
              constrainToVisibleArea
              renderInPortal={false}
              pointerLength={6}
              style={{
                fill: theme.colors.white[1000],
                fontSize: getOriginalSize(16),
              }}
              flyoutPadding={{ top: 4, bottom: 4, left: 8, right: 8 }}
              flyoutStyle={{
                stroke: "none",
                fill: theme.colors.text.primary,
              }}
            />
          }
          style={{ data: { fill: "#007AFF33", width: 32 } }}
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
                        return fill === "#007AFFE5"
                          ? "#007AFF33"
                          : {
                              style: {
                                ...props.style,
                                transform: `translate(0, -25)`,
                                fill: "#007AFFE5",
                                width: 32,
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
                        return fill === "#007AFFE5"
                          ? "#007AFF33"
                          : {
                              style: {
                                ...props.style,
                                transform: `translate(0, -25)`,
                                fill: "#007AFFE5",
                                width: 32,
                              },
                            };
                      },
                    },
                  ];
                },
              },
            },
          ]}
          data={data}
        />
        <VictoryAxis
          style={{
            tickLabels: {
              fontWeight: "500",
              fontSize: getOriginalSize(15),
            },
            axis: { stroke: "transparent" },
            grid: {
              stroke: theme.colors.dark[100],
              strokeWidth: 0.5,
            },
          }}
          offsetY={63}
          tickFormat={(x: any) => x}
          standalone={false}
        />
        <VictoryAxis
          style={{
            tickLabels: { fontSize: getOriginalSize(15) },
            axis: { stroke: "transparent" },
            grid: {
              stroke: theme.colors.dark[100],
              strokeWidth: 0.12,
            },
          }}
          dependentAxis
          tickFormat={(y: any) => {
            if (y < 1000) {
              return `${t("SAR")}\n${y}`;
            } else if (y >= 1000 && y <= 100000) {
              return `${t("SAR")}\n${y / 1000 + "K"}`;
            } else if (y >= 100000 && y <= 10000000) {
              return `${t("SAR")}\n${y / 100000 + "L"}`;
            } else if (y >= 10000000 && y <= 1000000000) {
              return `${t("SAR")}\n${y / 10000000 + "M"}`;
            } else {
              return `${t("SAR")}\n${y / 1000000000 + "B"}`;
            }
          }}
          standalone={false}
        />
      </VictoryChart>
    </View>
  );
}
