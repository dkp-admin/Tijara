import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { FormikProps, useFormik } from "formik";
import React, { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import * as Yup from "yup";
import { t } from "../../../i18n";
import { PrimaryButton } from "../../components/buttons/primary-button";
import PasswordInput from "../../components/input/password-input";
import PhoneInput from "../../components/input/phone-input";
import { langFlags } from "../../components/language-selection/language-row";
import Spacer from "../../components/spacer";
import DefaultText, { getOriginalSize } from "../../components/text/Text";
import ErrorText from "../../components/text/error-text";
import showToast from "../../components/toast";
import { useTheme } from "../../context/theme-context";
import { useAuth } from "../../hooks/use-auth";
import { checkDirection } from "../../hooks/use-direction-check";
import { useResponsive } from "../../hooks/use-responsiveness";
import { langs } from "../../utils/Constants";
import DB from "../../utils/DB";
import { DBKeys } from "../../utils/DBKeys";
import { ERRORS } from "../../utils/errors";

type LoginProps = {
  phone: string;
  password: string;
};

const env = Constants.expoConfig?.extra?.env || "development";

const Login = () => {
  const theme = useTheme();
  const { login } = useAuth();
  const isRTL = checkDirection();
  const { wp, hp } = useResponsive();
  const navigation = useNavigation<any>();

  const [selected, setSelected] = useState(langs[0]);
  const [countryCode, setCountryCode] = useState("+966");

  const formik: FormikProps<LoginProps> = useFormik<LoginProps>({
    initialValues: { phone: "", password: "" },

    onSubmit: async (values) => {
      try {
        await login(countryCode + "-" + values.phone, values.password);
      } catch (error: any) {
        if (error?.code == "not_found") {
          showToast("error", t(ERRORS.USER_NOT_FOUND));
        } else if (error?.code == "bad_password") {
          showToast("error", t(ERRORS.INVALID_PASSWORD));
        } else {
          showToast("error", t("Login Failed!"), error.message);
        }
      }
    },

    validationSchema: Yup.object().shape({
      phone: Yup.string()
        .min(9, t("Phone Number should be of minimum 9 digits"))
        .max(12, t("Phone Number should be of maximum 12 digits"))
        .required(t("Phone number is required")),
      password: Yup.string().required(t("Password is required")),
    }),
  });

  const redirectToTijarahWeb = async () => {
    let url;

    if (env === "production") {
      url = `https://app.tijarah360.com/authentication/register`;
    } else if (env === "qa") {
      url = `https://tijarah-qa.vercel.app/authentication/register`;
    } else {
      url = `https://tijarah.vercel.app/authentication/register`;
    }

    await WebBrowser.openBrowserAsync(url);
  };

  useEffect(() => {
    (async () => {
      const lang = (await DB.retrieveData(DBKeys.LANG || "en")) as string;

      const selectedLang = langs.find((language) => language.code == lang);

      setSelected(selectedLang as any);
    })();
  }, []);

  useEffect(() => {
    formik.resetForm();
  }, []);

  return (
    <View
      style={{
        ...styles.container,
        paddingTop: hp("12%"),
        paddingHorizontal: wp("6%"),
        backgroundColor: theme.colors.bgColor,
      }}
    >
      <KeyboardAvoidingView
        enabled={true}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={getOriginalSize(40)}
      >
        <ScrollView
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
        >
          <DefaultText fontWeight="bold" fontSize="3xl">
            {t("Login")}
          </DefaultText>

          <DefaultText
            style={{ marginTop: getOriginalSize(10) }}
            color="text.secondary"
          >
            {t("Sign in with your Tijarah360 credentials")}
          </DefaultText>

          <Spacer space={hp("8%")} />

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

          <Spacer space={hp("3.5%")} />

          <PasswordInput
            placeholderText={t("Password")}
            handleChange={(val: any) => formik.handleChange("password")(val)}
            handleBlur={formik.handleBlur("password")}
            values={formik.values.password}
          />
          <ErrorText
            errors={
              (formik.errors.password && formik.touched.password) as Boolean
            }
            title={formik.errors.password || ""}
          />

          <Spacer space={getOriginalSize(12)} />

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => {
              navigation.navigate("ForgotPassword");
            }}
          >
            <DefaultText
              // style={{ textAlign: "left" }}
              fontWeight="medium"
              fontSize="md"
              color="text.secondary"
            >
              {t("Forgot Password?")}
            </DefaultText>
          </TouchableOpacity>

          <Spacer space={hp("3.5%")} />

          <PrimaryButton
            loading={formik.isSubmitting}
            onPress={formik.handleSubmit}
            title={t("Login")}
          />

          <Spacer space={hp("3.5%")} />

          <View style={styles.signupView}>
            <DefaultText
              fontSize="lg"
              color="#9CA3AF"
              style={{ textAlign: "center" }}
            >
              {t("Don't have an account?")}
            </DefaultText>

            <TouchableOpacity
              style={{ marginLeft: getOriginalSize(5) }}
              onPress={() => {
                redirectToTijarahWeb();
              }}
            >
              <DefaultText
                style={{ textAlign: "center" }}
                fontSize="lg"
                fontWeight="medium"
                color="primary.1000"
              >
                {t("Signup")}
              </DefaultText>
            </TouchableOpacity>
          </View>

          <Spacer space={hp("7%")} />

          <TouchableOpacity
            style={styles.row_container_selected}
            onPress={() => {
              navigation.push("LanguageSelection", { isNavigate: true });
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                key={selected?.code}
                style={styles.avatarStyle}
                source={langFlags[selected?.code]}
              />

              <DefaultText
                style={styles.languageCode}
                fontWeight="semibold"
                color="text.secondary"
              >
                {selected?.code}
              </DefaultText>

              <DefaultText fontWeight="semibold" color="text.secondary">
                {selected?.name}
              </DefaultText>
            </View>

            <AntDesign
              style={{ justifyContent: "flex-end" }}
              key={"right-icon"}
              name={isRTL ? "left" : "right"}
              size={getOriginalSize(20)}
              color={theme.colors.primary[1000]}
            />
          </TouchableOpacity>

          <Spacer space={hp("12%")} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  forgotPassword: {
    marginLeft: getOriginalSize(5),
    display: "flex",
    flexDirection: "row-reverse",
    backgroundColor: "transparent",
  },
  signupView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  row_container_selected: {
    borderRadius: getOriginalSize(12),
    paddingVertical: getOriginalSize(10),
    paddingHorizontal: getOriginalSize(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#006C350D",
  },
  avatarStyle: { height: getOriginalSize(45), width: getOriginalSize(45) },
  languageCode: {
    marginLeft: getOriginalSize(16),
    marginRight: getOriginalSize(10),
    textTransform: "uppercase",
  },
});

export default Login;
