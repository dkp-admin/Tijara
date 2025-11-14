import { format } from "date-fns";
import { FormikProps, useFormik } from "formik";
import React, { useContext, useEffect, useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import Checkbox from "react-native-bouncy-checkbox";
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import { t } from "../../../../i18n";
import serviceCaller from "../../../api";
import endpoint from "../../../api/endpoints";
import AuthContext from "../../../context/auth-context";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { AuthType } from "../../../types/auth-types";
import { ERRORS } from "../../../utils/errors";
import ICONS from "../../../utils/icons";
import parsePhoneNumber from "../../../utils/parse-phone-number";
import ActionSheetHeader from "../../action-sheet/action-sheet-header";
import Input from "../../input/input";
import PhoneInput from "../../input/phone-input";
import Spacer from "../../spacer";
import DefaultText from "../../text/Text";
import ErrorText from "../../text/error-text";
import showToast from "../../toast";

type SendReceiptProps = {
  sentVia: string;
  phone: string;
  email: string;
};

function salesSummaryData(
  data: any,
  dateRange: any,
  userName: string,
  printedBy: string
) {
  const fromDate = new Date(dateRange.from);
  const toDate = new Date(dateRange.to);

  const dataObj = {
    startDate: format(new Date(fromDate), "dd-MM-yyyy, h:mm a"),
    endDate: format(new Date(toDate), "dd-MM-yyyy, h:mm a"),
    user: { name: { en: userName } },
    refundInCash: data.refundInCash,
    refundInCard: data.refundInCard,
    refundInWallet: data.refundInWallet,
    refundInCredit: data.refundInCredit || 0,
    refundCountInCash: data.refundCountInCash,
    refundCountInCard: data.refundCountInCard,
    refundCountInWallet: data.refundCountInWallet,
    refundCountInCredit: data.refundCountInCredit || 0,
    discount: data.discount,
    charges: data.chargeTotal,
    chargeVat: data.chargeVat,
    chargesWithoutVat: data.chargesWithoutVat,
    totalVatWithoutDiscount: data.totalVatWithoutDiscount,
    totalVat: data.totalVat - data.refundedVatOnCharge,
    totalOrder: data.totalOrder,
    noOfRefund: data.noOfRefund,
    noOfDiscount: data.noOfDiscount,
    totalRevenue:
      data.netSales +
      data.totalVat +
      data.chargesWithoutVat -
      data.refundedCharges,
    pickup: {
      name: "Pickup",
      amount: data.pickup.amount,
      count: data.pickup.count,
    },
    delivery: {
      name: "Delivery",
      amount: data.delivery.amount,
      count: data.delivery.count,
    },
    walkin: {
      name: "Walk-in",
      amount: data.walkin.amount,
      count: data.walkin.count,
    },
    takeaway: {
      name: "Takeaway",
      amount: data.takeaway.amount,
      count: data.takeaway.count,
    },
    "dine-in": {
      name: "Dine-in",
      amount: data?.["dine-in"].amount,
      count: data?.["dine-in"].count,
    },
    netSales:
      data.netSales +
      data.chargesWithoutVat -
      data.refundedCharges +
      data.refundedVatOnCharge,
    netSalesWithoutDiscount: data.netSalesWithoutDiscount,
    totalShift: data.totalShift,
    txnWithCard: data.txnWithCard,
    txnWithCash: data.txnWithCash,
    txnWithWallet: data.txnWithWallet,
    txnWithCredit: data.txnWithCredit || 0,
    txnCountInCard: data.txnCountInCard,
    txnCountInCash: data.txnCountInCash,
    txnCountInWallet: data.txnCountInWallet,
    txnCountInCredit: data.txnCountInCredit || 0,
    cashiers:
      data.cashiers?.length === 0
        ? "-"
        : data?.cashiers?.map((cashier: string) => `${cashier}`).join(", "),
    txnStats: data?.txnStats || [],
    refundData: data?.refundData || [],
    printedBy: printedBy,
  };

  return dataObj;
}

export default function SendTransactionReceiptModal({
  salesSummary,
  dateRange,
  visible = false,
  handleClose,
}: {
  salesSummary: any;
  dateRange: any;
  visible: boolean;
  handleClose: any;
}) {
  const theme = useTheme();
  const { wp, hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);

  const [country, setCountry] = useState("+966");

  console.log(
    JSON.stringify(
      salesSummaryData(
        salesSummary,
        dateRange,
        authContext.user.company.name,
        authContext.user.name
      ),
      null,
      2
    )
  );

  const formik: FormikProps<SendReceiptProps> = useFormik<SendReceiptProps>({
    initialValues: {
      sentVia: "sms",
      phone: "",
      email: "",
    },

    onSubmit: async (values) => {
      const data = {
        sales: salesSummaryData(
          salesSummary,
          dateRange,
          authContext.user.company.name,
          authContext.user.name
        ),
        type: values.sentVia,
        locationRef: authContext.user.locationRef,
        printedOn: format(new Date(), "dd-MM-yyyy, h:mm a"),
        value:
          values.sentVia === "sms"
            ? parsePhoneNumber(country, values.phone)
            : values.email,
      };

      try {
        const res = await serviceCaller(endpoint.sendTransactionReceipt.path, {
          method: endpoint.sendTransactionReceipt.method,
          body: { ...data },
        });

        if (res?.code == "receipt_sent") {
          handleClose();
          showToast("success", t("Sales summary sent successfully"));
        }
      } catch (error: any) {
        if (error?._err?.statusCode) {
          showToast("error", ERRORS.INTERNAL_SERVER_ERROR);
        } else {
          showToast("error", ERRORS.SOMETHING_WENT_WRONG);
        }
      }
    },

    validationSchema: Yup.object().shape({
      sentVia: Yup.string().required(t("Sent Via is required")),
      phone: Yup.string()
        .when("sentVia", {
          is: "sms",
          then: Yup.string()
            .required(t("Phone number is required"))
            .min(9, t("Phone number must be greater than 8 digits"))
            .max(12, t("Phone number must be less than 13 digits")),
          otherwise: Yup.string().optional(),
        })
        .nullable(),
      email: Yup.string()
        .when("sentVia", {
          is: "email",
          then: Yup.string()
            .required(t("Email is required"))
            .email(t("Enter a valid email")),
          otherwise: Yup.string().optional(),
        })
        .nullable(),
    }),
  });

  useEffect(() => {
    if (visible) {
      formik.resetForm();
      formik.setFieldValue("sentVia", "sms");
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
            backgroundColor: theme.colors.white[1000],
          }}
        >
          <ActionSheetHeader
            title={t("Send Receipt")}
            handleLeftBtn={() => handleClose()}
            rightBtnText={t("Send")}
            loading={formik.isSubmitting}
            handleRightBtn={() => {
              formik.handleSubmit();
            }}
            permission={true}
          />

          <View
            style={{
              paddingVertical: hp("5.5%"),
              paddingHorizontal: hp("2%"),
            }}
          >
            <DefaultText
              fontSize="lg"
              fontWeight="normal"
              color={"otherGrey.100"}
            >
              {t("Sent via")}
            </DefaultText>

            <View
              style={{
                marginTop: hp("3%"),
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "center" }}
                  onPress={() => formik.setFieldValue("sentVia", "sms")}
                >
                  <Checkbox
                    isChecked={formik.values.sentVia == "sms"}
                    fillColor={theme.colors.white[1000]}
                    unfillColor={theme.colors.white[1000]}
                    iconComponent={
                      formik.values.sentVia == "sms" ? (
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

                  <DefaultText style={{ marginLeft: wp("0.5%") }} fontSize="xl">
                    {t("Phone")}
                  </DefaultText>
                </TouchableOpacity>
              </View>

              <Spacer space={hp("2%")} />

              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "center" }}
                  onPress={() => formik.setFieldValue("sentVia", "email")}
                >
                  <Checkbox
                    isChecked={formik.values.sentVia == "email"}
                    fillColor={theme.colors.white[1000]}
                    unfillColor={theme.colors.white[1000]}
                    iconComponent={
                      formik.values.sentVia == "email" ? (
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

                  <DefaultText style={{ marginLeft: wp("0.5%") }} fontSize="xl">
                    {t("Email")}
                  </DefaultText>
                </TouchableOpacity>
              </View>
            </View>

            <ErrorText
              errors={
                (formik.errors.sentVia && formik.touched.sentVia) as Boolean
              }
              title={formik.errors.sentVia || ""}
            />

            <Spacer space={hp("5%")} />

            {formik.values.sentVia == "sms" && (
              <View>
                <PhoneInput
                  style={{ backgroundColor: theme.colors.bgColor }}
                  placeholderText={t("Phone")}
                  values={formik.values.phone}
                  handleChange={(val: any) =>
                    formik.setFieldValue("phone", val)
                  }
                  selectedCountryCode={country}
                  handleCountryCode={(code: string) => setCountry(code)}
                />
                <ErrorText
                  errors={
                    (formik.errors.phone && formik.touched.phone) as Boolean
                  }
                  title={formik.errors.phone || ""}
                />
              </View>
            )}

            {formik.values.sentVia == "email" && (
              <View>
                <Input
                  containerStyle={{ backgroundColor: theme.colors.bgColor }}
                  placeholderText={t("Email")}
                  keyboardType={"email-address"}
                  values={formik.values.email}
                  handleChange={(val: any) =>
                    formik.setFieldValue("email", val)
                  }
                />
                <ErrorText
                  errors={
                    (formik.errors.email && formik.touched.email) as Boolean
                  }
                  title={formik.errors.email || ""}
                />
              </View>
            )}
          </View>
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
