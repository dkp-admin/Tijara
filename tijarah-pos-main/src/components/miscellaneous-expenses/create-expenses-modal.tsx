import { FormikProps, useFormik } from "formik";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
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
import { checkDirection } from "../../hooks/check-direction";
import { checkInternet } from "../../hooks/check-internet";
import { useResponsive } from "../../hooks/use-responsiveness";
import { queryClient } from "../../query-client";
import { AuthType } from "../../types/auth-types";
import ICONS from "../../utils/icons";
import { debugLog, errorLog } from "../../utils/log-patch";
import { showAlert } from "../../utils/showAlert";
import ActionSheetHeader from "../action-sheet/action-sheet-header";
import AmountInput from "../input/amount-input";
import DateInput from "../input/date-input";
import Input from "../input/input";
import SelectInput from "../input/select-input";
import MultipleAttachmentUploader from "../multiple-attachment-uploader";
import Spacer from "../spacer";
import DefaultText from "../text/Text";
import ErrorText from "../text/error-text";
import Label from "../text/label";
import showToast from "../toast";
import ToolTip from "../tool-tip";
import VendorSelectInput from "../variant/stocks/stock-action/vendor-select-input";
import AddPayment from "./payment/add-payment";
import PaymentList from "./payment/payment-list";

type CreateMiscExpensesProps = {
  paid: boolean;
  name: string;
  reason: string;
  vendor: string;
  vendorRef: string;
  expenseDate?: Date;
  paymentMethod: string;
  type: "single" | "multiple";
  amount: string;
  payments: any[];
  referenceNumber: string;
  description: string;
  attachment: string[];
  status: string;
  markPaid: boolean;
};

const paymentMethodOptions = [
  { value: "Cash", key: "cash" },
  { value: "Card", key: "card" },
  { value: "Credit", key: "credit" },
];

const Payment_Name: any = {
  cash: "Cash",
  card: "Card",
  credit: "Credit",
};

const expenseTypeOptions = [
  {
    key: "administrative",
    value: "Administrative",
  },
  {
    key: "vendorPayments",
    value: "Vendor Payments",
  },

  {
    key: "purchase",
    value: "Purchase",
  },
  {
    key: "medical",
    value: "Medical",
  },
  {
    key: "marketing",
    value: "Marketing",
  },
  {
    key: "rental",
    value: "Rental",
  },
  {
    key: "taxes",
    value: "Taxes",
  },
  {
    key: "other",
    value: "Other",
  },
];

const expanseTypeName: any = {
  administrative: "Administrative",
  vendorPayments: "Vendor Payments",
  purchase: "Purchase",
  medical: "Medical",
  marketing: "Marketing",
  rental: "Rental",
  taxes: "Taxes",
  other: "Other",
};

export enum TransactionStatus {
  paid = "paid",
  received = "received",
  toBeReceived = "to_be_received",
  toBePaid = "to_be_paid",
}

