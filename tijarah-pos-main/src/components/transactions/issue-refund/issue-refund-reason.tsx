import * as ExpoPrintHelp from "expo-print-help";
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Checkbox from "react-native-bouncy-checkbox";
import { EventRegister } from "react-native-event-listeners";
import Toast from "react-native-toast-message";
import { t } from "../../../../i18n";
import serviceCaller from "../../../api";
import AuthContext from "../../../context/auth-context";
import DeviceContext from "../../../context/device-context";
import { useTheme } from "../../../context/theme-context";
import { OrderModel } from "../../../database/order/order";
import { checkDirection } from "../../../hooks/check-direction";
import { checkInternet } from "../../../hooks/check-internet";
import { useBusinessDetails } from "../../../hooks/use-business-details";
import { checkKeyboardState } from "../../../hooks/use-keyboard-state";
import usePrinterStatus from "../../../hooks/use-printer-status";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { queryClient } from "../../../query-client";
import EntityNames from "../../../types/entity-name";
import MMKVDB from "../../../utils/DB-MMKV";
import { DBKeys } from "../../../utils/DBKeys";
import { PROVIDER_NAME } from "../../../utils/constants";
import { repo } from "../../../utils/createDatabaseConnection";
import { ERRORS } from "../../../utils/errors";
import { getItemVAT } from "../../../utils/get-price";
import ICONS from "../../../utils/icons";
import { debugLog, errorLog } from "../../../utils/log-patch";
import ActionSheetHeader from "../../action-sheet/action-sheet-header";
import Input from "../../input/input";
import SelectInput from "../../input/select-input";
import Spacer from "../../spacer";
import DefaultText from "../../text/Text";
import showToast from "../../toast";
import ToolTip from "../../tool-tip";

const refundThroughOptions = [
  { value: "Cash", key: "cash" },
  { value: "Original", key: "original" },
];

const refundThroughWalletWithCustomer = [
  { value: "Cash", key: "cash" },
  { value: "Wallet", key: "wallet" },
  { value: "Original", key: "original" },
];

const refundThroughCreditWithCustomer = [
  { value: "Cash", key: "cash" },
  { value: "Credit", key: "credit" },
  { value: "Original", key: "original" },
];

const refundThroughOptionsWithCustomer = [
  { value: "Cash", key: "cash" },
  { value: "Wallet", key: "wallet" },
  { value: "Credit", key: "credit" },
  { value: "Original", key: "original" },
];

const reasonOptions = [
  { value: "Goods returned", key: "goodsReturned" },
  { value: "Accidental charge", key: "accidentalCharge" },
  { value: "Cancelled order", key: "cancelledOrder" },
  { value: "Other", key: "other" },
];

