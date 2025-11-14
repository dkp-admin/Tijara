import nextFrame from "next-frame";
import React, { useCallback, useContext, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  View,
  VirtualizedList,
} from "react-native";
import { useInfiniteQuery } from "react-query";
import { useDebounce } from "use-debounce";
import { t } from "../../../i18n";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import { AuthType } from "../../types/auth-types";
import CatalogueNavHeader from "../common/catalogue-navigation-header";
import SearchWithAdd from "../common/search-add";
import Loader from "../loader";
import NoDataPlaceholder from "../no-data-placeholder/no-data-placeholder";
import AddEditProductModal from "./add-product-modal";
import ProductHeader from "./product-header";
import ProductRow from "./product-row";
import repository from "../../db/repository";
import { FlashList } from "@shopify/flash-list";

const rowsPerPage = 5;

async function fetchProducts(
  pageParam: number,
  categoryId: string | undefined,
  query: string
) {
  let conditions: string[] = [];

  if (categoryId) {
    conditions.push("categoryRef = $categoryId");
  }

  if (query.trim()) {
    if (Number(query) > 0) {
      conditions.push(`(
        json_extract(name, '$.en') LIKE $query
        OR json_extract(name, '$.ar') LIKE $query
        OR EXISTS (
          SELECT 1 FROM json_each(variants) 
          WHERE json_extract(value, '$.sku') LIKE $query
          OR json_extract(value, '$.code') LIKE $query
        )
      )`);
    } else {
      conditions.push(`(
        json_extract(name, '$.en') LIKE $query
        OR json_extract(name, '$.ar') LIKE $query
      )`);
    }
  }

  const whereClause = conditions.length > 0 ? conditions.join(" AND ") : "";

  await nextFrame();

  return repository.productRepository.getPaginatedProductsWithQuery(
    pageParam,
    rowsPerPage,
    whereClause,
    categoryId,
    {
      $query: `%${query.trim()}%`,
      $categoryId: categoryId,
    }
  );
}

const ProductList = ({ categoryId }: { categoryId?: string }) => {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);

  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [visibleProduct, setVisibleProduct] = useState(false);

  const {
    data,
    hasNextPage,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery(
    [`find-product`, debouncedQuery, categoryId],
    async ({ pageParam = 1 }) => {
      return fetchProducts(pageParam, categoryId, debouncedQuery);
    },
    {
      getNextPageParam: (lastPage, allPages) => {
        const [rows, totalRecords] = lastPage;
        const currentPage = allPages.length;
        const totalPages = Math.ceil(totalRecords / rowsPerPage);

        return currentPage < totalPages ? currentPage + 1 : undefined;
      },
      keepPreviousData: true,
    }
  );

  const productsList = useMemo(() => {
    return data?.pages?.flatMap((page) => page[0]) || [];
  }, [data?.pages]);

  const renderProduct = useCallback(({ item }: any) => {
    return <ProductRow data={item} />;
  }, []);

  const productHeader = useMemo(() => {
    return <ProductHeader />;
  }, []);

  const listFooterComponent = useMemo(
    () => (
      <View style={{ height: hp("10%"), marginBottom: 16 }}>
        {isFetchingNextPage && (
          <ActivityIndicator size="small" color={theme.colors.primary[1000]} />
        )}
      </View>
    ),
    [isFetchingNextPage, theme.colors.primary]
  );

  const emptyComponent = useMemo(() => {
    if (isLoading) return null;

    return (
      <View style={{ marginHorizontal: 16 }}>
        <NoDataPlaceholder
          title={t("No Products!")}
          marginTop={hp("25%")}
          showBtn={
            categoryId ? false : authContext.permission["pos:product"]?.create
          }
          btnTitle={t("Add a product")}
          handleOnPress={() => setVisibleProduct(true)}
        />
      </View>
    );
  }, [categoryId, authContext.permission, isLoading]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const keyExtractor = useCallback((item: any) => item._id, []);

  const getItem = useCallback((data: any[], index: number) => data[index], []);
  const getItemCount = useCallback((data: any[]) => data.length, []);

  if (!authContext.permission["pos:product"]?.read) {
    return (
      <View style={{ marginHorizontal: 16 }}>
        <NoDataPlaceholder
          title={t("You don't have permission to view this screen")}
          marginTop={hp("35%")}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {twoPaneView ? (
        <SearchWithAdd
          placeholderText={t("Search products with name or SKU")}
          btnText={categoryId ? "" : t("Add a product")}
          queryText={queryText}
          setQueryText={setQueryText}
          handleBtnTap={() => setVisibleProduct(true)}
          readPermission={authContext.permission["pos:product"]?.read}
          createPermission={authContext.permission["pos:product"]?.create}
        />
      ) : (
        <CatalogueNavHeader
          title={categoryId ? t("Categories") : t("Products")}
          placeholderText={t("Search products with name or SKU")}
          query={queryText}
          showAddBtn={!categoryId}
          handleQuery={setQueryText}
          handleAddButtonTap={() => setVisibleProduct(true)}
          readPermission={authContext.permission["pos:product"]?.read}
          createPermission={authContext.permission["pos:product"]?.create}
        />
      )}

      {isLoading ? (
        <Loader marginTop={hp("40%")} />
      ) : (
        <FlashList
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={Keyboard.dismiss}
          data={productsList}
          renderItem={renderProduct}
          ListHeaderComponent={productHeader}
          ListEmptyComponent={emptyComponent}
          ListFooterComponent={listFooterComponent}
          keyExtractor={keyExtractor}
          removeClippedSubviews={true}
        />
      )}

      {visibleProduct && (
        <AddEditProductModal
          data={{}}
          visible={visibleProduct}
          key="edit-product"
          handleSaveProduct={(data: any, message: string) => {
            setVisibleProduct(false);
            refetch(); // Refresh the list after adding a new product
          }}
          handleClose={() => {
            setVisibleProduct(false);
          }}
        />
      )}
    </View>
  );
};

export default React.memo(ProductList);
