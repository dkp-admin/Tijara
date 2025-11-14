import { format } from "date-fns";
import { FormikProps, useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import Checkbox from "react-native-bouncy-checkbox";
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import { t } from "../../../../i18n";
import serviceCaller from "../../../api";
import endpoint from "../../../api/endpoints";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { ERRORS } from "../../../utils/errors";
import ICONS from "../../../utils/icons";
import { debugLog, errorLog } from "../../../utils/log-patch";
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

function getItems(items: any) {
  const itemList = items.map((item: any) => {
    const data: any = {
      name: { en: item.name.en, ar: item.name.ar },
      contains: item.contains,
      image: item.image,
      quantity: item.qty,
      isFree: item.isFree,
      isQtyFree: item.isQtyFree,
      hasMultipleVariants: item.hasMultipleVariants,
      billing: {
        total: item.total,
        subTotal: item.sellingPrice,
        vatAmount: item.vat,
        vatPercentage: item.vatPercentage,
        discountAmount: item.discount,
        discountPercentage: item.discountPercentage,
        promotionPercentage: item?.promotionPercentage || 0,
        discountedTotal: item.discountedTotal,
        discountedVat: item?.discountedVat || 0,
        amountBeforeVoidComp: item.amountBeforeVoidComp,
      },
      variant: {
        name: { en: item.variantNameEn, ar: item.variantNameAr },
        sku: item.sku,
        unit: item.unit,
        type: item.type,
        unitCount: item.noOfUnits,
        costPrice: item.costPrice,
        sellingPrice: item.sellingPrice / item.qty,
      },
      void: item.void,
      voidRef: item.voidRef,
      voidReason: item.voidReason,
      comp: item.comp,
      compRef: item.compRef,
      compReason: item.compReason,
      kitchenName: item.kitchenName,
      kotId: item.kotId,
      sentToKotAt: item.sentToKotAt,
      modifiers: item.modifiers,
      promotionsData: item?.promotionsData || [],
    };

    if (item?.productRef != "") {
      data["productRef"] = item.productRef;
    }

    if (item?.categoryRef != "") {
      data["categoryRef"] = item.categoryRef;
    }

    return data;
  });

  return itemList;
}

function getOrderData(data: any) {
  const items = getItems(data?.items);

  const dataObj: any = {
    _id: data._id,
    company: { name: data.company?.en || data.company.name },
    companyRef: data.companyRef,
    location: { name: data.location.name },
    locationRef: data.locationRef,
    cashier: { name: data.cashier.name },
    cashierRef: data.cashierRef,
    device: { deviceCode: data.device.deviceCode },
    deviceRef: data.deviceRef,
    orderNum: data.orderNum,
    orderType: data.orderType,
    tokenNumber: data.tokenNum,
    specialInstructions: data.specialInstructions,
    items: items,
    payment: {
      total: data.payment.total,
      subTotal: data.payment.subTotal,
      vatAmount: data.payment.vat,
      vatPercentage: data.payment.vatPercentage,
      discountCode: data.payment.discountCode,
      discountAmount: data.payment.discount,
      subTotalWithoutDiscount: data.payment.subTotalWithoutDiscount,
      discountPercentage: data.payment.discountPercentage,
      breakup: data.payment.breakup?.map((breakup: any) => {
        return {
          name: breakup.name,
          total: breakup.total,
          refId: breakup.refId,
          providerName: breakup.providerName,
          paid: breakup.piad,
          change: breakup.change,
        };
      }),
    },
    refunds: data.refunds?.map((refund: any) => {
      return {
        reason: refund.reason,
        amount: refund.amount,
        vat: refund.vat,
        items: refund.items?.map((item: any) => {
          return {
            unit: item.unit,
            qty: Number(item.qty),
            amount: Number(item.amount),
            vat: item.vat,
            name: { en: item?.nameEn || "", ar: item?.nameAr || "" },
            categoryRef: item.categoryRef,
            _id: item._id,
            sku: item.sku,
          };
        }),
        refundedTo: refund.refundedTo?.map((data: any) => {
          return {
            amount: data.amount,
            refundedTo: data.refundTo,
          };
        }),
        cashier: { name: refund.cashier.name },
        cashierRef: refund.cashierRef,
        date: new Date(refund.date),
        device: { deviceCode: refund.device.deviceCode },
        deviceRef: refund.deviceRef,
      };
    }),
    createdAt: format(new Date(data.createdAt), "h:mma yyyy-MM-dd"),
  };

  if (data?.customerRef) {
    dataObj["customer"] = {
      name: data.customer.name,
      vat: data.customer.vat,
    };
    dataObj["customerRef"] = data.customerRef;
  }

  return dataObj;
}

export default function SendReceiptModal({
  data,
  customer,
  visible = false,
  handleClose,
}: {
  data: any;
  customer?: any;
  visible: boolean;
  handleClose?: any;
}) {
  const theme = useTheme();
  const { wp, hp, twoPaneView } = useResponsive();

  const [country, setCountry] = useState("+966");

  const formik: FormikProps<SendReceiptProps> = useFormik<SendReceiptProps>({
    initialValues: {
      sentVia: "sms",
      phone: "",
      email: "",
    },

    onSubmit: async (values) => {
      const dataObj: any = {
        order: getOrderData(data),
        type: values.sentVia,
      };

      if (values.sentVia == "sms") {
        dataObj["value"] = parsePhoneNumber(country, values.phone);
      } else if (values.sentVia == "email") {
        dataObj["value"] = values.email;
      }

      try {
        const res = await serviceCaller(endpoint.sendReceipt.path, {
          method: endpoint.sendReceipt.method,
          body: { ...dataObj },
        });

        if (res?.code == "receipt_sent") {
          debugLog(
            "Receipt sent successfully",
            {},
            "orders-screen",
            "handleSubmitReceiptFunction"
          );
          handleClose();
          showToast("success", t("Receipt Sent Successfully"));
        }
      } catch (error: any) {
        errorLog(
          error?.message,
          values,
          "orders-screen",
          "handleSubmitReceiptFunction",
          error
        );

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

      if (customer != null) {
        const phoneNumber = customer?.phone
          ? customer?.phone?.toString().split("-")[1]
          : "";

        setCountry(
          phoneNumber ? customer?.phone?.toString().split("-")[0] : "+966"
        );

        formik.setFieldValue("phone", phoneNumber || "");
        formik.setFieldValue("email", customer?.email || "");
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
