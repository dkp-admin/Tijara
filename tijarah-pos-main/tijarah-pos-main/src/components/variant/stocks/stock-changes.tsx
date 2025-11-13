import React, { useContext } from "react";
import { FlatList, View } from "react-native";
import { useInfiniteQuery } from "react-query";
import { Like, Raw } from "typeorm";
import { t } from "../../../../i18n";
import AuthContext from "../../../context/auth-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { AuthType } from "../../../types/auth-types";
import { rowsPerPage } from "../../../utils/constants";
import { repo } from "../../../utils/createDatabaseConnection";
import { debugLog } from "../../../utils/log-patch";
import Loader from "../../loader";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import Spacer from "../../spacer";
import StockChangesHeader from "./stock-changes/stock-changes-header";
import StockChangesRow from "./stock-changes/stock-changes-row";

export default function StockChanges({
  variant,
  filter,
}: {
  variant: any;
  filter: any;
}) {
  const { hp } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);

  const { data, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery(
      [`find-stock-history`, variant, filter],
      async ({ pageParam = 1 }) => {
        let dbQuery: any = [];

        if (filter.value !== "all") {
          dbQuery = [
            {
              locationRef: Like(`%${authContext.user.locationRef}%`),
              stockAction: Raw((alias: any) =>
                filter.value === "internal-transfer"
                  ? `${alias} == 'transfer-internal' OR ${alias} == 'received-internal'`
                  : `${alias} == '${filter.value}'`
              ),
              variant: Like(`%${variant.sku}%`),
            },
          ];
        } else {
          dbQuery = [
            {
              variant: Like(`%${variant.sku}%`),
              locationRef: Like(`%${authContext.user.locationRef}%`),
            },
          ];
        }

        const stockHistory = await repo.stockHistory.findAndCount({
          take: rowsPerPage,
          skip: rowsPerPage * (pageParam - 1),
          where: dbQuery,
          order: { createdAt: "DESC" },
        });

        debugLog(
          "Stoock history fetched from db",
          {},
          "stock-history-modal",
          "fetchStockHistory"
        );

        return stockHistory;
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

  const stockHistoryList = data?.pages?.flatMap((page) => page[0] || []) || [];

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return <Loader marginTop={hp("25%")} />;
  }

  return (
    <View style={{ flex: 1, paddingHorizontal: hp("2.5%") }}>
      <StockChangesHeader />

      <FlatList
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        data={stockHistoryList}
        renderItem={({ item }: any) => {
          return <StockChangesRow key={item._id} data={item} />;
        }}
        ListEmptyComponent={() => (
          <NoDataPlaceholder
            title={t("No Stock Changes!")}
            marginTop={hp("15%")}
          />
        )}
        ListFooterComponent={() => <Spacer space={hp("10%")} />}
      />
    </View>
  );
}
