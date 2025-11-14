import { format } from "date-fns";
import React, { useCallback, useContext, useEffect, useMemo } from "react";
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
import { queryClient } from "../../query-client";
import useReportStore from "../../store/report-filter";
import { AuthType } from "../../types/auth-types";
import { debugLog, infoLog } from "../../utils/log-patch";
import SeparatorHorizontalView from "../common/separator-horizontal-view";
import SeparatorVerticalView from "../common/separator-vertical-view";
import Loader from "../loader";
import NoDataPlaceholder from "../no-data-placeholder/no-data-placeholder";
import PermissionPlaceholderComponent from "../permission-placeholder";
import DefaultText from "../text/Text";
import OrderListHeader from "./order-report/order-list-header";
import OrderRow from "./order-report/order-row";
import OrderTopHeader from "./order-report/order-top-header";
import ReportCommonCard from "./report-common-card";

const rowsPerPage = 25;

const fetchOrdersReportApi = async (
  pageParam: any,
  companyRef: any,
  locationRef: any,
  reportFilter: any
) => {
  const fromDate = new Date(reportFilter.dateRange.from);
  const toDate = new Date(reportFilter.dateRange.to);

  const query: any = {
    page: pageParam,
    sort: "desc",
    activeTab: "all",
    limit: rowsPerPage,
    companyRef: companyRef,
    locationRef: locationRef,
    dateRange: { from: fromDate, to: toDate },
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

  debugLog(
    "Order report fetched from api",
    {},
    "reports-order-screen",
    "fetchOrdersReportApi"
  );

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

export default function OrdersReport() {
  const theme = useTheme();
  const { businessData } = useCommonApis();
  const isConnected = checkInternet();
  const { hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);
  const { reportFilter } = useReportStore() as any;

  const {
    findOne: findOrderStats,
    entity: orderStats,
    loading,
    dataUpdatedAt,
  } = useFindOne("report/order/stats");

  const { data, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery(
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
          if (
            currentPageSize < rowsPerPage ||
            currentPageSize === totalRecords
          ) {
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
        amount: `${(orderStats?.todaysRevenue || 0)?.toFixed(2)}`,
        desc: `${t("TODAY'S ORDER COUNT")}: ${
          orderStats?.totalOrderToday || 0
        }`,
      },
      {
        title: t("TODAY'S REFUNDS"),
        amount: `${(orderStats?.totalRefundToday || 0)?.toFixed(2)}`,
        desc: `${t("ITEMS REFUNDED TODAY")}: ${
          orderStats?.totalRefundedItemsToday || 0
        }`,
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

  const topcardHeader = useMemo(
    () => (
      <>
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
            backgroundColor: theme.colors.white[1000],
          }}
        >
          <View
            style={{
              flexDirection: twoPaneView ? "row" : "column",
            }}
          >
            {topRowData.map((data, index) => {
              return (
                <React.Fragment key={index}>
                  <View style={{ width: twoPaneView ? "50%" : "100%" }}>
                    <ReportCommonCard key={index} data={data} />
                  </View>

                  {index < topRowData.length - 1 &&
                    (twoPaneView ? (
                      <SeparatorVerticalView />
                    ) : (
                      <SeparatorHorizontalView />
                    ))}
                </React.Fragment>
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
        const fromDate = new Date(reportFilter.dateRange.from);
        const toDate = new Date(reportFilter.dateRange.to);

        findOrderStats({
          page: 0,
          sort: "desc",
          activeTab: "all",
          limit: rowsPerPage,
          companyRef: authContext.user.companyRef,
          locationRef: authContext.user.locationRef,
          dateRange: { from: fromDate, to: toDate },
        });
      }
    })();
  }, [authContext, reportFilter]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries(`orders-report`);
    };
  }, []);

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
      infoLog(
        "Internet not connected",
        { tab: "Orders" },
        "reports-order-screen",
        "handleInternet"
      );
      text = `${t("Reports are not available on offline mode")}. ${t(
        "Please go online"
      )}.`;
    } else {
      infoLog(
        "Permission denied to view this screen",
        { tab: "Orders" },
        "reports-order-screen",
        "handlePermission"
      );
      text = t("You don't have permissions to view this screen");
    }

    return <PermissionPlaceholderComponent title={text} marginTop="-15%" />;
  }

  return (
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
