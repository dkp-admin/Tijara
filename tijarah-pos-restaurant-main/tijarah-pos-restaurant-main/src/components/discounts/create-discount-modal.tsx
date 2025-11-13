import { FormikProps, useFormik } from "formik";
import React, { useContext, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import endpoint from "../../api/endpoints";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import { useResponsive } from "../../hooks/use-responsiveness";
import { queryClient } from "../../query-client";
import { AuthType } from "../../types/auth-types";
import ActionSheetHeader from "../action-sheet/action-sheet-header";
import AmountInput from "../input/amount-input";
import DateInput from "../input/date-input";
import Input from "../input/input";
import SelectInput from "../input/select-input";
import Spacer from "../spacer";
import ErrorText from "../text/error-text";
import showToast from "../toast";
import repository from "../../db/repository";
import { useCurrency } from "../../store/get-currency";

type CreateDiscountProps = {
  name: string;
  type: { value: string; key: string };
  isPercent: boolean;
  value: string;
  expiry: Date;
};

const typeOptions = [
  { value: "Fixed Percentage", key: "percent" },
  { value: "Fixed Amount", key: "amount" },
];

const typeName: any = {
  percent: "Fixed Percentage",
  amount: "Fixed Amount",
};

export default function CreateEditDiscountModal({
  data,
  visible = false,
  handleClose,
}: {
  data: any;
  visible: boolean;
  handleClose?: any;
}) {
  const theme = useTheme();
  const isConnected = checkInternet();
  const authContext = useContext<AuthType>(AuthContext);
  const { currency } = useCurrency();
  const nextDate = new Date();
  nextDate.setMonth(nextDate.getMonth() + 1);

  const [isEditing, setIsEditing] = useState(false);
  const [discountData, setDiscountData] = useState<any>(null);

  const { hp, twoPaneView } = useResponsive();

  const formik: FormikProps<CreateDiscountProps> =
    useFormik<CreateDiscountProps>({
      initialValues: {
        name: "",
        type: { value: "", key: "" },
        isPercent: false,
        value: "",
        expiry: nextDate,
      },

      onSubmit: async (values) => {
        const businessDetails: any = await repository.business.findByLocationId(
          authContext.user.locationRef
        );

        const dataObj = {
          code: values.name,
          discountType: values.type.key,
          discount: Number(values.value),
          expiry: values.expiry,
          companyRef: businessDetails.location.companyRef,
          company: { name: businessDetails.company.name.en },
        };

        try {
          const res = data.isAdd
            ? await serviceCaller(endpoint.couponAdd.path, {
                method: endpoint.couponAdd.method,
                body: { ...dataObj },
              })
            : await serviceCaller(
                `${endpoint.couponUpdate.path}/${discountData._id}`,
                {
                  method: endpoint.couponUpdate.method,
                  body: { ...dataObj },
                }
              );

          if (res !== null || res?.code === "success") {
            await queryClient.invalidateQueries("find-discount");

            handleClose();
            showToast(
              "success",
              data.isAdd
                ? t("Discount Added Successfully")
                : t("Discount Updated Successfully")
            );
          }
        } catch (err: any) {
          if (err?._err?.code === 500) {
            showToast("error", t("500_message"));
          } else if (err.code === "duplicate_record") {
            showToast("error", t("Discount name already exist"));
          } else {
            // showToast("error", err?.code || err?.message);
            showToast("error", t("500_message"));
          }
        }
      },

      validationSchema: Yup.object().shape({
        name: Yup.string().required(t("Discount Name is required")),
        type: Yup.object({
          value: Yup.string().required(t("Please Select Discount Type")),
          key: Yup.string().required(t("Please Select Discount Type")),
        })
          .required(t("Please Select Discount Type"))
          .nullable(),
        value: Yup.string()
          .when("isPercent", {
            is: true,
            then: Yup.string()
              .required(t("Discount value is required"))
              .test(
                t("Is positive?"),
                t("Discount value must not be greater than two digits"),
                (number) => String(number).length <= 2
              )
              .test(
                t("Is positive?"),
                t("Discount percent must be greater than 0"),
                (value) => Number(value) > 0
              ),
            otherwise: Yup.string()
              .optional()
              .test(
                t("Is positive?"),
                t("Discount value must be greater than 0"),
                (amount) => Number(amount) > 0
              ),
          })
          .nullable(),
        expiry: Yup.date()
          .required(t("Expiry Date is required"))
          .typeError(t("Expiry Date is required"))
          .nullable(),
      }),
    });

  useEffect(() => {
    if (visible) {
      formik.resetForm();
      setIsEditing(data.isAdd);

      if (!data.isAdd) {
        setDiscountData(data?.discount);
      }
    }
  }, [visible]);

  useEffect(() => {
    if (discountData !== null) {
      formik.setValues({
        name: discountData.code,
        type: {
          value: typeName[discountData.discountType],
          key: discountData.discountType,
        },
        isPercent: discountData.discountType === "percent",
        value:
          discountData.discountType === "percent"
            ? `${discountData.discount}`
            : `${Number(discountData.discount)?.toFixed(2)}`,
        expiry: discountData.expiry,
      });
    }
  }, [discountData]);

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
            title={data.isAdd ? t("Create a discount") : data?.title}
            rightBtnText={
              data.isAdd ? t("Create") : !isEditing ? t("Edit") : t("Save")
            }
            handleLeftBtn={() => {
              handleClose();
            }}
            handleRightBtn={() => {
              if (isEditing) {
                if (isConnected) {
                  formik.handleSubmit();
                } else {
                  if (data.isAdd) {
                    showToast("error", t("Discount can't be created offline"));
                  } else {
                    showToast("error", t("Discount can't be updated offline"));
                  }
                }
              } else {
                setIsEditing(true);
              }
            }}
            permission={authContext.permission["pos:coupon"]?.create}
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
              <View
                style={
                  twoPaneView
                    ? {
                        flexDirection: "row",
                        alignItems: "center",
                      }
                    : {
                        flexDirection: "column",
                      }
                }
              >
                <View style={{ flex: 1 }}>
                  <Input
                    style={{ width: "100%" }}
                    label={`${t("DISCOUNT NAME")} *`}
                    autoCapitalize="words"
                    placeholderText={`Ex. 10% Off On Clearance Items`}
                    values={formik.values.name}
                    handleChange={(val: any) => {
                      const sanitizedValue = val.replace(/\s/g, "");
                      formik.setFieldValue("name", sanitizedValue);
                    }}
                    maxLength={20}
                    disabled={!data.isAdd}
                  />
                  <ErrorText
                    errors={
                      (formik.errors.name && formik.touched.name) as Boolean
                    }
                    title={formik.errors.name || ""}
                  />
                </View>

                <Spacer space={hp("2%")} />

                <View style={{ flex: 1 }}>
                  <DateInput
                    label={`${t("EXPIRY DATE")} *`}
                    placeholderText={t("Select date")}
                    mode="date"
                    rightIcon={false}
                    dateFormat="dd/MM/yyyy"
                    minimumDate={new Date()}
                    values={formik.values.expiry}
                    handleChange={(val: any) => {
                      formik.setFieldValue("expiry", val);
                    }}
                    disabled={!isEditing}
                  />
                  <ErrorText
                    errors={
                      (formik.errors.expiry && formik.touched.expiry) as Boolean
                    }
                    title={formik.errors.expiry || (null as any)}
                  />
                </View>
              </View>

              <View
                style={
                  twoPaneView
                    ? {
                        marginTop: hp("3.75%"),
                        flexDirection: "row",
                        alignItems: "center",
                      }
                    : {
                        marginTop: hp("2%"),
                      }
                }
              >
                <View style={{ flex: 1 }}>
                  <SelectInput
                    label={`${t("DISCOUNT TYPE")} *`}
                    placeholderText={t("Select Discount Type")}
                    options={typeOptions}
                    allowSearch={false}
                    values={formik.values.type}
                    handleChange={(val: any) => {
                      if (val.key && val.value) {
                        formik.setFieldValue("type", val);
                        formik.setFieldValue("value", "");
                        formik.setFieldValue(
                          "isPercent",
                          val.key === "percent"
                        );
                      }
                    }}
                    containerStyle={{ borderWidth: 0 }}
                    disabled={!data.isAdd}
                  />
                  <ErrorText
                    errors={
                      (formik.errors.type?.value &&
                        formik.touched.type?.value) as Boolean
                    }
                    title={formik.errors.type?.value || ""}
                  />
                </View>

                <Spacer space={hp("2%")} />

                <View style={{ flex: 1 }}>
                  {formik.values.isPercent ? (
                    <Input
                      style={{ width: "93%" }}
                      label={`${t("DISCOUNT VALUE")} (${t("in")} %) *`}
                      placeholderText={t("Value")}
                      values={formik.values.value}
                      keyboardType="number-pad"
                      handleChange={(val: any) => {
                        if (/^[0-9\b]+$/.test(val) || val === "") {
                          formik.setFieldValue("value", val);
                        }
                      }}
                      disabled={!data.isAdd}
                    />
                  ) : (
                    <AmountInput
                      style={{ width: "93%" }}
                      label={`${t("DISCOUNT VALUE")} (${t(
                        "in"
                      )} ${currency}) *`}
                      maxLength={6}
                      placeholderText={`${currency} 0.00`}
                      values={formik.values.value}
                      handleChange={(val: any) => {
                        formik.setFieldValue("value", val);
                      }}
                      disabled={!data.isAdd}
                    />
                  )}
                  <ErrorText
                    errors={
                      (formik.errors.value && formik.touched.value) as Boolean
                    }
                    title={formik.errors.value || ""}
                  />
                </View>
              </View>

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
