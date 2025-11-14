import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { setI18nConfig, t } from "../../../i18n";
import { BackButton } from "../../components/buttons/back-button";
import { PrimaryButton } from "../../components/buttons/primary-button";
import LanguageRow from "../../components/language-selection/language-row";
import Spacer from "../../components/spacer";
import DefaultText, { getOriginalSize } from "../../components/text/Text";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import { langs } from "../../utils/Constants";
import DB from "../../utils/DB";
import { DBKeys } from "../../utils/DBKeys";

const LanguageSelection = (props: any) => {
  const theme = useTheme();
  const { wp, hp } = useResponsive();
  const navigation = useNavigation<any>();
  const isNavigate = (props?.route?.params?.isNavigate as any) || false;

  const [selected, setSelected] = useState(langs[0]);

  const handleNext = async () => {
    const lang = await DB.retrieveString(DBKeys.LANG);

    if (!lang) {
      await DB.storeData(DBKeys.LANG, "en");
      setI18nConfig("en");
    }

    if (props?.route?.params?.isNavigate == true) {
      navigation.pop();
    } else {
      navigation.navigate("Welcome");
    }
  };

  useEffect(() => {
    (async () => {
      const lang = await DB.retrieveData(DBKeys.LANG || "en");

      const selectedLang = langs.find((language) => language.code == lang);

      if (selectedLang?.code) {
        setSelected(selectedLang);
      }
    })();
  }, []);

  return (
    <View
      style={{
        ...styles.container,
        paddingTop: isNavigate ? hp("4%") : hp("12%"),
        paddingHorizontal: wp("6%"),
        backgroundColor: theme.colors.bgColor2,
      }}
    >
      {isNavigate && (
        <View>
          <BackButton
            onPress={() => {
              navigation.pop();
            }}
          />

          <Spacer space={hp("3%")} />
        </View>
      )}

      <ScrollView
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
      >
        <DefaultText fontWeight="bold" fontSize="4xl">
          {t("Language Preference")}
        </DefaultText>

        <DefaultText
          style={{ marginTop: getOriginalSize(10) }}
          color="text.secondary"
        >
          {t("Select your preferred language below")}
        </DefaultText>

        <Spacer space={hp("6%")} />

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

        <Spacer space={hp("12%")} />
      </ScrollView>

      {!isNavigate && (
        <PrimaryButton
          style={{
            width: "100%",
            bottom: hp("10%"),
            position: "absolute",
            marginHorizontal: "8%",
          }}
          onPress={handleNext}
          title={t("Continue")}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default LanguageSelection;
