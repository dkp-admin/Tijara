import { useNavigation } from "@react-navigation/core";
import { createStackNavigator } from "@react-navigation/stack";
import { format } from "date-fns";
import {
  default as React,
  Suspense,
  lazy,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { t } from "../../../i18n";
import CustomHeader from "../../components/common/custom-header";
import SeparatorVerticalView from "../../components/common/separator-vertical-view";
import SideMenu from "../../components/common/side-menu";
import Loader from "../../components/loader";
import ReportFilter, {
  getReportDateTime,
} from "../../components/reports/report-filter";
import ReportsNavHeader from "../../components/reports/reports-navigation-header";
import DefaultText from "../../components/text/Text";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import { useResponsive } from "../../hooks/use-responsiveness";
import useCommonApis from "../../hooks/useCommonApis";
import useReportStore from "../../store/report-filter";
import { AuthType } from "../../types/auth-types";
import ICONS from "../../utils/icons";
import { debugLog } from "../../utils/log-patch";

const SalesReport = lazy(() => import("../../components/reports/sales-report"));
const OrdersReport = lazy(
  () => import("../../components/reports/orders-report")
);
const CashDrawerReport = lazy(
  () => import("../../components/reports/cash-drawer-report")
);
const ActivityLogs = lazy(
  () => import("../../components/reports/activity-logs")
);

const ReportsStackNav = createStackNavigator();

const Reports = () => {
  const theme = useTheme();
  const isConnected = checkInternet();
  const { businessData } = useCommonApis();
  const { wp, hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);
  const navigation = useNavigation() as any;

  const { reportFilter, setReportFilter } = useReportStore() as any;

  const [selectedMenu, setSelectedMenu] = useState(twoPaneView ? "sales" : "");
  const [openFilter, setOpenFilter] = useState(false);

  const menuOptions = [
    { title: t("Sales summary"), value: "sales" },
    { title: t("Orders/Transactions"), value: "orders" },
    { title: t("Shifts & Cash drawer"), value: "cashDrawer" },
    { title: t("Activity Logs"), value: "activityLogs" },
  ];

  const getHeaderText: any = {
    sales: t("SALES SUMMARY"),
    orders: t("ORDERS/TRANSACTIONS"),
    cashDrawer: t("SHIFTS & CASH DRAWER"),
    activityLogs: t("ACTIVITY LOGS"),
  };

  const showDateRangeFilter = useMemo(() => {
    if (selectedMenu === "sales") {
      return authContext.permission["pos:report"]?.sales;
    } else if (selectedMenu === "orders") {
      return authContext.permission["pos:report"]?.order;
    } else if (selectedMenu === "cashDrawer") {
      return authContext.permission["pos:report"]?.shift;
    } else if (selectedMenu === "activityLogs") {
      return authContext.permission["pos:report"]?.["activity-log"];
    }
  }, [selectedMenu, authContext.permission]);

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
          debugLog(
            getHeaderText[menu],
            { row: menu },
            "reports-screen",
            "selectedMenuFunction"
          );
          setSelectedMenu(menu);

          if (!twoPaneView) {
            handleNavigate(menu);
          }
        }}
        menuOptions={menuOptions}
      />
    ),
    [selectedMenu]
  );

  const renderContent = () => (
    <>
      <SeparatorVerticalView />

      <View
        style={{
          flex: 0.75,
          height: "100%",
          backgroundColor: theme.colors.white[1000],
        }}
      >
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

              {(selectedMenu == "activityLogs" ? true : isConnected) && (
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

        {selectedMenu === "sales" && <SalesReportComponent />}
        {selectedMenu === "orders" && <OrderReportComponent />}
        {selectedMenu === "cashDrawer" && <CashDrawerReportComponent />}
        {selectedMenu === "activityLogs" && <ActivityLogsComponent />}
      </View>
    </>
  );

  const ReportMenuComponent = () => {
    return (
      <View style={styles.container}>
        {renderSideMenu}

        {twoPaneView && renderContent()}
      </View>
    );
  };

  const SalesReportComponent = React.memo(() => {
    return (
      <Suspense fallback={<Loader />}>
        <SalesReport />
      </Suspense>
    );
  });

  const OrderReportComponent = React.memo(() => {
    return (
      <Suspense fallback={<Loader />}>
        <OrdersReport />
      </Suspense>
    );
  });

  const CashDrawerReportComponent = React.memo(() => {
    return (
      <Suspense fallback={<Loader />}>
        <CashDrawerReport />
      </Suspense>
    );
  });

  const ActivityLogsComponent = React.memo(() => {
    return (
      <Suspense fallback={<Loader />}>
        <ActivityLogs />
      </Suspense>
    );
  });

  useEffect(() => {
    (async () => {
      const dateTime = await getReportDateTime(
        new Date(),
        new Date(),
        businessData,
        isConnected
      );

      setReportFilter({
        dateRange: {
          from: dateTime.from,
          to: dateTime.to,
          startDate: dateTime.startDate,
          endDate: dateTime.endDate,
          showStartDate: dateTime.showStartDate,
          showEndDate: dateTime.showEndDate,
        },
      });
    })();
  }, [businessData]);

  return (
    <>
      <CustomHeader />

      <View
        style={{ ...styles.container, backgroundColor: theme.colors.bgColor }}
      >
        <ReportsStackNav.Navigator>
          <ReportsStackNav.Screen
            name="ReportsMenu"
            options={{ headerShown: false }}
            component={ReportMenuComponent}
          />

          <ReportsStackNav.Screen
            name="SalesReport"
            options={{
              header: () => (
                <ReportsNavHeader
                  title={t("Sales summary")}
                  dateRange={getDateRange}
                  selectedMenu={selectedMenu}
                  handleFilterTap={() => setOpenFilter(true)}
                />
              ),
            }}
            component={SalesReportComponent}
          />

          <ReportsStackNav.Screen
            name="OrderReport"
            options={{
              header: () => (
                <ReportsNavHeader
                  title={t("Orders/Transactions")}
                  dateRange={getDateRange}
                  selectedMenu={selectedMenu}
                  handleFilterTap={() => setOpenFilter(true)}
                />
              ),
            }}
            component={OrderReportComponent}
          />

          <ReportsStackNav.Screen
            name="CashDrawerReport"
            options={{
              header: () => (
                <ReportsNavHeader
                  title={t("Shifts & Cash drawer")}
                  dateRange={getDateRange}
                  selectedMenu={selectedMenu}
                  handleFilterTap={() => setOpenFilter(true)}
                />
              ),
            }}
            component={CashDrawerReportComponent}
          />

          <ReportsStackNav.Screen
            name="AvtivityLogs"
            options={{
              header: () => (
                <ReportsNavHeader
                  title={t("Activity Logs")}
                  dateRange={getDateRange}
                  selectedMenu={selectedMenu}
                  handleFilterTap={() => setOpenFilter(true)}
                />
              ),
            }}
            component={ActivityLogsComponent}
          />
        </ReportsStackNav.Navigator>

        <ReportFilter
          reportType={selectedMenu}
          visible={openFilter}
          handleClose={() => setOpenFilter(false)}
        />
      </View>
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
