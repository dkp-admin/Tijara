import React from "react";
import { TouchableOpacity, View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import ICONS from "../../../utils/icons";
import CustomBarChartDays from "../../chart/custom-bar-chart-days";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import Spacer from "../../spacer";
import DefaultText from "../../text/Text";

export default function DailyEarnings({ title, dailyEarnings, width }: any) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();

  const getDayNameArr = () => {
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  };

  const getDailyEarningsData = () => {
    // const dailyEarningArr = Array(12).fill([
    //   100, 1200, 2000, 800, 2500, 500, 1100,
    // ]);

    // dailyEarningArr?.splice(
    //   currentMonth,
    //   1,
    //   dailyEarnings?.currentMonth?.amount || 0
    // );
    // dailyEarningArr?.splice(
    //   currentMonth - 1,
    //   1,
    //   dailyEarnings?.prevMonth?.amount || 0
    // );

    return [500, 1200, 2000, 800, 2500, 4000, 1100]; //dailyEarningArr;
  };

  const earningData = () => {
    let earningArr: any[] = [];

    getDailyEarningsData()?.map((data: any, index: number) => {
      earningArr?.push({ x: getDayNameArr()[index], y: data });
    });

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
        <CustomBarChartDays
          data={earningData()}
          width={width}
          // width={
          //   orientation == 1 || orientation == 2
          //     ? wp("40%") - 20
          //     : wp("32%") - 20
          // }
        />
      )}
    </View>
  );
}
