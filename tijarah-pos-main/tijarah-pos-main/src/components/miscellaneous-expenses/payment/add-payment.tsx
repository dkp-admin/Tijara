import { FormikProps, useFormik } from "formik";
import React, { useEffect } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { checkKeyboardState } from "../../../hooks/use-keyboard-state";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { ERRORS } from "../../../utils/errors";
import ICONS from "../../../utils/icons";
import { PrimaryButton } from "../../buttons/primary-button";
import AmountInput from "../../input/amount-input";
import SelectInput from "../../input/select-input";
import Spacer from "../../spacer";
import DefaultText from "../../text/Text";
import ErrorText from "../../text/error-text";
import showToast from "../../toast";

type AddPaymentProps = {
  paymentMethod: string;
  amount: string;
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

export default function AddPayment({
  visible = false,
  handleClose,
  handleAdd,
}: {
  visible: boolean;
  handleClose: any;
  handleAdd: any;
}) {
  const theme = useTheme();
  const { hp, wp } = useResponsive();
  const isKeyboardVisible = checkKeyboardState();

  const formik: FormikProps<AddPaymentProps> = useFormik<AddPaymentProps>({
    initialValues: { paymentMethod: "", amount: "" },

    onSubmit: async (values) => {
      try {
        handleAdd({
          paymentMethod: values.paymentMethod,
          amount: values.amount,
        });
        showToast("success", t("Payment Created"));
      } catch (error: any) {
        showToast("error", ERRORS.SOMETHING_WENT_WRONG);
      }
    },

    validationSchema: Yup.object().shape({
      paymentMethod: Yup.string().required(t("Select payment method")),
      amount: Yup.string()
        .required(t("Amount is required"))
        .test(
          t("Is greater than 0?"),
          t("Amount must be greater than 0"),
          (value) => Number(value) > 0
        )
        .nullable(),
    }),
  });

  useEffect(() => {
    formik.resetForm();
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent={true}
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
            marginTop: isKeyboardVisible ? "-28%" : "0%",
            overflow: "hidden",
            width: hp("42%"),
            borderRadius: 16,
            paddingVertical: hp("2%"),
            backgroundColor: theme.colors.white[1000],
          }}
        >
          <View
            style={{
              paddingHorizontal: hp("2%"),
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <DefaultText style={{ fontSize: 20 }} fontWeight="medium">
              {t("New Payment")}
            </DefaultText>

            <TouchableOpacity onPress={() => handleClose()}>
              <ICONS.ClosedFilledIcon />
            </TouchableOpacity>
          </View>

          <View
            style={{
              marginTop: hp("1.25%"),
              marginBottom: hp("2%"),
              height: 1,
              backgroundColor: theme.colors.dividerColor.main,
            }}
          />

          <View style={{ paddingHorizontal: hp("2%") }}>
            <SelectInput
              containerStyle={{
                borderWidth: 0,
                backgroundColor: theme.colors.bgColor,
              }}
              label={`${t("PAYMENT METHOD")} *`}
              placeholderText={t("Select Payment Method")}
              options={paymentMethodOptions}
              allowSearch={false}
              values={{
                key: formik.values.paymentMethod,
                value: Payment_Name[formik.values.paymentMethod],
              }}
              handleChange={(val: any) => {
                if (val.key) {
                  formik.setFieldValue("paymentMethod", val.key);
                }
              }}
            />
            <ErrorText
              errors={
                (formik.errors.paymentMethod &&
                  formik.touched.paymentMethod) as Boolean
              }
              title={formik.errors.paymentMethod || ""}
            />

            <Spacer space={hp("3%")} />

            <AmountInput
              containerStyle={{
                backgroundColor: theme.colors.bgColor,
              }}
              style={{ width: "100%" }}
              maxLength={8}
              label={`${t("AMOUNT")} (${t("in")} ${t("SAR")}) *`}
              placeholderText={`${t("SAR")} 0.00`}
              values={formik.values.amount}
              handleChange={(val: any) => {
                if (val.length > 2) {
                  showToast("info", t("Amount exceeds 3 digits"));
                }
                formik.setFieldValue("amount", val);
              }}
            />
            <ErrorText
              errors={
                (formik.errors.amount && formik.touched.amount) as Boolean
              }
              title={formik.errors.amount || ""}
            />

            <View
              style={{
                overflow: "hidden",
                marginVertical: hp("2%"),
                marginHorizontal: -wp("5%"),
                height: 1,
                backgroundColor: theme.colors.dividerColor.main,
              }}
            />

            <PrimaryButton
              style={{
                width: "100%",
                alignSelf: "center",
                paddingVertical: hp("2.25%"),
                paddingHorizontal: wp("1.8%"),
              }}
              textStyle={{
                fontSize: 16,
                fontWeight: theme.fontWeights.medium,
                fontFamily: theme.fonts.circulatStd,
              }}
              loading={formik.isSubmitting}
              title={t("Add Payment")}
              onPress={() => {
                formik.handleSubmit();
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
  container: {
    height: "100%",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});
