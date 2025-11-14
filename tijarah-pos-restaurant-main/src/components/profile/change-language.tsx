import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import MMKVDB from "../../utils/DB-MMKV";
import { DBKeys } from "../../utils/DBKeys";
import { langs } from "../../utils/constants";
import ICONS from "../../utils/icons";
import LanguageRow from "../language-selection/language-row";
import DefaultText from "../text/Text";

export default function ChangeLanguage({
  isLogin = true,
  isFromDevice = false,
  visible = false,
  handleClose,
}: {
  isLogin?: boolean;
  isFromDevice?: boolean;
  visible: boolean;
  handleClose?: any;
}) {
  const theme = useTheme();

  const { hp } = useResponsive();

  const [selected, setSelected] = useState(langs[0]);

  useEffect(() => {
    const lang = MMKVDB.get(DBKeys.LANG) || "en";

    const selectedLang = langs.find((language) => language.code == lang);

    if (selectedLang) {
      setSelected(selectedLang as any);
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
            <DefaultText style={{ fontSize: 20 }} fontWeight="medium">
              {t("Change Language")}
            </DefaultText>

            <TouchableOpacity onPress={() => handleClose()}>
              <ICONS.ClosedFilledIcon />
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

          <View style={{ paddingHorizontal: hp("2%") }}>
            {langs.map((language) => {
              return (
                <LanguageRow
                  key={language.code}
                  isLogin={isLogin}
                  isFromDevice={isFromDevice}
                  language={language}
                  selected={selected}
                  setSelected={setSelected}
                />
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
});