export default function CreateEditExpensesModal({
  data,
  visible = false,
  handleClose,
  handleSuccess,
}: {
  data: any;
  visible: boolean;
  handleClose: any;
  handleSuccess: any;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const isConnected = checkInternet();
  const vendorSheetRef = useRef<any>();
  const { hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);
  const deviceContext = useContext(DeviceContext) as any;

  const [isEditing, setIsEditing] = useState(false);
  const [visisblePayment, setVisiblePayment] = useState(false);

  const formik: FormikProps<CreateMiscExpensesProps> =
    useFormik<CreateMiscExpensesProps>({
      initialValues: {
        paid: true,
        name: "",
        reason: "",
        vendor: "",
        vendorRef: "",
        expenseDate: undefined as any,
        referenceNumber: "",
        type: "single",
        paymentMethod: "",
        amount: "",
        payments: [],
        description: "",
        attachment: [],
        status: "",
        markPaid: false,
      },

      onSubmit: async (values) => {
        if (values.paymentMethod === "") {
          showToast("error", t("Select payment method"));
          return;
        }

        if (values.amount === "") {
          showToast("error", t("Amount is required"));
          return;
        } else if (Number(values.amount) === 0) {
          showToast("error", t("Amount must be greater than 0"));
          return;
        }

        if (values.payments?.length === 0) {
          showToast("error", t("Please add at least one payment"));
          return;
        }

        let payments = values.payments;

        if (values.paymentMethod && values.amount && payments.length === 0) {
          payments = [
            { paymentMethod: values.paymentMethod, amount: values.amount },
          ];
        } else if (payments?.length === 1) {
          payments = [
            { paymentMethod: values.paymentMethod, amount: values.amount },
          ];
        }

        const dataObj: any = {
          name: { en: values.name, ar: values.name },
          date: values.expenseDate,
          reason: values.reason,
          companyRef: authContext.user.companyRef,
          company: { name: authContext.user.company.name },
          locationRef: authContext.user.locationRef,
          location: { name: authContext.user.location.name },
          transactionType: "debit",
          userRef: authContext.user._id,
          user: {
            name: authContext.user.name,
            type: authContext.user.userType,
          },
          deviceRef: deviceContext.user.deviceRef,
          device: { deviceCode: deviceContext.user.phone },
          referenceNumber: values.referenceNumber,
          fileUrl: values.attachment,
          transactions: payments,
          description: values.description,
          status: TransactionStatus[formik.values.paid ? "paid" : "toBePaid"],
        };

        if (values.vendorRef) {
          dataObj.vendor = { name: values.vendor };
          dataObj.vendorRef = values.vendorRef;
        }

        if (values.paid || values.markPaid) {
          dataObj.paymentDate = new Date()?.toISOString();
        }

        try {
          const res =
            data === null
              ? await serviceCaller(endpoint.miscExpensesCreate.path, {
                  method: endpoint.miscExpensesCreate.method,
                  body: { ...dataObj },
                })
              : await serviceCaller(
                  `${endpoint.miscExpensesUpdate.path}/${data._id}`,
                  {
                    method: endpoint.miscExpensesUpdate.method,
                    body: { ...dataObj },
                  }
                );

          if (res !== null || res?.code === "success") {
            await queryClient.invalidateQueries("find-misc-expenses");
            debugLog(
              data === null
                ? "Miscalleneous expenses created to server"
                : "Miscalleneous expenses updated to server",
              res,
              "misc-expenses-create-modal",
              "handleSubmitFunction"
            );
            handleSuccess();
            showToast(
              "success",
              data === null
                ? t("Miscalleneous expenses Created")
                : t("Miscalleneous expenses Updated")
            );
          }
        } catch (err: any) {
          errorLog(
            err?.code,
            dataObj,
            "misc-expenses-create-modal",
            "handleSubmitFunction",
            err
          );

          showToast("error", err?.code || err?.message);
        }
      },

      validationSchema: Yup.object().shape({
        name: Yup.string()
          .matches(
            /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
            t("Enter valid expense name")
          )
          .required(`${t("Expense name is required")}`)
          .max(60, t("Expense name must not be greater than 60 characters")),
        reason: Yup.string().required(t("Expense type is required")),
        expenseDate: Yup.date()
          .required(t("Expense date is required"))
          .nullable(),
        vendor: Yup.string().when("reason", {
          is: "vendorPayments",
          then: Yup.string().required(t("Please select vendor")),
          otherwise: Yup.string().optional(),
        }),
        referenceNumber: Yup.string().max(
          30,
          t("Reference Number must not be greater than 30 characters")
        ),
        description: Yup.string().max(
          70,
          t("Description must not be greater than 70 characters")
        ),
      }),
    });

  const imageUploader = useMemo(
    () => (
      <MultipleAttachmentUploader
        disabled={!isEditing}
        uploadedAttachments={formik.values.attachment}
        handleAttachments={(attachment: string[]) => {
          formik.setFieldValue("attachment", attachment);
        }}
      />
    ),
    [formik.values.attachment, isEditing]
  );

  const showPaymentTypeSwitchAlert = async () => {
    await showAlert({
      confirmation: t("Confirmation"),
      alertMsg: t("multiple_to_single_payment_switch_alert"),
      btnText1: t("No"),
      btnText2: t("Yes"),
      onPressBtn1: () => {},
      onPressBtn2: () => {
        formik.setFieldValue("type", "single");
        formik.setFieldValue(
          "paymentMethod",
          formik.values.payments[0].paymentMethod
        );
        formik.setFieldValue("amount", formik.values.payments[0].amount);

        if (formik.values.payments.length > 1) {
          formik.setFieldValue("payments", [formik.values.payments[0]]);
        }
      },
    });
  };

  const createNewPayment = () => {
    const create = formik.values.paymentMethod || formik.values.amount;

    if (create && formik.values.payments.length === 0) {
      const data = {
        paymentMethod: formik.values.paymentMethod,
        amount: formik.values.amount,
      };

      formik.setFieldValue("payments", [data]);
    }
  };

  useEffect(() => {
    if (visible) {
      formik.resetForm();
      setIsEditing(data === null);

      if (data !== null) {
        formik.setValues({
          paid: data.status === "paid",
          name: data.name.en,
          reason: data.reason,
          vendor: data?.vendor?.name || "",
          vendorRef: data?.vendorRef || "",
          expenseDate: data.date,
          type: data.transactions?.length === 1 ? "single" : "multiple",
          paymentMethod: data.transactions[0].paymentMethod,
          amount: `${data.transactions[0].amount || ""}`,
          payments: data.transactions,
          referenceNumber: data.referenceNumber,
          attachment: data.fileUrl,
          description: data.description,
          status: data.status,
          markPaid: false,
        });
      }
    }
  }, [visible]);

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
              data === null
                ? t("Create miscellaneous expenses")
                : data?.name?.en
            }
            rightBtnText={
              data === null ? t("Add") : !isEditing ? t("Edit") : t("Save")
            }
            handleLeftBtn={() => handleClose()}
            loading={formik.isSubmitting}
            handleRightBtn={() => {
              if (isEditing) {
                if (!isConnected) {
                  debugLog(
                    data === null
                      ? "Miscellaneous expenses can't be created offline"
                      : "Miscellaneous expenses can't be updated offline",
                    {},
                    "misc-expenses-create-modal",
                    data === null
                      ? "handleCreateFunction"
                      : "handleUpdateFunction"
                  );
                  showToast(
                    "error",
                    data === null
                      ? t("Miscellaneous expenses can't be created offline")
                      : t("Miscellaneous expenses can't be updated offline")
                  );
                }

                if (
                  formik.values.type === "single" &&
                  formik.values.payments?.length === 0
                ) {
                  createNewPayment();
                }

                formik.handleSubmit();
              } else {
                setIsEditing(true);
              }
            }}
            permission={
              data === null
                ? authContext.permission["pos:expense"]?.create
                : authContext.permission["pos:expense"]?.update
            }
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
              {imageUploader}

              <Spacer space={hp("3.5%")} />

              <View style={styles.labelTextView}>
                <View
                  style={{
                    marginBottom: hp("0.5%"),
                    marginLeft: hp("1.75%"),
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    style={{
                      maxWidth: "40%",
                      opacity: isEditing ? 1 : 0.5,
                      flexDirection: "row",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                    onPress={() => {
                      if (data?._id) {
                        showToast(
                          "error",
                          t("You can not change the status once it is set")
                        );
                        return;
                      }

                      formik.setFieldValue("paid", true);
                    }}
                    disabled={!isEditing}
                  >
                    <Checkbox
                      isChecked={formik.values.paid}
                      fillColor="transparent"
                      unfillColor="transparent"
                      iconComponent={
                        formik.values.paid ? (
                          <ICONS.RadioFilledIcon
                            color={theme.colors.primary[1000]}
                          />
                        ) : (
                          <ICONS.RadioEmptyIcon
                            color={theme.colors.primary[1000]}
                          />
                        )
                      }
                      disableBuiltInState
                      disabled
                    />

                    <DefaultText fontSize="xl">{t("Paid")}</DefaultText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      maxWidth: "40%",
                      opacity: isEditing ? 1 : 0.5,
                      marginLeft: hp("4%"),
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                    onPress={() => {
                      if (data?._id) {
                        showToast(
                          "error",
                          t("You can not change the status once it is set")
                        );
                        return;
                      }

                      formik.setFieldValue("paid", false);
                    }}
                    disabled={!isEditing}
                  >
                    <Checkbox
                      isChecked={!formik.values.paid}
                      fillColor="transparent"
                      unfillColor="transparent"
                      iconComponent={
                        !formik.values.paid ? (
                          <ICONS.RadioFilledIcon
                            color={theme.colors.primary[1000]}
                          />
                        ) : (
                          <ICONS.RadioEmptyIcon
                            color={theme.colors.primary[1000]}
                          />
                        )
                      }
                      disableBuiltInState
                      disabled
                    />

                    <DefaultText fontSize="xl">{t("To be paid")}</DefaultText>
                  </TouchableOpacity>
                </View>
              </View>

              <Spacer space={hp("3.5%")} />

              <Input
                style={{ width: "100%" }}
                label={`${t("EXPENSE NAME")} *`}
                autoCapitalize="words"
                placeholderText={t("Enter expense name")}
                values={formik.values.name}
                handleChange={(val: any) => formik.setFieldValue("name", val)}
                maxLength={60}
                disabled={data?._id != null}
              />
              <ErrorText
                errors={(formik.errors.name && formik.touched.name) as Boolean}
                title={formik.errors.name || ""}
              />

              <Spacer space={hp("3%")} />

              <SelectInput
                label={`${t("EXPENSE TYPE")} *`}
                placeholderText={t("Select Expense Type")}
                options={expenseTypeOptions}
                allowSearch={false}
                values={{
                  key: formik.values.reason,
                  value: expanseTypeName[formik.values.reason],
                }}
                handleChange={(val: any) => {
                  if (val.key) {
                    formik.setFieldValue("reason", val.key);
                  }
                }}
                containerStyle={{ borderWidth: 0 }}
                disabled={data?._id != null}
              />
              <ErrorText
                errors={
                  (formik.errors.reason && formik.touched.reason) as Boolean
                }
                title={formik.errors.reason || ""}
              />

              {formik.values.reason === "vendorPayments" && (
                <View>
                  <Spacer space={hp("3.5%")} />

                  <Label>{`${t("VENDOR")} *`}</Label>

                  <TouchableOpacity
                    style={{
                      ...styles.drop_down_view,
                      height: hp("7.5%"),
                      borderRadius: 16,
                      opacity: isEditing ? 1 : 0.5,
                      backgroundColor: theme.colors.white[1000],
                    }}
                    onPress={() => {
                      if (data == null) {
                        vendorSheetRef.current.open();
                      }
                    }}
                    disabled={data?._id != null}
                  >
                    <DefaultText
                      fontWeight="normal"
                      color={
                        data?._id || formik.values.vendor
                          ? theme.colors.otherGrey[100]
                          : theme.colors.placeholder
                      }
                    >
                      {formik.values.vendor
                        ? formik.values.vendor
                        : t("Select Vendor")}
                    </DefaultText>

                    <View
                      style={{
                        transform: [{ rotate: isRTL ? "180deg" : "0deg" }],
                      }}
                    >
                      <ICONS.RightContentIcon />
                    </View>
                  </TouchableOpacity>
                  <ErrorText
                    errors={
                      (formik.errors.vendor && formik.touched.vendor) as Boolean
                    }
                    title={formik.errors.vendor || ""}
                  />
                </View>
              )}

              <Spacer space={hp("3.5%")} />

              <DateInput
                label={`${t("EXPENSE DATE")} *`}
                placeholderText={t("Select date")}
                mode="date"
                rightIcon={false}
                dateFormat="dd/MM/yyyy"
                minimumDate={formik.values.paid ? undefined : new Date()}
                maximumDate={formik.values.paid ? new Date() : undefined}
                values={formik.values.expenseDate}
                handleChange={(val: any) => {
                  formik.setFieldValue("expenseDate", val);
                }}
                disabled={data?._id != null}
              />
              <ErrorText
                errors={
                  (formik.errors.expenseDate &&
                    formik.touched.expenseDate) as Boolean
                }
                title={formik.errors.expenseDate || (null as any)}
              />

              <Spacer space={hp("4%")} />

              <View style={styles.labelTextView}>
                <View
                  style={{
                    marginBottom: hp("0.5%"),
                    marginLeft: hp("1.75%"),
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    style={{
                      maxWidth: "40%",
                      opacity: isEditing ? 1 : 0.5,
                      flexDirection: "row",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                    onPress={() => {
                      if (formik.values.payments.length === 0) {
                        formik.setFieldValue("type", "single");
                      } else {
                        showPaymentTypeSwitchAlert();
                      }
                    }}
                    disabled={!isEditing}
                  >
                    <Checkbox
                      isChecked={formik.values.type == "single"}
                      fillColor="transparent"
                      unfillColor="transparent"
                      iconComponent={
                        formik.values.type == "single" ? (
                          <ICONS.RadioFilledIcon
                            color={theme.colors.primary[1000]}
                          />
                        ) : (
                          <ICONS.RadioEmptyIcon
                            color={theme.colors.primary[1000]}
                          />
                        )
                      }
                      disableBuiltInState
                      disabled
                    />

                    <DefaultText fontSize="xl">
                      {t("Single Payment")}
                    </DefaultText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      maxWidth: "40%",
                      opacity: isEditing ? 1 : 0.5,
                      marginLeft: hp("4%"),
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                    onPress={() => {
                      createNewPayment();
                      formik.setFieldValue("type", "multiple");
                    }}
                    disabled={!isEditing}
                  >
                    <Checkbox
                      isChecked={formik.values.type === "multiple"}
                      fillColor="transparent"
                      unfillColor="transparent"
                      iconComponent={
                        formik.values.type == "multiple" ? (
                          <ICONS.RadioFilledIcon
                            color={theme.colors.primary[1000]}
                          />
                        ) : (
                          <ICONS.RadioEmptyIcon
                            color={theme.colors.primary[1000]}
                          />
                        )
                      }
                      disableBuiltInState
                      disabled
                    />

                    <DefaultText fontSize="xl">
                      {t("Multiple Payments")}
                    </DefaultText>
                  </TouchableOpacity>
                </View>
              </View>

              {formik.values.type === "single" ? (
                <View>
                  <View
                    style={{
                      ...styles.skuView,
                      marginTop: 6,
                      backgroundColor: theme.colors.white[1000],
                    }}
                  >
                    <SelectInput
                      containerStyle={styles.skuInputContainerView}
                      clearValues={formik.values.paymentMethod == ""}
                      isTwoText={true}
                      allowSearch={false}
                      leftText={`${t("Payment Method")} *`}
                      placeholderText={t("Select Payment Method")}
                      options={paymentMethodOptions}
                      values={{
                        key: formik.values.paymentMethod,
                        value: Payment_Name[formik.values.paymentMethod],
                      }}
                      handleChange={(val: any) => {
                        if (val.key) {
                          formik.setFieldValue("paymentMethod", val.key);
                        }
                      }}
                      disabled={!isEditing}
                    />
                  </View>

                  <View
                    style={{
                      ...styles.dividerView,
                      borderColor: theme.colors.dividerColor.main,
                    }}
                  />

                  <View
                    style={{
                      ...styles.priceView,
                      backgroundColor: theme.colors.white[1000],
                    }}
                  >
                    <DefaultText fontWeight="normal">
                      {`${t("Amount")} (${t("in")} ${t("SAR")}) *`}
                    </DefaultText>

                    <AmountInput
                      containerStyle={styles.amountView}
                      style={{
                        width: "100%",
                        textAlign: isRTL ? "left" : "right",
                      }}
                      maxLength={8}
                      placeholderText={`${t("SAR")} 0.00`}
                      values={formik.values.amount}
                      handleChange={(val: any) => {
                        if (val.length > 2) {
                          showToast("info", t("Amount exceeds 3 digits"));
                        }
                        formik.setFieldValue("amount", val);
                      }}
                      disabled={!isEditing}
                    />
                  </View>
                </View>
              ) : (
                <View>
                  <View
                    style={{
                      marginTop: 10,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Label>{t("PAYMENT")}</Label>

                    <TouchableOpacity
                      style={{ marginRight: hp("1.5%") }}
                      onPress={() => {
                        if (formik.values.payments.length >= 3) {
                          showToast(
                            "error",
                            t("You can't add more than 3 payment method")
                          );
                          return;
                        }

                        setVisiblePayment(true);
                      }}
                      disabled={!isEditing}
                    >
                      <DefaultText
                        fontSize="md"
                        fontWeight="medium"
                        color={
                          isEditing ? "primary.1000" : theme.colors.placeholder
                        }
                      >
                        {t("ADD NEW")}
                      </DefaultText>
                    </TouchableOpacity>
                  </View>

                  <PaymentList
                    disabled={!isEditing}
                    payments={formik.values.payments}
                    handleDelete={(idx: number, payments: any) => {
                      payments.splice(idx, 1);
                      formik.setFieldValue("payments", [...payments]);
                      formik.setFieldValue(
                        "paymentMethod",
                        payments?.[0]?.paymentMethod || ""
                      );
                      formik.setFieldValue(
                        "amount",
                        payments?.[0]?.amount || ""
                      );
                    }}
                  />
                </View>
              )}

              <Spacer space={hp("5%")} />

              <Input
                style={{ width: "100%" }}
                label={t("referenceNo")}
                autoCapitalize="words"
                placeholderText={t("Enter reference no or transaction id")}
                values={formik.values.referenceNumber}
                handleChange={(val: any) =>
                  formik.setFieldValue(
                    "referenceNumber",
                    val?.replace(/[^A-Za-z0-9]/, "")
                  )
                }
                maxLength={30}
                disabled={data?._id != null}
              />

              <Spacer space={hp("3%")} />

              <Input
                containerStyle={{ height: hp("16%") }}
                style={{ width: "100%", height: 100 }}
                label={t("DESCRIPTION")}
                autoCapitalize="sentences"
                placeholderText={t("Enter description")}
                multiline={true}
                numOfLines={10}
                maxLength={70}
                values={formik.values.description}
                handleChange={(val: string) => {
                  formik.setFieldValue("description", val);
                }}
                disabled={data?._id != null}
              />

              {data?._id != null && (
                <View>
                  <Spacer space={hp("5%")} />

                  <View
                    style={{
                      marginBottom: hp("0.5%"),
                      marginLeft: hp("1.75%"),
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        maxWidth: "40%",
                        opacity: isEditing ? 1 : 0.5,
                        flexDirection: "row",
                        alignItems: "center",
                        marginRight: 12,
                      }}
                      onPress={() => {
                        formik.setFieldValue(
                          "markPaid",
                          !formik.values.markPaid
                        );
                        formik.setFieldValue("paid", !formik.values.markPaid);
                      }}
                      disabled={!isEditing}
                    >
                      <Checkbox
                        isChecked={formik.values.markPaid}
                        fillColor="transparent"
                        unfillColor="transparent"
                        iconComponent={
                          formik.values.markPaid ? (
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

                      <DefaultText fontSize="xl">{t("Mark Paid")}</DefaultText>
                    </TouchableOpacity>

                    <View style={{ marginTop: 4, marginLeft: 8 }}>
                      <ToolTip
                        infoMsg={t(
                          "You can change this status of this transaction when you update this"
                        )}
                      />
                    </View>
                  </View>
                </View>
              )}

              <Spacer space={hp("12%")} />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>

      <Toast />

      <VendorSelectInput
        sheetRef={vendorSheetRef}
        values={{ key: formik.values.vendorRef, value: formik.values.vendor }}
        handleSelected={(val: any) => {
          if (val?.key && val?.value) {
            formik.setFieldValue("vendorRef", val.key);
            formik.setFieldValue("vendor", val.value);
            vendorSheetRef.current.close();
          }
        }}
      />

      {visisblePayment && (
        <AddPayment
          visible={visisblePayment}
          handleClose={() => setVisiblePayment(false)}
          handleAdd={(data: any) => {
            formik.setFieldValue("payments", [...formik.values.payments, data]);
            formik.setFieldValue("paymentMethod", data.paymentMethod);
            formik.setFieldValue("amount", data.amount);
            setVisiblePayment(false);
          }}
        />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    height: "100%",
  },
  labelTextView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  drop_down_view: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  skuView: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skuInputContainerView: {
    borderWidth: 0,
    borderRadius: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  dividerView: { marginLeft: 16, borderBottomWidth: 0.5 },
  priceView: {
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  amountView: {
    flex: 0.75,
    borderWidth: 0,
    borderRadius: 0,
    alignSelf: "flex-end",
  },
});
