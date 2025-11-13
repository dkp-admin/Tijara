import React, { useContext } from "react";
import { FlatList, View } from "react-native";
import { useInfiniteQuery } from "react-query";
import { t } from "../../../../i18n";
import AuthContext from "../../../context/auth-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { AuthType } from "../../../types/auth-types";
import { rowsPerPage } from "../../../utils/constants";
import Loader from "../../loader";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import Spacer from "../../spacer";
import BatchesHeader from "./batches/batches-header";
import BatchesRow from "./batches/batches-row";
import repository from "../../../db/repository";

export default function Batches({
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
      [`find-batch`, variant, filter, authContext],
      async ({ pageParam = 1 }) => {
        let dbQuery: any = [];

        dbQuery["sku"] = variant.sku;

        if (filter.value === "available-stocks") {
          dbQuery = [
            {
              locationRef: authContext.user.locationRef,
              sku: variant.sku,
            },
          ];
        } else if (filter.value === "zero-stocks") {
          dbQuery = [
            {
              locationRef: authContext.user.locationRef,
              sku: variant.sku,
            },
          ];
        } else if (filter.value === "negative-stocks") {
          dbQuery = [
            {
              locationRef: authContext.user.locationRef,
              sku: variant.sku,
            },
          ];
        } else {
          dbQuery = [
            {
              locationRef: authContext.user.locationRef,
              sku: variant.sku,
            },
          ];
        }

        const batches = await repository.batchRepository.findAndCount({
          take: rowsPerPage,
          skip: rowsPerPage * (pageParam - 1),
          where: dbQuery,
          order: { createdAt: "DESC" },
        });

        return batches;
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

  const batchList = data?.pages?.flatMap((page) => page[0] || []) || [];

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
      <BatchesHeader />

      <FlatList
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        data={batchList}
        renderItem={({ item }: any) => {
          return <BatchesRow key={item._id} data={item} />;
        }}
        ListEmptyComponent={() => (
          <NoDataPlaceholder title={t("No Batches!")} marginTop={hp("15%")} />
        )}
        ListFooterComponent={() => <Spacer space={hp("10%")} />}
      />
    </View>
  );
}
