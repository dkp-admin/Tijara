import { useNavigation } from "@react-navigation/native";
import { FormikProps, useFormik } from "formik";
import { useRef } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import * as Yup from "yup";
import { t } from "../../../i18n";
import { BackButton } from "../../components/buttons/back-button";
import { PrimaryButton } from "../../components/buttons/primary-button";
import OTPTextView from "../../components/input/otp-input";
import PasswordInput from "../../components/input/password-input";
import Spacer from "../../components/spacer";
import DefaultText, { getOriginalSize } from "../../components/text/Text";
import ErrorText from "../../components/text/error-text";
import showToast from "../../components/toast";
import { useTheme } from "../../context/theme-context";
import { useAuth } from "../../hooks/use-auth";
import { useResponsive } from "../../hooks/use-responsiveness";
import { ERRORS } from "../../utils/errors";

type ResetPasswordProps = {
  otp: string;
  newPassword: string;
  repeatPassword: string;
};

const ResetPassword = (props: any) => {
  const theme = useTheme();
  const otpInput = useRef<any>();
  const { wp, hp } = useResponsive();
  const { passwordReset } = useAuth();
  const navigation = useNavigation<any>();
  const phone = (props?.route?.params?.phone as any) || "";

  const formik: FormikProps<ResetPasswordProps> = useFormik<ResetPasswordProps>(
    {
      initialValues: { otp: "", newPassword: "", repeatPassword: "" },

      onSubmit: async (values) => {
        try {
          const res = await passwordReset(
            phone,
            values.otp,
            values.newPassword
          );

          if (res?.code === "success") {
            navigation.navigate("AuthNavigator", {
              screen: "Login",
            });

            showToast("success", t("Password Reset Successfully"));
          }
        } catch (error: any) {
          if (error?.message == "user_not_found") {
            showToast("error", t(ERRORS.USER_NOT_FOUND));
          } else if (error?.code == "wrong_otp") {
            showToast("error", t(ERRORS.WRONG_OTP));
          } else if (error?._err?.statusCode == "500") {
            showToast("error", t(ERRORS.INTERNAL_SERVER_ERROR));
          } else {
            showToast("error", error.message);
          }
        }
      },

      validationSchema: Yup.object().shape({
        otp: Yup.string()
          .required(t("Verification Code is required"))
          .test(
            "len",
            t("Verification Code must be exactly 4 digits"),
            (val) => String(val).length === 4
          )
          .nullable(),
        newPassword: Yup.string()
          .min(8, t("New Password must be at least 8 characters"))
          .max(20)
          .required(t("New Password is required"))
          .matches(/^\S*$/, `${t("Password cannot contain spaces")}`),
        repeatPassword: Yup.string()
          .oneOf(
            [Yup.ref("newPassword"), null],
            t("Both Password must be match")
          )
          .required(t("Repeat Password is required"))
          .matches(/^\S*$/, `${t("Password cannot contain spaces")}`),
      }),
    }
  );

  return (
    <View
      style={{
        flex: 1,
        paddingTop: hp("3%"),
        paddingHorizontal: wp("6%"),
        backgroundColor: theme.colors.bgColor,
      }}
    >
      <BackButton
        onPress={() => {
          navigation.pop();
        }}
      />

      <KeyboardAvoidingView
        enabled={true}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={getOriginalSize(40)}
      >
        <ScrollView
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps={"always"}
        >
          <Spacer space={hp("1.5%")} />

          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <DefaultText fontWeight="bold" fontSize="3xl">
              {t("Password Reset")}
            </DefaultText>

            <DefaultText
              style={{
                marginTop: getOriginalSize(10),
                marginBottom: getOriginalSize(5),
              }}
              fontWeight="medium"
              color="text.secondary"
            >
              {t("Please enter the code received on")}
            </DefaultText>

            <DefaultText fontWeight="medium" color="text.primary">
              {phone}
            </DefaultText>
          </View>

          <Spacer space={hp("4%")} />

          <OTPTextView
            //@ts-ignore
            textInputStyle={{
              flexDirection: "row",
              fontSize: theme.fontSizes["4xl"],
              fontWeight: theme.fontWeights.extrabold,
              backgroundColor: theme.colors.bgColor2,
            }}
            ref={otpInput}
            inputCount={4}
            inputCellLength={1}
            offTintColor={"#252528"}
            tintColor={theme.colors.primary[1000]}
            handleTextChange={(text: string) =>
              formik.handleChange("otp")(text)
            }
          />
          <ErrorText
            errors={(formik.errors.otp && formik.touched.otp) as Boolean}
            title={formik.errors.otp || ""}
          />

          <Spacer space={hp("3%")} />

          <PasswordInput
            placeholderText={t("New Password")}
            values={formik.values.newPassword}
            handleBlur={formik.handleBlur("newPassword")}
            handleChange={(val: any) => formik.handleChange("newPassword")(val)}
          />
          <ErrorText
            errors={
              (formik.errors.newPassword &&
                formik.touched.newPassword) as Boolean
            }
            title={formik.errors.newPassword || ""}
          />

          <Spacer space={hp("3%")} />

          <PasswordInput
            placeholderText={t("Repeat Password")}
            values={formik.values.repeatPassword}
            handleBlur={formik.handleBlur("repeatPassword")}
            handleChange={(val: any) =>
              formik.handleChange("repeatPassword")(val)
            }
          />
          <ErrorText
            errors={
              (formik.errors.repeatPassword &&
                formik.touched.repeatPassword) as Boolean
            }
            title={formik.errors.repeatPassword || ""}
          />

          <Spacer space={hp("6%")} />

          <PrimaryButton
            title={t("Reset Password")}
            loading={formik.isSubmitting}
            onPress={formik.handleSubmit}
          />

          <Spacer space={hp("12%")} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ResetPassword;
