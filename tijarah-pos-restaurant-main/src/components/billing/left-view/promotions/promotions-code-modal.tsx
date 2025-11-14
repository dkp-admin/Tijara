import { t } from "i18n-js";
import React, { useState } from "react";
import { Modal, StyleSheet, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import ActionSheetHeader from "../../../action-sheet/action-sheet-header";
import { PrimaryButton } from "../../../buttons/primary-button";
import DefaultText from "../../../text/Text";
import showToast from "../../../toast";

export default function PromotionCodeModal({
  visible = false,
  handleClose,
  getPromoCode,
  data,
}: {
  visible: boolean;
  handleClose?: any;
  getPromoCode?: any;
  data?: any;
}) {
  const theme = useTheme();
  const { wp, hp, twoPaneView } = useResponsive();
  const [code, setCode] = useState<string>("");

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
          paddingTop: hp("30%"),
          paddingHorizontal: wp("30%"),
          backgroundColor: theme.colors.transparentBg,
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.white[1000],
            borderRadius: 15,
          }}
        >
          <ActionSheetHeader
            title={"Enter promo code"}
            handleLeftBtn={() => handleClose()}
            isCurrency={true}
          />

          <View style={{ paddingHorizontal: 15, paddingVertical: 15 }}>
            <DefaultText
              style={{ marginBottom: 10, fontWeight: "bold", fontSize: 18 }}
            >
              Code
            </DefaultText>
            <TextInput
              style={{
                width: "100%",
                borderWidth: 2,
                borderColor: `${theme.colors.primary[1000]}`,
                padding: 10,
                borderRadius: 10,
              }}
              onChangeText={(val) => setCode(val)}
            />
            <PrimaryButton
              style={{ marginTop: hp("1.5%") }}
              textStyle={{
                fontSize: 16,
                fontWeight: theme.fontWeights.medium,
                fontFamily: theme.fonts.circulatStd,
              }}
              title={t("Submit")}
              onPress={() => {
                if (code === data.code?.code) {
                  getPromoCode(data);
                  showToast("success", "Promotion code applied successfully");
                  handleClose();
                } else showToast("error", "Invalid Code");
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
    height: "100%",
  },
});
