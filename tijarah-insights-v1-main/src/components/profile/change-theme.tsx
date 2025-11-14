import { reloadAsync } from "expo-updates";
import React, { useEffect, useState } from "react";
import { Alert, Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import DB from "../../utils/DB";
import { DBKeys } from "../../utils/DBKeys";
import ICONS from "../../utils/icons";
import DefaultText from "../text/Text";

export default function ChangeTheme({
  visible = false,
  handleClose,
}: {
  visible: boolean;
  handleClose?: any;
}) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();

  const [themeMode, setThemeMode] = useState("light");

  const changeThemeAlert = (theme: string) => {
    Alert.alert(
      t("Confirmation"),
      t("Do you want to reload the app for theme change?"),
      [
        {
          text: t("No"),
          onPress: () => {},
        },
        {
          text: t("Yes"),
          style: "destructive",
          onPress: async () => {
            setThemeMode(theme);
            await DB.storeData(DBKeys.THEME_MODE, theme);
            await reloadAsync();
          },
        },
      ]
    );
  };

  useEffect(() => {
    (async () => {
      const theme = ((await DB.retrieveData(DBKeys.THEME_MODE)) ||
        "light") as string;

      setThemeMode(theme);
    })();
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
            width: wp("85%"),
            borderRadius: 16,
            paddingTop: hp("2%"),
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
            <DefaultText fontSize="2xl" fontWeight="semibold">
              {t("Change Language")}
            </DefaultText>

            <TouchableOpacity onPress={() => handleClose()}>
              <ICONS.CloseFilledIcon />
            </TouchableOpacity>
          </View>

          <View
            style={{
              marginTop: hp("1.5%"),
              marginBottom: hp("2%"),
              height: 1,
              backgroundColor: theme.colors.dividerColor.main,
            }}
          />

          <View style={{ paddingHorizontal: wp("3%") }}>
            {["light", "dark"].map((theme) => {
              return (
                <TouchableOpacity
                  key={theme}
                  style={{
                    ...styles.row_container,
                    backgroundColor:
                      theme === themeMode ? "#006C350D" : "transparent",
                  }}
                  onPress={() => {
                    changeThemeAlert(theme);
                  }}
                  disabled={theme === themeMode}
                >
                  <DefaultText
                    style={{ textTransform: "capitalize" }}
                    fontWeight="semibold"
                  >
                    {theme}
                  </DefaultText>
                </TouchableOpacity>
              );
            })}
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
  row_container: {
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal: 8,
    paddingLeft: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
    flexDirection: "row",
  },
});
