import { useMemo } from "react";
import { View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import CustomBarChartHorizontal from "../../chart/custom-bar-chart-horizontal";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import Spacer from "../../spacer";
import DefaultText, { getOriginalSize } from "../../text/Text";
import ToolTip from "../../tool-tip";
import ScrollTabButton from "../common/scroll-tab-button";
import LoadingRect from "../skeleton-loader/skeleton-loader";

const colorsArr = ["#4339F2", "#FF3A29", "#FFB200", "#211F32", "#02A0FC"];
const colorsBgArr = ["#DAD7FE", "#FFE5D3", "#FFF5CC", "#211F3233", "#CCF8FE"];

export default function VendorProfitsCard({
  activeTab = 0,
  setActiveTab,
  vendorProfits,
  loading = false,
}: {
  activeTab: number;
  setActiveTab: any;
  vendorProfits: any;
  loading: boolean;
}) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();

  const chartDataArr = useMemo(() => {
    const dataArr = vendorProfits?.map((vendor: any, index: number) => {
      return {
        key: index,
        color: colorsArr[index],
        bgColor: colorsBgArr[index],
        data: vendor.profit,
        name: vendor.name || "NA",
      };
    });

    return dataArr?.splice(0, 5) || [];
  }, [vendorProfits]);

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
          {t("Vendor Profits")}
        </DefaultText>

        <View style={{ marginLeft: getOriginalSize(8) }}>
          <ToolTip infoMsg={t("info_vendor_profits_in_others")} />
        </View>
      </View>

      <Spacer space={getOriginalSize(12)} />

      {loading ? (
        <LoadingRect width={wp("83%")} height={hp("30%")} />
      ) : (
        <View>
          <ScrollTabButton
            tabs={[t("Most Profits"), t("Least Profits")]}
            activeTab={activeTab}
            onChange={(tab: any) => {
              setActiveTab(tab);
            }}
          />

          {chartDataArr?.length > 0 ? (
            <View>
              <Spacer space={getOriginalSize(12)} />
              <CustomBarChartHorizontal
                vendor={true}
                chartData={chartDataArr}
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
                title={t("no_data_vendor_profits_in_others")}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
}
