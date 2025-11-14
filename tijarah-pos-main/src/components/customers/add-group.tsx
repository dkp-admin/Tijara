import { FormikProps, useFormik } from "formik";
import React, { useContext, useEffect } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
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
import { AuthType } from "../../types/auth-types";
import { repo } from "../../utils/createDatabaseConnection";
import ICONS from "../../utils/icons";
import { debugLog, errorLog, infoLog } from "../../utils/log-patch";
import { PrimaryButton } from "../buttons/primary-button";
import Input from "../input/input";
import DefaultText from "../text/Text";
import ErrorText from "../text/error-text";
import showToast from "../toast";

type AddGroupProps = {
  name: string;
};

export default function AddGroup({
  visible = false,
  handleClose,
  handleCreate,
}: {
  visible: boolean;
  handleClose: any;
  handleCreate: any;
}) {
  const theme = useTheme();
  const { hp, wp } = useResponsive();
  const isConnected = checkInternet();
  const isKeyboardVisible = checkKeyboardState();
  const authContext = useContext<AuthType>(AuthContext);

  const formik: FormikProps<AddGroupProps> = useFormik<AddGroupProps>({
    initialValues: { name: "" },

    onSubmit: async (values) => {
      try {
        const businessDetails: any = await repo.business.findOne({
          where: { _id: authContext.user.locationRef },
        });

        const dataObj = {
          companyRef: businessDetails.location.companyRef,
          company: { name: businessDetails.company.name.en },
          name: values.name,
          status: "active",
        };

        const res = await serviceCaller(endpoint.group.path, {
          method: endpoint.group.method,
          body: { ...dataObj },
        });

        if (res !== null) {
          debugLog(
            "Group created to server",
            res,
            "group-create-modal",
            "handleSubmitFunction"
          );
          handleCreate(res);
          showToast("success", t("Group Created"));
        }
      } catch (error: any) {
        errorLog(
          error?.message,
          values,
          "group-create-modal",
          "handleSubmitFunction",
          error
        );
        showToast("error", error?.code || error?.message);
      }
    },

    validationSchema: Yup.object().shape({
      name: Yup.string().required(t("Name is required")),
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
              {t("New Group")}
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
              label={t("GROUP NAME")}
              maxLength={30}
              autoCapitalize="words"
              placeholderText={t("Enter group name")}
              values={formik.values.name}
              handleChange={(val: any) => formik.setFieldValue("name", val)}
            />
            <ErrorText
              errors={(formik.errors.name && formik.touched.name) as Boolean}
              title={formik.errors.name || ""}
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
              title={t("Create Group")}
              onPress={() => {
                if (!isConnected) {
                  infoLog(
                    "Internet not connected",
                    {},
                    "collection-create-modal",
                    "handleAdd"
                  );
                  showToast("info", t("Please connect with internet"));
                  return;
                }

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
