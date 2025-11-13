import { FormikProps, useFormik } from "formik";
import React, { useContext, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Checkbox from "react-native-bouncy-checkbox";
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import endpoint from "../../api/endpoints";
import AuthContext from "../../context/auth-context";
import DeviceContext from "../../context/device-context";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import MMKVDB from "../../utils/DB-MMKV";
import { DBKeys } from "../../utils/DBKeys";
import { objectId } from "../../utils/bsonObjectIdTransformer";
import { getErrorMsg } from "../../utils/common-error-msg";
import { PROVIDER_NAME } from "../../utils/constants";
import ICONS from "../../utils/icons";
import ActionSheetHeader from "../action-sheet/action-sheet-header";
import ItemDivider from "../action-sheet/row-divider";
import { PrimaryButton } from "../buttons/primary-button";
import AmountInput from "../input/amount-input";
import Input from "../input/input";
import SelectInput from "../input/select-input";
import Spacer from "../spacer";
import DefaultText from "../text/Text";
import ErrorText from "../text/error-text";
import showToast from "../toast";
import repository from "../../db/repository";
import { CashDrawerTransaction } from "../../db/schema/cashdrawer-txn";
import { useCurrency } from "../../store/get-currency";

type EndShiftProps = {
  reason: { value: string; key: string };
  isOther: boolean;
  otherReason: string;
  openOrders: boolean;
  otherOrders: boolean;
};

const positiveReasonOptions = [
  { value: "Cash added by the owner", key: "cashAddedOwner" },
  { value: "Other", key: "other" },
];

const negativeReasonOptions = [
  { value: "Purchase Expenses", key: "purchaseExpense" },
  { value: "Cashier used cash as petty cash", key: "cashierCash" },
  { value: "Other", key: "other" },
];

export default function EndShift({
  data,
  visible = false,
  handleClose,
}: {
  data: any;
  visible: boolean;
  handleClose?: any;
}) {
  const theme = useTheme();
  const authContext = useContext(AuthContext) as any;
  const deviceContext = useContext(DeviceContext) as any;
  const { hp, wp, twoPaneView } = useResponsive();
  const { currency } = useCurrency();
  const [amount, setAmount] = useState<number>(-1);
  const [difference, setDifference] = useState(0);
  const [expectedCash, setExpectedCash] = useState(0);
  const [cashDrawerTxn, setCashDrawerTxn] = useState(null) as any;
  const [businessDetails, setBusinessDetails] = useState(null) as any;
  const [billingSettings, setBillingSettings] = useState(null) as any;
  const [orderData, setOrderData] = useState(null) as any;
  const [miscExpenses, setMiscExpenses] = useState<any[]>([]);

  const getValidationSchema = () => {
    return Yup.object().shape({
      reason:
        difference !== 0
          ? Yup.object({
              value: Yup.string().required(t("Please Select Reason")),
              key: Yup.string().required(t("Please Select Reason")),
            })
              .required(t("Please Select Reason"))
              .nullable()
          : Yup.object().nullable(),
      otherReason: Yup.string()
        .when("isOther", {
          is: true,
          then: Yup.string().required(t("Other reason is required")),
          otherwise: Yup.string().optional(),
        })
        .nullable(),
    });
  };

  const formik: FormikProps<EndShiftProps> = useFormik<EndShiftProps>({
    initialValues: {
      reason: { value: "", key: "" },
      isOther: false,
      otherReason: "",
      openOrders: false,
      otherOrders: false,
    },

    onSubmit: async (values) => {
      if (!data.isEndShift && (values.openOrders || values.otherOrders)) {
        const openOrderIds = data?.openOrders?.map((order: any) => {
          return order._id;
        });

        const otherOrderIds = data?.otherOrders?.map((order: any) => {
          return order._id;
        });

        const dataObj =
          values.openOrders && values.otherOrders
            ? [...openOrderIds, ...otherOrderIds]
            : values.openOrders
            ? openOrderIds
            : otherOrderIds;

        await serviceCaller(endpoint.onlineOrderingCancel.path, {
          method: endpoint.onlineOrderingCancel.method,
          body: { refs: dataObj },
        });
      }

      try {
        const salesRefundedAmount = Number(
          MMKVDB.get(DBKeys.SALES_REFUNDED_AMOUNT) || "0"
        );

        const cashDrawerData: CashDrawerTransaction = {
          _id: objectId(),
          userRef: authContext.user._id,
          user: { name: authContext.user.name },
          location: { name: businessDetails.location.name.en },
          locationRef: businessDetails.location._id,
          company: { name: businessDetails.company.name.en },
          companyRef: businessDetails.company._id,
          openingActual: cashDrawerTxn?.openingActual,
          openingExpected: cashDrawerTxn?.openingExpected,
          closingActual: Number(amount),
          closingExpected: expectedCash,
          difference: difference,
          totalSales: Number(data?.sales || 0) - salesRefundedAmount,
          transactionType: "close",
          description:
            values.reason.key == "other"
              ? values.otherReason
              : values.reason.value,
          shiftIn: false,
          dayEnd: !data.isEndShift,
          started: cashDrawerTxn?.started || new Date(),
          ended: new Date(),
          source: "local",
        };
        console.log("cash", cashDrawerData);

        await repository.cashDrawerTxnRepository.create(cashDrawerData as any);

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
        //     { paymentMethod: "all", amount: data.sales - salesRefundedAmount },
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

        //   }
        // } catch (err: any) {

        // }

        if (!data.isEndShift) {
          const printTemplate =
            await repository.printTemplateRepository.findByLocation(
              deviceContext?.user?.locationRef
            );

          if (printTemplate?.[0]?.resetCounterDaily) {
            MMKVDB.set(DBKeys.ORDER_TOKEN, `1`);
          }
        }

        MMKVDB.set(DBKeys.CASH_DRAWER, "open");
        MMKVDB.set(DBKeys.TOTAL_REFUNDED_AMOUNT, "0");
        MMKVDB.set(DBKeys.SALES_REFUNDED_AMOUNT, "0");
        MMKVDB.set(
          DBKeys.SYSTEM_AVAILABLE_CASH,
          data.isEndShift ? `${Number(amount)}` : ""
        );

        handleLogout();
        handleClose();

        showToast(
          "success",
          data.isEndShift
            ? t("Shift Ended and Logout Successfully")
            : t("Day Ended and Logout Successfully")
        );
      } catch (err) {
        showToast("error", getErrorMsg("cash-drawer-txn", "create"));
      }
    },

    validationSchema: getValidationSchema(),
  });

  const handleLogout = async () => {
    MMKVDB.remove(DBKeys.USER);
    MMKVDB.remove(DBKeys.USERTYPE);
    MMKVDB.remove(DBKeys.USER_PERMISSIONS);

    authContext.logout();

    showToast("success", t("Logout successfully!"));
  };

  const updatedExpectedAmount = async () => {
    let totalAmount = 0;
    let salesAmount = 0;
    const refundedAmount = Number(
      MMKVDB.get(DBKeys.TOTAL_REFUNDED_AMOUNT) || "0"
    );

    if (Number(cashDrawerTxn?.openingActual) >= 0) {
      totalAmount = cashDrawerTxn.openingActual;
    } else {
      totalAmount = billingSettings?.defaultCash;
    }

    salesAmount +=
      orderData?.reduce((amount: number, order: any) => {
        return amount + calculateCashTotal(order.payment.breakup);
      }, 0) || 0;

    if (miscExpenses?.length > 0) {
      totalAmount -=
        miscExpenses?.reduce((amount: number, expense: any) => {
          return amount + calculateExpenseCashTotal(expense.transactions);
        }, 0) || 0;
    }

    console.log(totalAmount, salesAmount, refundedAmount);
    setExpectedCash(totalAmount + salesAmount - refundedAmount);
  };

  const getOpenOrderNumber = () => {
    const orderNum = data?.openOrders
      ?.map((order: any) => order.orderNum)
      ?.join(", ");

    return orderNum;
  };

  const getOtherOrderNumber = () => {
    const orderNum = data?.otherOrders
      ?.map((order: any) => order.orderNum)
      ?.join(", ");

    return orderNum;
  };

  useEffect(() => {
    setAmount(-1);
    formik.resetForm();

    repository.cashDrawerTxnRepository
      .findLatestByCompanyRef(deviceContext.user.companyRef)
      .then((result) => {
        setCashDrawerTxn(result);
      });
    repository.billing
      .findById(deviceContext?.user?.locationRef)
      .then((result) => {
        setBillingSettings(result);
      });
    repository.business
      .findByLocationId(deviceContext?.user?.locationRef)
      .then((res) => {
        setBusinessDetails(res);
      });
  }, [visible]);

  useEffect(() => {
    if (cashDrawerTxn) {
      const startDate = new Date(cashDrawerTxn.started);

      const endDate = new Date();

      repository.orderRepository
        .getCashOrders(deviceContext.user.deviceRef, startDate, endDate)
        .then((result) => {
          setOrderData(result);
        });

      serviceCaller(endpoint.miscExpenses.path, {
        method: endpoint.miscExpenses.method,
        query: {
          sort: "desc",
          _q: "",
          page: 0,
          limit: 500,
          activeTab: "paid",
          companyRef: authContext.user.companyRef,
          locationRef: authContext.user.locationRef,
          userRef: authContext.user._id,
          deviceRef: deviceContext.user.deviceRef,
          transactionType: "debit",
          paymentMethod: "cash",
          paymentDate: {
            from: startDate,
            to: endDate,
          },
        },
      }).then((res) => {
        setMiscExpenses(res?.results || []);
      });
    }
  }, [cashDrawerTxn]);

  useEffect(() => {
    updatedExpectedAmount();
  }, [orderData, cashDrawerTxn, billingSettings, miscExpenses]);

  function calculateExpenseCashTotal(payments: any): number {
    return payments.reduce((total: number, payment: any) => {
      if (payment.paymentMethod === PROVIDER_NAME.CASH) {
        return total + Number(payment.amount || 0);
      }
      return total;
    }, 0);
  }

  function calculateCashTotal(breakup: any): number {
    return breakup.reduce((total: number, payment: any) => {
      if (payment.providerName === PROVIDER_NAME.CASH) {
        const change = Math.max(payment.change || 0, 0);
        return total + Number(payment.total) - change || 0;
      }
      return total;
    }, 0);
  }

  useEffect(() => {
    const diff = amount - expectedCash;

    setDifference(diff);
  }, [amount, expectedCash]);

  useEffect(() => {
    if (formik.values.reason.key == "other") {
      formik.setFieldValue("isOther", true);
    } else {
      formik.setFieldValue("isOther", false);
    }
  }, [formik.values.reason]);

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
            title={
              data.isEndShift
                ? t("End Shift - Close cash drawer")
                : t("Day End")
            }
            rightBtnText={""}
            handleLeftBtn={() => {
              formik.resetForm();
              handleClose();
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
                paddingVertical: hp("3%"),
                paddingHorizontal: hp("2.5%"),
              }}
            >
              <DefaultText
                style={{ marginTop: -5 }}
                fontSize="lg"
                fontWeight="medium"
              >
                {`${t("Available as per system")}.`}
              </DefaultText>

              <View
                style={{
                  marginTop: 5,
                  flexDirection: "row",
                  alignItems: "baseline",
                }}
              >
                <DefaultText
                  fontSize="lg"
                  fontWeight="medium"
                  color="otherGrey.100"
                >
                  {currency}
                </DefaultText>

                <Spacer space={5} />

                <DefaultText fontSize="2xl" fontWeight="medium">
                  {expectedCash?.toFixed(2)}
                </DefaultText>
              </View>

              <ItemDivider
                style={{
                  margin: 0,
                  borderWidth: 0,
                  borderBottomWidth: 1,
                  marginVertical: hp("1.75%"),
                  borderColor: "#C2C2C2",
                }}
              />

              <AmountInput
                containerStyle={{ backgroundColor: "#8A959E1A" }}
                style={{
                  width: "100%",
                  fontSize: theme.fontSizes["2xl"],
                  fontWeight: theme.fontWeights.medium,
                }}
                label={`${t("ACTUAL CASH AVAILABLE")}  (${t(
                  "in"
                )} ${currency})`}
                maxLength={18}
                placeholderText={"0.00"}
                values={amount == -1 ? "" : `${amount}`}
                handleChange={(val: any) => {
                  setAmount(val);
                }}
              />

              {amount >= 0 && (
                <>
                  <ItemDivider
                    style={{
                      margin: 0,
                      borderWidth: 0,
                      borderBottomWidth: 1,
                      marginTop: hp("2.25%"),
                      marginBottom: hp("1.5%"),
                      borderColor: "#C2C2C2",
                    }}
                  />

                  <DefaultText fontSize="lg" fontWeight="medium">
                    {t("Difference")}
                  </DefaultText>

                  <View
                    style={{
                      marginTop: 5,
                      flexDirection: "row",
                      alignItems: "baseline",
                    }}
                  >
                    <DefaultText
                      fontSize="lg"
                      fontWeight="medium"
                      color="otherGrey.100"
                    >
                      {currency}
                    </DefaultText>

                    <Spacer space={5} />

                    <DefaultText
                      fontSize="2xl"
                      fontWeight="medium"
                      color={
                        difference == 0
                          ? theme.colors.otherGrey[100]
                          : difference > 0
                          ? theme.colors.primary[1000]
                          : theme.colors.red.default
                      }
                    >
                      {difference == 0
                        ? difference?.toFixed(2)
                        : difference > 0
                        ? `+${difference.toFixed(2)}`
                        : `${difference.toFixed(2)}`}
                    </DefaultText>
                  </View>
                </>
              )}

              <Spacer space={hp("2.25%")} />

              {amount !== -1 && (
                <>
                  <SelectInput
                    containerStyle={{
                      borderWidth: 0,
                      backgroundColor: "#8A959E1A",
                    }}
                    marginHorizontal={"0%"}
                    label={t("REASON")}
                    placeholderText={t("Select Reason")}
                    options={
                      difference > 0
                        ? positiveReasonOptions
                        : negativeReasonOptions
                    }
                    allowSearch={false}
                    values={formik.values.reason}
                    handleChange={(val: any) => {
                      if (val.key && val.value) {
                        formik.setFieldValue("reason", val);
                      }
                    }}
                  />
                  <ErrorText
                    errors={
                      (formik.errors.reason?.value &&
                        formik.touched.reason?.value) as Boolean
                    }
                    title={formik.errors.reason?.value || (null as any)}
                  />
                </>
              )}

              {formik.values.reason.key == "other" && (
                <>
                  <Spacer space={15} />

                  <Input
                    containerStyle={{ backgroundColor: "#8A959E1A" }}
                    style={{ width: "100%" }}
                    placeholderText={t("Enter the reason")}
                    values={formik.values.otherReason}
                    handleChange={(val: any) =>
                      formik.setFieldValue("otherReason", val)
                    }
                  />
                  <ErrorText
                    errors={
                      (formik.errors.otherReason &&
                        formik.touched.otherReason) as Boolean
                    }
                    title={formik.errors.otherReason || (null as any)}
                  />
                </>
              )}

              {data?.openOrders?.length > 0 &&
                data?.otherOrders?.length > 0 && (
                  <View>
                    <ItemDivider
                      style={{
                        margin: 0,
                        borderWidth: 0,
                        borderBottomWidth: 1,
                        marginTop: amount === -1 ? 5 : hp("1.75%"),
                        marginBottom: hp("1.75%"),
                        borderColor: "#C2C2C2",
                      }}
                    />

                    <DefaultText
                      style={{ marginTop: 8 }}
                      fontSize="lg"
                      fontWeight="medium"
                      color={theme.colors.otherGrey[100]}
                    >
                      {`${t("Note")}: ${t(
                        "Please choose the order option(s) to cancel the orders within it before day end"
                      )}.`}
                    </DefaultText>
                  </View>
                )}

              {data?.openOrders?.length > 0 && (
                <View style={{ marginTop: hp("3.5%") }}>
                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center" }}
                    onPress={() =>
                      formik.setFieldValue(
                        "openOrders",
                        !formik.values.openOrders
                      )
                    }
                  >
                    <Checkbox
                      isChecked={formik.values.openOrders}
                      fillColor={theme.colors.white[1000]}
                      unfillColor={theme.colors.white[1000]}
                      iconComponent={
                        formik.values.openOrders ? (
                          <ICONS.TickFilledIcon
                            color={theme.colors.primary[1000]}
                          />
                        ) : (
                          <ICONS.TickEmptyIcon
                            color={theme.colors.primary[1000]}
                          />
                        )
                      }
                      disableBuiltInState
                      disabled
                    />

                    <DefaultText
                      style={{ marginLeft: wp("0.5%") }}
                      fontSize="xl"
                    >
                      {t("Open Orders: All the open orders are listed here")}
                    </DefaultText>
                  </TouchableOpacity>

                  <View
                    style={{
                      borderRadius: 8,
                      marginTop: hp("2.5%"),
                      paddingVertical: hp("2%"),
                      paddingHorizontal: hp("1.75%"),
                      backgroundColor: theme.colors.bgColor2,
                    }}
                  >
                    <DefaultText
                      style={{ marginLeft: wp("0.5%") }}
                      fontSize="xl"
                    >
                      {getOpenOrderNumber()}
                    </DefaultText>
                  </View>
                </View>
              )}

              {data?.otherOrders?.length > 0 && (
                <View style={{ marginTop: hp("3.5%") }}>
                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center" }}
                    onPress={() =>
                      formik.setFieldValue(
                        "otherOrders",
                        !formik.values.otherOrders
                      )
                    }
                  >
                    <Checkbox
                      isChecked={formik.values.otherOrders}
                      fillColor={theme.colors.white[1000]}
                      unfillColor={theme.colors.white[1000]}
                      iconComponent={
                        formik.values.otherOrders ? (
                          <ICONS.TickFilledIcon
                            color={theme.colors.primary[1000]}
                          />
                        ) : (
                          <ICONS.TickEmptyIcon
                            color={theme.colors.primary[1000]}
                          />
                        )
                      }
                      disableBuiltInState
                      disabled
                    />

                    <DefaultText
                      style={{ marginLeft: wp("0.5%") }}
                      fontSize="xl"
                    >
                      {t(
                        "Ongoing Orders: All the ongoing orders are listed here"
                      )}
                    </DefaultText>
                  </TouchableOpacity>

                  <View
                    style={{
                      borderRadius: 8,
                      marginTop: hp("2.5%"),
                      paddingVertical: hp("2%"),
                      paddingHorizontal: hp("1.75%"),
                      backgroundColor: theme.colors.bgColor2,
                    }}
                  >
                    <DefaultText fontSize="xl">
                      {getOtherOrderNumber()}
                    </DefaultText>
                  </View>
                </View>
              )}

              {formik.values.openOrders && formik.values.otherOrders ? (
                <DefaultText
                  style={{ marginTop: hp("4%") }}
                  fontSize="lg"
                  fontWeight="medium"
                  color={theme.colors.otherGrey[100]}
                >
                  {`${t("Note")}: ${t(
                    "All the open & ongoing orders would be cancelled"
                  )}.`}
                </DefaultText>
              ) : formik.values.openOrders ? (
                <DefaultText
                  style={{ marginTop: hp("4%") }}
                  fontSize="lg"
                  fontWeight="medium"
                  color={theme.colors.otherGrey[100]}
                >
                  {`${t("Note")}: ${t(
                    "All the open orders would be cancelled"
                  )}.`}
                </DefaultText>
              ) : formik.values.otherOrders ? (
                <DefaultText
                  style={{ marginTop: hp("4%") }}
                  fontSize="lg"
                  fontWeight="medium"
                  color={theme.colors.otherGrey[100]}
                >
                  {`${t("Note")}: ${t(
                    "All the ongoing orders would be cancelled"
                  )}.`}
                </DefaultText>
              ) : (
                <></>
              )}

              <Spacer space={hp("20%")} />
            </ScrollView>
          </KeyboardAvoidingView>

          <View
            style={{
              bottom: 0,
              width: "100%",
              position: "absolute",
              paddingBottom: hp("2.5%"),
              backgroundColor: theme.colors.bgColor,
            }}
          >
            <View
              style={{
                overflow: "hidden",
                marginTop: hp("0.5%"),
                marginBottom: hp("2%"),
                marginHorizontal: -wp("5%"),
                height: 1,
                backgroundColor: theme.colors.dividerColor.main,
              }}
            />

            <PrimaryButton
              style={{
                width: twoPaneView ? "50%" : "90%",
                alignSelf: "center",
                paddingVertical: hp("2.25%"),
                paddingHorizontal: wp("1.5%"),
              }}
              textStyle={{
                fontSize: 16,
                fontWeight: theme.fontWeights.medium,
                fontFamily: theme.fonts.circulatStd,
              }}
              loading={formik.isSubmitting}
              title={
                data.isEndShift
                  ? t("End Shift and logout")
                  : t("Day end and logout")
              }
              onPress={() => {
                if (amount == -1) {
                  showToast("error", t("Please enter actual cash available"));
                } else {
                  formik.handleSubmit();
                }
              }}
            />
          </View>
        </View>
      </View>

      <Toast />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { overflow: "hidden", height: "100%" },
});