export default function IssueRefundReasonModal({
  data,
  visible = false,
  handleClose,
  handleIssueRefund,
}: {
  data: any;
  visible: boolean;
  handleClose?: any;
  handleIssueRefund?: any;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const isConnected = checkInternet();
  const isKeyboardVisible = checkKeyboardState();
  const { hp, twoPaneView } = useResponsive();
  const authContext = useContext(AuthContext) as any;
  const deviceContext = useContext(DeviceContext) as any;
  const { businessDetails } = useBusinessDetails();
  const { isConnected: isPrinterConnected } = usePrinterStatus();

  const [refunds, setRefunds] = useState([
    { index: -1, amount: 0, maxAmount: 0 },
  ]);
  const [charges, setCharges] = useState<any[]>([]);
  const [refundThrough, setRefundThrough] = useState({ value: "", key: "" });
  const [reason, setReason] = useState({ value: "", key: "" });
  const [otherReason, setOtherReason] = useState("");
  const [loading, setLoading] = useState(false);

  const updateChargeCheckbox = (chargeData: any, val: boolean) => {
    let maxAmount = 0;

    const chargesData = charges.map((charge: any) => {
      if (charge.chargeId == chargeData.chargeId) {
        maxAmount = Number(charge.total?.toFixed(2));

        return {
          ...charge,
          selected: val,
          amount: val ? charge.total?.toFixed(2) : -1,
        };
      } else {
        return charge;
      }
    });

    if (refunds?.length > 1) {
      const refundData: any = refunds.map((refund: any, index: number) => {
        if (index === 0) {
          return {
            index: 0,
            amount: -1,
            maxAmount: Number(refund.maxAmount) + maxAmount,
          };
        } else {
          return refund;
        }
      });

      setRefunds(refundData);
    }

    setCharges(chargesData);
  };

  const updateChargeAmount = (chargeData: any, enterAmount: any) => {
    let amount = 0;
    const maxAmount = Number(chargeData.total);

    if (enterAmount && maxAmount >= Number(enterAmount)) {
      amount = enterAmount;
    } else if (maxAmount < Number(enterAmount)) {
      amount = maxAmount;
    } else {
      amount = -1;
    }

    const chargesData = charges.map((charge: any) => {
      if (charge.chargeId == chargeData.chargeId) {
        return {
          ...charge,
          amount,
        };
      } else {
        return charge;
      }
    });

    if (refunds?.length > 1) {
      const refundData: any = refunds.map((refund: any, index: number) => {
        if (index === 0) {
          return {
            index: 0,
            amount: -1,
            maxAmount: refund.maxAmount + maxAmount,
          };
        } else {
          return refund;
        }
      });

      setRefunds(refundData);
    }

    setCharges(chargesData);
  };

  const updateRefundAmount = (enterAmount: any, idx: number) => {
    let amount = 0;
    const maxAmount = refunds[idx].maxAmount;

    if (data.amount > Number(enterAmount) && maxAmount > Number(enterAmount)) {
      amount = Number(enterAmount);
    } else if (data.amount > maxAmount) {
      amount = maxAmount;
    } else {
      amount = data.amount;
    }

    const refundData: any = refunds.map((refund: any) => {
      if (refund.index == idx) {
        return { index: idx, amount, maxAmount };
      } else {
        return refund;
      }
    });

    setRefunds(refundData);
  };

  const totalRefundedAmount = useMemo(() => {
    if (charges?.length > 0) {
      const amount = charges?.reduce((total: number, charge: any) => {
        if (charge?.amount > 0) {
          return total + Number(charge.amount || 0);
        }
        return total;
      }, 0);

      return (Number(data.amount) + amount)?.toFixed(2);
    }

    return Number(data.amount)?.toFixed(2);
  }, [charges]);

  const remainingBalance = useMemo(() => {
    if (refunds?.length > 0) {
      if (refundThrough.key === "original") {
        let amount = 0;

        refunds.forEach((refund: any) => {
          if (refund?.amount > 0) {
            amount += Number(refund.amount);
          }
        });

        return Number(totalRefundedAmount) - amount;
      } else {
        return 0;
      }
    }

    return 0;
  }, [refunds]);

  const onIssueRefund = async () => {
    const length = data.order.payment.breakup.length;

    if (refundThrough.key === "") {
      showToast("error", t("Please Select Refund Through"));
      return;
    }

    if (length > 1 && remainingBalance !== 0) {
      showToast(
        "error",
        `${t("Refund amount should be equal to")} ${t(
          "SAR"
        )} ${totalRefundedAmount}`
      );
      return;
    }

    if (reason.key == "") {
      showToast("error", t("Please Select Refund Reason"));
      return;
    }

    if (reason.key == "other" && otherReason == "") {
      showToast("error", t("Other Reason is required"));
      return;
    }

    debugLog(
      "Issue refund initiated",
      {},
      "orders-refund-screen",
      "handleOnIssueRefund"
    );

    setLoading(true);

    let chargesVAT = 0;
    let chargesTotal = 0;
    let refundedAmount = Number(MMKVDB.get(DBKeys.TOTAL_REFUNDED_AMOUNT)) || 0;
    let salesRefundedAmount =
      Number(MMKVDB.get(DBKeys.SALES_REFUNDED_AMOUNT)) || 0;

    const selectedItems = data.selectedItems.filter(
      (item: any) => item.selected
    );

    const chargesList: any[] = [];

    charges?.forEach((data: any) => {
      if (data.selected && Number(data.amount) > 0) {
        const vat =
          Number(data.total) === Number(data.amount)
            ? Number(data.vat)
            : getItemVAT(
                Number(data.amount),
                Number(deviceContext.user.company.vat.percentage)
              );

        chargesVAT += vat;
        chargesTotal += Number(data.amount);
        refundedAmount += Number(data.amount);
        salesRefundedAmount += Number(data.amount);

        chargesList.push({
          chargeId: data.chargeId,
          name: { en: data.name.en, ar: data.name.ar },
          totalCharge: Number(data.amount),
          totalVatOnCharge: vat,
        });
      }
    });

    const chargesListBackend = chargesList?.map((data: any) => {
      return {
        chargeId: data.chargeId,
        name: { en: data.name.en, ar: data.name.ar },
        totalCharge: data.totalCharge,
        totalVatOnCharge: data.totalVatOnCharge,
      };
    });

    const itemList = selectedItems.map((items: any) => {
      return {
        _id: items.productRef,
        categoryRef: items.categoryRef,
        nameEn: items.nameEn,
        nameAr: items.nameAr,
        category: { name: items?.category?.name || "" },
        amount: Number(items.amount),
        vat: Number(items.vat),
        discountAmount: Number(items.discountAmount),
        discountPercentage: Number(items.discountPercentage),
        qty: items.qty,
        unit: items.unit,
        sku: items.sku,
        parentSku: items.parentSku,
        boxSku: items.boxSku,
        crateSku: items.crateSku,
        boxRef: items.boxRef,
        crateRef: items.crateRef,
        hasMultipleVariants: items.hasMultipleVariants,
        modifiers: items?.modifiers || [],
      };
    });

    const itemListBackend = selectedItems.map((items: any) => {
      const data: any = {
        name: { en: items.nameEn, ar: items.nameAr },
        category: { name: items?.category?.name || "" },
        amount: Number(items.amount),
        vat: Number(items.vat),
        discountAmount: Number(items.discountAmount),
        discountPercentage: Number(items.discountPercentage),
        qty: items.qty,
        unit: items.unit,
        isOpenItem: items.isOpenItem,
        sku: items.sku,
        parentSku: items.parentSku,
        boxSku: items.boxSku,
        crateSku: items.crateSku,
        boxRef: items.boxRef,
        crateRef: items.crateRef,
        hasMultipleVariants: items.hasMultipleVariants,
        modifiers: items?.modifiers || [],
      };

      if (items.sku !== "Open Item") {
        data["_id"] = items.productRef;
        data["categoryRef"] = items.categoryRef;
      }

      return data;
    });

    let refundedData: any[] = [];

    if (refundThrough.key === "original") {
      data.order.payment.breakup.map((breakup: any, index: number) => {
        if (refunds[index].amount > 0) {
          if (breakup.providerName === PROVIDER_NAME.CASH) {
            refundedAmount += refunds[index].amount;
          }

          salesRefundedAmount += refunds[index].amount;

          refundedData.push({
            refundTo: breakup.providerName,
            amount: refunds[index].amount,
          });
        }
      });
    } else {
      if (refundThrough.key === PROVIDER_NAME.CASH) {
        refundedAmount += Number(data.amount);
      }

      salesRefundedAmount += Number(data.amount);

      refundedData.push({
        refundTo: refundThrough.key,
        amount: Number(data.amount) + chargesTotal,
      });
    }

    const refundToList = refundedData.filter((list: any) => {
      return list !== undefined;
    });

    const refundToListBackend: any = refundToList.map((refundToList: any) => {
      return {
        refundedTo: refundToList.refundTo,
        amount: refundToList.amount,
      };
    });

    const updateItemList = data.order.items.map((item: any) => {
      const itemName = `${item.name.en} ${
        item.variantNameEn ? "- " + item.variantNameEn : ""
      }`;

      let count = data.selectedItems.reduce((acc: any, currentItem: any) => {
        if (currentItem.selected && currentItem.name === itemName) {
          if (item.unit === "perItem") {
            return acc + 1;
          } else if (currentItem.qty === item.qty) {
            return item.qty;
          }
        }
        return acc;
      }, 0);

      return {
        ...item,
        refundedQty:
          count > 0 && count === item.qty && item.unit !== "perItem"
            ? item.qty
            : count + item.refundedQty,
      };
    });

    const refundObj: any = {
      reason: reason.key == "other" ? otherReason : reason.value,
      amount: Number(data.amount) + Number(chargesTotal),
      vat: Number(data.vat) + Number(chargesVAT),
      discountAmount: Number(data.discountAmount),
      vatWithoutDiscount: Number(data.vatWithoutDiscount),
      discountPercentage: Number(data.order.payment.discountPercentage),
      hasMultipleVariants: false,
      charges: chargesList || [],
      items: itemList,
      refundedTo: refundToList,
      cashier: { name: authContext.user.name },
      cashierRef: authContext.user._id,
      date: new Date(),
      device: { deviceCode: deviceContext.user.phone },
      deviceRef: deviceContext.user.deviceRef,
    };

    const kickDrawer = refundToList?.some(
      (refund: any) => refund.refundTo === PROVIDER_NAME.CASH
    );

    debugLog(
      "Issue refund processing",
      refundObj,
      "orders-refund-screen",
      "handleOnIssueRefund"
    );

    try {
      const res = await serviceCaller(`/order/${data.order._id}/refund`, {
        method: "POST",
        body: {
          reason: reason.key == "other" ? otherReason : reason.value,
          amount: Number(data.amount) + Number(chargesTotal),
          vat: Number(data.vat) + Number(chargesVAT),
          discountAmount: Number(data.discountAmount),
          vatWithoutDiscount: Number(data.vatWithoutDiscount),
          discountPercentage: Number(data.order.payment.discountPercentage),
          charges: chargesListBackend || [],
          items: itemListBackend,
          refundedTo: refundToListBackend,
          cashier: { name: authContext.user.name },
          cashierRef: authContext.user._id,
          date: new Date(),
          device: { deviceCode: deviceContext.user.phone },
          deviceRef: deviceContext.user.deviceRef,
        },
      });

      if (res) {
        debugLog(
          "Issue refund completed",
          res,
          "orders-refund-screen",
          "handleOnIssueRefund"
        );

        const resData = await serviceCaller(`/order/${data.order._id}`, {
          method: "GET",
        });

        showToast("success", t("Refund issued for the order"));

        MMKVDB.set(DBKeys.TOTAL_REFUNDED_AMOUNT, `${refundedAmount}`);
        MMKVDB.set(DBKeys.SALES_REFUNDED_AMOUNT, `${salesRefundedAmount}`);

        const orderData: OrderModel = {
          _id: data.order._id,
          company: { name: data.order.company.name },
          companyRef: data.order.companyRef,
          location: { name: data.order.location.name },
          locationRef: data.order.locationRef,
          customerRef: data.order.customerRef,
          customer: {
            name: data.order.customer?.name || "",
            vat: data.order.customer?.vat || "",
            phone: data.order.customer?.phone || "",
          },
          cashier: { name: data.order.cashier.name },
          cashierRef: data.order.cashierRef,
          device: { deviceCode: data.order.device.deviceCode },
          deviceRef: data.order.deviceRef,
          orderNum: data.order.orderNum,
          tokenNum: data.order.tokenNum,
          orderType: data.order.orderType,
          orderStatus: data.order.orderStatus,
          qrOrdering: data.order.qrOrdering,
          onlineOrdering: data.order?.onlineOrdering,
          dineInData: data.order.dineInData,
          specialInstructions: data.order.specialInstructions,
          items: updateItemList,
          payment: data.order.payment,
          refunds: [
            {
              ...refundObj,
              referenceNumber: resData?.refunds?.[0]?.referenceNumber || "",
            },
          ],
          createdAt: data.order.createdAt,
          acceptedAt: data.order.acceptedAt,
          receivedAt: data.order.receivedAt,
          appliedDiscount: data.order.appliedDiscount,
          paymentMethod: data.order.paymentMethod,
          refundAvailable: true,
          source: "server",
        };

        await repo.order.update({ _id: data.order._id }, orderData);
        await queryClient.invalidateQueries("find-order");

        EventRegister.emit("sync:enqueue", {
          entityName: EntityNames.OrdersPull,
        });

        debugLog(
          "Order updated after refund",
          orderData,
          "orders-refund-screen",
          "handleOnIssueRefund"
        );

        if (isPrinterConnected && kickDrawer) {
          ExpoPrintHelp.openCashDrawer();
        } else {
          ExpoPrintHelp.cut();
        }

        if (data.order?.customerRef) {
          const customer = await repo.customer.findOne({
            where: { _id: data.order.customerRef },
          });

          if (customer) {
            await serviceCaller(`/customer/${customer._id}`, {
              method: "PATCH",
              body: {
                totalRefunded:
                  (customer?.totalRefunded || 0) +
                  Number(totalRefundedAmount || 0),
              },
            });

            EventRegister.emit("sync:enqueue", {
              entityName: EntityNames.CustomerPull,
            });

            debugLog(
              "Customer refunded amount updated after refund",
              {
                ...customer,
                totalRefunded:
                  (customer?.totalRefunded || 0) + Number(data.amount),
              },
              "orders-refund-screen",
              "handleOnIssueRefund"
            );
          }
        }

        handleIssueRefund(orderData);

        if (data.restockItems?.length > 0) {
          EventRegister.emit(
            "restock-product",
            JSON.stringify(data.restockItems)
          );
        }
      }
    } catch (error: any) {
      errorLog(
        error?.message,
        refundObj,
        "orders-refund-screen",
        "handleOnIssueRefund",
        error
      );
      showToast(
        "error",
        error?._err?.message?.[0]?.error || ERRORS.SOMETHING_WENT_WRONG
      );
    } finally {
      setLoading(false);
    }
  };

  const getRefundOptions = () => {
    if (
      data.order.customerRef &&
      businessDetails?.company?.wallet &&
      businessDetails?.company?.enableCredit
    ) {
      return refundThroughOptionsWithCustomer;
    } else if (data.order.customerRef && businessDetails?.company?.wallet) {
      return refundThroughWalletWithCustomer;
    } else if (
      data.order.customerRef &&
      businessDetails?.company?.enableCredit
    ) {
      return refundThroughCreditWithCustomer;
    } else {
      return refundThroughOptions;
    }
  };

  useEffect(() => {
    if (visible) {
      setLoading(false);
      setRefundThrough({ value: "", key: "" });
      setReason({ value: "", key: "" });
      setOtherReason("");

      let total = 0;
      const length = data.order.payment.breakup.length;

      const refunData = data.order.payment.breakup.map(
        (breakup: any, index: number) => {
          if (index == length - 1) {
            const maxAmount =
              data.amount > total
                ? Number(data.amount) - total
                : Number(data.order.payment.total) - total;

            return {
              index: index,
              amount: length == 1 ? maxAmount : -1,
              maxAmount: Number(breakup.total),
            };
          } else {
            total += breakup.total;
            return {
              index: index,
              amount: -1,
              maxAmount: Number(breakup.total),
            };
          }
        }
      );

      const chargeData = data.order.payment.charges?.map((charge: any) => {
        return {
          ...charge,
          selected: false,
          amount: -1,
        };
      });

      setRefunds(refunData);
      setCharges(chargeData || []);
    }
  }, [visible]);

  useEffect(() => {
    if (reason.key) {
      setOtherReason("");
    }
  }, [reason]);

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
          backgroundColor: "transparent",
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
            title={`${t("Refunding")} SAR ${totalRefundedAmount}`}
            description={
              !isKeyboardVisible &&
              remainingBalance !== Number(totalRefundedAmount) &&
              remainingBalance > 0
                ? `${t("Remaining Balance")}: ${t(
                    "SAR"
                  )} ${remainingBalance?.toFixed(2)}`
                : ""
            }
            isClose={false}
            rightBtnText={t("Issue Refund")}
            handleLeftBtn={() => handleClose()}
            loading={loading}
            handleRightBtn={() => {
              if (isConnected) {
                onIssueRefund();
              } else {
                showToast("error", t("Please connect with internet"));
              }
            }}
            permission={true}
          />

          <KeyboardAvoidingView
            enabled={true}
            behavior={"height"}
            keyboardVerticalOffset={Platform.OS == "ios" ? 50 : 20}
          >
            <ScrollView
              alwaysBounceVertical={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                marginTop: hp("1%"),
                paddingVertical: hp("3%"),
                paddingHorizontal: hp("2.5%"),
              }}
            >
              <DefaultText
                fontSize="lg"
                fontWeight="medium"
                color="otherGrey.100"
              >
                {`#${data.order.orderNum}`}
              </DefaultText>

              {charges?.length > 0 && (
                <View>
                  <Spacer space={hp("2%")} />

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <DefaultText fontWeight="medium" color="black.1000">
                      {t("Custom Charges")}
                    </DefaultText>

                    <View style={{ marginTop: 5, marginLeft: 8 }}>
                      <ToolTip infoMsg={t("info_msg_refund_charges")} />
                    </View>
                  </View>

                  <Spacer space={hp("2%")} />

                  <View>
                    {charges.map((charge: any) => {
                      return (
                        <React.Fragment key={charge.chargeId}>
                          <View key={charge.chargeId}>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingVertical: hp("2%"),
                                paddingHorizontal: hp("1.5%"),
                                borderTopLeftRadius: 16,
                                borderTopRightRadius: 16,
                                backgroundColor: theme.colors.white[1000],
                              }}
                            >
                              <DefaultText>
                                {isRTL ? charge.name.ar : charge.name.en}
                              </DefaultText>

                              <View
                                style={{
                                  marginRight: -10,
                                  flexDirection: "row",
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                }}
                              >
                                <DefaultText
                                  style={{ marginRight: hp("1.25%") }}
                                >
                                  {t("Refund")}
                                </DefaultText>

                                <Checkbox
                                  isChecked={charge.selected}
                                  fillColor={theme.colors.white[1000]}
                                  unfillColor={theme.colors.white[1000]}
                                  iconComponent={
                                    charge.selected ? (
                                      <ICONS.TickFilledIcon
                                        color={theme.colors.primary[1000]}
                                      />
                                    ) : (
                                      <ICONS.TickEmptyIcon
                                        color={theme.colors.primary[1000]}
                                      />
                                    )
                                  }
                                  onPress={() => {
                                    updateChargeCheckbox(
                                      charge,
                                      !charge.selected
                                    );
                                  }}
                                />
                              </View>
                            </View>

                            <View
                              style={{
                                borderWidth: 0.5,
                                marginLeft: hp("1.5%"),
                                borderColor:
                                  theme.colors.dividerColor.secondary,
                              }}
                            />

                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingVertical: hp("0.25%"),
                                paddingHorizontal: hp("1.5%"),
                                borderBottomLeftRadius: 16,
                                borderBottomRightRadius: 16,
                                backgroundColor: theme.colors.white[1000],
                              }}
                            >
                              <DefaultText>{t("Amount")}</DefaultText>

                              <Input
                                containerStyle={{
                                  flex: 0.75,
                                  opacity: 1,
                                  borderWidth: 0,
                                  borderRadius: 0,
                                }}
                                style={{
                                  width: "100%",
                                  fontSize: 20,
                                  textAlign: "right",
                                }}
                                placeholderText={"0.00"}
                                keyboardType={"number-pad"}
                                values={`${
                                  charge.amount > 0 ? charge.amount : ""
                                }`}
                                handleChange={(val: any) => {
                                  if (
                                    val === "" ||
                                    /^[0-9]*(\.[0-9]{0,2})?$/.test(val)
                                  ) {
                                    updateChargeAmount(charge, val);
                                  }
                                }}
                                disabled={!charge.selected}
                              />
                            </View>
                          </View>

                          <DefaultText
                            style={{
                              marginTop: 5,
                              marginRight: 5,
                              marginBottom: hp("5%"),
                              textAlign: "right",
                            }}
                            fontSize="md"
                            fontWeight="normal"
                            color="otherGrey.200"
                          >
                            {`${t("Maximum of")} ${t("SAR")} ${Number(
                              charge.total
                            )?.toFixed(2)} ${t(
                              "can be issued from this charge"
                            )}`}
                          </DefaultText>
                        </React.Fragment>
                      );
                    })}
                  </View>
                </View>
              )}

              <Spacer space={hp("2%")} />

              <DefaultText fontWeight="medium" color="black.1000">
                {t("Select Refund Reason")}
              </DefaultText>

              <Spacer space={hp("2.5%")} />

              <SelectInput
                containerStyle={{
                  borderWidth: 0,
                  borderRadius: 16,
                }}
                isTwoText={true}
                isRightArrow={true}
                allowSearch={false}
                leftText={`${t("Refund Through")} *`}
                placeholderText={t("Select Refund Through")}
                options={getRefundOptions()}
                values={refundThrough}
                handleChange={(val: any) => {
                  if (val.key && val.value) {
                    debugLog(
                      "Refund through " + val.value,
                      val,
                      "orders-refund-screen",
                      "handleRefundThroughSelect"
                    );
                    setRefundThrough(val);
                  }
                }}
              />

              <Spacer space={hp("5%")} />

              {(refundThrough.key === "cash" ||
                refundThrough.key === "credit" ||
                refundThrough.key === "wallet") && (
                <View>
                  <View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingVertical: hp("2%"),
                        paddingHorizontal: hp("1.5%"),
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        backgroundColor: theme.colors.white[1000],
                      }}
                    >
                      <DefaultText>{t("Refund to")}</DefaultText>

                      <DefaultText
                        fontSize="2xl"
                        color={theme.colors.placeholder}
                      >
                        {refundThrough.key === "cash"
                          ? t("Cash")
                          : refundThrough.key === "wallet"
                          ? t("Wallet")
                          : t("Credit")}
                      </DefaultText>
                    </View>

                    <View
                      style={{
                        borderWidth: 0.5,
                        marginLeft: hp("1.5%"),
                        borderColor: theme.colors.dividerColor.secondary,
                      }}
                    />

                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingVertical: hp("0.5%"),
                        paddingHorizontal: hp("1.5%"),
                        borderBottomLeftRadius: 16,
                        borderBottomRightRadius: 16,
                        backgroundColor: theme.colors.white[1000],
                      }}
                    >
                      <DefaultText>{t("Amount")}</DefaultText>

                      <DefaultText
                        style={{ paddingVertical: 10 }}
                        fontSize="2xl"
                        color={theme.colors.placeholder}
                      >
                        {`${t("SAR")} ${totalRefundedAmount}`}
                      </DefaultText>
                    </View>
                  </View>

                  <DefaultText
                    style={{
                      marginTop: 5,
                      marginRight: 5,
                      marginBottom: hp("5%"),
                      textAlign: "right",
                    }}
                    fontSize="md"
                    fontWeight="normal"
                    color="otherGrey.200"
                  >
                    {`${t("Maximum of")} ${t("SAR")} ${totalRefundedAmount} ${t(
                      "can be issued by this payment method"
                    )}`}
                  </DefaultText>
                </View>
              )}

              {refundThrough.key === "original" && (
                <View>
                  {data.order.payment.breakup.map(
                    (breakup: any, index: number) => {
                      return (
                        <React.Fragment key={index}>
                          <View key={index}>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingVertical: hp("2%"),
                                paddingHorizontal: hp("1.5%"),
                                borderTopLeftRadius: 16,
                                borderTopRightRadius: 16,
                                backgroundColor: theme.colors.white[1000],
                              }}
                            >
                              <DefaultText>{t("Refund to")}</DefaultText>

                              <DefaultText
                                style={{ textTransform: "capitalize" }}
                                fontSize="2xl"
                                color={theme.colors.placeholder}
                              >
                                {breakup.providerName === PROVIDER_NAME.CASH
                                  ? t("Cash")
                                  : breakup.providerName === PROVIDER_NAME.CARD
                                  ? t("Card")
                                  : breakup.providerName ===
                                    PROVIDER_NAME.CREDIT
                                  ? t("Credit")
                                  : t("Wallet")}
                              </DefaultText>
                            </View>

                            <View
                              style={{
                                borderWidth: 0.5,
                                marginLeft: hp("1.5%"),
                                borderColor:
                                  theme.colors.dividerColor.secondary,
                              }}
                            />

                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingVertical: hp("0.5%"),
                                paddingHorizontal: hp("1.5%"),
                                borderBottomLeftRadius: 16,
                                borderBottomRightRadius: 16,
                                backgroundColor: theme.colors.white[1000],
                              }}
                            >
                              <DefaultText>{t("Amount")}</DefaultText>

                              {data.order.payment.breakup.length === 1 ? (
                                <DefaultText
                                  style={{ paddingVertical: 10 }}
                                  fontSize="2xl"
                                  color={theme.colors.placeholder}
                                >
                                  {`${t("SAR")} ${totalRefundedAmount}`}
                                </DefaultText>
                              ) : (
                                <Input
                                  containerStyle={{
                                    flex: 0.75,
                                    opacity: 1,
                                    borderWidth: 0,
                                    borderRadius: 0,
                                  }}
                                  style={{
                                    width: "100%",
                                    fontSize: 20,
                                    textAlign: "right",
                                  }}
                                  placeholderText={"0.00"}
                                  keyboardType={"number-pad"}
                                  values={`${
                                    refunds[index]?.amount > 0
                                      ? refunds[index].amount
                                      : ""
                                  }`}
                                  handleChange={(val: any) => {
                                    updateRefundAmount(
                                      val?.replace(/[^0-9]/, ""),
                                      index
                                    );
                                  }}
                                />
                              )}
                            </View>
                          </View>

                          <DefaultText
                            style={{
                              marginTop: 5,
                              marginRight: 5,
                              marginBottom: hp("5%"),
                              textAlign: "right",
                            }}
                            fontSize="md"
                            fontWeight="normal"
                            color="otherGrey.200"
                          >
                            {`${t("Maximum of")} ${t("SAR")} ${
                              data.order.payment.breakup.length === 1
                                ? totalRefundedAmount
                                : refunds[index]?.maxAmount?.toFixed(2)
                            } ${t("can be issued by this payment method")}`}
                          </DefaultText>
                        </React.Fragment>
                      );
                    }
                  )}
                </View>
              )}

              {refundThrough.key && (
                <SelectInput
                  containerStyle={{
                    borderWidth: 0,
                    borderRadius: 16,
                    borderBottomLeftRadius: reason.key == "other" ? 0 : 16,
                    borderBottomRightRadius: reason.key == "other" ? 0 : 16,
                  }}
                  isTwoText={true}
                  isRightArrow={true}
                  allowSearch={false}
                  leftText={t("Reason for refund")}
                  placeholderText={t("Select Reason")}
                  options={reasonOptions}
                  values={reason}
                  handleChange={(val: any) => {
                    if (val.key && val.value) {
                      debugLog(
                        "Reason: " + val.value,
                        val,
                        "orders-refund-screen",
                        "handleReasonSelect"
                      );
                      setReason(val);
                    }
                  }}
                />
              )}

              {reason.key == "other" && (
                <>
                  <View
                    style={{
                      marginLeft: 16,
                      borderBottomWidth: 0.5,
                      borderColor: theme.colors.dividerColor.main,
                    }}
                  />

                  <Input
                    containerStyle={{
                      borderWidth: 0,
                      borderRadius: 0,
                      borderBottomLeftRadius: 16,
                      borderBottomRightRadius: 16,
                    }}
                    style={{ width: "100%" }}
                    placeholderText={t("Enter the reason")}
                    values={otherReason}
                    handleChange={(val: any) => setOtherReason(val)}
                  />
                </>
              )}

              <Spacer space={hp("12%")} />
            </ScrollView>
          </KeyboardAvoidingView>
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
