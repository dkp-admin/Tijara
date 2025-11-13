import * as WebBrowser from "expo-web-browser";
import React from "react";
import { Linking, StyleSheet, TouchableOpacity, View } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import ICONS from "../../utils/icons";
import ItemDivider from "../action-sheet/row-divider";
import DefaultText from "../text/Text";

const contactNumber = "+966-580459794";

export default function HelpSheet({ sheetRef }: any) {
  const theme = useTheme();

  return (
    //@ts-ignore
    <RBSheet
      ref={sheetRef}
      animationType="fade"
      closeOnDragDown={true}
      closeOnPressMask={true}
      height={250}
      customStyles={{
        container: {
          ...styles.card_view,
          backgroundColor: theme.colors.bgColor2,
        },
        draggableIcon: { backgroundColor: theme.colors.dark[600] },
      }}
    >
      <View style={styles.header_view}>
        <DefaultText
          fontSize={"2xl"}
          style={{ textAlign: "center" }}
          fontWeight="extrabold"
        >
          {t("Contact Support")}
        </DefaultText>

        <DefaultText
          fontSize={"md"}
          style={{ textAlign: "center", marginTop: 3 }}
          color={"dark.600"}
        >
          {t("Reach out to us through the options below")}
        </DefaultText>
      </View>

      <ItemDivider style={{ marginTop: 12 }} />

      <View style={styles.content_view}>
        <TouchableOpacity
          style={{
            alignItems: "center",
            flex: 1,
            justifyContent: "center",
          }}
          onPress={async () => {
            await WebBrowser.openBrowserAsync(
              "https://tawk.to/chat/65730c5607843602b8ffb428/1hh4mgd0c"
            );
          }}
        >
          <ICONS.ChatFilledIcon color={theme.colors.primary[1000]} />

          <DefaultText
            fontWeight="medium"
            fontSize={"md"}
            style={{ margin: 5, textAlign: "center" }}
          >
            {t("Chat").substring(0, 4)}
          </DefaultText>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
          onPress={() => {
            Linking.openURL(`tel:${contactNumber}`);
          }}
        >
          <ICONS.CallFilledIcon color={theme.colors.primary[1000]} />

          <DefaultText
            fontWeight="medium"
            fontSize={"md"}
            style={{ margin: 5, textAlign: "center" }}
          >
            {t("Call").substring(0, 4)}
          </DefaultText>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
          onPress={() => {
            Linking.openURL(`https://wa.me/${contactNumber}`);
          }}
        >
          <ICONS.WhatsappFilledIcon
            color={theme.colors.bgColor2}
            bgColor={theme.colors.primary[1000]}
          />

          <DefaultText
            fontWeight="medium"
            fontSize={"md"}
            style={{ margin: 5, textAlign: "center" }}
          >
            {t("Whatsapp").substring(0, 8)}
          </DefaultText>
        </TouchableOpacity>
      </View>
    </RBSheet>
  );
}

const styles = StyleSheet.create({
  card_view: {
    elevation: 100,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  header_view: {
    width: "100%",
    paddingTop: 5,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  content_view: {
    paddingTop: 5,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
});
