import React from "react";
import { View } from "react-native";
import {
  Bar,
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from "victory-native";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/check-direction";
import { t } from "../../../i18n";

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

export default function CustomBarChartMonth({
  data,
  width,
}: {
  data: any;
  width: number;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const currentMonth = months[new Date().getMonth()];

  return (
    <View
      style={{
        alignItems: "center",
        paddingLeft: isRTL ? 0 : 25,
        paddingRight: isRTL ? 20 : 0,
      }}
    >
      <VictoryChart
        containerComponent={<VictoryVoronoiContainer />}
        domainPadding={{ x: [20, 0], y: [0, 0] }}
        width={width}
      >
        <VictoryBar
          cornerRadius={14}
          labels={({ datum }) => `${t("SAR")} ${datum.y}`}
          dataComponent={
            <Bar
              style={{
                transform: `translate(0, -25)`,
                fill: ({ datum }: any) => {
                  return datum?.x == currentMonth ? "#007AFFE5" : "#007AFF33";
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
              style={{ fill: theme.colors.white[1000] }}
              flyoutPadding={{ top: 4, bottom: 4, left: 8, right: 8 }}
              flyoutStyle={{
                stroke: "none",
                fill: theme.colors.text.primary,
              }}
            />
          }
          style={{ data: { fill: "#007AFF33", width: 32 } }}
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
                                transform: `translate(0, -30)`,
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
                                transform: `translate(0, -30)`,
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
            axis: { stroke: "transparent" },
            grid: { stroke: theme.colors.dark[100], strokeWidth: 0.5 },
          }}
          offsetY={60}
          tickFormat={(x: any) => x}
          standalone={false}
        />
        <VictoryAxis
          style={{
            axis: { stroke: "transparent" },
            grid: { stroke: theme.colors.dark[100], strokeWidth: 0.12 },
          }}
          dependentAxis
          tickFormat={(y: any) => {
            if (y < 1000) {
              return y;
            } else if (y >= 1000 && y <= 100000) {
              return y / 1000 + "K";
            } else {
              return y / 100000 + "L";
            }
          }}
          standalone={false}
        />
      </VictoryChart>
    </View>
  );
}
