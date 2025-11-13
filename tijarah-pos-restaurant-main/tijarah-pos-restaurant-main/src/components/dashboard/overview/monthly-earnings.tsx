import React from "react";
import { TouchableOpacity, View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import ICONS from "../../../utils/icons";
import CustomBarChartMonth from "../../chart/custom-bar-chart-month";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import Spacer from "../../spacer";
import DefaultText from "../../text/Text";

export default function MonthlyEarnings({
  title,
  monthlyEarnings,
  width,
}: any) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();

  const currentMonth = new Date().getMonth();

  const getMonthNameArr = () => {
    return [
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
  };

  const getMonthlyEarningsData = () => {
    // const monthEarningArr = Array(12).fill([
    //   100, 400, 1200, 2000, 350, 800, 1800, 2500, 100, 500, 1100, 300,
    // ]);

    // monthEarningArr?.splice(
    //   currentMonth,
    //   1,
    //   monthlyEarnings?.currentMonth?.amount || 0
    // );
    // monthEarningArr?.splice(
    //   currentMonth - 1,
    //   1,
    //   monthlyEarnings?.prevMonth?.amount || 0
    // );

    return [1000, 700, 3200, 2000, 950, 4000, 4800, 2500, 100, 500, 1100, 300]; //monthEarningArr;
  };

  const earningData = () => {
    let earningArr: any[] = [];

    if (currentMonth < 6) {
      getMonthlyEarningsData()?.map((data: any, index: number) => {
        if (index < 6) {
          earningArr?.push({ x: getMonthNameArr()[index], y: data });
        } else {
          return <></>;
        }
      });
    } else {
      getMonthlyEarningsData()?.map((data: any, index: number) => {
        if (index > 5) {
          earningArr?.push({ x: getMonthNameArr()[index], y: data });
        } else {
          return <></>;
        }
      });
    }

    return earningArr;
  };

  const emptyData = () => {
    let isEmpty = true;

    earningData()?.map((d: any) => {
      if (d?.y != 0) {
        isEmpty = false;
        return;
      }
    });

    return isEmpty;
  };

  return (
    <View
      style={{
        borderRadius: 10,
        paddingTop: hp("2.75%"),
        paddingHorizontal: wp("1.7%"),
        backgroundColor: theme.colors.white[1000],
      }}
    >
      <View style={{ alignItems: "center", flexDirection: "row" }}>
        <DefaultText fontSize="sm" fontWeight="medium" color="dark.800">
          {title}
        </DefaultText>

        <TouchableOpacity style={{ marginLeft: 8 }}>
          <ICONS.InfoCircleSmallIcon />
        </TouchableOpacity>
      </View>

      {emptyData() ? (
        <>
          <NoDataPlaceholder
            title={`${t("Waiting for data to show chart")}.`}
          />

          <Spacer space={12} />
        </>
      ) : (
        <CustomBarChartMonth
          data={earningData()}
          width={width}
          // width={
          //   orientation == 1 || orientation == 2
          //     ? wp("40%") - 20
          //     : wp("30%") - 20
          // }
        />
      )}
    </View>
  );
}
