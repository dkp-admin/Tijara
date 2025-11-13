import React, { useState } from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import i18n, { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import DefaultText from "../text/Text";
import ChangeLanguage from "../profile/change-language";
import { langFlags } from "../language-selection/language-row";
import { LanguageCodes } from "../../types/language-types";

export default function FloatingLangView({
  isLogin = true,
  isFromDevice = false,
}: any) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();

  const [openLanguageModal, setOpenLanguageModal] = useState(false);

  const langName: any = {
    ar: t("Arabic"),
    en: t("English"),
    ur: t("Urdu"),
  };

  return (
    <>
      <TouchableOpacity
        style={{
          ...styles.lang_view,
          top: hp("3%"),
          right: wp("3.5%"),
          paddingVertical: hp("1.5%"),
          paddingHorizontal: hp("1.25%"),
          backgroundColor: theme.colors.white[1000],
        }}
        onPress={() => setOpenLanguageModal(true)}
      >
        <Image
          key={"flag"}
          style={{
            width: hp("4.25%"),
            height: hp("4.25%"),
          }}
          borderRadius={hp("5%")}
          source={langFlags[i18n.currentLocale() as LanguageCodes]}
        />

        <DefaultText style={{ marginLeft: hp("1.5%") }} fontWeight="medium">
          {langName[i18n.currentLocale()]}
        </DefaultText>
      </TouchableOpacity>

      <ChangeLanguage
        isLogin={isLogin}
        isFromDevice={isFromDevice}
        visible={openLanguageModal}
        handleClose={() => setOpenLanguageModal(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  lang_view: {
    borderRadius: 14,
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
  },
});
