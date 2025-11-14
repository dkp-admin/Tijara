import React, { useCallback, useContext, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  View,
  VirtualizedList,
} from "react-native";
import { useInfiniteQuery } from "react-query";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import endpoint from "../../api/endpoints";
import DeviceContext from "../../context/device-context";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import { useResponsive } from "../../hooks/use-responsiveness";
import { rowsPerPage } from "../../utils/constants";
import Loader from "../loader";
import NoDataPlaceholder from "../no-data-placeholder/no-data-placeholder";
import PermissionPlaceholderComponent from "../permission-placeholder";
import showToast from "../toast";
import EditGlobalProductModal from "./edit-global-product-modal";
import GlobalProductHeader from "./global-product-header";
import GlobalProductRow from "./global-product-row";
import AuthContext from "../../context/auth-context";
import { checkDirection } from "../../hooks/check-direction";
import CatalogueNavHeader from "../common/catalogue-navigation-header";
import SearchWithAdd from "../common/search-add";
import { useIsFocused } from "@react-navigation/core";
import { AuthType } from "../../types/auth-types";
import { debugLog, errorLog, infoLog } from "../../utils/log-patch";

const fetchGlobalProducts = async (
  searchText: string,
  pageParam: number,
  businessTypeRef: string
) => {
  const response = await serviceCaller(endpoint.globalProducts.path, {
    method: endpoint.globalProducts.method,
    query: {
      page: pageParam,
      sort: "desc",
      activeTab: "active",
      limit: rowsPerPage,
      _q: searchText,
      businessTypeRefs: [businessTypeRef],
    },
  });

  return response;
};

