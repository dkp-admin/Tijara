import { FlashList } from "@shopify/flash-list";
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  StyleSheet,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useInfiniteQuery, useQueryClient } from "react-query";
import { t } from "../../../../../i18n";
import AuthContext from "../../../../context/auth-context";
import { useTheme } from "../../../../context/theme-context";
import { checkDirection } from "../../../../hooks/check-direction";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import { fetchCustomers } from "../../../../screens/more/customers";
import { AuthType } from "../../../../types/auth-types";
import { rowsPerPage } from "../../../../utils/constants";
import { repo } from "../../../../utils/createDatabaseConnection";
import ICONS from "../../../../utils/icons";
import ActionSheetHeader from "../../../action-sheet/action-sheet-header";
import BillingCustomerRow from "../../../billing/right-view/billing-customer-row";
import { PrimaryButton } from "../../../buttons/primary-button";
import SeparatorHorizontalView from "../../../common/separator-horizontal-view";
import AddEditCustomerModal from "../../../customers/add-customer-modal";
import Input from "../../../input/input";
import Loader from "../../../loader";
import NoDataPlaceholder from "../../../no-data-placeholder/no-data-placeholder";
import { debugLog } from "../../../../utils/log-patch";

export default function WalletCustomerModal({
  visible = false,
  handleSelectedCustomer,
  handleClose,
}: {
  visible: boolean;
  handleSelectedCustomer: any;
  handleClose: any;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const queryClient = useQueryClient();
  const { hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);

  const [queryText, setQueryText] = useState("");
  const [visibleAddCustomer, setVisibleAddCustomer] = useState(false);

  const { data, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery(
      [`find-customer`, queryText],
      async ({ pageParam = 1 }) => {
        return fetchCustomers(pageParam, queryText);
      },
      {
        getNextPageParam: (lastPage: any, allPages: any) => {
          const totalRows = allPages?.reduce((pv: number, cv: any) => {
            return pv + cv?.customers?.length || 0;
          }, 0);

          if (lastPage?.totalCount > totalRows) {
            return totalRows / rowsPerPage + 1;
          }
        },
      }
    );

  const customers: any = useMemo(() => {
    if (data) {
      const customerList = data?.pages?.flatMap((page) => page?.customers);
      debugLog(
        "Wallet customers fetched from db",
        {},
        "cart-billing-screen",
        "fetchWalletCustiomers"
      );
      return customerList;
    }

    return [];
  }, [data]);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  useEffect(() => {
    return () => {
      queryClient.removeQueries(`find-customer`);
    };
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
            title={t("Customers")}
            handleLeftBtn={() => handleClose()}
          />

          <View
            style={{
              height: hp("7%"),
              flexDirection: isRTL ? "row-reverse" : "row",
              alignItems: "center",
              marginVertical: hp("1.25%"),
              justifyContent: "space-between",
              paddingLeft: hp("1.5%"),
              paddingRight: hp("0.75%"),
            }}
          >
            <View
              style={{
                flex: 0.97,
                borderRadius: 16,
                paddingLeft: hp("1"),
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: theme.colors.primary[100],
              }}
            >
              <ICONS.ProfilePlaceholderIcon
                height={hp("5.5%")}
                width={hp("5.5%")}
              />

              <Input
                containerStyle={{
                  borderWidth: 0,
                  backgroundColor: "transparent",
                }}
                allowClear={queryText != ""}
                style={{ flex: twoPaneView ? 0.97 : 0.93 }}
                placeholderText={t(
                  "Search or add a customer with name or phone"
                )}
                values={queryText}
                handleChange={(val: any) => setQueryText(val)}
              />
            </View>

            {customers.length == 0 && queryText != "" && (
              <PrimaryButton
                style={{
                  paddingVertical: hp("1%"),
                  backgroundColor: "transparent",
                }}
                textStyle={{
                  fontSize: 20,
                  fontWeight: theme.fontWeights.medium,
                  color: authContext.permission["pos:customer"]?.create
                    ? theme.colors.primary[1000]
                    : theme.colors.placeholder,
                  fontFamily: theme.fonts.circulatStd,
                }}
                title={t("ADD")}
                onPress={() => {
                  setVisibleAddCustomer(true);
                }}
                disabled={!authContext.permission["pos:customer"]?.create}
              />
            )}
          </View>

          <SeparatorHorizontalView />

          {isLoading && queryText == "" ? (
            <Loader marginTop={hp("30%")} />
          ) : (
            <FlashList
              onEndReached={loadMore}
              onEndReachedThreshold={0.01}
              alwaysBounceVertical={false}
              showsVerticalScrollIndicator={false}
              onScrollBeginDrag={Keyboard.dismiss}
              data={customers}
              keyboardShouldPersistTaps="always"
              estimatedItemSize={hp("12%")}
              renderItem={({ item }) => {
                return (
                  <BillingCustomerRow
                    data={item}
                    handleOnPress={(data: any) => {
                      handleSelectedCustomer(data);
                    }}
                  />
                );
              }}
              ListEmptyComponent={() => {
                return (
                  <View style={{ marginHorizontal: 16 }}>
                    <NoDataPlaceholder
                      title={t("No Customers!")}
                      marginTop={hp("25%")}
                      showBtn={authContext.permission["pos:customer"]?.create}
                      btnTitle={t("Create Customer")}
                      handleOnPress={() => {
                        setVisibleAddCustomer(true);
                      }}
                    />
                  </View>
                );
              }}
              ListFooterComponent={() => (
                <View style={{ height: hp("10%"), marginBottom: 16 }}>
                  {isFetchingNextPage && (
                    <ActivityIndicator
                      size={"small"}
                      color={theme.colors.primary[1000]}
                    />
                  )}
                </View>
              )}
            />
          )}
        </View>
      </View>

      <AddEditCustomerModal
        isFromCustomer={false}
        data={{ isAdd: true }}
        visible={visibleAddCustomer}
        handleCustomerAdd={async (phone: string) => {
          const customer = await repo.customer.findOne({ where: { phone } });

          if (customer) {
            handleSelectedCustomer(customer);
            setQueryText("");
          }
          setVisibleAddCustomer(false);
        }}
        handleClose={() => {
          setVisibleAddCustomer(false);
        }}
      />

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
