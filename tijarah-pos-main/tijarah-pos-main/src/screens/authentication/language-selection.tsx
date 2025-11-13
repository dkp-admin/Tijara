import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { setI18nConfig, t } from "../../../i18n";
import { PrimaryButton } from "../../components/buttons/primary-button";
import LanguageRow from "../../components/language-selection/language-row";
import Spacer from "../../components/spacer";
import DefaultText from "../../components/text/Text";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import MMKVDB from "../../utils/DB-MMKV";
import { DBKeys } from "../../utils/DBKeys";
import { TIJARAH_LOGO, langs } from "../../utils/constants";
import ICONS from "../../utils/icons";
import { debugLog } from "../../utils/log-patch";

const LanguageSelection = () => {
  const theme = useTheme();
  const { wp, hp, twoPaneView } = useResponsive();
  const navigation = useNavigation<any>();

  const [selected, setSelected] = useState(langs[0]);

  const handleNext = async () => {
    const lang = MMKVDB.get(DBKeys.LANG);

    if (!lang) {
      MMKVDB.set(DBKeys.LANG, "en");
      setI18nConfig("en");
    }

    debugLog(
      "Language selected",
      selected,
      "language-selection",
      "handleNextFunction"
    );

    navigation.navigate("ConnectDevice");
  };

  useEffect(() => {
    const lang = MMKVDB.get(DBKeys.LANG) || "en";

    const selectedLang = langs.find((language) => language.code == lang);

    if (selectedLang) {
      setSelected(selectedLang as any);
    }
  }, []);

  const isFocused = useIsFocused();

  return (
    <View
      style={{
        ...styles.container,
        paddingHorizontal: twoPaneView ? wp("30%") : wp("7.5%"),
        backgroundColor: theme.colors.bgColor,
      }}
    >
      <ScrollView
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          marginTop: hp("5%"),
        }}
      >
        <View style={{ alignItems: "center" }}>
          <Image source={TIJARAH_LOGO} resizeMode="contain" />
        </View>

        <View>
          <DefaultText style={{ marginTop: hp("4%"), marginLeft: wp("1.5%") }}>
            {t("Select your preferred language")}
          </DefaultText>

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

        <PrimaryButton
          style={{
            marginTop: hp("10%"),
            paddingVertical: hp("1.8%"),
            marginHorizontal: twoPaneView ? wp("6%") : wp("0%"),
          }}
          onPress={handleNext}
          title={t("Next")}
          rightIcon={<ICONS.ArrowRightIcon />}
        />

        <Spacer space={hp("12%")} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default LanguageSelection;