const GlobalProductList = () => {
  const theme = useTheme();
  const isRTL = checkDirection();
  const focused = useIsFocused();
  const isConnected = checkInternet();
  const authContext = useContext<AuthType>(AuthContext);
  const deviceContext = useContext(DeviceContext) as any;
  const { hp, twoPaneView } = useResponsive();

  const [queryText, setQueryText] = useState("");
  const [productData, setProductData] = useState({});
  const [visibleEditProduct, setVisibleEditProduct] = useState(false);

  const { data, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery(
      [`find-global-products`, queryText, deviceContext, focused],
      async ({ pageParam = 0 }) => {
        if (isConnected) {
          const products = await fetchGlobalProducts(
            queryText,
            pageParam,
            deviceContext.user.company.businessTypeRef
          );

          debugLog(
            "Global products fetched from api",
            {},
            "global-products-screen",
            "fetchGlobalProducts"
          );

          return products;
        }
      },
      {
        getNextPageParam: (lastPage: any, allPages: any) => {
          const totalPages = Math.ceil(lastPage?.total / rowsPerPage);
          const totalRows = allPages?.reduce((pv: number, cv: any) => {
            return pv + cv?.results?.length || 0;
          }, 0);
          const currentPage = Math.ceil(totalRows / rowsPerPage) - 1;

          if (currentPage < totalPages) {
            return currentPage + 1;
          }
        },
      }
    );

  const productsList = useMemo(() => {
    if (data?.pages && isConnected) {
      return data.pages.map((page: any) => page.results).flat();
    }

    return [];
  }, [data]);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const checkExistProduct = async (data: any) => {
    try {
      const res = await serviceCaller(endpoint.isAlreadyImported.path, {
        method: endpoint.isAlreadyImported.method,
        query: {
          _id: data._id,
          companyRef: deviceContext.user.companyRef,
        },
      });

      if (res?.exists) {
        debugLog(
          "Global product already imported",
          res,
          "global-products-screen",
          "checkExistProductFunction"
        );
        showToast("info", t("Already Imported"));
      } else {
        addProduct(data);
      }
    } catch (err: any) {
      errorLog(
        err?.message,
        endpoint.isAlreadyImported,
        "global-products-screen",
        "checkExistProductFunction",
        err
      );
      showToast("error", err.message);
    }
  };

  const addProduct = async (data: any) => {
    const dataObj = {
      assignedToAll: false,
      locationRefs: [authContext.user.locationRef],
      locations: [authContext.user.location.name],
      companyRef: authContext.user.companyRef,
      company: {
        name: authContext.user.company.name,
      },
      productIds: [data._id],
      importType: "selected",
    };

    try {
      const res = await serviceCaller(endpoint.importGlobalProduct.path, {
        method: endpoint.importGlobalProduct.method,
        body: dataObj,
      });

      if (res?.success === 1) {
        debugLog(
          "Global product imported",
          dataObj,
          "global-products-screen",
          "addProductFunction"
        );
        showToast("success", t("Global Product Imported"));
      }
    } catch (err: any) {
      errorLog(
        err?.message,
        endpoint.importGlobalProduct,
        "global-products-screen",
        "addProductFunction",
        err
      );
      showToast("error", err.message);
    }
  };

  const renderProduct = useCallback(({ item }: any) => {
    return (
      <GlobalProductRow
        data={item}
        handleOnPress={(data: any) => {
          debugLog(
            "Create global product modal opened",
            data,
            "global-products-screen",
            "handleOnPress"
          );
          setProductData({
            title: isRTL ? data.name.ar : data.name.en,
            product: data,
          });
          setVisibleEditProduct(true);
          Keyboard.dismiss();
        }}
        handleAddProduct={(data: any) => {
          checkExistProduct(data);
          Keyboard.dismiss();
        }}
      />
    );
  }, []);

  const productHeaderComponent = useMemo(() => {
    return <GlobalProductHeader />;
  }, []);

  const productFooterComponent = useMemo(
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

  const productEmptyComponent = useMemo(() => {
    return (
      <View style={{ marginHorizontal: 16 }}>
        <NoDataPlaceholder
          title={t("No Global Products!")}
          marginTop={hp("30%")}
        />
      </View>
    );
  }, []);

  const keyExtractor = (item: any) => item._id;

  if (isLoading && !queryText) {
    return <Loader marginTop={hp("40%")} />;
  }

  if (!isConnected || !authContext.permission["pos:global-product"]?.read) {
    let text = "";

    if (!isConnected) {
      infoLog(
        "Internet not connected",
        {},
        "global-products-screen",
        "handleConnection"
      );
      text = `${t("You seem to be not connected to the internet")}. ${t(
        "Please connect to the internet to access Global Products"
      )}.`;
    } else {
      infoLog(
        "Permission denied for this screen",
        {},
        "global-products-screen",
        "handlePermission"
      );
      text = t("You don't have permission to view this screen");
    }

    return <PermissionPlaceholderComponent title={text} marginTop="-20%" />;
  }

  return (
    <View style={{ ...styles.container }}>
      {twoPaneView ? (
        <SearchWithAdd
          placeholderText={t("Search products")}
          queryText={queryText}
          setQueryText={setQueryText}
          readPermission={authContext.permission["pos:global-product"]?.read}
        />
      ) : (
        <CatalogueNavHeader
          title={t("Global Products")}
          placeholderText={t("Search products")}
          query={queryText}
          handleQuery={setQueryText}
          showAddBtn={false}
          readPermission={authContext.permission["pos:global-product"]?.read}
        />
      )}

      <VirtualizedList // Change from FlatList to VirtualizedList
        onEndReached={loadMore}
        onEndReachedThreshold={0.01}
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={Keyboard.dismiss}
        data={productsList}
        renderItem={renderProduct}
        ListHeaderComponent={productHeaderComponent}
        ListEmptyComponent={productEmptyComponent}
        ListFooterComponent={productFooterComponent}
        keyExtractor={keyExtractor}
        initialNumToRender={6} // You can adjust this value as needed
        getItemCount={() => productsList.length}
        getItem={(data, index) => data[index]}
        keyboardShouldPersistTaps="always"
      />

      <EditGlobalProductModal
        data={productData}
        visible={visibleEditProduct}
        handleClose={() => {
          debugLog(
            "Create global product modal closed",
            {},
            "global-products-screen",
            "handleClose"
          );
          setVisibleEditProduct(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default GlobalProductList;
