import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { EventRegister } from "react-native-event-listeners";
import Toast from "react-native-toast-message";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { checkKeyboardState } from "../../../hooks/use-keyboard-state";
import cart from "../../../utils/cart";
import showToast from "../../toast";
import { t } from "../../../../i18n";
import DefaultText from "../../text/Text";
import { useMenuTab } from "../../../store/menu-tab-store";
import ActionSheetHeader from "../../action-sheet/action-sheet-header";
import Input from "../../input/input";
import Spacer from "../../spacer";

const ClearItemsModalBillingNew = ({
  visible = false,
  handleClose,
}: {
  visible: boolean;
  handleClose: any;
}) => {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();
  const isKeyboardVisible = checkKeyboardState();
  const [loading, setLoading] = useState(false);
  const { changeTab } = useMenuTab();

  const handleClearItems = () => {
    setLoading(true);
    cart.clearCart();
    showToast("success", t("Cart items cleared"));
    changeTab(0);
    setLoading(false);
    handleClose();
  };

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
            title={t("Clear Items")}
            rightBtnText={""}
            handleLeftBtn={() => handleClose()}
            loading={false}
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
              <View style={{ paddingHorizontal: hp("2%") }}>
                <DefaultText>
                  {t("Do you want to clear cart items?")}
                </DefaultText>
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
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",

    height: "100%",
  },
  add_minus_view: {
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: "center",
  },
});

export default ClearItemsModalBillingNew;
