import nextFrame from "next-frame";
import React, { useCallback, useContext, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  View,
  VirtualizedList,
} from "react-native";
import { useInfiniteQuery } from "react-query";
import { ILike } from "typeorm";
import { useDebounce } from "use-debounce";
import { t } from "../../../i18n";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { ProductModel } from "../../database/product/product";
import { useResponsive } from "../../hooks/use-responsiveness";
import { AuthType } from "../../types/auth-types";
import { repo } from "../../utils/createDatabaseConnection";
import { debugLog } from "../../utils/log-patch";
import CatalogueNavHeader from "../common/catalogue-navigation-header";
import SearchWithAdd from "../common/search-add";
import Loader from "../loader";
import NoDataPlaceholder from "../no-data-placeholder/no-data-placeholder";
import AddEditProductModal from "./add-product-modal";
import ProductHeader from "./product-header";
import ProductRow from "./product-row";

const rowsPerPage = 10;

async function fetchProducts(pageParam: any, categoryId: any, query: any) {
  let dbQuery = {} as any;

  if (categoryId) {
    dbQuery["categoryRef"] = categoryId;
  }

  if (query) {
    dbQuery["name"] = ILike(`%${query}%`);
  }

  const queryBuilder = repo.product
    .createQueryBuilder("products")
    .where({ ...dbQuery });

  if (!categoryId && query && (Number(query) || 0) > 0) {
    queryBuilder.orWhere("products.variants LIKE :variantSku", {
      variants: "sku",
      variantSku: `%${query}%`,
    });
  }

  if (!categoryId && query) {
    queryBuilder.orWhere("products.variants LIKE :variantCode", {
      variants: "code",
      variantCode: `%${query}%`,
    });
  }

  await nextFrame();

  debugLog(
    "Products fetched from db",
    {},
    "catalogue-products-screen",
    "fetchProducts"
  );

  return queryBuilder
    .take(rowsPerPage)
    .skip(rowsPerPage * (pageParam - 1))
    .getManyAndCount();
}

const ProductList = ({ categoryId }: { categoryId?: any }) => {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);

  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [visibleProduct, setVisibleProduct] = useState(false);

  const { data, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery(
      [`find-product`, debouncedQuery, categoryId],
      async ({ pageParam = 1 }) => {
        return fetchProducts(pageParam, categoryId, debouncedQuery);
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

  const productsList = data?.pages?.flatMap((page) => page[0] || []) || [];

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
          title={t("No Products!")}
          marginTop={hp("25%")}
          showBtn={
            categoryId ? false : authContext.permission["pos:product"]?.create
          }
          btnTitle={t("Add a product")}
          handleOnPress={() => {
            debugLog(
              "Add product modal opened",
              {},
              "catalogue-products-screen",
              "handleAddProduct"
            );
            setVisibleProduct(true);
          }}
        />
      </View>
    );
  }, [categoryId]);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const keyExtractor = (item: ProductModel) => item._id;

  if (!authContext.permission["pos:product"]?.read) {
    debugLog(
      "Permission denied for this screen",
      {},
      "catalogue-products-screen",
      "handlePermission"
    );

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
          handleBtnTap={() => {
            debugLog(
              "Add product modal opened",
              {},
              "catalogue-products-screen",
              "handleAddProduct"
            );
            setVisibleProduct(true);
          }}
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
          handleAddButtonTap={() => {
            debugLog(
              "Add product modal opened",
              {},
              "catalogue-products-screen",
              "handleAddProduct"
            );
            setVisibleProduct(true);
          }}
          readPermission={authContext.permission["pos:product"]?.read}
          createPermission={authContext.permission["pos:product"]?.create}
        />
      )}

      {isLoading ? (
        <Loader marginTop={hp("40%")} />
      ) : (
        <VirtualizedList // Change from FlatList to VirtualizedList
          onEndReached={loadMore}
          onEndReachedThreshold={0.01}
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={Keyboard.dismiss}
          data={productsList}
          renderItem={renderProduct}
          ListHeaderComponent={productHeader}
          ListEmptyComponent={emptyComponent}
          ListFooterComponent={listFooterComponent}
          keyExtractor={keyExtractor}
          initialNumToRender={6} // You can adjust this value as needed
          getItemCount={() => productsList.length}
          getItem={(data, index) => data[index]}
          keyboardShouldPersistTaps="always"
        />
      )}

      {visibleProduct && (
        <AddEditProductModal
          data={{}}
          visible={visibleProduct}
          key="edit-product"
          handleSaveProduct={(data: any, message: string) => {
            debugLog(
              "Add product modal closed",
              {},
              "catalogue-products-screen",
              "handleClose"
            );
            setVisibleProduct(false);
            // showProductSaveAlert(data, message);
          }}
          handleClose={() => {
            debugLog(
              "Add product modal closed",
              {},
              "catalogue-products-screen",
              "handleClose"
            );
            setVisibleProduct(false);
          }}
        />
      )}
    </View>
  );
};

export default React.memo(ProductList);
