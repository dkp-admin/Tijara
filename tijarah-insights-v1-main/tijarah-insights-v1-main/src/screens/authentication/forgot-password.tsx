import { useNavigation } from "@react-navigation/native";
import { FormikProps, useFormik } from "formik";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import * as Yup from "yup";
import { t } from "../../../i18n";
import { BackButton } from "../../components/buttons/back-button";
import { PrimaryButton } from "../../components/buttons/primary-button";
import PhoneInput from "../../components/input/phone-input";
import Spacer from "../../components/spacer";
import DefaultText, { getOriginalSize } from "../../components/text/Text";
import ErrorText from "../../components/text/error-text";
import showToast from "../../components/toast";
import { useTheme } from "../../context/theme-context";
import { useAuth } from "../../hooks/use-auth";
import { useResponsive } from "../../hooks/use-responsiveness";
import parsePhoneNumber from "../../utils/parse-phone-number";

type ForgotPasswordProps = {
  phone: string;
};

const ForgotPassword = () => {
  const theme = useTheme();
  const { sendOTP } = useAuth();
  const { wp, hp } = useResponsive();
  const navigation = useNavigation<any>();

  const [countryCode, setCountryCode] = useState("+966");

  const formik: FormikProps<ForgotPasswordProps> =
    useFormik<ForgotPasswordProps>({
      initialValues: { phone: "" },

      onSubmit: async (values) => {
        try {
          const res = await sendOTP(
            parsePhoneNumber(countryCode, values.phone)
          );

          if (res?.code === "otp_sent") {
            navigation.navigate("ResetPassword", {
              phone: parsePhoneNumber(countryCode, values.phone),
            });
          }
        } catch (error: any) {
          showToast("error", error.message);
        }
      },

      validationSchema: Yup.object().shape({
        phone: Yup.string()
          .min(9, t("Phone Number should be of minimum 9 digits"))
          .max(12, t("Phone Number should be of maximum 12 digits"))
          .required(t("Phone number is required")),
      }),
    });

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
        keyboardVerticalOffset={getOriginalSize(60)}
      >
        <ScrollView
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
        >
          <Spacer space={hp("3%")} />

          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <DefaultText fontWeight="bold" fontSize="3xl">
              {t("Forgot your password?")}
            </DefaultText>

            <DefaultText
              style={{ marginTop: getOriginalSize(10) }}
              fontWeight="medium"
              color="text.secondary"
            >
              {t(
                "Enter the phone number you use to sign-in to Tijarah360 Platform"
              )}
            </DefaultText>
          </View>

          <Spacer space={hp("6%")} />

          <PhoneInput
            placeholderText={t("Phone Number")}
            handleChange={(val: any) => formik.handleChange("phone")(val)}
            handleBlur={formik.handleBlur("phone")}
            values={formik.values.phone}
            selectedCountryCode={countryCode}
            handleCountryCode={(code: string) => setCountryCode(code)}
          />
          <ErrorText
            errors={(formik.errors.phone && formik.touched.phone) as Boolean}
            title={formik.errors.phone || ""}
          />

          <Spacer space={hp("6%")} />

          <PrimaryButton
            title={t("Continue")}
            loading={formik.isSubmitting}
            onPress={formik.handleSubmit}
          />

          <Spacer space={hp("12%")} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ForgotPassword;
