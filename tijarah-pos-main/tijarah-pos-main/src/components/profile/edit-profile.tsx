import { FormikProps, useFormik } from "formik";
import React, { useContext, useEffect, useState } from "react";
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
import serviceCaller from "../../api";
import endpoint from "../../api/endpoints";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import { checkKeyboardState } from "../../hooks/use-keyboard-state";
import { useResponsive } from "../../hooks/use-responsiveness";
import MMKVDB from "../../utils/DB-MMKV";
import { DBKeys } from "../../utils/DBKeys";
import { getErrorMsg } from "../../utils/common-error-msg";
import { repo } from "../../utils/createDatabaseConnection";
import ICONS from "../../utils/icons";
import { debugLog, errorLog, infoLog } from "../../utils/log-patch";
import { PrimaryButton } from "../buttons/primary-button";
import Input from "../input/input";
import Spacer from "../spacer";
import DefaultText from "../text/Text";
import ErrorText from "../text/error-text";
import showToast from "../toast";

type EditProfileProps = {
  name: string;
  email: string;
};

const EditProfile = ({
  visible = false,
  handleClose,
}: {
  visible: boolean;
  handleClose?: any;
}) => {
  const theme = useTheme();
  const isConnected = checkInternet();
  const isKeyboardVisible = checkKeyboardState();
  const authContext = useContext(AuthContext) as any;

  const { hp, wp } = useResponsive();

  const [loading, setLoading] = useState(false);

  const formik: FormikProps<EditProfileProps> = useFormik<EditProfileProps>({
    initialValues: {
      name: "",
      email: "",
    },

    onSubmit: async (values) => {
      if (isConnected) {
        setLoading(true);

        try {
          const data = { name: values.name, email: values.email };

          const res = await serviceCaller(
            `${endpoint.updateUser.path}/${authContext.user._id}`,
            {
              method: endpoint.updateUser.method,
              body: { ...data },
            }
          );

          if (res) {
            debugLog(
              "Profile Updated",
              res,
              "edit-profile-modal",
              "handleSubmitFunction"
            );
            MMKVDB.remove(DBKeys.USER);
            MMKVDB.set(DBKeys.USER, res);

            await repo.user.update(
              { _id: authContext.user._id },
              {
                ...data,
                _id: authContext.user._id,
                value: `${values?.name} (${res.phone})`,
              }
            );

            debugLog(
              "Updated user profile to db",
              {
                ...data,
                _id: authContext.user._id,
                value: `${values?.name} (${res.phone})`,
              },
              "edit-profile-modal",
              "handleSubmitFunction"
            );

            authContext.login({
              ...authContext.user,
              name: values?.name,
              email: values?.email,
            });

            showToast("success", t("Profile Updated"));
            handleClose();
          }
        } catch (error: any) {
          errorLog(
            error?.message,
            authContext.user,
            "edit-profile-modal",
            "handleSubmitFunction",
            error
          );
          showToast("error", getErrorMsg("user", "update"));
        } finally {
          setLoading(false);
        }
      } else {
        infoLog(
          "Internet not connected",
          { name: values.name, email: values.email },
          "edit-profile-modal",
          "handleSubmitFunction"
        );
        showToast("error", t("Please connect with internet for user update"));
      }
    },

    validationSchema: Yup.object().shape({
      name: Yup.string().required(t("Name is required")),
      email: Yup.string()
        .required(t("Email is required"))
        .email(t("Enter a valid email")),
    }),
  });

  useEffect(() => {
    formik.setValues({
      name: authContext.user.name,
      email: authContext.user.email,
    });
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
          marginTop: isKeyboardVisible ? "-15%" : "0%",
          backgroundColor: theme.colors.transparentBg,
        }}
      >
        <View
          style={{
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
              {t("Edit Profile")}
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
                    backgroundColor: theme.colors.bgColor,
                  }}
                  style={{ width: "100%" }}
                  label={t("NAME")}
                  autoCapitalize="words"
                  placeholderText={t("Enter name")}
                  maxLength={60}
                  values={formik.values.name}
                  handleChange={(val: any) => formik.setFieldValue("name", val)}
                />
                <ErrorText
                  errors={
                    (formik.errors.name && formik.touched.name) as Boolean
                  }
                  title={formik.errors.name || ""}
                />

                <Spacer space={hp("2%")} />

                <Input
                  containerStyle={{
                    backgroundColor: theme.colors.bgColor,
                  }}
                  style={{ width: "100%" }}
                  label={t("EMAIL ADDRESS")}
                  placeholderText={t("Email")}
                  keyboardType={"email-address"}
                  values={formik.values.email}
                  maxLength={70}
                  handleChange={(val: any) =>
                    formik.setFieldValue("email", val)
                  }
                />
                <ErrorText
                  errors={
                    (formik.errors.email && formik.touched.email) as Boolean
                  }
                  title={formik.errors.email || (null as any)}
                />
              </ScrollView>
            </KeyboardAvoidingView>

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
              loading={loading}
              title={t("Save")}
              onPress={() => {
                if (isConnected) {
                  formik.handleSubmit();
                } else {
                  showToast("info", t("Please connect with internet"));
                }
              }}
            />
          </View>
        </View>
      </View>

      <Toast />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
});

export default EditProfile;
