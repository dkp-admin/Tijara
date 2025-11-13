import { endOfDay, format, startOfDay } from "date-fns";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  SectionList,
  StyleSheet,
  View,
} from "react-native";
import { useInfiniteQuery } from "react-query";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import endpoint from "../../api/endpoints";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import { useFindOne } from "../../hooks/use-find-one";
import { useResponsive } from "../../hooks/use-responsiveness";
import useCommonApis from "../../hooks/useCommonApis";
import SalesSummaryTopCards from "../../screens/more/components/sales-summary-top-cards";
import useReportStore from "../../store/report-filter";
import { AuthType } from "../../types/auth-types";
import ICONS from "../../utils/icons";
import Loader from "../loader";
import CurrencyView from "../modal/currency-view-modal";
import NoDataPlaceholder from "../no-data-placeholder/no-data-placeholder";
import PermissionPlaceholderComponent from "../permission-placeholder";
import DefaultText from "../text/Text";
import OrderListHeader from "./order-report/order-list-header";
import OrderRow from "./order-report/order-row";
import OrderTopHeader from "./order-report/order-top-header";
import ReportFilter from "./report-filter";
import ReportsNavHeader from "./reports-navigation-header";
import { currencyValue } from "../../utils/get-value-currency";

const rowsPerPage = 25;

const fetchOrdersReportApi = async (
  pageParam: any,
  companyRef: any,
  locationRef: any,
  reportFilter: any
) => {
  const fromDate = new Date(
    reportFilter?.dateRange?.from || startOfDay(new Date())
  );
  const toDate = new Date(reportFilter?.dateRange?.to || endOfDay(new Date()));

  const query: any = {
    page: pageParam,
    sort: "desc",
    activeTab: "all",
    limit: rowsPerPage,
    companyRef: companyRef,
    locationRef: locationRef,
    dateRange: {
      from: fromDate,
      to: toDate,
    },
  };

  if (
    reportFilter?.orderType?.value &&
    reportFilter?.orderType?.value !== "all"
  ) {
    query.orderType = reportFilter?.orderType?.value;
  }

  if (reportFilter?.source?.value && reportFilter?.source?.value === "online") {
    query.onlineOrdering = true;
  }

  if (reportFilter?.source?.value && reportFilter?.source?.value === "qr") {
    query.qrOrdering = true;
  }

  if (
    reportFilter?.orderStatus?.value &&
    reportFilter?.orderStatus?.value !== "all"
  ) {
    query.orderStatus = reportFilter?.orderStatus?.value;
  }

  const response = await serviceCaller(endpoint.orderReport.path, {
    method: endpoint.orderReport.method,
    query: query,
  });

  return response;
};

const convertToSectionedList = (orders: any) => {
  if (!orders || orders?.length === 0) {
    return [];
  }

  const sectionListData: {
    header: { date: string; amount: number };
    data: any[];
  }[] = [];

  let date = orders[0].createdAt;
  let createdAtDate = format(new Date(orders[0].createdAt), "dd/MM/yyyy");
  let totalAmount = 0;
  let orderList: any[] = [];

  orders.forEach((order: any) => {
    const orderDate = format(new Date(order.createdAt), "dd/MM/yyyy");

    if (orderDate === createdAtDate) {
      orderList.push(order);
      totalAmount += Number(order.payment.total);
    } else {
      sectionListData.push({
        header: { date: date, amount: totalAmount },
        data: [...orderList],
      });

      createdAtDate = orderDate;
      orderList = [order];
      date = order.createdAt;
      totalAmount = Number(order.payment.total);
    }
  });

  if (orderList.length > 0) {
    sectionListData.push({
      header: { date: date, amount: totalAmount },
      data: [...orderList],
    });
  }

  return sectionListData;
};

