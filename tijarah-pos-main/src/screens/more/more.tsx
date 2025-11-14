import { useIsFocused } from "@react-navigation/core";
import * as Constants from "expo-constants";
import React, { useContext, useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Between } from "typeorm";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import endpoint from "../../api/endpoints";
import { PrimaryButton } from "../../components/buttons/primary-button";
import CustomHeader from "../../components/common/custom-header";
import CancelOnlineOrder from "../../components/modal/cancel-online-order-modal";
import MoreDataRow from "../../components/more/more-row";
import EndShift from "../../components/profile/end-shift";
import Spacer from "../../components/spacer";
import DefaultText from "../../components/text/Text";
import showToast from "../../components/toast";
import AuthContext from "../../context/auth-context";
import DeviceContext from "../../context/device-context";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/check-direction";
import { checkInternet } from "../../hooks/check-internet";
import { useResponsive } from "../../hooks/use-responsiveness";
import useCommonApis from "../../hooks/useCommonApis";
import useCartStore from "../../store/cart-item";
import DatabasePull from "../../sync/database-pull";
import { AuthType } from "../../types/auth-types";
import MMKVDB from "../../utils/DB-MMKV";
import { DBKeys } from "../../utils/DBKeys";
import { objectId } from "../../utils/bsonObjectIdTransformer";
import calculateCart from "../../utils/calculate-cart";
import cart from "../../utils/cart";
import { COMPANY_PLACEHOLDER } from "../../utils/constants";
import { repo } from "../../utils/createDatabaseConnection";
import ICONS from "../../utils/icons";
import { debugLog } from "../../utils/log-patch";

const pullOperations = new DatabasePull();

