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
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { checkKeyboardState } from "../../../../hooks/use-keyboard-state";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import ICONS from "../../../../utils/icons";
import { PrimaryButton } from "../../../buttons/primary-button";
import Input from "../../../input/input";
import Spacer from "../../../spacer";
import DefaultText from "../../../text/Text";
import ErrorText from "../../../text/error-text";
import showToast from "../../../toast";

type SpecialInstructionModalProps = {
  specialInstruction: string;
};

const SpecialInstructionModal = ({
  data,
  visible = false,
  handleClose,
  handleSuccess,
}: {
  data: string;
  visible: boolean;
  handleClose: any;
  handleSuccess: any;
}) => {
  const theme = useTheme();
  const isKeyboardVisible = checkKeyboardState();
  const { hp, wp, twoPaneView } = useResponsive();

  const formik: FormikProps<SpecialInstructionModalProps> =
    useFormik<SpecialInstructionModalProps>({
      initialValues: {
        specialInstruction: "",
      },

      onSubmit: (values) => {
        handleSuccess(values.specialInstruction);
        showToast(
          "success",
          data
            ? t("Special Instruction updated")
            : t("Special Instruction added")
        );
      },

      validationSchema: Yup.object().shape({
        specialInstruction: Yup.string().required(
          t("Special Instruction is required")
        ),
      }),
    });

  useEffect(() => {
    if (visible) {
      formik.setValues({
        specialInstruction: data,
      });
    }
  }, [visible, data]);

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
          marginTop: isKeyboardVisible ? "-12%" : "0%",
          backgroundColor: theme.colors.transparentBg,
        }}
      >
        <View
          style={{
            overflow: "hidden",
            width: twoPaneView ? hp("60%") : hp("42%"),
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
              {t("Special Instruction")}
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
            <KeyboardAvoidingView
              enabled={true}
              behavior={"height"}
              keyboardVerticalOffset={Platform.OS == "ios" ? 50 : 20}
            >
              <ScrollView
                alwaysBounceVertical={false}
                showsVerticalScrollIndicator={false}
              >
                <Input
                  containerStyle={{
                    height: hp("16%"),
                    backgroundColor: theme.colors.bgColor,
                  }}
                  style={{ width: "100%", height: 100 }}
                  label=""
                  autoCapitalize="sentences"
                  multiline={true}
                  numOfLines={10}
                  maxLength={70}
                  placeholderText={t("Enter special instruction")}
                  values={formik.values.specialInstruction}
                  handleChange={(val: any) =>
                    formik.setFieldValue("specialInstruction", val)
                  }
                />
                <ErrorText
                  errors={
                    (formik.errors.specialInstruction &&
                      formik.touched.specialInstruction) as Boolean
                  }
                  title={formik.errors.specialInstruction || ""}
                />
              </ScrollView>
            </KeyboardAvoidingView>

            <View
              style={{
                marginTop: hp("2.5%"),
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {data && (
                <PrimaryButton
                  style={{
                    flex: 1,
                    paddingVertical: hp("2%"),
                    paddingHorizontal: wp("1.8%"),
                    backgroundColor: "#F0443833",
                  }}
                  textStyle={{
                    fontSize: 16,
                    color: theme.colors.red.default,
                    fontWeight: theme.fontWeights.medium,
                    fontFamily: theme.fonts.circulatStd,
                  }}
                  title={t("Remove")}
                  onPress={() => {
                    handleSuccess("");
                    showToast("success", t("Special Instruction removed"));
                  }}
                />
              )}

              {data && <Spacer space={hp("2.5%")} />}

              <PrimaryButton
                style={{
                  flex: 1,
                  marginHorizontal: data ? "0%" : "25%",
                  paddingVertical: hp("2%"),
                  paddingHorizontal: wp("1.8%"),
                }}
                textStyle={{
                  fontSize: 16,
                  fontWeight: theme.fontWeights.medium,
                  fontFamily: theme.fonts.circulatStd,
                }}
                title={data ? t("Update") : t("Add")}
                onPress={() => {
                  formik.handleSubmit();
                }}
              />
            </View>
          </View>
        </View>
      </View>

      <Toast />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default SpecialInstructionModal;
