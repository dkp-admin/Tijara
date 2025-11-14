import { useNavigation } from "@react-navigation/core";
import { format } from "date-fns";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { t } from "../../../i18n";
import CustomHeader from "../../components/common/custom-header";
import SeparatorVerticalView from "../../components/common/separator-vertical-view";
import SideMenu from "../../components/common/side-menu";
import CashDrawerReport from "../../components/reports/cash-drawer-report";
import OrdersReport from "../../components/reports/orders-report";
import ReportFilter from "../../components/reports/report-filter";
import DefaultText from "../../components/text/Text";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import { useResponsive } from "../../hooks/use-responsiveness";
import useReportStore from "../../store/report-filter";
import ICONS from "../../utils/icons";
import SalesSummaryReports from "./components/sales-summary";
import { useSubscription } from "../../store/subscription-store";
import PermissionPlaceholderComponent from "../../components/permission-placeholder";

const Reports = () => {
  const theme = useTheme();
  const { twoPaneView, hp, wp } = useResponsive();
  const [selectedMenu, setSelectedMenu] = useState(twoPaneView ? "sales" : "");
  const navigation = useNavigation<any>();
  const authContext = useContext(AuthContext) as any;
  const [openFilter, setOpenFilter] = useState(false);
  const { reportFilter, setReportFilter } = useReportStore() as any;
  const isConnected = checkInternet();
  const { hasPermission } = useSubscription();

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

  const Header = ({
    selectedMenu,
    showDateRangeFilter,
    getHeaderText,
    getDateRange,
    isConnected,
    reportFilter,
    setOpenFilter,
  }: any) => (
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
      <DefaultText style={{ paddingTop: hp("3.75%") }} fontWeight="medium">
        {getHeaderText[selectedMenu]}
      </DefaultText>

      {showDateRangeFilter && (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <DefaultText
            style={{ marginRight: wp("1.85%") }}
            fontSize="2xl"
            fontWeight="medium"
          >
            {getDateRange}
          </DefaultText>
          {(selectedMenu === "activityLogs" || isConnected) && (
            <TouchableOpacity onPress={() => setOpenFilter(true)}>
              {Object.keys(reportFilter).length > 0 ? (
                <ICONS.FilterAppliedIcon />
              ) : (
                <ICONS.FilterSquareIcon />
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  const ContentSection = ({ selectedMenu }: { selectedMenu: string }) => {
    switch (selectedMenu) {
      case "sales":
        return hasPermission("sales_summary") ? (
          <SalesSummaryReports menu={selectedMenu} />
        ) : (
          <PermissionPlaceholderComponent
            title={t("You don't have permission to view this screen")}
            marginTop="-25%"
          />
        );
      case "orders":
        return hasPermission("order_report") ? (
          <OrdersReport menu={selectedMenu} />
        ) : (
          <PermissionPlaceholderComponent
            title={t("You don't have permission to view this screen")}
            marginTop="-25%"
          />
        );
      case "cashDrawer":
        return hasPermission("shift_and_cash_drawer") ? (
          <CashDrawerReport />
        ) : (
          <PermissionPlaceholderComponent
            title={t("You don't have permission to view this screen")}
            marginTop="-25%"
          />
        );
      default:
        return null;
    }
  };

  const menuOptions = [
    { title: t("Sales summary"), value: "sales", key: "sales_summary" },
    { title: t("Orders/Transactions"), value: "orders", key: "order_report" },
    {
      title: t("Shifts & Cash drawer"),
      value: "cashDrawer",
      key: "shift_and_cash_drawer",
    },
  ];

  const getHeaderText: any = {
    sales: t("SALES SUMMARY"),
    orders: t("ORDERS/TRANSACTIONS"),
    cashDrawer: t("SHIFTS & CASH DRAWER"),
  };

  const handleNavigate = useCallback((menu: string) => {
    if (menu === "sales") {
      navigation.navigate("SalesReport");
    } else if (menu === "orders") {
      navigation.navigate("OrderReport");
    } else if (menu === "cashDrawer") {
      navigation.navigate("CashDrawerReport");
    } else if (menu === "activityLogs") {
      navigation.navigate("AvtivityLogs");
    }
  }, []);

  const renderSideMenu = useMemo(
    () => (
      <SideMenu
        title={t("REPORTS")}
        selectedMenu={selectedMenu}
        setSelectedMenu={(menu: string) => {
          if (!twoPaneView) {
            handleNavigate(menu);
          }
          setSelectedMenu(menu);
        }}
        menuOptions={menuOptions}
      />
    ),
    [selectedMenu]
  );

  const showDateRangeFilter = useMemo(() => {
    if (selectedMenu === "sales") {
      return authContext.permission["pos:report"]?.sales;
    } else if (selectedMenu === "orders") {
      return authContext.permission["pos:report"]?.order;
    } else if (selectedMenu === "cashDrawer") {
      return authContext.permission["pos:report"]?.shift;
    }
  }, [selectedMenu, authContext.permission]);

  const renderContent = useMemo(() => {
    return (
      <>
        <SeparatorVerticalView />
        <View
          style={{
            flex: 0.75,
            height: "100%",
            backgroundColor: theme.colors.bgColor,
          }}
        >
          <Header
            selectedMenu={selectedMenu}
            showDateRangeFilter={showDateRangeFilter}
            getHeaderText={getHeaderText}
            getDateRange={getDateRange}
            isConnected={isConnected}
            reportFilter={reportFilter}
            setOpenFilter={setOpenFilter}
          />

          <ContentSection selectedMenu={selectedMenu} />
        </View>
      </>
    );
  }, [selectedMenu, reportFilter]);

  useMemo(() => {
    setReportFilter({});
  }, []);

  return (
    <>
      <CustomHeader />
      <View
        style={{ ...styles.container, backgroundColor: theme.colors.bgColor }}
      >
        {renderSideMenu}
        {twoPaneView && renderContent}
      </View>
      <ReportFilter
        reportType={selectedMenu}
        visible={openFilter}
        handleClose={() => setOpenFilter(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
});

export default Reports;
