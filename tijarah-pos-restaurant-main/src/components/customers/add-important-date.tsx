import { FormikProps, useFormik } from "formik";
import React, { useEffect } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import ICONS from "../../utils/icons";
import { PrimaryButton } from "../buttons/primary-button";
import DateInput from "../input/date-input";
import Input from "../input/input";
import Spacer from "../spacer";
import ErrorText from "../text/error-text";
import DefaultText from "../text/Text";
import showToast from "../toast";
import generateUniqueID from "../../utils/generate-unique-id";
import { checkKeyboardState } from "../../hooks/use-keyboard-state";

type AddImpDateProps = {
  name: string;
  date: Date;
};

export default function AddImportantDate({
  visible = false,
  handleClose,
  handleAdd,
}: {
  visible: boolean;
  handleClose?: any;
  handleAdd?: any;
}) {
  const theme = useTheme();
  const isKeyboardVisible = checkKeyboardState();

  const { hp, wp } = useResponsive();

  const formik: FormikProps<AddImpDateProps> = useFormik<AddImpDateProps>({
    initialValues: {
      name: "",
      date: undefined as any,
    },

    onSubmit: async (values) => {
      showToast("success", t("Important Date Added"));
      handleAdd({
        _id: generateUniqueID(16),
        name: values.name,
        date: values.date,
      });
      handleClose();
    },

    validationSchema: Yup.object().shape({
      name: Yup.string().required(t("Name is required")),
      date: Yup.date()
        .required(t("Date is required"))
        .typeError(t("Date is required")),
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
              {t("Add Important Date")}
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
            <Input
              containerStyle={{ backgroundColor: theme.colors.bgColor }}
              style={{ width: "100%" }}
              label={t("NAME")}
              maxLength={30}
              autoCapitalize="words"
              placeholderText={t("Enter name")}
              values={formik.values.name}
              handleChange={(val: any) => formik.setFieldValue("name", val)}
            />
            <ErrorText
              errors={(formik.errors.name && formik.touched.name) as Boolean}
              title={formik.errors.name || ""}
            />

            <Spacer space={hp("2%")} />

            <DateInput
              containerStyle={{ backgroundColor: theme.colors.bgColor }}
              label={t("DATE")}
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
            <ErrorText
              errors={(formik.errors.date && formik.touched.date) as Boolean}
              title={formik.errors.date || (null as any)}
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
              title={t("Submit")}
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
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
});
