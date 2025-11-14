import React, { useEffect } from "react";
import { ActivityIndicator, Modal, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import { t } from "../../../i18n";
import DefaultText from "../../components/text/Text";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import databasePull from "../../sync/database-pull";

const PullProductsModal = ({
  visible = false,
  handleClose,
}: {
  visible: boolean;
  handleClose: any;
}) => {
  const theme = useTheme();
  const { hp } = useResponsive();

  useEffect(() => {
    if (visible) {
      const pullProducts = async () => {
        let timeoutId;

        try {
          const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error("Timeout")), 15000);
          });

          await Promise.race([databasePull.fetchProducts(), timeoutPromise]);

          clearTimeout(timeoutId);

          // Close the modal
          handleClose();
        } catch (error: any) {
          if (error.message === "Timeout") {
            console.log("Operation timed out after 15 seconds");
          } else {
            console.error("Error occurred while fetching products:", error);
          }
          // Close the modal in case of timeout or error
          handleClose();
        }
      };

      pullProducts();
    }
  }, [visible]);

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
        <View
          style={{
            overflow: "hidden",

            borderRadius: 12,
            paddingVertical: hp("3%"),
            backgroundColor: theme.colors.white[1000],
          }}
        >
          <View style={{ paddingHorizontal: hp("2%") }}>
            <DefaultText>{t("Syncing Orders")}</DefaultText>
            <ActivityIndicator style={{ marginTop: hp("2%") }} />
          </View>
        </View>
      </View>

      <Toast />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  add_minus_view: {
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: "center",
  },
});

export default PullProductsModal;
