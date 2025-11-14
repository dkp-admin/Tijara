import React, { useCallback, useContext, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useInfiniteQuery } from "react-query";
import { t } from "../../../../../i18n";
import AuthContext from "../../../../context/auth-context";
import { useTheme } from "../../../../context/theme-context";
import { checkInternet } from "../../../../hooks/check-internet";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import { fetchDiscountsApi } from "../../../../screens/more/discounts";
import { AuthType } from "../../../../types/auth-types";
import { rowsPerPage } from "../../../../utils/constants";
import ICONS from "../../../../utils/icons";
import ActionSheetHeader from "../../../action-sheet/action-sheet-header";
import SeparatorHorizontalView from "../../../common/separator-horizontal-view";
import CreateEditDiscountModal from "../../../discounts/create-discount-modal";
import EmptyOrLoaderComponent from "../../../empty";
import Input from "../../../input/input";
import Loader from "../../../loader";
import PermissionPlaceholderComponent from "../../../permission-placeholder";
import showToast from "../../../toast";
import DiscountListHeaderDinein from "./discount-list-header";
import DiscountRowDinein from "./discount-row";
import dineinCart from "../../../../utils/dinein-cart";
import { EventRegister } from "react-native-event-listeners";
import useItemsDineIn from "../../../../hooks/use-items-dinein";
import serviceCaller from "../../../../api";
import DefaultText from "../../../text/Text";

function calculateDiscountAmount(discountDoc: any, totalAmount: number) {
  const { discount, discountType } = discountDoc;

  if (discountType === "amount") {
    return discount;
  } else if (discountType === "percentage") {
    return (discount / 100) * totalAmount;
  }
}

export default function DiscountModalDinein({
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
  const { totalAmount, discountsApplied } = useItemsDineIn();

  const [queryText, setQueryText] = useState("");
  const [visibleEditDiscount, setVisibleEditDiscount] = useState(false);

  const { data, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery(
      [`find-discount`, authContext, isConnected],
      async ({ pageParam = 0 }) => {
        if (isConnected) {
          return fetchDiscountsApi(
            pageParam,
            authContext.user.companyRef,
            "active"
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

  const listHeaderComponent = useMemo(() => <DiscountListHeaderDinein />, []);

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
      <DiscountRowDinein
        dinein={true}
        data={item}
        handleOnPress={(data: any) => {
          if (dineinCart?.getCartItems()?.length >= 0) {
            const discountAmount = calculateDiscountAmount(data, totalAmount);

            if (totalAmount - discountAmount <= 0) {
              showToast("error", t("Invalid Discount"));
              return;
            }

            dineinCart?.applyDiscount(data, (discounts: any) => {
              EventRegister.emit("discountApplied-dinein", discounts);
              showToast("success", "Discount applied to cart");
              handleClose();
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
              paddingHorizontal: hp("2.5%"),
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 0.05 }}>
              <ICONS.DiscountIcon />
            </View>

            <View style={{ flex: 1 }}>
              <Input
                containerStyle={{
                  borderWidth: 0,
                  height: hp("7%"),
                  marginLeft: wp("0.25%"),
                  backgroundColor: "transparent",
                }}
                allowClear={queryText !== ""}
                style={{
                  flex: twoPaneView ? 0.975 : 0.945,
                }}
                placeholderText={t("Enter discount code")}
                values={queryText}
                handleChange={(val: any) => setQueryText(val)}
              />
            </View>
            <View>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    if (dineinCart.cartItems.length <= 0) {
                      return showToast(
                        "info",
                        t("Please add item in the cart for discount")
                      );
                    }
                    if (!isConnected)
                      return showToast(
                        "error",
                        t("Please connect with internet")
                      );
                    if (queryText === "")
                      return showToast(
                        "error",
                        t("Please enter discount code")
                      );
                    const res = await serviceCaller("/coupon/pos/code", {
                      method: "GET",
                      query: {
                        code: queryText,
                        companyRef: authContext.user.companyRef,
                      },
                    });

                    const isApplied =
                      discountsApplied.findIndex(
                        (dis: any) => dis._id == res._id
                      ) !== -1;

                    if (isApplied) {
                      showToast("info", t("Discount coupon already applied"));
                      return;
                    }

                    if (dineinCart.cartItems.length >= 0 && !isApplied) {
                      dineinCart.applyDiscount(res, (discounts: any) => {
                        EventRegister.emit("discountApplied-dinein", discounts);
                      });
                    }

                    handleClose();
                  } catch (error) {
                    showToast("error", t("Coupon code is invalid"));
                  }
                }}
                style={{
                  flex: 2,
                  marginTop: hp("2%"),
                }}
              >
                <DefaultText
                  style={{ color: theme.colors.primary[1000] }}
                  fontSize={"md"}
                >
                  Apply
                </DefaultText>
              </TouchableOpacity>
            </View>
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