const MoreHome = () => {
  const theme = useTheme();
  const isRTL = checkDirection();
  const isFocused = useIsFocused();
  const isConnected = checkInternet();
  const { hp, wp, twoPaneView } = useResponsive();
  const { businessData } = useCommonApis() as any;

  const authContext = useContext<AuthType>(AuthContext);
  const deviceContext = useContext(DeviceContext) as any;

  const { setCustomer, setCustomerRef } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [openDayEnd, setOpenDayEnd] = useState(false);
  const [disabledSync, setDisabledSync] = useState(false);
  const [syncRefreshTime, setSyncRefreshTime] = useState<any>("");
  const [openCancelOnline, setOpenCancelOnline] = useState(false);
  const [onlineOrderData, setOnlineOrderData] = useState<any>(null);

  const getDeviceCode = () => {
    let formattedString = "";

    const deviceCode = deviceContext.user?.phone?.split("");

    deviceCode?.map((code: string, index: number) => {
      if (index == 3) {
        formattedString = formattedString + code?.replace(code, `${code} - `);
      } else {
        formattedString = formattedString + code?.replace(code, `${code} `);
      }
    });

    return formattedString;
  };

  const handleClearItems = () => {
    Alert.alert(
      t("Confirmation"),
      `${t("There is an open order in the cart")}. ${t(
        "Do you still want to day end?"
      )}`,
      [
        {
          text: t("No"),
          onPress: () => {},
          style: "destructive",
        },
        {
          text: t("Yes"),
          onPress: async () => {
            debugLog(
              "Clear cart items",
              {},
              "more-tab-screen",
              "clearCartItemsAlert"
            );
            cart.clearCart();
            calculateCart();
            setCustomer({});
            setCustomerRef("");
            checkUpdateCashDrawer();
          },
        },
      ]
    );
  };

  const checkUpdateCashDrawer = async () => {
    setLoading(true);

    let page = 0;
    let length = 0;
    let totalCount = 0;
    let openOrders: any[] = [];
    let otherOrders: any[] = [];

    do {
      try {
        const onlineOrders = await serviceCaller(endpoint.onlineOrdering.path, {
          method: endpoint.onlineOrdering.method,
          query: {
            _q: "",
            page: 0,
            limit: 100,
            sort: "asc",
            activeTab: "all",
            companyRef: deviceContext.user.companyRef,
            locationRef: deviceContext.user.locationRef,
          },
        });

        if (onlineOrders?.results?.length > 0) {
          page = page + 1;
          totalCount = onlineOrders?.total || 0;
          length += onlineOrders?.results?.length;

          const open = onlineOrders?.results?.filter(
            (order: any) => order.orderStatus === "open"
          );

          const other = onlineOrders?.results?.filter(
            (order: any) =>
              order.orderStatus !== "open" &&
              order.deviceRef === deviceContext.user.deviceRef
          );

          openOrders.push(...openOrders, ...open);
          otherOrders.push(...otherOrders, ...other);
        } else {
          break;
        }
      } catch (error) {
        console.log("error", error);
      }
    } while (length < totalCount);

    const openDrawer = MMKVDB.get(DBKeys.CASH_DRAWER) || "";

    let salesAmount = 0;

    const cashDrawerTxn: any = await repo.cashDrawerTxn.findOne({
      where: { companyRef: deviceContext.user.companyRef },
      order: { _id: "DESC" },
    });

    if (cashDrawerTxn) {
      const startDate = new Date(cashDrawerTxn.started);
      const endDate = new Date();

      const orders: any[] = await repo.order.find({
        where: [
          {
            deviceRef: deviceContext.user.deviceRef,
            createdAt: Between(startDate, endDate),
          },
          {
            deviceRef: deviceContext.user.deviceRef,
            acceptedAt: Between(startDate, endDate),
          },
        ],
      });

      salesAmount +=
        orders?.reduce((amount: number, order: any) => {
          return amount + calculatePaymentTotal(order.payment.breakup);
        }, 0) || 0;
    }

    if (openDrawer === "close") {
      setLoading(false);
      setOnlineOrderData({
        sales: salesAmount,
        openOrders: openOrders,
        otherOrders: otherOrders,
      });
      setOpenDayEnd(true);
    } else {
      if (openOrders?.length > 0 || otherOrders?.length > 0) {
        setLoading(false);
        setOnlineOrderData({
          sales: salesAmount,
          openOrders: openOrders,
          otherOrders: otherOrders,
        });
        setOpenCancelOnline(true);
      } else {
        const salesRefundedAmount = Number(
          MMKVDB.get(DBKeys.SALES_REFUNDED_AMOUNT) || "0"
        );

        try {
          const cashDrawerData = {
            _id: objectId(),
            userRef: authContext.user._id,
            user: { name: authContext.user.name },
            location: { name: businessData.location.name.en },
            locationRef: businessData.location._id,
            company: { name: businessData.company.name.en },
            companyRef: businessData.company._id,
            openingActual: undefined,
            openingExpected: undefined,
            closingActual: undefined,
            closingExpected: undefined,
            difference: undefined,
            totalSales: salesAmount - salesRefundedAmount,
            transactionType: "close",
            description: "Cash Drawer Close",
            shiftIn: false,
            dayEnd: true,
            started: cashDrawerTxn?.started || new Date(),
            ended: new Date(),
            source: "local",
          };

          await repo.cashDrawerTxn.insert(cashDrawerData as any);

          debugLog(
            "Cash drawer txn created",
            cashDrawerData,
            "more-tab-screen",
            "updateCashDrawerFunction"
          );

          // const dataObj = {
          //   name: { en: "Shift end sales", ar: "Shift end sales" },
          //   date: new Date()?.toISOString(),
          //   reason: "sales",
          //   companyRef: authContext.user.companyRef,
          //   company: { name: authContext.user.company.name },
          //   locationRef: authContext.user.locationRef,
          //   location: { name: authContext.user.location.name },
          //   transactionType: "credit",
          //   userRef: authContext.user._id,
          //   user: {
          //     name: authContext.user.name,
          //     type: authContext.user.userType,
          //   },
          //   deviceRef: deviceContext.user.deviceRef,
          //   device: { deviceCode: deviceContext.user.phone },
          //   referenceNumber: "",
          //   fileUrl: [],
          //   transactions: [
          //     {
          //       paymentMethod: "all",
          //       amount: salesAmount - salesRefundedAmount,
          //     },
          //   ],
          //   description: "",
          //   paymentDate: new Date()?.toISOString(),
          //   status: "received",
          // };

          // try {
          //   const res = await serviceCaller(endpoint.miscExpensesCreate.path, {
          //     method: endpoint.miscExpensesCreate.method,
          //     body: { ...dataObj },
          //   });

          //   if (res !== null || res?.code === "success") {
          //     debugLog(
          //       "Shift end sales updated to server",
          //       res,
          //       "more-tab-screen",
          //       "updateCashDrawerFunction"
          //     );
          //   }
          // } catch (err: any) {
          //   errorLog(
          //     err?.code,
          //     dataObj,
          //     "more-tab-screen",
          //     "updateCashDrawerFunction",
          //     err
          //   );
          // }

          const printTemplate = await repo.printTemplate.findOne({
            where: { locationRef: deviceContext.user.locationRef },
          });

          if (printTemplate?.resetCounterDaily) {
            MMKVDB.set(DBKeys.ORDER_TOKEN, `1`);
          }

          MMKVDB.set(DBKeys.SALES_REFUNDED_AMOUNT, "0");

          handleLogout();
        } catch (error: any) {
          debugLog(
            "Cash drawer txn creation failed",
            error,
            "more-tab-screen",
            "updateCashDrawerFunction"
          );

          showToast("error", t(""));
        } finally {
          setLoading(false);
        }
      }
    }
  };

  function calculatePaymentTotal(breakup: any): number {
    return breakup.reduce((total: number, payment: any) => {
      const change = Math.max(payment.change || 0, 0);
      return total + Number(payment.total || 0) - change || 0;
    }, 0);
  }

  const handleLogout = async () => {
    debugLog(
      "User logout",
      authContext.user,
      "more-tab-screen",
      "handleLogoutFunction"
    );

    MMKVDB.remove(DBKeys.USER);
    MMKVDB.remove(DBKeys.USERTYPE);
    MMKVDB.remove(DBKeys.USER_PERMISSIONS);

    authContext.logout();

    showToast("success", t("Logout successfully!"));
  };

  const handleSyncRefresh = async () => {
    if (!isConnected) {
      showToast("info", t("Please connect with internet"));
      return;
    }

    debugLog(
      "Sync refresh button tap",
      {},
      "more-tab",
      "handleSyncRefreshFunction"
    );

    const time = `${new Date().getTime() + 5 * 60 * 1000}`;

    setSyncRefreshTime(time);
    MMKVDB.set(DBKeys.SYNC_REFRESH_TIME, time);

    showToast("info", t("Sync Requested"));

    await pullOperations.fetchAllEntities();
  };

  useEffect(() => {
    if (isFocused) {
      const syncTime = MMKVDB.get(DBKeys.SYNC_REFRESH_TIME);

      setSyncRefreshTime(Number(syncTime));
    }
  }, [isFocused]);

  useEffect(() => {
    if (Number(syncRefreshTime) > 0) {
      const remainingTime = syncRefreshTime - new Date().getTime();

      if (remainingTime > 0) {
        setDisabledSync(true);
      } else {
        setDisabledSync(false);
        setSyncRefreshTime("");
        MMKVDB.set(DBKeys.SYNC_REFRESH_TIME, "");
      }
    }
  }, [syncRefreshTime, isFocused]);

  return (
    <>
      <CustomHeader />

      <View
        style={{
          ...styles.container,
          backgroundColor: theme.colors.bgColor,
        }}
      >
        <ScrollView
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            width: "100%",
            paddingHorizontal: twoPaneView ? "20%" : "7.5%",
            alignItems: "flex-start",
          }}
        >
          <View
            style={{
              width: "100%",
              marginTop: hp("7.5%"),
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            <View>
              <View
                style={{
                  ...styles.company_view,
                }}
              >
                <View
                  style={{
                    ...styles.image_view,
                    width: hp("13%"),
                    height: hp("13%"),
                  }}
                >
                  <Image
                    key={"company-logo"}
                    resizeMode="cover"
                    style={{ width: hp("11%"), height: hp("11%") }}
                    borderRadius={15}
                    source={
                      businessData?.company?.logo
                        ? {
                            uri: businessData.company.logo,
                          }
                        : COMPANY_PLACEHOLDER
                    }
                  />
                </View>

                <View style={{ marginLeft: wp("1.5%") }}>
                  <DefaultText
                    style={{ width: "90%" }}
                    fontSize="2xl"
                    fontWeight="medium"
                  >
                    {isRTL
                      ? businessData?.company?.name?.ar
                      : businessData?.company?.name?.en}
                  </DefaultText>

                  <DefaultText style={{ width: "90%", marginTop: 5 }}>
                    {isRTL
                      ? businessData?.location?.name?.ar
                      : businessData?.location?.name?.en}
                  </DefaultText>

                  <DefaultText
                    style={{ marginTop: 4 }}
                    fontSize="lg"
                    color="otherGrey.100"
                  >
                    {getDeviceCode()}
                  </DefaultText>
                </View>
              </View>
            </View>

            {twoPaneView && (
              <TouchableOpacity
                style={{
                  alignItems: "center",
                  marginBottom: hp("0.5%"),
                  marginRight: hp("4.5%"),
                  opacity: disabledSync ? 0.5 : 1,
                }}
                onPress={() => handleSyncRefresh()}
                disabled={disabledSync}
              >
                <ICONS.SyncRefreshcon />

                <DefaultText style={{ marginTop: 4 }} color="primary.1000">
                  {t("Sync")}
                </DefaultText>
              </TouchableOpacity>
            )}
          </View>

          <Spacer space={hp("3%")} />

          <MoreDataRow />

          <Spacer space={hp("3%")} />

          <PrimaryButton
            style={{
              paddingHorizontal: 0,
              paddingVertical: hp("1%"),
              backgroundColor: "transparent",
            }}
            textStyle={{
              fontSize: 20,
              fontWeight: theme.fontWeights.medium,
              color: theme.colors.primary[1000],
              fontFamily: theme.fonts.circulatStd,
            }}
            title={t("Day end")}
            loading={loading}
            onPress={() => {
              if (!isConnected) {
                showToast("info", t("Please connect with internet"));
                return;
              }

              if (cart.getCartItems().length > 0) {
                handleClearItems();
              } else {
                checkUpdateCashDrawer();
              }
            }}
          />

          {!twoPaneView && (
            <TouchableOpacity
              style={{
                alignItems: "center",
                marginTop: hp("2.5%"),
                marginBottom: hp("0.5%"),
                marginRight: hp("4.5%"),
                opacity: disabledSync ? 0.5 : 1,
              }}
              onPress={() => handleSyncRefresh()}
              disabled={disabledSync}
            >
              <ICONS.SyncRefreshcon />

              <DefaultText style={{ marginTop: 4 }} color="primary.1000">
                {t("Sync")}
              </DefaultText>
            </TouchableOpacity>
          )}

          <View style={{ paddingTop: 15 }}>
            {Constants.default.expoConfig && (
              <DefaultText>{`Version ${Constants.default.expoConfig.version}`}</DefaultText>
            )}
          </View>

          <Spacer space={hp("15%")} />
        </ScrollView>

        {openDayEnd && (
          <EndShift
            data={{ isEndShift: false, ...onlineOrderData }}
            visible={openDayEnd}
            handleClose={() => setOpenDayEnd(false)}
          />
        )}

        {openCancelOnline && (
          <CancelOnlineOrder
            data={onlineOrderData}
            visible={openCancelOnline}
            handleClose={() => setOpenCancelOnline(false)}
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  company_view: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  image_view: {
    padding: 5,
    borderWidth: 1,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#8A959E4D",
  },
});

export default MoreHome;
