import { FormikProps, useFormik } from "formik";
import React, { useContext, useEffect } from "react";
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
import { EventRegister } from "react-native-event-listeners";
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import { useResponsive } from "../../hooks/use-responsiveness";
import { AuthType } from "../../types/auth-types";
import EntityNames from "../../types/entity-name";
import ICONS from "../../utils/icons";
import ActionSheetHeader from "../action-sheet/action-sheet-header";
import ImageUploader from "../image-uploader";
import AmountInput from "../input/amount-input";
import DateInput from "../input/date-input";
import Input from "../input/input";
import Spacer from "../spacer";
import DefaultText from "../text/Text";
import ErrorText from "../text/error-text";
import showToast from "../toast";

type CustomerPayCreditProps = {
  type: string;
  amount: string;
  cardNum: string;
  transferNum: string;
  date: Date;
  attachmentUrl: string;
  note: string;
};

export default function CustomerPayCredit({
  visible = false,
  data,
  handleClose,
  handleSuccess,
}: {
  visible: boolean;
  data: any;
  handleClose: any;
  handleSuccess: any;
}) {
  const theme = useTheme();
  const isConnected = checkInternet();
  const { wp, hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);

  const formik: FormikProps<CustomerPayCreditProps> =
    useFormik<CustomerPayCreditProps>({
      initialValues: {
        type: "",
        amount: "",
        cardNum: "",
        transferNum: "",
        date: undefined as any,
        attachmentUrl: "",
        note: "",
      },

      onSubmit: async (values) => {
        try {
          const res = await serviceCaller(`/credit/receive-payment`, {
            method: "POST",
            body: {
              customerRef: data?.customerRef,
              customer: {
                name: data?.customerName,
              },
              companyRef: data?.companyRef,
              company: {
                name: data?.companyName,
              },
              paymentMethod: values.type,
              amount: Number(values.amount || 0),
              dueAmount: Number(data?.amount) - Number(values.amount || 0),
              payableAmount: data?.amount,
              transactionType: "credit",
              cardNumber:
                values.type === "accountTransfer"
                  ? values.transferNum
                  : values.type === "card"
                  ? values.cardNum
                  : "",
              transferDate: values.date,
              fileUrl: values.attachmentUrl,
              description: values.note,
            },
          });

          if (res) {
            EventRegister.emit("sync:enqueue", {
              entityName: EntityNames.CustomerPull,
            });

            showToast("success", t("Payment received successfully"));

            handleSuccess();
          }
        } catch (err: any) {
          showToast("error", err.message);
        }
      },

      validationSchema: Yup.object({
        type: Yup.string().required(t("Payment type selection is required")),
        amount: Yup.string()
          .required(t("Amount is required"))
          .test(
            t("Is greater than 0?"),
            t("Amount must be greater than 0"),
            (value) => Number(value) > 0
          )
          .test(
            t("Is valid amount?"),
            t("Amount should be less than payable amount"),
            (value) => Number(value) <= Number(data?.amount)
          )
          .nullable(),
      }),
    });

  const showMargin = (): string => {
    const payableAmount = Number(data?.amount);
    const amount = Number(formik.values.amount);

    if (payableAmount && amount) {
      const marginAmount = payableAmount - amount;

      return `${t("SAR")} ${marginAmount.toFixed(2)}`;
    } else {
      return `${t("SAR")} ${payableAmount.toFixed(2)}`;
    }
  };

  useEffect(() => {
    formik.resetForm();
    formik.setFieldValue("amount", `${data?.amount}` || "");
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
            title={data?.customerName}
            rightBtnText={t("Receive Payment")}
            handleLeftBtn={() => handleClose()}
            loading={formik.isSubmitting}
            handleRightBtn={() => {
              if (!isConnected) {
                showToast("info", t("Please connect with internet"));
                return;
              }
              formik.handleSubmit();
            }}
            permission={authContext.permission["pos:customer-credit"]?.pay}
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
              <Input
                style={{ width: "100%" }}
                label={t("CUSTOMER NAME")}
                placeholderText={t("Customer name")}
                values={data?.customerName}
                handleChange={() => {}}
                disabled
              />

              <Spacer space={hp("2.5%")} />

              <Input
                style={{ width: "100%" }}
                label={t("PAYABLE AMOUNT")}
                placeholderText={t("Payable Amount")}
                values={`${t("SAR")} ${data?.amount?.toFixed(2)}`}
                handleChange={() => {}}
                disabled
              />

              <View
                style={{
                  marginTop: hp("3%"),
                  marginLeft: hp("1.75%"),
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  style={{
                    maxWidth: "25%",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                  onPress={() => {
                    formik.resetForm();
                    formik.setFieldValue("type", "cash");
                    formik.setFieldValue("amount", `${data?.amount}` || "");
                  }}
                >
                  <Checkbox
                    isChecked={formik.values.type == "cash"}
                    fillColor={theme.colors.white[1000]}
                    unfillColor={theme.colors.white[1000]}
                    iconComponent={
                      formik.values.type == "cash" ? (
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

                  <DefaultText fontSize="xl">{t("Cash")}</DefaultText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    maxWidth: "25%",
                    marginLeft: hp("4%"),
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                  onPress={() => {
                    formik.resetForm();
                    formik.setFieldValue("type", "card");
                    formik.setFieldValue("amount", `${data?.amount}` || "");
                  }}
                >
                  <Checkbox
                    isChecked={formik.values.type == "card"}
                    fillColor={theme.colors.white[1000]}
                    unfillColor={theme.colors.white[1000]}
                    iconComponent={
                      formik.values.type == "card" ? (
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

                  <DefaultText fontSize="xl">{t("Card")}</DefaultText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    maxWidth: "50%",
                    marginLeft: hp("4%"),
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                  onPress={() => {
                    formik.resetForm();
                    formik.setFieldValue("type", "accountTransfer");
                    formik.setFieldValue("amount", `${data?.amount}` || "");
                  }}
                >
                  <Checkbox
                    isChecked={formik.values.type == "accountTransfer"}
                    fillColor={theme.colors.white[1000]}
                    unfillColor={theme.colors.white[1000]}
                    iconComponent={
                      formik.values.type == "accountTransfer" ? (
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

                  <DefaultText fontSize="xl">{t("A/C Transfer")}</DefaultText>
                </TouchableOpacity>
              </View>

              <ErrorText
                errors={(formik.errors.type && formik.touched.type) as Boolean}
                title={formik.errors.type || ""}
              />

              {formik.values.type === "card" && (
                <View>
                  <Spacer space={hp("2.5%")} />

                  <Input
                    style={{ width: "100%" }}
                    label={t("CARD NUMBER")}
                    keyboardType={"number-pad"}
                    placeholderText={t("Enter Card Number")}
                    values={formik.values.cardNum}
                    handleChange={(val: any) => {
                      if (val === "" || /^[0-9\b]+$/.test(val)) {
                        formik.setFieldValue("cardNum", val);
                      }
                    }}
                  />
                </View>
              )}

              {formik.values.type === "accountTransfer" && (
                <View>
                  <Spacer space={hp("2.5%")} />

                  <Input
                    style={{ width: "100%" }}
                    label={t("TRANSFER NUMBER")}
                    keyboardType={"number-pad"}
                    placeholderText={t("Enter Transfer Number")}
                    values={formik.values.transferNum}
                    handleChange={(val: any) => {
                      if (val === "" || /^[0-9\b]+$/.test(val)) {
                        formik.setFieldValue("transferNum", val);
                      }
                    }}
                  />
                </View>
              )}

              {formik.values.type &&
                formik.values.type !== "accountTransfer" && (
                  <View>
                    <Spacer space={hp("2.5%")} />

                    <AmountInput
                      maxLength={5}
                      style={{ width: "100%" }}
                      label={`${t("Amount (in SAR)")} *`}
                      placeholderText={t("Enter amount")}
                      values={formik.values.amount}
                      handleChange={(val: any) => {
                        formik.setFieldValue("amount", val);
                      }}
                    />

                    <ErrorText
                      errors={
                        (formik.errors.amount &&
                          formik.touched.amount) as Boolean
                      }
                      title={formik.errors.amount || ""}
                    />

                    <Spacer space={hp("2.5%")} />

                    <Input
                      style={{ width: "100%" }}
                      label={t("DUE AMOUNT")}
                      placeholderText={""}
                      values={showMargin()}
                      handleChange={() => {}}
                      disabled
                    />
                  </View>
                )}

              {formik.values.type === "accountTransfer" && (
                <View>
                  <Spacer space={hp("2.5%")} />

                  {twoPaneView ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <View style={{ width: "68%" }}>
                        <AmountInput
                          maxLength={5}
                          style={{ width: "100%" }}
                          label={`${t("Amount (in SAR)")} *`}
                          placeholderText={t("Enter amount")}
                          values={formik.values.amount}
                          handleChange={(val: any) => {
                            formik.setFieldValue("amount", val);
                          }}
                        />

                        <ErrorText
                          errors={
                            (formik.errors.amount &&
                              formik.touched.amount) as Boolean
                          }
                          title={formik.errors.amount || ""}
                        />

                        <Spacer space={hp("2.5%")} />

                        <Input
                          style={{ width: "100%" }}
                          label={t("DUE AMOUNT")}
                          placeholderText={""}
                          values={showMargin()}
                          handleChange={() => {}}
                          disabled
                        />
                      </View>

                      <View
                        style={{ marginLeft: wp("2%"), alignItems: "center" }}
                      >
                        <ImageUploader
                          picText={
                            formik.values.attachmentUrl
                              ? t("Change Attachment")
                              : t("Upload Attachment")
                          }
                          uploadedImage={formik.values.attachmentUrl}
                          handleImageChange={(uri: string) => {
                            formik.setFieldValue("attachmentUrl", uri);
                          }}
                        />
                      </View>
                    </View>
                  ) : (
                    <View>
                      <AmountInput
                        maxLength={5}
                        style={{ width: "100%" }}
                        label={`${t("Amount (in SAR)")} *`}
                        placeholderText={t("Enter amount")}
                        values={formik.values.amount}
                        handleChange={(val: any) => {
                          formik.setFieldValue("amount", val);
                        }}
                      />

                      <ErrorText
                        errors={
                          (formik.errors.amount &&
                            formik.touched.amount) as Boolean
                        }
                        title={formik.errors.amount || ""}
                      />

                      <Spacer space={hp("2.5%")} />

                      <Input
                        style={{ width: "100%" }}
                        label={t("DUE AMOUNT")}
                        placeholderText={""}
                        values={showMargin()}
                        handleChange={() => {}}
                        disabled
                      />

                      <Spacer space={hp("3%")} />

                      <View
                        style={{
                          alignItems: "center",
                          marginBottom: hp("1.5%"),
                        }}
                      >
                        <ImageUploader
                          picText={
                            formik.values.attachmentUrl
                              ? t("Change Attachment")
                              : t("Upload Attachment")
                          }
                          uploadedImage={formik.values.attachmentUrl}
                          handleImageChange={(uri: string) => {
                            formik.setFieldValue("attachmentUrl", uri);
                          }}
                        />
                      </View>
                    </View>
                  )}

                  <Spacer space={hp("2.5%")} />

                  <DateInput
                    label={t("TRANSFER DATE")}
                    placeholderText={t("Select date")}
                    mode="date"
                    rightIcon={false}
                    dateFormat="dd/MM/yyyy"
                    maximumDate={new Date()}
                    values={formik.values.date}
                    handleChange={(val: any) => {
                      formik.setFieldValue("date", val);
                    }}
                  />
                </View>
              )}

              {formik.values.type && (
                <View>
                  <Spacer space={hp("3%")} />

                  <Input
                    containerStyle={{ height: hp("15%") }}
                    label={t("NOTE")}
                    autoCapitalize="sentences"
                    placeholderText={t("Enter Note")}
                    multiline={true}
                    numOfLines={10}
                    maxLength={70}
                    values={formik.values.note}
                    handleChange={(val: string) => {
                      formik.setFieldValue("note", val);
                    }}
                  />
                </View>
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
