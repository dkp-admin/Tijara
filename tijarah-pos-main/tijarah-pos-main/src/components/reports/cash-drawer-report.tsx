import { endOfDay, startOfDay } from "date-fns";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { useInfiniteQuery } from "react-query";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import endpoint from "../../api/endpoints";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import { useResponsive } from "../../hooks/use-responsiveness";
import { queryClient } from "../../query-client";
import useReportStore from "../../store/report-filter";
import { AuthType } from "../../types/auth-types";
import { rowsPerPage } from "../../utils/constants";
import { debugLog, infoLog } from "../../utils/log-patch";
import Loader from "../loader";
import NoDataPlaceholder from "../no-data-placeholder/no-data-placeholder";
import PermissionPlaceholderComponent from "../permission-placeholder";
import CashDrawerDetailsModal from "./cash-drawer-report/cash-drawer-details";
import CashDrawerHeader from "./cash-drawer-report/cash-drawer-header";
import CashDrawerRow from "./cash-drawer-report/cash-drawer-row";

const fetchShiftsReportApi = async (
  pageParam: any,
  companyRef: any,
  locationRef: any,
  reportFilter: any
) => {
  const fromDate = new Date(reportFilter.dateRange.from);
  const toDate = new Date(reportFilter.dateRange.to);

  const response = await serviceCaller(endpoint.shiftReport.path, {
    method: endpoint.shiftReport.method,
    query: {
      page: pageParam,
      sort: "desc",
      activeTab: "all",
      limit: rowsPerPage,
      companyRef: companyRef,
      locationRef: locationRef,
      dateRange: { from: fromDate, to: toDate },
    },
  });

  debugLog(
    "Shift report fetched from api",
    {},
    "reports-shift-screen",
    "fetchShiftsReportApi"
  );

  return response;
};

export default function CashDrawerReport() {
  const theme = useTheme();
  const isConnected = checkInternet();
  const authContext = useContext<AuthType>(AuthContext);
  const { hp } = useResponsive();
  const { reportFilter } = useReportStore() as any;

  const [shiftsReport, setShiftsReport] = useState<any>([]);
  const [openCashDrawer, setOpenCashDrawer] = useState(false);
  const [cashDrawerData, setCashDrawerData] = useState<any>(null);

  const { data, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery(
      [`cash-drawer-report`, authContext, reportFilter, isConnected],
      async ({ pageParam = 0 }) => {
        if (isConnected) {
          return fetchShiftsReportApi(
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

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderCashDrawer = useCallback(({ item }: any) => {
    return (
      <CashDrawerRow
        key={item?._id}
        data={item}
        handleRowPress={(data: any) => {
          setCashDrawerData(data);
          setOpenCashDrawer(true);
        }}
      />
    );
  }, []);

  const listHeaderComponent = useMemo(() => <CashDrawerHeader />, []);

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
          title={t("No Shift Reports!")}
          marginTop={hp("30%")}
        />
      </View>
    );
  }, []);

  useEffect(() => {
    if (data?.pages && isConnected) {
      const shiftReportsList = data?.pages
        ?.map((page: any) => page?.results)
        .flat();

      setShiftsReport([...(shiftReportsList || [])]);
    }
  }, [data?.pages]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries(`cash-drawer-report`);
    };
  }, []);

  if (isLoading) {
    return (
      <View
        style={{ ...styles.container, backgroundColor: theme.colors.bgColor }}
      >
        <Loader style={{ marginTop: hp("35%") }} />
      </View>
    );
  }

  if (!isConnected || !authContext.permission["pos:report"]?.shift) {
    let text = "";

    if (!isConnected) {
      infoLog(
        "Internet not connected",
        { tab: "Shifts & cash drawer" },
        "reports-shift-screen",
        "handleInternet"
      );
      text = `${t("Reports are not available on offline mode")}. ${t(
        "Please go online"
      )}.`;
    } else {
      infoLog(
        "Permission denied to view this screen",
        { tab: "Shifts & cash drawer" },
        "reports-shift-screen",
        "handlePermission"
      );
      text = t("You don't have permission to view this screen");
    }

    return <PermissionPlaceholderComponent title={text} marginTop="-15%" />;
  }

  return (
    <View
      style={{ ...styles.container, backgroundColor: theme.colors.bgColor }}
    >
      <FlatList
        onEndReached={loadMore}
        onEndReachedThreshold={0.01}
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        data={shiftsReport}
        renderItem={renderCashDrawer}
        ListHeaderComponent={listHeaderComponent}
        ListEmptyComponent={emptyComponent}
        ListFooterComponent={listFooterComponent}
      />

      <CashDrawerDetailsModal
        data={cashDrawerData}
        visible={openCashDrawer}
        handleClose={() => setOpenCashDrawer(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
