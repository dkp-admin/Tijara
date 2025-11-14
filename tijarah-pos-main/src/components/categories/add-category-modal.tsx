import { useFormik } from "formik";
import { default as React, useContext, useEffect, useMemo } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { EventRegister } from "react-native-event-listeners";
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import endpoint from "../../api/endpoints";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import { useResponsive } from "../../hooks/use-responsiveness";
import { AuthType } from "../../types/auth-types";
import EntityNames from "../../types/entity-name";
import { getErrorMsg } from "../../utils/common-error-msg";
import { repo } from "../../utils/createDatabaseConnection";
import { debugLog, errorLog, infoLog } from "../../utils/log-patch";
import ActionSheetHeader from "../action-sheet/action-sheet-header";
import ImageUploader from "../image-uploader";
import Input from "../input/input";
import Spacer from "../spacer";
import ErrorText from "../text/error-text";
import showToast from "../toast";
import { AddCategoryProps } from "./types";

export default function AddEditCategoryModal({
  visible = false,
  handleClose,
}: {
  visible: boolean;
  handleClose?: any;
}) {
  const theme = useTheme();
  const isConnected = checkInternet();
  const { hp, wp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);

  const formik = useFormik<AddCategoryProps>({
    initialValues: {
      en_name: "",
      ar_name: "",
      categoryPic: "",
      description: "",
      localImage: "",
    },

    onSubmit: async (values) => {
      try {
        const businessDetails: any = await repo.business.findOne({
          where: { _id: authContext.user.locationRef },
        });

        const dataObj = {
          image: values.categoryPic,
          name: { en: values.en_name, ar: values.ar_name },
          description: values.description,
          companyRef: businessDetails.location.companyRef,
          company: { name: businessDetails.company.name.en },
          status: "active",
        };

        const res = await serviceCaller(endpoint.categoryAdd.path, {
          method: endpoint.categoryAdd.method,
          body: { ...dataObj },
        });

        if (res !== null) {
          debugLog(
            "Catgeory created to server",
            res,
            "category-create-modal",
            "handleSubmitFunction"
          );
          EventRegister.emit("sync:enqueue", {
            entityName: EntityNames.CategoryPull,
          });
          handleClose();
          showToast("success", t("Category Added Successfully"));
        }
      } catch (error: any) {
        errorLog(
          error?.message,
          values,
          "category-create-modal",
          "handleSubmitFunction",
          error
        );
        showToast("error", getErrorMsg("category", "create"));
      }
    },

    //Todo: move in /schema/entityname.ts
    validationSchema: Yup.object().shape({
      en_name: Yup.string().required(t("Category Name is required")),
      ar_name: Yup.string().required(t("Category Name in Arabic is required")),
    }),
  });

  useEffect(() => {
    if (visible) {
      formik.resetForm();
    }
  }, [visible]);

  const imageUploader = useMemo(
    () => (
      <ImageUploader
        size={hp("20%")}
        picText={t("Upload Picture")}
        uploadedImage={formik.values.categoryPic}
        handleImageChange={(uri: string) => {
          formik.setFieldValue("categoryPic", uri);
        }}
      />
    ),
    [formik.values.categoryPic]
  );

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
            title={t("Add a category")}
            rightBtnText={t("Add")}
            handleLeftBtn={() => handleClose()}
            loading={formik.isSubmitting}
            handleRightBtn={() => {
              if (!isConnected) {
                infoLog(
                  "Internet not connected",
                  {},
                  "category-create-modal",
                  "handleAdd"
                );
                showToast("info", t("Please connect with internet"));
                return;
              }

              formik.handleSubmit();
            }}
            permission={authContext.permission["pos:category"]?.create}
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
              {!twoPaneView && (
                <View style={{ alignItems: "center", marginBottom: hp("3%") }}>
                  {imageUploader}
                </View>
              )}

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ width: twoPaneView ? "68%" : "100%" }}>
                  <Input
                    style={{ width: "100%" }}
                    label={`${t("CATEGORY NAME")} *`}
                    autoCapitalize="words"
                    placeholderText={t("Enter the category name")}
                    values={formik.values.en_name}
                    handleChange={(val: any) =>
                      formik.setFieldValue("en_name", val)
                    }
                    maxLength={60}
                  />
                  <ErrorText
                    errors={
                      (formik.errors.en_name &&
                        formik.touched.en_name) as Boolean
                    }
                    title={formik.errors.en_name || ""}
                  />

                  <Spacer space={hp("2.5%")} />

                  <Input
                    style={{ width: "100%" }}
                    label={`${t("CATEGORY NAME IN ARABIC")} *`}
                    autoCapitalize="words"
                    placeholderText={t("Enter the category name")}
                    values={formik.values.ar_name}
                    handleChange={(val: any) =>
                      formik.setFieldValue("ar_name", val)
                    }
                    maxLength={60}
                  />
                  <ErrorText
                    errors={
                      (formik.errors.ar_name &&
                        formik.touched.ar_name) as Boolean
                    }
                    title={formik.errors.ar_name || ""}
                  />
                </View>

                {twoPaneView && (
                  <View style={{ marginLeft: wp("2%"), alignItems: "center" }}>
                    {imageUploader}
                  </View>
                )}
              </View>

              <Spacer space={hp("4%")} />

              <Input
                containerStyle={{ height: hp("15%") }}
                style={{ paddingVertical: wp("1.25%") }}
                label={t("DESCRIPTION")}
                autoCapitalize="sentences"
                placeholderText={t("Enter the category description")}
                multiline={true}
                numOfLines={10}
                values={formik.values.description}
                handleChange={(val: string) =>
                  formik.setFieldValue("description", val)
                }
                maxLength={70}
              />

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
