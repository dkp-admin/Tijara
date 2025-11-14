import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";

export default function ProductNotFoundModal({
  visible = false,
  handleClose,
  handleAddProduct,
}: {
  visible: boolean;
  handleClose: any;
  handleAddProduct: any;
}) {
  const theme = useTheme();
  const { hp } = useResponsive();

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
        <TouchableOpacity
          style={{ position: "absolute", left: 100000 }}
          onPress={(e) => {
            e.preventDefault();
          }}
        >
          <Text>PRESS</Text>
        </TouchableOpacity>

        <View
          style={{
            overflow: "hidden",
            marginHorizontal: "27%",
            paddingVertical: hp("3%"),
            paddingHorizontal: hp("2.75%"),
            backgroundColor: theme.colors.white[1000],
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "600" }}>
            {t("Product Not Found")}
          </Text>

          <Text
            style={{
              marginTop: 12,
              marginRight: 20,
              fontSize: 16,
            }}
          >
            {t("product_not_found_alert_msg")}
          </Text>

          <View
            style={{
              marginTop: 24,
              marginBottom: -4,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <TouchableOpacity
              onPress={() => {
                handleClose();
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  marginRight: hp("2.5%"),
                  fontWeight: "600",
                  textTransform: "uppercase",
                }}
              >
                {t("Continue")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                handleAddProduct();
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  textTransform: "uppercase",
                }}
              >
                {t("Add Product")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
