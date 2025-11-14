import { endOfDay, startOfDay } from "date-fns";
import React, { useCallback, useContext, useEffect, useMemo } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { useInfiniteQuery } from "react-query";
import { Between } from "typeorm";
import { t } from "../../../i18n";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import { queryClient } from "../../query-client";
import useReportStore from "../../store/report-filter";
import { AuthType } from "../../types/auth-types";
import { rowsPerPage } from "../../utils/constants";
import { repo } from "../../utils/createDatabaseConnection";
import { debugLog, infoLog } from "../../utils/log-patch";
import Loader from "../loader";
import NoDataPlaceholder from "../no-data-placeholder/no-data-placeholder";
import PermissionPlaceholderComponent from "../permission-placeholder";
import ActivityLogsRow from "./activity-logs/activity-logs-row";
import ActivityLogsTopHeader from "./activity-logs/logs-top-header";

export default function ActivityLogs() {
  const theme = useTheme();
  const { hp } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);
  const { reportFilter } = useReportStore() as any;

  const { data, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery(
      [`find-logs`, reportFilter],
      async ({ pageParam = 1 }) => {
        const whereObj: any = {};

        if (reportFilter?.dateRange?.from && reportFilter?.dateRange?.to) {
          const startDate = new Date(reportFilter.dateRange.from);
          const endDate = new Date(reportFilter.dateRange.to);

          whereObj["createdAt"] = Between(startDate, endDate);
        }

        const logs = await repo.log.findAndCount({
          take: rowsPerPage,
          skip: rowsPerPage * (pageParam - 1),
          where: { ...whereObj },
          order: { createdAt: "DESC" },
        });

        debugLog(
          "Activity logs fetched from db",
          {},
          "reports-logs-screen",
          "fetchActivityLogs"
        );

        return logs;
      },
      {
        getNextPageParam: (lastPage, allPages) => {
          const totalRecords = lastPage[1];
          const currentPageSize = lastPage[0]?.length || 0;
          const nextPage = allPages.length + 1;
          if (
            currentPageSize < rowsPerPage ||
            currentPageSize === totalRecords
          ) {
            return null; // No more pages to fetch
          }
          return nextPage;
        },
      }
    );

  const logsList = data?.pages?.flatMap((page) => page[0] || []) || [];

  const renderLogs = useCallback(({ item }: any) => {
    return <ActivityLogsRow key={item.id} data={item} />;
  }, []);

  const listFooterComponent = useMemo(
    () => (
      <View style={{ height: hp("15%"), marginBottom: 16 }}>
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
          title={t("No Activity Logs!")}
          marginTop={hp("30%")}
        />
      </View>
    );
  }, []);

  useEffect(() => {
    return () => {
      queryClient.removeQueries(`find-logs`);
    };
  }, []);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (!authContext.permission["pos:report"]?.["activity-log"]) {
    infoLog(
      "Permission denied to view this screen",
      { tab: "Activity logs" },
      "reports-logs-screen",
      "handlePermission"
    );

    return (
      <PermissionPlaceholderComponent
        marginTop="-20%"
        title={t("You don't have permissions to view this screen")}
      />
    );
  }

  if (isLoading) {
    return (
      <Loader
        marginTop={hp("30%")}
        style={{ backgroundColor: theme.colors.white[1000] }}
      />
    );
  }

  return (
    <View style={{ ...styles.container }}>
      <ActivityLogsTopHeader />

      <FlatList
        onEndReached={loadMore}
        onEndReachedThreshold={0.01}
        alwaysBounceVertical={false}
        data={logsList}
        showsVerticalScrollIndicator={false}
        renderItem={renderLogs}
        ListEmptyComponent={emptyComponent}
        ListFooterComponent={listFooterComponent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
