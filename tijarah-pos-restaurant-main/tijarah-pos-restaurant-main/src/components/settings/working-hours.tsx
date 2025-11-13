import { FormikProps, useFormik } from "formik";
import React, { useEffect } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import ICONS from "../../utils/icons";
import { PrimaryButton } from "../buttons/primary-button";
import DateInput from "../input/date-input";
import Spacer from "../spacer";
import DefaultText from "../text/Text";
import ErrorText from "../text/error-text";

type EditProfileProps = {
  startTime: Date;
  endTime: Date;
};

export default function WorkingHours({
  data,
  visible = false,
  handleClose,
  handleSubmit,
}: {
  data: any;
  visible: boolean;
  handleClose?: any;
  handleSubmit?: any;
}) {
  const theme = useTheme();

  const { hp, wp } = useResponsive();

  const formik: FormikProps<EditProfileProps> = useFormik<EditProfileProps>({
    initialValues: {
      startTime: undefined as any,
      endTime: undefined as any,
    },

    onSubmit: async (values) => {
      handleSubmit(values);
      handleClose();
    },

    validationSchema: Yup.object().shape({
      startTime: Yup.date()
        .required(t("Start Time is required"))
        .typeError(t("Start Time is required")),
      endTime: Yup.date()
        .required(t("End Time is required"))
        .typeError(t("End Time is required")),
    }),
  });

  useEffect(() => {
    formik.setValues({
      startTime: data.startTime,
      endTime: data.endTime,
    });
  }, [visible]);

  useEffect(() => {
    if (formik.values.startTime != null && formik.values.endTime == null) {
      const date = new Date();
      date.setHours(formik.values.startTime.getHours() + 10);
      date.setMinutes(formik.values.startTime.getMinutes());

      formik.setFieldValue("endTime", date);
    }
  }, [formik.values.startTime]);

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
            width: wp("35%"),
            borderRadius: 16,
            paddingVertical: hp("2.5%"),
            backgroundColor: theme.colors.white[1000],
          }}
        >
          <View
            style={{
              paddingHorizontal: wp("1.5%"),
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <DefaultText style={{ fontSize: 20 }} fontWeight="medium">
              {t("Working Hours")}
            </DefaultText>

            <TouchableOpacity onPress={() => handleClose()}>
              <ICONS.ClosedFilledIcon />
            </TouchableOpacity>
          </View>

          <View
            style={{
              marginTop: hp("1.5%"),
              marginBottom: hp("2%"),
              height: 1,
              backgroundColor: theme.colors.dividerColor.main,
            }}
          />

          <View style={{ paddingHorizontal: wp("1.5%") }}>
            <KeyboardAvoidingView
              enabled={true}
              behavior={"height"}
              keyboardVerticalOffset={Platform.OS == "ios" ? 50 : 20}
            >
              <ScrollView
                alwaysBounceVertical={false}
                showsVerticalScrollIndicator={false}
              >
                <DateInput
                  containerStyle={{ backgroundColor: theme.colors.bgColor }}
                  label={t("START TIME")}
                  placeholderText={t("Select start time")}
                  mode="time"
                  dateFormat="hh:mm a"
                  values={formik.values.startTime}
                  handleChange={(val: any) => {
                    // console.log("val", val);

                    formik.setFieldValue("startTime", val);
                  }}
                  rightIcon={false}
                />
                <ErrorText
                  errors={
                    ((formik.errors.startTime as any) &&
                      (formik.touched.startTime as any)) as Boolean
                  }
                  title={formik.errors.startTime || (null as any)}
                />

                <Spacer space={hp("2%")} />

                <DateInput
                  containerStyle={{ backgroundColor: theme.colors.bgColor }}
                  label={t("END TIME")}
                  placeholderText={t("Select end time")}
                  mode="time"
                  dateFormat="hh:mm a"
                  values={formik.values.endTime}
                  handleChange={(val: any) => {
                    formik.setFieldValue("endTime", val);
                  }}
                  rightIcon={false}
                  disabled={formik.values.startTime == null}
                />
                <ErrorText
                  errors={
                    (formik.errors.endTime && formik.touched.endTime) as Boolean
                  }
                  title={formik.errors.endTime || (null as any)}
                />
              </ScrollView>
            </KeyboardAvoidingView>

            <View
              style={{
                marginTop: hp("2%"),
                marginBottom: hp("2%"),
                marginHorizontal: -wp("1.5%"),
                height: 1,
                backgroundColor: theme.colors.dividerColor.main,
              }}
            />

            <PrimaryButton
              style={{
                width: "100%",
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
