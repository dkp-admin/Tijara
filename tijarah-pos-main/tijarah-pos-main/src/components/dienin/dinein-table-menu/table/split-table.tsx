import { FormikProps, useFormik } from "formik";
import React, { useEffect } from "react";
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
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import ActionSheetHeader from "../../../action-sheet/action-sheet-header";
import Input from "../../../input/input";
import Spacer from "../../../spacer";
import DefaultText from "../../../text/Text";
import ErrorText from "../../../text/error-text";
import showToast from "../../../toast";

type SplitProps = {
  capacity: number;
  splitOne: string;
  splitTwo: string;
};

const SplitTableModal = ({
  data,
  visible = false,
  handleClose,
  handleSubmit,
}: {
  data: any;
  visible: boolean;
  handleClose: any;
  handleSubmit: any;
}) => {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();

  const formik: FormikProps<SplitProps> = useFormik<SplitProps>({
    initialValues: { capacity: 0, splitOne: "", splitTwo: "" },

    onSubmit: async (values) => {
      if (Number(values.splitOne) >= formik.values.capacity) {
        showToast(
          "error",
          `${t("Split one value must be less than")} ${formik.values.capacity}`
        );
        return;
      }

      if (Number(values.splitTwo) >= formik.values.capacity) {
        showToast(
          "error",
          `${t("Split two value must be less than")} ${formik.values.capacity}`
        );
        return;
      } else if (
        Number(values.splitTwo) + Number(values.splitOne) !==
        formik.values.capacity
      ) {
        showToast(
          "error",
          `${t("Split two value must be less than")} ${values.splitOne}`
        );
        return;
      }

      try {
        handleSubmit(data, values.splitOne, values.splitTwo);
      } catch (error: any) {
        console.log(error);
      }
    },

    validationSchema: Yup.object().shape({
      splitOne: Yup.string()
        .required(t("Split One is required"))
        .min(1, t("Split one value should be minimum 1")),
      splitTwo: Yup.string()
        .required(t("Split Two is required"))
        .min(1, t("Split two value should be minimum 1")),
    }),
  });

  useEffect(() => {
    if (data) {
      formik.resetForm();
      formik.setFieldValue("capacity", data?.capacity);
    }
  }, [data]);

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
            title={t("Split Table")}
            rightBtnText={t("Split")}
            handleLeftBtn={() => handleClose()}
            handleRightBtn={() => formik.handleSubmit()}
            loading={formik.isSubmitting}
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
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <DefaultText fontSize="xl">{`${t("Split")} `}</DefaultText>

                <DefaultText
                  fontSize="xl"
                  fontWeight="medium"
                  color="primary.1000"
                >
                  {data?.label}
                </DefaultText>
              </View>

              <Spacer space={hp("4%")} />

              <Input
                style={{ width: "100%" }}
                keyboardType="number-pad"
                label={`${t("SPLIT ONE")}`}
                placeholderText={t("Enter split one value")}
                values={formik.values.splitOne}
                handleChange={(val: any) => {
                  if (/^[0-9\b]+$/.test(val) || val === "") {
                    formik.setFieldValue("splitOne", val);
                    formik.setFieldValue(
                      "splitTwo",
                      `${
                        formik.values.capacity - Number(val) ===
                        formik.values.capacity
                          ? ""
                          : formik.values.capacity - Number(val)
                      }`
                    );
                  }
                }}
              />
              <ErrorText
                errors={
                  (formik.errors.splitOne && formik.touched.splitOne) as Boolean
                }
                title={formik.errors.splitOne || ""}
              />

              <Spacer space={hp("3.25%")} />

              <Input
                style={{ width: "100%" }}
                keyboardType="number-pad"
                label={`${t("SPLIT TWO")}`}
                placeholderText={t("Enter split two value")}
                values={formik.values.splitTwo}
                handleChange={(val: any) => {
                  if (/^[0-9\b]+$/.test(val) || val === "") {
                    formik.setFieldValue("splitTwo", val);
                  }
                }}
                disabled={formik.values.splitOne === ""}
              />
              <ErrorText
                errors={
                  (formik.errors.splitTwo && formik.touched.splitTwo) as Boolean
                }
                title={formik.errors.splitTwo || ""}
              />

              <Spacer space={hp("12%")} />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>

      <Toast />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { overflow: "hidden", height: "100%" },
  card_view: {
    elevation: 100,
    marginTop: "3%",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  textInput: { flex: 0.99, marginRight: -16 },
  item_row: {
    paddingVertical: 18,
    paddingHorizontal: 26,
    flexDirection: "row",
    alignItems: "center",
  },
});

export default SplitTableModal;
