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
import ActionSheetHeader from "../action-sheet/action-sheet-header";
import Input from "../input/input";
import Spacer from "../spacer";
import ErrorText from "../text/error-text";
import showToast from "../toast";
import useCartStore from "../../store/cart-item";

type SaveTicketProps = {
  notes: string;
};

export default function OrderNotesModal({
  visible = false,
  handleClose,
}: {
  visible: boolean;
  handleClose?: any;
}) {
  const theme = useTheme();
  const { specialInstructions, setSpecialInstructions } = useCartStore();
  const { hp, twoPaneView } = useResponsive();

  const formik: FormikProps<SaveTicketProps> = useFormik<SaveTicketProps>({
    initialValues: {
      notes: "",
    },

    onSubmit: async (values) => {
      setSpecialInstructions(values.notes || "");

      showToast("success", t("Order Note Saved Successfully"));
      handleClose();
    },
  });

  useEffect(() => {
    if (visible) {
      formik.setValues({
        notes: specialInstructions,
      });
    }
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent={false}
      style={{ height: "50%" }}
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
            height: 200,
            marginHorizontal: twoPaneView ? "20%" : "0%",
            marginVertical: twoPaneView ? "5%" : "0%",
            backgroundColor: theme.colors.bgColor,
          }}
        >
          <ActionSheetHeader
            title={t("Add Order Notes")}
            rightBtnText={t("Add")}
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
            keyboardVerticalOffset={Platform.OS == "ios" ? 50 : 50}
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
                label={`${t("NOTES")}`}
                autoCapitalize="words"
                placeholderText={t("Enter order notes")}
                values={formik.values.notes}
                handleChange={(val: any) => formik.setFieldValue("notes", val)}
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
