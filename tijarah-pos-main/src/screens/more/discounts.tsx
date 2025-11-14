import { useIsFocused } from "@react-navigation/core";
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
  Keyboard,
  StyleSheet,
  View,
} from "react-native";
import { useInfiniteQuery } from "react-query";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import endpoint from "../../api/endpoints";
import CustomHeader from "../../components/common/custom-header";
import SeparatorHorizontalView from "../../components/common/separator-horizontal-view";
import CreateEditDiscountModal from "../../components/discounts/create-discount-modal";
import DiscountListHeader from "../../components/discounts/discount-list-header";
import DiscountRow from "../../components/discounts/discount-row";
import DiscountTopHeader from "../../components/discounts/discount-top-header";
import EmptyOrLoaderComponent from "../../components/empty";
import Loader from "../../components/loader";
import PermissionPlaceholderComponent from "../../components/permission-placeholder";
import showToast from "../../components/toast";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import { useResponsive } from "../../hooks/use-responsiveness";
import { AuthType } from "../../types/auth-types";
import { rowsPerPage } from "../../utils/constants";
import { debugLog } from "../../utils/log-patch";

export const fetchDiscountsApi = async (
  pageParam: any,
  companyRef: any,
  activeTab: string,
  queryText: string
) => {
  const response = await serviceCaller(endpoint.coupons.path, {
    method: endpoint.coupons.method,
    query: {
      sort: "desc",
      _q: queryText,
      page: pageParam,
      limit: rowsPerPage,
      activeTab: activeTab,
      companyRef: companyRef,
    },
  });

  debugLog(
    "Discount fetched from api",
    {},
    "discounts-screen",
    "fetchDiscounts"
  );

  return response;
};

const Discounts = () => {
  const theme = useTheme();
  const isFocused = useIsFocused();
  const isConnected = checkInternet();
  const { hp } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);

  const [queryText, setQueryText] = useState("");
  const [discountData, setDiscountData] = useState({});
  const [visibleCreateDiscount, setVisibleCreateDiscount] = useState(false);

  const { data, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery(
      [`find-discount`, authContext, queryText, isFocused, isConnected],
      async ({ pageParam = 0 }) => {
        if (isConnected) {
          return fetchDiscountsApi(
            pageParam,
            authContext.user.companyRef,
            "all",
            queryText
          );
        }
      },
      {
        getNextPageParam: (lastPage, allPages) => {
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
      }
    );

  const discountsList = useMemo(() => {
    if (data?.pages && isConnected) {
      return data?.pages?.map((page: any) => page?.results).flat();
    } else {
      return [];
    }
  }, [data?.pages]);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const listHeaderComponent = useMemo(() => <DiscountListHeader />, []);

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
      <EmptyOrLoaderComponent
        isEmpty={discountsList.length === 0}
        title={t("No Discounts!")}
        showBtn={authContext.permission["pos:coupon"]?.create}
        btnTitle={t("Create a discount")}
        handleOnPress={() => {
          if (!isConnected) {
            debugLog(
              "Discount can't be created offline",
              {},
              "discounts-screen",
              "handleOnPress"
            );
            showToast("error", t("Discount can't be created offline"));
            return;
          }

          debugLog(
            "Create discount modal opened",
            {},
            "discounts-screen",
            "handleOnPress"
          );
          setQueryText("");
          setDiscountData({ isAdd: true });
          setVisibleCreateDiscount(true);
        }}
      />
    );
  }, [discountsList, isConnected, authContext]);

  const renderDiscount = useCallback(({ item }: any) => {
    return (
      <DiscountRow
        data={item}
        handleOnPress={(data: any) => {
          debugLog(
            "Create discount modal opened",
            data,
            "discounts-screen",
            "handleEditDiscount"
          );
          setDiscountData({
            isAdd: false,
            title: data.code,
            discount: data,
          });
          setVisibleCreateDiscount(true);
        }}
      />
    );
  }, []);

  useEffect(() => {
    setQueryText("");
  }, []);

  return (
    <>
      <CustomHeader />

      <View
        style={{
          ...styles.container,
          backgroundColor: theme.colors.white[1000],
        }}
      >
        <DiscountTopHeader
          queryText={queryText}
          setQueryText={setQueryText}
          handleBtnTap={() => {
            debugLog(
              "Create discount modal opened",
              {},
              "discounts-screen",
              "handleCreateDiscount"
            );
            setDiscountData({ isAdd: true });
            setVisibleCreateDiscount(true);
          }}
        />

        <SeparatorHorizontalView />

        {!isConnected ? (
          <PermissionPlaceholderComponent
            title={t("Please connect with internet")}
            marginTop="-20%"
          />
        ) : !authContext.permission["pos:coupon"]?.read ? (
          <PermissionPlaceholderComponent
            title={t("You don't have permission to view this screen")}
            marginTop="-20%"
          />
        ) : isLoading ? (
          <View
            style={{
              ...styles.container,
              backgroundColor: theme.colors.white[1000],
            }}
          >
            <Loader style={{ marginTop: hp("30%") }} />
          </View>
        ) : (
          <FlatList
            onEndReached={loadMore}
            onEndReachedThreshold={0.01}
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={Keyboard.dismiss}
            data={discountsList}
            renderItem={renderDiscount}
            ListHeaderComponent={listHeaderComponent}
            ListEmptyComponent={emptyComponent}
            ListFooterComponent={listFooterComponent}
          />
        )}

        <CreateEditDiscountModal
          data={discountData}
          visible={visibleCreateDiscount}
          handleClose={() => {
            debugLog(
              "Create discount modal closed",
              {},
              "discounts-screen",
              "handleClose"
            );
            setVisibleCreateDiscount(false);
          }}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Discounts;