export default function OrdersReport({ menu = "orders" }: { menu?: string }) {
  const theme = useTheme();
  const { businessData } = useCommonApis();
  const isConnected = checkInternet();
  const { hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);
  const { reportFilter, setReportFilter } = useReportStore() as any;
  const [openFilter, setOpenFilter] = useState(false);

  const {
    findOne: findOrderStats,
    entity: orderStats,
    loading,
    dataUpdatedAt,
  } = useFindOne("report/sales/stats");

  const {
    data,
    hasNextPage,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery(
    [`orders-report`, authContext, reportFilter, isConnected],
    async ({ pageParam = 0 }) => {
      if (isConnected) {
        return fetchOrdersReportApi(
          pageParam,
          authContext.user.companyRef,
          authContext.user.locationRef,
          reportFilter
        );
      }
    },
    {
      getNextPageParam: (lastPage: any, allPages: any) => {
        const totalRecords = lastPage?.total;
        const currentPageSize = lastPage?.results?.length || 0;
        const nextPage = allPages?.length;
        if (currentPageSize < rowsPerPage || currentPageSize === totalRecords) {
          return null; // No more pages to fetch
        }

        return nextPage;
      },
      staleTime: 900000,
    }
  );

  const ordersData: any = useMemo(() => {
    return data?.pages?.flatMap((page: any) => page?.results || []).flat();
  }, [data]);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const topRowData = useMemo(
    () => [
      {
        title: t("TODAY'S REVENUE"),
        topAmount: orderStats?.todaysRevenue + orderStats?.todaysVat || 0,
        bottomText: `${t("TOTAL SALES")}:`,
        bottomCount: (
          <CurrencyView
            amount={currencyValue(
              orderStats?.totalRevenue + orderStats?.totalRevenueVat || 0
            )}
          />
        ),
        icon: <ICONS.DashSaleIcon />,
      },
      {
        title: t("Today's Order Count"),
        topAmount: orderStats?.totalOrderToday || 0,
        bottomText: `${t("TOTAL ORDERS COUNT")}:`,
        bottomCount: orderStats?.totalOrder || 0,
        icon: <ICONS.DashSaleIcon color={theme.colors.primary[1000]} />,
        showSar: false,
      },
      {
        title: t("TODAY'S REFUNDS"),
        topAmount: orderStats?.totalRefundToday || 0,
        bottomText: `${t("TOTAL REFUNDS")}:`,
        bottomCount: (
          <CurrencyView
            amount={Number(orderStats?.totalRefund || 0).toFixed(2)}
          />
        ),
        icon: <ICONS.RefundOrderIcon />,
      },
      {
        title: t("ITEMS REFUNDED TODAY"),
        topAmount: orderStats?.totalRefundedItemsToday || 0,
        bottomText: `${t("Total Refunded Items")}:`,
        bottomCount: orderStats?.totalRefundedItems || 0,
        icon: <ICONS.RefundOrderIcon />,
        showSar: false,
      },
    ],
    [orderStats]
  );

  const renderOrders = useCallback(({ item }: any) => {
    return <OrderRow key={item?._id} data={item} />;
  }, []);

  const renderSectionHeader = useCallback(
    ({ section: { header } }: any) => (
      <OrderListHeader key={header.amount} data={header} />
    ),
    []
  );

  const getReportNote = () => {
    const businessHour =
      businessData?.location?.businessClosureSetting?.businessTime;
    const endStartReporting =
      businessData?.location?.businessClosureSetting?.endStartReporting;

    if (businessHour && !reportFilter?.reportingHours?._id) {
      return `${t(
        "The report being shown is based on location business hours"
      )}`;
    } else if (endStartReporting && !reportFilter?.reportingHours?._id) {
      return `${t(
        "The report being shown is based on End at business day settings"
      )}`;
    } else if (reportFilter?.reportingHours?._id) {
      return `${t("The report being shown is based on Reporting hours")}`;
    } else {
      return `${t(
        "The report being shown is based on Company time zone (12:00 - 11:59)"
      )}`;
    }
  };

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

  const topcardHeader = useMemo(
    () => (
      <>
        {!twoPaneView && (
          <ReportsNavHeader
            title={t("Orders/Transactions")}
            dateRange={getDateRange}
            selectedMenu={menu}
            handleFilterTap={() => setOpenFilter(true)}
          />
        )}
        <View
          style={{
            marginLeft: hp("4%"),
            marginTop: hp("3%"),
            marginBottom: -hp("1%"),
          }}
        >
          <DefaultText
            style={{ marginRight: "2%" }}
            fontSize="lg"
            fontWeight="medium"
            color={theme.colors.otherGrey[100]}
          >
            {`${t("Note")}: ${getReportNote()}. ${t(
              "Stats last updated on"
            )} ${format(new Date(dataUpdatedAt), "dd/MM/yyyy, h:mm a")}.`}
          </DefaultText>
        </View>

        <View
          style={{
            borderRadius: 8,
            marginVertical: hp("3%"),
            marginHorizontal: hp("2%"),
          }}
        >
          <View
            style={{
              flexDirection: twoPaneView ? "row" : "column",
              gap: 10,
            }}
          >
            {topRowData.map((data) => {
              return (
                <SalesSummaryTopCards
                  key={data?.title}
                  title={data?.title?.toUpperCase()}
                  bottomCount={data?.bottomCount}
                  bottomText={data?.bottomText}
                  topAmount={data?.topAmount}
                  showSar={data?.showSar}
                  Icon={data?.icon}
                />
              );
            })}
          </View>
        </View>

        <OrderTopHeader />
      </>
    ),
    [orderStats, dataUpdatedAt, businessData]
  );

  const listFooterComponent = useMemo(
    () => (
      <View style={{ height: hp("15%"), marginBottom: 20 }}>
        {isFetchingNextPage && (
          <ActivityIndicator
            size={"small"}
            color={theme.colors.primary[1000]}
          />
        )}
      </View>
    ),
    [isFetchingNextPage]
  );

  const emptyComponent = useMemo(() => {
    return (
      <View style={{ marginHorizontal: 16 }}>
        <NoDataPlaceholder
          title={t("No Orders Report!")}
          marginTop={hp("20%")}
        />
      </View>
    );
  }, []);

  useMemo(() => {
    (async () => {
      if (isConnected) {
        const fromDate = reportFilter?.dateRange?.from
          ? new Date(reportFilter?.dateRange?.from)
          : startOfDay(new Date());
        const toDate = reportFilter?.dateRange?.to
          ? new Date(reportFilter?.dateRange?.to)
          : endOfDay(new Date());

        const query: any = {
          page: 0,
          sort: "desc",
          activeTab: "all",
          limit: rowsPerPage,
          companyRef: authContext.user.companyRef,
          locationRef: authContext.user.locationRef,
          dateRange: {
            from: fromDate,
            to: toDate,
          },
        };

        findOrderStats(query);
      }
    })();
  }, [authContext, reportFilter]);

  useEffect(() => {
    if (menu === "orders") {
      refetch();
    }
  }, [menu]);

  if (loading || isLoading) {
    return (
      <View
        style={{ ...styles.container, backgroundColor: theme.colors.bgColor }}
      >
        <Loader style={{ marginTop: hp("35%") }} />
      </View>
    );
  }

  if (!isConnected || !authContext.permission["pos:report"]?.order) {
    let text = "";

    if (!isConnected) {
      text = `${t("Reports are not available on offline mode")}. ${t(
        "Please go online"
      )}.`;
    } else {
      text = t("You don't have permissions to view this screen");
    }

    return <PermissionPlaceholderComponent title={text} marginTop="-15%" />;
  }

  if (!(loading || isLoading) && !orderStats) {
    return (
      <>
        {!twoPaneView && (
          <ReportsNavHeader
            title={t("Orders/Transactions")}
            dateRange={getDateRange}
            selectedMenu={menu}
            handleFilterTap={() => setOpenFilter(true)}
          />
        )}
        <View
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: hp("80%"),
            ...styles.container,
            backgroundColor: theme.colors.bgColor,
          }}
        >
          <DefaultText style={{ fontSize: 24 }}>
            {t(
              "We're having trouble reaching our servers, Please check your internet connection"
            )}
          </DefaultText>
        </View>
        <ReportFilter
          reportType={menu}
          visible={openFilter}
          handleClose={() => setOpenFilter(false)}
        />
      </>
    );
  }

  return (
    <>
      <View
        style={{ ...styles.container, backgroundColor: theme.colors.bgColor }}
      >
        <FlatList
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          data={[1]}
          ListHeaderComponent={topcardHeader}
          renderItem={() => (
            <SectionList
              onEndReached={loadMore}
              onEndReachedThreshold={0.01}
              scrollEnabled={false}
              alwaysBounceVertical={false}
              showsVerticalScrollIndicator={false}
              sections={convertToSectionedList(ordersData || [])}
              keyExtractor={(item, index) => `${item.orderId}-${index}`}
              renderItem={renderOrders}
              renderSectionHeader={renderSectionHeader}
              ListEmptyComponent={emptyComponent}
              ListFooterComponent={listFooterComponent}
            />
          )}
        />
      </View>
      <ReportFilter
        reportType={menu}
        visible={openFilter}
        handleClose={() => setOpenFilter(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
