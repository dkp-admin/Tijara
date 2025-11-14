import { endOfDay, startOfDay } from "date-fns";
import React, { useCallback, useContext, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Modal,
  StyleSheet,
  View,
} from "react-native";
import { EventRegister } from "react-native-event-listeners";
import Toast from "react-native-toast-message";
import { useInfiniteQuery } from "react-query";
import { t } from "../../../../i18n";
import serviceCaller from "../../../api";
import AuthContext from "../../../context/auth-context";
import { useTheme } from "../../../context/theme-context";
import { checkInternet } from "../../../hooks/check-internet";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { AuthType } from "../../../types/auth-types";
import cart from "../../../utils/cart";
import { rowsPerPage } from "../../../utils/constants";
import ICONS from "../../../utils/icons";
import ActionSheetHeader from "../../action-sheet/action-sheet-header";
import SeparatorHorizontalView from "../../common/separator-horizontal-view";
import EmptyOrLoaderComponent from "../../empty";
import Input from "../../input/input";
import Loader from "../../loader";
import PermissionPlaceholderComponent from "../../permission-placeholder";
import DefaultText from "../../text/Text";
import PromotionsListHeader from "./promotions/promotions-list-header";
import PromotionsRow from "./promotions/promotions-row";

export const fetchPromotionsApi = async (
  pageParam: any,
  companyRef: any,
  activeTab: string,
  queryText: string,
  locationRef: string,
  startOfDay: Date,
  endOfDay: Date
) => {
  const response = await serviceCaller("/promotion/pos", {
    method: "GET",
    query: {
      sort: "desc",
      _q: queryText,
      page: pageParam,
      limit: rowsPerPage,
      activeTab: activeTab,
      companyRef: companyRef,
      locationRef,
      startOfDay,
      endOfDay,
      showAdvancedPromo: true,
    },
  });

  return response;
};

export default function DiscountsTab({
  visible,
  handleClose,
}: {
  visible: boolean;
  handleClose: any;
}) {
  const theme = useTheme();
  const isConnected = checkInternet();
  const { wp, hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);

  const [queryText, setQueryText] = useState("");

  const {
    data,
    hasNextPage,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    error,
  } = useInfiniteQuery(
    [`find-promotions`, authContext, queryText, isConnected],
    async ({ pageParam = 0 }) => {
      if (isConnected) {
        return fetchPromotionsApi(
          pageParam,
          authContext.user.companyRef,
          "active",
          queryText,
          authContext?.user?.locationRef,
          startOfDay(new Date()),
          endOfDay(new Date())
        );
      }
    },
    {
      getNextPageParam: (lastPage, allPages) => {
        const totalRecords = lastPage?.total;
        const currentPageSize = lastPage?.results?.length || 0;
        const nextPage = allPages?.length;
        if (currentPageSize < rowsPerPage || currentPageSize === totalRecords) {
          return null; // No more pages to fetch
        }
        return nextPage;
      },
    }
  );

  const promotionsList = useMemo(() => {
    if (data?.pages && isConnected) {
      return data?.pages?.map((page: any) => page?.results).flat();
    } else {
      return [];
    }
  }, [data?.pages, isConnected]);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const listHeaderComponent = useMemo(() => <PromotionsListHeader />, []);

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
        isEmpty={promotionsList.length === 0}
        title={t("No Promotions!")}
        showBtn={false}
        btnTitle={t("")}
        handleOnPress={() => {
          setQueryText("");
        }}
      />
    );
  }, [promotionsList, isConnected, authContext]);

  const renderDiscount = useCallback(
    ({ item }: any) => {
      return (
        <>
          {isConnected ? (
            <PromotionsRow
              data={item}
              handleOnPress={(data: any) => {
                if (cart.cartItems.length >= 0) {
                  cart.applyPromotion(data, (promotions: any) => {
                    EventRegister.emit("promotionApplied", promotions);
                  });
                }
              }}
            />
          ) : (
            <DefaultText>{t("Please connect to internet!")}</DefaultText>
          )}
        </>
      );
    },
    [isConnected]
  );

  const renderServerError = useCallback(
    () => (
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
    ),
    [theme]
  );

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent={false}
      style={{ height: "100%" }}
    >
      <View
        style={{
          ...styles.container,
          backgroundColor: theme.colors.transparentBg,
        }}
      >
        <View
          style={{
            ...styles.container,
            marginHorizontal: twoPaneView ? "20%" : "0%",
            backgroundColor: theme.colors.bgColor,
          }}
        >
          <ActionSheetHeader
            title={t("Promotions")}
            handleLeftBtn={() => {
              setQueryText("");
              handleClose();
            }}
          />

          <View
            style={{
              paddingLeft: hp("2.5%"),
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <ICONS.SearchPrimaryIcon />

            <Input
              containerStyle={{
                borderWidth: 0,
                height: hp("7%"),
                marginLeft: wp("0.25%"),
                backgroundColor: "transparent",
              }}
              allowClear={queryText != ""}
              style={{
                flex: twoPaneView ? 0.975 : 0.945,
              }}
              placeholderText={t("Search promotions")}
              values={queryText}
              handleChange={(val: any) => setQueryText(val)}
            />
          </View>

          <SeparatorHorizontalView />

          {!isConnected ? (
            <PermissionPlaceholderComponent
              title={t("Please connect with internet")}
              marginTop="-25%"
            />
          ) : !authContext.permission["pos:coupon"]?.read ? (
            <PermissionPlaceholderComponent
              title={t("You don't have permission to view this screen")}
              marginTop="-25%"
            />
          ) : isLoading ? (
            <View
              style={{
                ...styles.container,
                backgroundColor: theme.colors.bgColor,
              }}
            >
              <Loader style={{ marginTop: hp("30%") }} />
            </View>
          ) : error ? (
            renderServerError()
          ) : (
            <FlatList
              onEndReached={loadMore}
              onEndReachedThreshold={0.01}
              alwaysBounceVertical={false}
              showsVerticalScrollIndicator={false}
              onScrollBeginDrag={Keyboard.dismiss}
              data={promotionsList}
              renderItem={renderDiscount}
              ListHeaderComponent={listHeaderComponent}
              ListEmptyComponent={emptyComponent}
              ListFooterComponent={listFooterComponent}
            />
          )}
        </View>
      </View>

      <Toast />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    height: "100%",
  },
});
