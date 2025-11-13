import React from "react";
import { KeyboardAvoidingView, Modal, StyleSheet, View } from "react-native";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import ActionSheetHeader from "../../../action-sheet/action-sheet-header";
import WideBarcode from "../../../wide-barcode";

export default function PrintTemplateViewModal({
  visible = false,
  handleClose,
  data,
}: {
  visible: boolean;
  handleClose?: any;
  onChange?: any;
  onDelete?: any;
  data?: any;
}) {
  const theme = useTheme();
  const { twoPaneView } = useResponsive();

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
            title={t("Template Preview")}
            handleLeftBtn={() => {
              handleClose();
            }}
            permission={true}
          />
          <KeyboardAvoidingView enabled={true}>
            <View
              style={{
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              {data?.paperSize !== "" && <WideBarcode data={data} />}
            </View>
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
  add_minus_view: {
    width: "27.5%",
    borderWidth: 0,
    paddingVertical: 16,
    borderColor: "#DFDFDFCC",
    alignItems: "center",
  },
});
