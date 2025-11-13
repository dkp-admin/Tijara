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
import Loader from "../loader";
import NoDataPlaceholder from "../no-data-placeholder/no-data-placeholder";
import PermissionPlaceholderComponent from "../permission-placeholder";
import CashDrawerDetailsModal from "./cash-drawer-report/cash-drawer-details";
import CashDrawerHeader from "./cash-drawer-report/cash-drawer-header";
import CashDrawerRow from "./cash-drawer-report/cash-drawer-row";
import DefaultText from "../text/Text";

const fetchShiftsReportApi = async (
  pageParam: any,
  companyRef: any,
  locationRef: any,
  reportFilter: any
) => {
  const fromDate = new Date(
    reportFilter?.dateRange?.from || startOfDay(new Date())
  );
  const toDate = new Date(reportFilter?.dateRange?.to || endOfDay(new Date()));

  const response = await serviceCaller(endpoint.shiftReport.path, {
    method: endpoint.shiftReport.method,
    query: {
      page: pageParam,
      sort: "desc",
      activeTab: "all",
      limit: rowsPerPage,
      companyRef: companyRef,
      locationRef: locationRef,
      dateRange: {
        from: fromDate || startOfDay(new Date()),
        to: toDate || endOfDay(new Date()),
      },
    },
  });

  return response;
};

export default function CashDrawerReport() {
  const theme = useTheme();
  const isConnected = checkInternet();
  const authContext = useContext<AuthType>(AuthContext);
  const { hp } = useResponsive();
  const { reportFilter } = useReportStore() as any;
  const [openCashDrawer, setOpenCashDrawer] = useState(false);
  const [cashDrawerData, setCashDrawerData] = useState<any>(null);

  const {
    data,
    hasNextPage,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    error,
  } = useInfiniteQuery(
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
        if (currentPageSize < rowsPerPage || currentPageSize === totalRecords) {
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

  const shiftsReport: any = useMemo(() => {
    if (data?.pages && isConnected) {
      return data?.pages?.map((page: any) => page?.results).flat();
    } else {
      return [];
    }
  }, [data?.pages, isConnected]);

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
      text = `${t("Reports are not available on offline mode")}. ${t(
        "Please go online"
      )}.`;
    } else {
      text = t("You don't have permission to view this screen");
    }

    return <PermissionPlaceholderComponent title={text} marginTop="-15%" />;
  }

  if (error) {
    return (
      <View
        style={{
          ...styles.container,
          backgroundColor: theme.colors.bgColor,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <DefaultText style={{ fontSize: 24, textAlign: "center" }}>
          {t(
            "We're having trouble reaching our servers, Please check your internet connection"
          )}
        </DefaultText>
      </View>
    );
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
