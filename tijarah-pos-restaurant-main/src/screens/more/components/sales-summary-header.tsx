import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { t } from "../../../../i18n";
import ReportFilter from "../../../components/reports/report-filter";
import DefaultText from "../../../components/text/Text";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import useReportStore from "../../../store/report-filter";
import ICONS from "../../../utils/icons";

const SalesSummaryHeader = ({ type = "sales", title = "SALES SUMMARY" }) => {
  const { hp, wp } = useResponsive();
  const { reportFilter } = useReportStore() as any;

  const theme = useTheme();
  const [openFilter, setOpenFilter] = useState(false);

  const getDateRange = useMemo(() => {
    if (reportFilter?.dateRange) {
      return `${reportFilter.dateRange.showStartDate} - ${reportFilter.dateRange.showEndDate}`;
    } else {
      return `${format(new Date(), "MMM d, `yy")} - ${format(
        new Date(),
        "MMM d, `yy"
      )}`;
    }
  }, [reportFilter]);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: hp("9.5%"),
        paddingLeft: wp("2%"),
        paddingRight: wp("2.25%"),
        borderBottomWidth: 1,
        borderColor: theme.colors.dividerColor.secondary,
        backgroundColor: theme.colors.primary[100],
      }}
    >
      <DefaultText
        style={{ paddingTop: hp("3.75%"), textTransform: "uppercase" }}
        fontWeight="medium"
      >
        {t(title)}
      </DefaultText>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <DefaultText
          style={{ marginRight: wp("1.85%") }}
          fontSize="2xl"
          fontWeight="medium"
        >
          {getDateRange}
        </DefaultText>

        <TouchableOpacity onPress={() => setOpenFilter(true)}>
          {Object.keys(reportFilter).length > 0 ? (
            <ICONS.FilterAppliedIcon />
          ) : (
            <ICONS.FilterSquareIcon />
          )}
        </TouchableOpacity>
      </View>
      {openFilter && (
        <ReportFilter
          reportType={type}
          visible={openFilter}
          handleClose={() => setOpenFilter(false)}
        />
      )}
    </View>
  );
};

export default SalesSummaryHeader;
