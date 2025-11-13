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
import AuthContext from "../../../context/auth-context";
import { useTheme } from "../../../context/theme-context";
import { checkInternet } from "../../../hooks/check-internet";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { fetchDiscountsApi } from "../../../screens/more/discounts";
import { AuthType } from "../../../types/auth-types";
import cart from "../../../utils/cart";
import { rowsPerPage } from "../../../utils/constants";
import ICONS from "../../../utils/icons";
import { debugLog } from "../../../utils/log-patch";
import ActionSheetHeader from "../../action-sheet/action-sheet-header";
import SeparatorHorizontalView from "../../common/separator-horizontal-view";
import CreateEditDiscountModal from "../../discounts/create-discount-modal";
import EmptyOrLoaderComponent from "../../empty";
import Input from "../../input/input";
import Loader from "../../loader";
import PermissionPlaceholderComponent from "../../permission-placeholder";
import showToast from "../../toast";
import DiscountListHeaderBilling from "./discount/discount-list-header";
import DiscountRowBilling from "./discount/discount-row";

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
  const [visibleEditDiscount, setVisibleEditDiscount] = useState(false);

  const { data, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery(
      [`find-discount`, authContext, queryText, isConnected],
      async ({ pageParam = 0 }) => {
        if (isConnected) {
          return fetchDiscountsApi(
            pageParam,
            authContext.user.companyRef,
            "active",
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

  const listHeaderComponent = useMemo(() => <DiscountListHeaderBilling />, []);

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
            showToast("error", t("Discount can't be created offline"));
            return;
          }
          setQueryText("");
          setVisibleEditDiscount(true);
        }}
      />
    );
  }, [discountsList, isConnected, authContext]);

  const renderDiscount = useCallback(({ item }: any) => {
    return (
      <DiscountRowBilling
        data={item}
        handleOnPress={(data: any) => {
          if (cart.cartItems.length >= 0) {
            cart.applyDiscount(data, (discounts: any) => {
              debugLog(
                "Discount applied to cart",
                data,
                "billing-screen",
                "handleDiscountAddButton"
              );
              EventRegister.emit("discountApplied", discounts);
            });
          }
        }}
      />
    );
  }, []);

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
            title={t("Discounts")}
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
              placeholderText={t("Search discounts")}
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
            data={{ isAdd: true }}
            visible={visibleEditDiscount}
            handleClose={() => setVisibleEditDiscount(false)}
          />
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
