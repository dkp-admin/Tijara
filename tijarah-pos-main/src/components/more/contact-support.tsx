import * as WebBrowser from "expo-web-browser";
import React from "react";
import {
  Linking,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import ICONS from "../../utils/icons";
import DefaultText from "../text/Text";
import showToast from "../toast";

const contactNumber = "+966-580459794";

export default function ContactSupport({
  visible = false,
  handleClose,
}: {
  visible: boolean;
  handleClose: any;
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
        <View
          style={{
            width: hp("42%"),
            borderRadius: 16,
            paddingVertical: hp("2%"),
            backgroundColor: theme.colors.white[1000],
          }}
        >
          <View
            style={{
              paddingHorizontal: hp("2%"),
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <DefaultText
              style={{ fontSize: 20, width: "80%" }}
              fontWeight="medium"
            >
              {t("Contact Support")}
            </DefaultText>

            <TouchableOpacity onPress={() => handleClose()}>
              <ICONS.ClosedFilledIcon />
            </TouchableOpacity>
          </View>

          <View
            style={{
              marginVertical: hp("1.5%"),
              height: 1,
              backgroundColor: theme.colors.dividerColor.main,
            }}
          />

          <DefaultText
            style={{ paddingHorizontal: hp("2%") }}
            fontSize="md"
            color={"otherGrey.200"}
          >
            {t("Reach out to us through the options below")}
          </DefaultText>

          <View style={{ ...styles.content_view, marginTop: hp("2.5%") }}>
            <TouchableOpacity
              style={styles.contact_view}
              onPress={async () => {
                handleClose();
                await WebBrowser.openBrowserAsync(
                  "https://tawk.to/chat/65730c5607843602b8ffb428/1hh4mgd0c"
                );
              }}
            >
              <ICONS.ChatFilledIcon color={theme.colors.primary[1000]} />

              <DefaultText
                style={styles.contact_text}
                fontSize="md"
                fontWeight="medium"
              >
                {t("Chat")}
              </DefaultText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contact_view}
              onPress={() => {
                Linking.canOpenURL(`tel:${contactNumber}`)
                  .then((supported) => {
                    if (supported) {
                      handleClose();
                      return Linking.openURL(`tel:${contactNumber}`);
                    } else {
                      showToast(
                        "info",
                        t(`Phone call not supported on this device`)
                      );
                    }
                  })
                  .catch((error) =>
                    console.log(`Error opening phone app: ${error}`)
                  );
              }}
            >
              <ICONS.CallFilledIcon color={theme.colors.primary[1000]} />

              <DefaultText
                style={styles.contact_text}
                fontSize="md"
                fontWeight="medium"
              >
                {t("Call")}
              </DefaultText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contact_view}
              onPress={() => {
                handleClose();
                Linking.openURL(`https://wa.me/${contactNumber}`);
              }}
            >
              <ICONS.WhatsAppIcon
                color={theme.colors.bgColor2}
                bgColor={theme.colors.primary[1000]}
              />

              <DefaultText
                style={styles.contact_text}
                fontSize="md"
                fontWeight="medium"
              >
                {t("Whatsapp")}
              </DefaultText>
            </TouchableOpacity>
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
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  content_view: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  contact_view: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  contact_text: {
    marginTop: 5,
    textAlign: "center",
  },
});
