import { FormikProps, useFormik } from "formik";
import React, { useEffect } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import * as Yup from "yup";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import useChannelStore from "../../store/channel-store";
import useTicketStore from "../../store/ticket-store";
import cart from "../../utils/cart";
import { ChannelsName } from "../../utils/constants";
import ActionSheetHeader from "../action-sheet/action-sheet-header";
import Input from "../input/input";
import Spacer from "../spacer";
import ErrorText from "../text/error-text";
import showToast from "../toast";
import useCartStore from "../../store/cart-item";

type SaveTicketProps = {
  name: string;
  type: { value: string; key: string };
};

export default function SaveTicketModal({
  data,
  visible = false,
  handleClose,
  handleSave,
  items,
}: {
  data: any;
  visible: boolean;
  handleClose?: any;
  handleSave?: any;
  items?: any;
}) {
  const theme = useTheme();
  const { addToTicket, updateToTicket } = useTicketStore();
  const { channel } = useChannelStore();
  const { hp, twoPaneView } = useResponsive();
  const { customer, setCustomer } = useCartStore() as any;

  const formik: FormikProps<SaveTicketProps> = useFormik<SaveTicketProps>({
    initialValues: {
      name: "",
      type: { value: "", key: "" },
    },

    onSubmit: async (values) => {
      if (data !== null && data?.id !== null) {
        updateToTicket(data.id, {
          name: values.name,
          type: values.type.key,
          items: items,
          createdAt: data.createdAt,
          updatedAt: new Date(),
          customer,
        });
      } else {
        addToTicket({
          name: values.name,
          type: values.type.key,
          items: items,
          createdAt: new Date(),
          updatedAt: new Date(),
          customer,
        });
      }

      cart.clearCart();
      setCustomer({});
      handleSave();
      showToast("success", t("Ticket Saved Successfully"));
    },

    validationSchema: Yup.object().shape({
      name: Yup.string().required(t("Ticket Name is required")),
      type: Yup.object({
        value: Yup.string().required(t("Please Select Order Type")),
        key: Yup.string().required(t("Please Select Order Type")),
      })
        .required(t("Please Select Order Type"))
        .nullable(),
    }),
  });

  useEffect(() => {
    if (visible) {
      formik.resetForm();

      if (data !== null && data?.id !== null) {
        formik.setValues({
          name: data.name,
          type: {
            value: ChannelsName[data.type] || data.type,
            key: data.type,
          },
        });
      } else {
        formik.setFieldValue("type", {
          value: ChannelsName[channel] || channel,
          key: channel,
        });
        formik.setFieldValue(
          "name",
          customer?.firstName
            ? `${customer.firstName?.trim()} ${
                customer?.lastName?.trim() || ""
              }`
            : ""
        );
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
            title={data?.isAdd ? t("Add Ticket") : t("Save Ticket")}
            rightBtnText={data?.isAdd ? t("Add") : t("Save")}
            handleLeftBtn={() => handleClose()}
            loading={formik.isSubmitting}
            handleRightBtn={() => {
              formik.handleSubmit();
            }}
            permission={true}
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
              <Input
                style={{ width: "100%" }}
                label={`${t("TICKET NAME")} *`}
                autoCapitalize="words"
                placeholderText={t("Enter the ticket name")}
                values={formik.values.name}
                handleChange={(val: any) => formik.setFieldValue("name", val)}
              />
              <ErrorText
                errors={(formik.errors.name && formik.touched.name) as Boolean}
                title={formik.errors.name || ""}
              />

              <Spacer space={hp("3.75%")} />

              {/* <SelectInput
                label={`${t("ORDER TYPE")} *`}
                placeholderText={t("Select Order Type")}
                options={channelList?.map((channel: any) => {
                  return {
                    key: channel,
                    value: ChannelsName[channel] || channel,
                  };
                })}
                allowSearch={false}
                values={formik.values.type}
                handleChange={(val: any) => {
                  if (val.key && val.value) {
                    formik.setFieldValue("type", val);
                  }
                }}
                containerStyle={{ borderWidth: 0 }}
              /> */}
              <ErrorText
                errors={
                  (formik.errors.type?.value &&
                    formik.touched.type?.value) as Boolean
                }
                title={formik.errors.type?.value || ""}
              />

              <Spacer space={hp("12%")} />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    height: "100%",
  },
});
