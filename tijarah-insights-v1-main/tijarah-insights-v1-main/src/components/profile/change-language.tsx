import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import { langs } from "../../utils/Constants";
import DB from "../../utils/DB";
import { DBKeys } from "../../utils/DBKeys";
import ICONS from "../../utils/icons";
import LanguageRow from "../language-selection/language-row";
import DefaultText, { getOriginalSize } from "../text/Text";

export default function ChangeLanguage({
  visible = false,
  handleClose,
}: {
  visible: boolean;
  handleClose?: any;
}) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();

  const [selected, setSelected] = useState(langs[0]);

  useEffect(() => {
    (async () => {
      const lang = (await DB.retrieveData(DBKeys.LANG || "en")) as string;

      const selectedLang = langs.find((language) => language.code == lang);

      if (selectedLang) {
        setSelected(selectedLang as any);
      }
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
            borderRadius: getOriginalSize(16),
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
              <ICONS.CloseFilledIcon
                width={getOriginalSize(30)}
                height={getOriginalSize(31)}
              />
            </TouchableOpacity>
          </View>

          <View
            style={{
              marginTop: hp("1.5%"),
              marginBottom: hp("2%"),
              height: getOriginalSize(1),
              backgroundColor: theme.colors.dividerColor.main,
            }}
          />

          <View style={{ paddingHorizontal: wp("3%") }}>
            {langs.map((language) => {
              return (
                <LanguageRow
                  key={language.code}
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
