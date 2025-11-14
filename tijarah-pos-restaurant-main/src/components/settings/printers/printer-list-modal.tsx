import React from "react";
import { Modal, StyleSheet, View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import ActionSheetHeader from "../../action-sheet/action-sheet-header";
import PrinterList from "./printers";

export default function PrinterListModal({
  visible = false,
  handleClose,
}: {
  visible: boolean;
  handleClose?: any;
}) {
  const theme = useTheme();

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
          backgroundColor: theme.colors.bgColor,
        }}
      >
        <ActionSheetHeader
          title={t("Printers")}
          handleLeftBtn={() => handleClose()}
        />

        <PrinterList />
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
