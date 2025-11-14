import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { EventRegister } from "react-native-event-listeners";
import Toast from "react-native-toast-message";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { checkKeyboardState } from "../../../../hooks/use-keyboard-state";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import dineinCart from "../../../../utils/dinein-cart";
import DefaultText from "../../../text/Text";
import showToast from "../../../toast";

const ClearItemsModal = ({
  visible = false,
  handleClose,
}: {
  visible: boolean;
  handleClose: any;
}) => {
  const theme = useTheme();
  const { hp } = useResponsive();
  const isKeyboardVisible = checkKeyboardState();
  const [loading, setLoading] = useState(false);

  const handleClearItems = () => {
    setLoading(true);
    const indexes: any = [];

    let len = [...(dineinCart.getCartItems() || [])]?.filter(
      (item: any) => item?.sentToKot === false
    );

    if (len?.length <= 0) {
      handleClose();
      setLoading(false);
    }

    const sentItems = [...(dineinCart.getCartItems() || [])]?.filter(
      (item: any) => item?.sentToKot === false
    );

    if (len?.length > 0) {
      len?.map((newItem: any) => {
        const index = dineinCart
          .getCartItems()
          .findIndex(
            (item: any) =>
              item?.sku === newItem?.sku && item?.sentToKot === false
          );
        indexes.push(index);
      });

      dineinCart.bulkRemoveFromCart(
        indexes,

        (removedItems: any) => {
          EventRegister.emit("itemRemoved-dinein", removedItems);
        }
      );

      if (sentItems?.length <= 0) {
        dineinCart.clearDiscounts((removedDiscounts: any) => {
          EventRegister.emit("discountRemoved-dinein", removedDiscounts);
        });

        dineinCart.clearCharges((removedCharges: any) => {
          EventRegister.emit("chargeRemoved-dinein", removedCharges);
        });
      }

      showToast("success", t("Cart items cleared"));

      setLoading(false);

      handleClose();
    }
  };

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
          marginTop: isKeyboardVisible ? "-15%" : "0%",
          backgroundColor: theme.colors.transparentBg,
        }}
      >
        <View
          style={{
            overflow: "hidden",
            width: hp("90%"),
            borderRadius: 12,
            paddingVertical: hp("3%"),
            backgroundColor: theme.colors.white[1000],
          }}
        >
          <View style={{ paddingHorizontal: hp("2%") }}>
            <DefaultText>{t("Do you want to clear cart items?")}</DefaultText>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 20,
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: theme.colors.primary[1000],
                  padding: 10,
                  marginTop: 20,
                  borderRadius: 5,
                  width: 50,
                }}
                onPress={handleClearItems}
              >
                {loading ? (
                  <ActivityIndicator />
                ) : (
                  <DefaultText
                    style={{
                      textAlign: "center",
                      color: "white",
                      fontSize: 14,
                    }}
                  >
                    Yes
                  </DefaultText>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  padding: 8,
                  marginTop: 20,
                  borderRadius: 5,
                  width: 50,
                }}
                onPress={handleClose}
              >
                <DefaultText
                  style={{
                    textAlign: "center",
                    color: theme.colors.primary[1000],
                    fontSize: 14,
                  }}
                >
                  No
                </DefaultText>
              </TouchableOpacity>
            </View>
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

export default ClearItemsModal;
