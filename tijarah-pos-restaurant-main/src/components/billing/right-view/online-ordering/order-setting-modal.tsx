import { useFormik } from "formik";
import { default as React, useContext, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import { t } from "../../../../../i18n";
import serviceCaller from "../../../../api";
import endpoint from "../../../../api/endpoints";
import AuthContext from "../../../../context/auth-context";
import { useTheme } from "../../../../context/theme-context";
import { checkInternet } from "../../../../hooks/check-internet";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import { AuthType } from "../../../../types/auth-types";
import ActionSheetHeader from "../../../action-sheet/action-sheet-header";
import DateInput from "../../../input/date-input";
import SelectInput from "../../../input/select-input";
import Spacer from "../../../spacer";
import DefaultText from "../../../text/Text";
import ErrorText from "../../../text/error-text";
import showToast from "../../../toast";

interface OrderSettingsProps {
  data: any;
  visible: boolean;
  handleSuccess: any;
  handleClose: () => void;
}

interface OrderSettingsFormikProps {
  pickup: boolean;
  delivery: boolean;
  pickupOffTill: string;
  deliveryOffTill: string;
  pickupNextAvailable: Date;
  deliveryNextAvailable: Date;
}

export default function OnlineOrderSettingModal({
  data,
  visible = false,
  handleSuccess,
  handleClose,
}: OrderSettingsProps) {
  const theme = useTheme();
  const isConnected = checkInternet();
  const { hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);

  const pickupDeliveryTypeOptions = [
    // {
    //   value: t("2 Hours"),
    //   key: "2",
    // },
    // {
    //   value: t("4 Hours"),
    //   key: "4",
    // },
    // {
    //   value: t("Next Day Begin"),
    //   key: "nextDayBegin",
    // },
    {
      value: t("Manual Change"),
      key: "manualChange",
    },
    // {
    //   value: t("Custom"),
    //   key: "custom",
    // },
  ];

  const typeName: any = {
    "2": t("2 Hours"),
    "4": t("4 Hours"),
    nextDayBegin: t("Next Day Begin"),
    manualChange: t("Manual Change"),
    custom: t("Custom"),
  };

  const formik = useFormik<OrderSettingsFormikProps>({
    initialValues: {
      pickup: false,
      delivery: false,
      pickupOffTill: "manualChange",
      deliveryOffTill: "manualChange",
      pickupNextAvailable: undefined as any,
      deliveryNextAvailable: undefined as any,
    },

    onSubmit: async (values) => {
      try {
        const res = await serviceCaller(
          `${endpoint.menuConfigUpdate.path}/${data?._id}`,
          {
            method: endpoint.menuConfigUpdate.method,
            body: {
              pickup: values.pickup,
              delivery: values.delivery,
              pickupOffTill: values.pickup ? "" : values.pickupOffTill,
              deliveryOffTill: values.delivery ? "" : values.deliveryOffTill,
              pickupNextAvailable: values.pickup
                ? ""
                : values.pickupNextAvailable,
              deliveryNextAvailable: values.delivery
                ? ""
                : values.deliveryNextAvailable,
            },
          }
        );

        if (res !== null) {
          handleSuccess();
          showToast("success", t("Online order setting configuration updated"));
        }
      } catch (error: any) {
        showToast("error", error?.message);
      }
    },

    validationSchema: Yup.object({
      pickupOffTill: Yup.string().when("pickup", {
        is: true,
        then: Yup.string().optional(),
        otherwise: Yup.string().required(t("Please Select Pickup Off Till")),
      }),
      deliveryOffTill: Yup.string().when("delivery", {
        is: true,
        then: Yup.string().optional(),
        otherwise: Yup.string().required(t("Please Select Delivery Off Till")),
      }),
      pickupNextAvailable: Yup.date().when(["pickup", "pickupOffTill"], {
        is: (pickup: boolean, pickupOffTill: string) =>
          !pickup && pickupOffTill === "custom",
        then: Yup.date()
          .required(t("Pickup Next Available is required"))
          .typeError(t("Pickup Next Available is required"))
          .nullable(),
        otherwise: Yup.date().optional().nullable(),
      }),
      deliveryNextAvailable: Yup.date().when(["delivery", "deliveryOffTill"], {
        is: (delivery: boolean, deliveryOffTill: string) =>
          !delivery && deliveryOffTill === "custom",
        then: Yup.date()
          .required(t("Delivery Next Available is required"))
          .typeError(t("Delivery Next Available is required"))
          .nullable(),
        otherwise: Yup.date().optional().nullable(),
      }),
    }),
  });

  useEffect(() => {
    if (visible) {
      formik.resetForm();

      if (data?.pickupDeliveryConfiguration) {
        formik.setValues({
          pickup: data.pickupDeliveryConfiguration.pickup,
          delivery: data.pickupDeliveryConfiguration.delivery,
          pickupOffTill:
            data.pickupDeliveryConfiguration?.pickupOffTill || "manualChange",
          deliveryOffTill:
            data.pickupDeliveryConfiguration?.deliveryOffTill || "manualChange",
          pickupNextAvailable:
            data.pickupDeliveryConfiguration.pickupNextAvailable,
          deliveryNextAvailable:
            data.pickupDeliveryConfiguration.deliveryNextAvailable,
        });
      }
    }
  }, [visible, data]);

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
            title={t("Online Order Settings")}
            rightBtnText={t("Update")}
            handleLeftBtn={() => handleClose()}
            loading={formik.isSubmitting}
            handleRightBtn={() => {
              if (!isConnected) {
                showToast("info", t("Please connect with internet"));
                return;
              }

              formik.handleSubmit();
            }}
            permission={authContext.permission["pos:business-detail"]?.update}
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
              <View
                style={{
                  ...styles.content_view,
                  backgroundColor: theme.colors.white[1000],
                }}
              >
                <DefaultText>{t("Pickup Order")}</DefaultText>

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
                    formik.setFieldValue("pickup", val);
                  }}
                  value={formik.values.pickup}
                />
              </View>

              {!formik.values.pickup && (
                <View style={{ marginTop: hp("3%") }}>
                  <SelectInput
                    label={`${t("Pickup Off Till")} *`}
                    placeholderText={t("Select Pickup Off Till")}
                    options={pickupDeliveryTypeOptions}
                    allowSearch={false}
                    values={{
                      key: formik.values.pickupOffTill,
                      value: typeName[formik.values.pickupOffTill],
                    }}
                    handleChange={(val: any) => {
                      if (val.key && val.value) {
                        formik.setFieldValue(
                          "pickupNextAvailable",
                          undefined as any
                        );
                        formik.setFieldValue("pickupOffTill", val.key);
                      }
                    }}
                    containerStyle={{ borderWidth: 0 }}
                  />
                  <ErrorText
                    errors={
                      (formik.errors.pickupOffTill &&
                        formik.touched.pickupOffTill) as Boolean
                    }
                    title={formik.errors.pickupOffTill || ""}
                  />

                  {formik.values.pickupOffTill === "custom" && (
                    <View style={{ marginTop: hp("3%") }}>
                      <DateInput
                        label={`${t("Pickup Next Available")} *`}
                        placeholderText={t("Select date")}
                        mode="datetime"
                        rightIcon={false}
                        dateFormat="MMM d, yyyy, hh:mm a"
                        minimumDate={new Date()}
                        values={formik.values.pickupNextAvailable}
                        handleChange={(val: any) => {
                          formik.setFieldValue("pickupNextAvailable", val);
                        }}
                      />
                      <ErrorText
                        errors={
                          (formik.errors.pickupNextAvailable &&
                            formik.touched.pickupNextAvailable) as Boolean
                        }
                        title={
                          formik.errors.pickupNextAvailable || (null as any)
                        }
                      />
                    </View>
                  )}
                </View>
              )}

              <View
                style={{
                  ...styles.content_view,
                  marginTop: hp("3%"),
                  backgroundColor: theme.colors.white[1000],
                }}
              >
                <DefaultText>{t("Delivery Order")}</DefaultText>

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
                    formik.setFieldValue("delivery", val);
                  }}
                  value={formik.values.delivery}
                />
              </View>

              {!formik.values.delivery && (
                <View style={{ marginTop: hp("3%") }}>
                  <SelectInput
                    label={`${t("Delivery Off Till")} *`}
                    placeholderText={t("Select Delivery Off Till")}
                    options={pickupDeliveryTypeOptions}
                    allowSearch={false}
                    values={{
                      key: formik.values.deliveryOffTill,
                      value: typeName[formik.values.deliveryOffTill],
                    }}
                    handleChange={(val: any) => {
                      if (val.key && val.value) {
                        formik.setFieldValue(
                          "deliveryNextAvailable",
                          undefined as any
                        );
                        formik.setFieldValue("deliveryOffTill", val.key);
                      }
                    }}
                    containerStyle={{ borderWidth: 0 }}
                  />
                  <ErrorText
                    errors={
                      (formik.errors.deliveryOffTill &&
                        formik.touched.deliveryOffTill) as Boolean
                    }
                    title={formik.errors.deliveryOffTill || ""}
                  />

                  {formik.values.deliveryOffTill === "custom" && (
                    <View style={{ marginTop: hp("3%") }}>
                      <DateInput
                        label={`${t("Delivery Next Available")} *`}
                        placeholderText={t("Select date")}
                        mode="datetime"
                        rightIcon={false}
                        dateFormat="MMM d, yyyy, hh:mm a"
                        minimumDate={new Date()}
                        values={formik.values.deliveryNextAvailable}
                        handleChange={(val: any) => {
                          formik.setFieldValue("deliveryNextAvailable", val);
                        }}
                      />
                      <ErrorText
                        errors={
                          (formik.errors.deliveryNextAvailable &&
                            formik.touched.deliveryNextAvailable) as Boolean
                        }
                        title={
                          formik.errors.deliveryNextAvailable || (null as any)
                        }
                      />
                    </View>
                  )}
                </View>
              )}

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
  content_view: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
