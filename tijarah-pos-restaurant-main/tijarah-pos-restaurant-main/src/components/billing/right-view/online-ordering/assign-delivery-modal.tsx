import { useFormik } from "formik";
import {
  default as React,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import { t } from "../../../../../i18n";
import serviceCaller from "../../../../api";
import endpoint from "../../../../api/endpoints";
import AuthContext from "../../../../context/auth-context";
import { useTheme } from "../../../../context/theme-context";
import { checkDirection } from "../../../../hooks/check-direction";
import { checkInternet } from "../../../../hooks/check-internet";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import { AuthType } from "../../../../types/auth-types";
import { USER_TYPES } from "../../../../utils/constants";
import ICONS from "../../../../utils/icons";
import parsePhoneNumber from "../../../../utils/parse-phone-number";
import ActionSheetHeader from "../../../action-sheet/action-sheet-header";
import Input from "../../../input/input";
import PhoneInput from "../../../input/phone-input";
import Spacer from "../../../spacer";
import DefaultText from "../../../text/Text";
import ErrorText from "../../../text/error-text";
import Label from "../../../text/label";
import showToast from "../../../toast";
import DeliveryBoySelectInput from "./delivery-boy-select-input";

interface AssignDeliveryProps {
  order: any;
  visible: boolean;
  handleSuccess: any;
  handleClose: () => void;
}

interface AssignDeliveryFormikProps {
  other: boolean;
  deliveryBoyRef: { key: string; value: string };
  deliveryBoyName: string;
  deliveryBoyPhone: string;
}

export default function AssignDeliveryModal({
  order,
  visible = false,
  handleSuccess,
  handleClose,
}: AssignDeliveryProps) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const isConnected = checkInternet();
  const deliveryUserSheetRef = useRef<any>();
  const { hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);

  const [country, setCountry] = useState("+966");

  const formik = useFormik<AssignDeliveryFormikProps>({
    initialValues: {
      other: false,
      deliveryBoyRef: { key: "", value: "" },
      deliveryBoyName: "",
      deliveryBoyPhone: "",
    },

    onSubmit: async (values) => {
      try {
        if (values.other) {
          const data = {
            role: { name: "" },
            roleRef: "",
            userType: USER_TYPES.DRIVER,
            companyRef: order.companyRef,
            company: {
              name: order.company.name,
            },
            location: {
              name: order.location.name,
            },
            locationRef: order.locationRef,
            name: values.deliveryBoyName.trim(),
            email: "",
            profilePicture: "",
            phone: parsePhoneNumber(country, values.deliveryBoyPhone),
            pin: "",
            status: "active",
          };

          const res = await serviceCaller(endpoint.assignDriver.path, {
            method: endpoint.assignDriver.method,
            body: { ...data },
          });

          if (res) {
            const response = await serviceCaller(
              `${endpoint.onlineOrderingUpdate.path}/${order?._id}`,
              {
                method: endpoint.onlineOrderingUpdate.method,
                body: {
                  orderStatus: "ready",
                  driverRef: res._id,
                  driver: {
                    name: res.name,
                    phone: res.phone,
                  },
                },
              }
            );

            if (response) {
              showToast(
                "success",
                t("Delivery boy created and assigned to order")
              );
              handleSuccess();
            }
          }
        } else {
          const res = await serviceCaller(
            `${endpoint.onlineOrderingUpdate.path}/${order?._id}`,
            {
              method: endpoint.onlineOrderingUpdate.method,
              body: {
                orderStatus: "ready",
                driverRef: values.deliveryBoyRef.key,
                driver: {
                  name: values.deliveryBoyName,
                  phone: parsePhoneNumber(country, values.deliveryBoyPhone),
                },
              },
            }
          );

          if (res) {
            showToast("success", t("Delivery boy assigned to order"));
            handleSuccess();
          }
        }
      } catch (error: any) {
        showToast("error", error?.message);
      }
    },

    validationSchema: Yup.object({
      deliveryBoyRef: Yup.object().when("other", {
        is: true,
        then: Yup.object().optional().nullable(),
        otherwise: Yup.object({
          value: Yup.string().required(t("Please Select Delivery Boy")),
          key: Yup.string().required(t("Please Select Delivery Boy")),
        })
          .required(t("Please Select Delivery Boy"))
          .nullable(),
      }),
      deliveryBoyName: Yup.string().when("other", {
        is: false,
        then: Yup.string().optional(),
        otherwise: Yup.string()
          .required(t("Name is required"))
          .matches(
            /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
            t("Enter valid name")
          )
          .max(60, t("Name must not be greater than 60 characters")),
      }),
      deliveryBoyPhone: Yup.string().when("other", {
        is: false,
        then: Yup.string().optional(),
        otherwise: Yup.string()
          .required(t("Phone Number is required"))
          .min(9, t("Phone Number should be minimum 9 digits"))
          .max(12, t("Phone Number should not be maximum 12 digits")),
      }),
    }),
  });

  useEffect(() => {
    if (visible) {
      formik.resetForm();

      if (visible && order?.driverRef) {
        const phoneNumber = order?.driver?.phone
          ? order?.driver?.phone?.toString().split("-")[1]
          : "";

        setCountry(
          phoneNumber ? order?.driver?.phone?.toString().split("-")[0] : "+966"
        );

        formik.setFieldValue("deliveryBoyRef", {
          key: order?.driverRef || "",
          value: `${order?.driver?.name || ""}, ${order?.driver?.phone || ""}`,
        });
        formik.setFieldValue("deliveryBoyName", order?.driver?.name || "");
        formik.setFieldValue("deliveryBoyPhone", phoneNumber || "");
      }
    }
  }, [visible, order]);

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
          backgroundColor: "transparent",
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
            title={t("Delivery Boy")}
            rightBtnText={order?.driverRef ? t("Change") : t("Assign")}
            handleLeftBtn={() => handleClose()}
            loading={formik.isSubmitting}
            handleRightBtn={() => {
              if (!isConnected) {
                showToast("info", t("Please connect with internet"));
                return;
              }

              formik.handleSubmit();
            }}
            permission={authContext.permission["pos:order"]?.update}
          />

          <KeyboardAvoidingView
            enabled
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
          >
            <ScrollView
              alwaysBounceVertical={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingVertical: hp("3%"),
                paddingHorizontal: hp("2.5%"),
              }}
            >
              <Label>
                {`${t("DELIVERY BOY")} ${formik.values.other ? "" : "*"}`}
              </Label>

              <TouchableOpacity
                style={{
                  ...styles.drop_down_view,
                  height: hp("7.5%"),
                  opacity: formik.values.other ? 0.5 : 1,
                  backgroundColor: theme.colors.white[1000],
                }}
                onPress={() => {
                  if (!formik.values.other) {
                    deliveryUserSheetRef.current.open();
                  }
                }}
                disabled={formik.values.other}
              >
                <DefaultText
                  fontWeight="normal"
                  color={
                    !formik.values.other || formik.values.deliveryBoyRef.key
                      ? theme.colors.otherGrey[100]
                      : theme.colors.placeholder
                  }
                >
                  {formik.values.deliveryBoyRef.key
                    ? formik.values.deliveryBoyRef.value
                    : t("Select Delivery Boy")}
                </DefaultText>

                <View
                  style={{
                    transform: [{ rotate: isRTL ? "180deg" : "0deg" }],
                  }}
                >
                  <ICONS.RightContentIcon />
                </View>
              </TouchableOpacity>
              <ErrorText
                errors={
                  (formik.errors.deliveryBoyRef?.value &&
                    formik.touched.deliveryBoyRef?.value) as Boolean
                }
                title={formik.errors.deliveryBoyRef?.value || ""}
              />

              <View
                style={{
                  ...styles.content_view,
                  marginTop: hp("3%"),
                  backgroundColor: theme.colors.white[1000],
                }}
              >
                <DefaultText>{t("Assign Other Delivery Boy")}</DefaultText>

                <Switch
                  style={{
                    transform:
                      Platform.OS == "ios"
                        ? [{ scaleX: 0.9 }, { scaleY: 0.9 }]
                        : [{ scaleX: 1.5 }, { scaleY: 1.5 }],
                    height: hp("5%"),
                  }}
                  trackColor={{
                    false: "rgba(120, 120, 128, 0.16)",
                    true: "#34C759",
                  }}
                  thumbColor={theme.colors.white[1000]}
                  onValueChange={(val: any) => {
                    formik.setFieldValue("other", val);
                    formik.setFieldValue("deliveryBoyRef", {
                      key: "",
                      value: "",
                    });
                    formik.setFieldValue("deliveryBoyName", "");
                    formik.setFieldValue("deliveryBoyPhone", "");
                  }}
                  value={formik.values.other}
                />
              </View>

              {formik.values.other && (
                <View style={{ marginTop: hp("3%") }}>
                  <Input
                    style={{ width: "100%" }}
                    label={`${t("NAME")} *`}
                    autoCapitalize="words"
                    maxLength={60}
                    placeholderText={t("Name")}
                    values={formik.values.deliveryBoyName}
                    handleChange={(val: any) =>
                      formik.setFieldValue("deliveryBoyName", val)
                    }
                  />
                  <ErrorText
                    errors={
                      (formik.errors.deliveryBoyName &&
                        formik.touched.deliveryBoyName) as Boolean
                    }
                    title={formik.errors.deliveryBoyName || ""}
                  />

                  <View style={{ marginTop: hp("3%") }}>
                    <PhoneInput
                      label={`${t("PHONE NUMBER")} *`}
                      placeholderText={t("Phone")}
                      values={formik.values.deliveryBoyPhone}
                      handleChange={(val: any) =>
                        formik.setFieldValue("deliveryBoyPhone", val)
                      }
                      selectedCountryCode={country}
                      handleCountryCode={(code: string) => setCountry(code)}
                    />
                    <ErrorText
                      errors={
                        (formik.errors.deliveryBoyPhone &&
                          formik.touched.deliveryBoyPhone) as Boolean
                      }
                      title={formik.errors.deliveryBoyPhone || ""}
                    />
                  </View>
                </View>
              )}

              <Spacer space={hp("12%")} />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>

      <Toast />

      <DeliveryBoySelectInput
        sheetRef={deliveryUserSheetRef}
        values={formik.values.deliveryBoyRef}
        handleSelected={(val: any, data: any) => {
          if (val?.key && val?.value) {
            const phoneNumber = data?.phone
              ? data?.phone?.toString().split("-")[1]
              : "";

            setCountry(
              phoneNumber ? data?.phone?.toString().split("-")[0] : "+966"
            );

            formik.setFieldValue("deliveryBoyRef", val);
            formik.handleChange("deliveryBoyName")(data?.name);
            formik.handleChange("deliveryBoyPhone")(phoneNumber);
          } else {
            formik.setFieldValue("deliveryBoyRef", { key: "", value: "" });
            formik.setFieldValue("deliveryBoyName", "");
            formik.setFieldValue("deliveryBoyPhone", "");
          }

          deliveryUserSheetRef.current.close();
        }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    height: "100%",
  },
  drop_down_view: {
    width: "100%",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  content_view: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
