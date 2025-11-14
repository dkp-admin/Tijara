import React from "react";
import { Modal, StyleSheet, View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import ActionSheetHeader from "../../action-sheet/action-sheet-header";
import { CardPrintPreview } from "./card-print-preview";
import { CashPrintPreview } from "./cash-print-preview";
import { MultiPayPrintPreview } from "./multi-payment-print-preview";

export default function PrintPreviewModal({
  data,
  visible = false,
  handleClose,
}: {
  data: any;
  visible: boolean;
  handleClose?: any;
}) {
  const theme = useTheme();
  const { twoPaneView } = useResponsive();

  const getPrintPreview = () => {
    if (data?.cash > 0 && data?.card > 0) {
      return MultiPayPrintPreview;
    } else if (data?.cash > 0) {
      return CashPrintPreview;
    } else {
      return CardPrintPreview;
    }
  };

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
            backgroundColor: theme.colors.white[1000],
          }}
        >
          <ActionSheetHeader
            title={
              data?.cash > 0
                ? t("Cash Print Preview")
                : data?.card > 0
                ? t("Card Print Preview")
                : t("Multi Payment Print Preview")
            }
            handleLeftBtn={() => handleClose()}
          />

          {/* <WebView
            style={{ flex: 1, marginTop: hp("3%") }}
            originWhitelist={["*"]}
            source={{ html: getPrintPreview() }}
          /> */}
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
