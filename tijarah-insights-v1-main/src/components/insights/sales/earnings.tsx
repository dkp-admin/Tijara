import { format } from "date-fns";
import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import CustomBarChart from "../../chart/custom-bar-chart";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import Spacer from "../../spacer";
import DefaultText, { getOriginalSize } from "../../text/Text";
import showToast from "../../toast";
import ToolTip from "../../tool-tip";
import ScrollTabButton from "../common/scroll-tab-button";
import LoadingRect from "../skeleton-loader/skeleton-loader";

const getDayNameArr = () => {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
};

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

export default function Earnings({
  monthlyEarning,
  loading = false,
}: {
  monthlyEarning: any;
  loading: boolean;
}) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();

  // const currentMonth = new Date().getMonth();

  const [activeTab, setActiveTab] = useState(0);

  // const getDailyEarningsData = () => {
  //   const dailyEarningArr = Array(12).fill([
  //     100, 1200, 2000, 800, 2500, 500, 1100,
  //   ]);
  //   dailyEarningArr?.splice(
  //     currentMonth,
  //     1,
  //     dailyEarnings?.currentMonth?.amount || 0
  //   );
  //   dailyEarningArr?.splice(
  //     currentMonth - 1,
  //     1,
  //     dailyEarnings?.prevMonth?.amount || 0
  //   );
  //   return [500, 1200, 2000, 800, 2500, 4000, 1100]; //dailyEarningArr;
  // };

  // const getMonthlyEarningsData = () => {
  //   const monthEarningArr = Array(12).fill([
  //     100, 400, 1200, 2000, 350, 800, 1800, 2500, 100, 500, 1100, 300,
  //   ]);
  //   monthEarningArr?.splice(
  //     currentMonth,
  //     1,
  //     monthlyEarnings?.currentMonth?.amount || 0
  //   );
  //   monthEarningArr?.splice(
  //     currentMonth - 1,
  //     1,
  //     monthlyEarnings?.prevMonth?.amount || 0
  //   );
  //   return [1000, 700, 3200, 2000, 950, 4000, 4800, 2500, 100, 500, 1100, 300]; //monthEarningArr;
  // };

  const earningData = useMemo(() => {
    const earningArr = monthlyEarning?.map((data: any) => {
      return {
        x: format(new Date(data.date), "d MMM"),
        y: data.grossRevenue,
      };
    });

    // if (activeTab === 0) {
    //   getDailyEarningsData()?.map((data: any, index: number) => {
    //     earningArr?.push({ x: getDayNameArr()[index], y: data });
    //   });
    // } else {
    //   if (currentMonth < 6) {
    //     getMonthlyEarningsData()?.map((data: any, index: number) => {
    //       if (index < 6) {
    //         earningArr?.push({ x: getMonthNameArr()[index], y: data });
    //       } else {
    //         return <></>;
    //       }
    //     });
    //   } else {
    //     getMonthlyEarningsData()?.map((data: any, index: number) => {
    //       if (index > 5) {
    //         earningArr?.push({ x: getMonthNameArr()[index], y: data });
    //       } else {
    //         return <></>;
    //       }
    //     });
    //   }
    // }

    const earnings = earningArr?.reverse()?.splice(0, 5);

    return earnings?.reverse() || [];
  }, [monthlyEarning]);

  return (
    <View
      style={{
        borderRadius: getOriginalSize(10),
        paddingTop: hp("1.75%"),
        paddingHorizontal: hp("1.5%"),
        backgroundColor: theme.colors.white[1000],
      }}
    >
      <View style={{ alignItems: "center", flexDirection: "row" }}>
        <DefaultText fontSize="md" fontWeight="semibold">
          {t("Earnings")}
        </DefaultText>

        <View style={{ marginLeft: getOriginalSize(8) }}>
          <ToolTip infoMsg={t("earnings_analytics_in_sales")} />
        </View>
      </View>

      <Spacer space={getOriginalSize(12)} />

      {loading ? (
        <LoadingRect
          width={wp("83%")}
          height={hp("30%")}
          style={{ marginBottom: hp("2%") }}
        />
      ) : (
        <View>
          <ScrollTabButton
            tabs={[t("Day"), t("Week"), t("Month")]}
            activeTab={activeTab}
            onChange={(tab: any) => {
              if (tab !== 0) {
                showToast("info", `${t("Coming Soon")}...`);
                return;
              }
              setActiveTab(tab);
            }}
          />

          {earningData?.length === 0 ? (
            <View
              style={{
                marginTop: hp("-3.5%"),
                marginBottom: hp("2.5%"),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <NoDataPlaceholder
                title={t("no_data_earnings_analytics_in_sales")}
              />
            </View>
          ) : (
            <CustomBarChart
              activeTab={activeTab}
              weekly={activeTab === 0}
              data={earningData}
            />
          )}
        </View>
      )}
    </View>
  );
}
