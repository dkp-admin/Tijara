import { useNavigation } from "@react-navigation/native";
import { differenceInDays, format, startOfDay } from "date-fns";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { expo } from "../../../app.json";
import { t } from "../../../i18n";
import ImageUploader from "../../components/image-uploader";
import { langFlags } from "../../components/language-selection/language-row";
import ChangeLanguage from "../../components/profile/change-language";
import ChangeTheme from "../../components/profile/change-theme";
import HelpCard from "../../components/profile/help";
import ProfileRow from "../../components/profile/profile-row";
import Spacer from "../../components/spacer";
import DefaultText, { getOriginalSize } from "../../components/text/Text";
import showToast from "../../components/toast";
import { useTheme } from "../../context/theme-context";
import { useAuth } from "../../hooks/use-auth";
import { checkDirection } from "../../hooks/use-direction-check";
import { useEntity } from "../../hooks/use-entity";
import { useResponsive } from "../../hooks/use-responsiveness";
import { LanguageType } from "../../types/language-types";
import { LANG_FLAGS_EN, STATUSBAR_HEIGHT, langs } from "../../utils/Constants";
import DB from "../../utils/DB";
import { DBKeys } from "../../utils/DBKeys";
import ICONS from "../../utils/icons";
import { trimText } from "../../utils/trim-text";

const getSubscriptionDetails = (subscriptionEndDate: string) => {
  const endDate = startOfDay(new Date(subscriptionEndDate));
  const currentDate = startOfDay(new Date());

  const renewDays = subscriptionEndDate
    ? differenceInDays(endDate, currentDate)
    : -1;

  const renewDaysText = renewDays > 0 ? `${renewDays} ${t("Days")}` : "";

  return {
    renewIn: renewDays,
    renewText: renewDaysText,
  };
};

const getBuildNumber = () => {
  if (Platform.OS == "ios") {
    return expo.ios.buildNumber;
  } else {
    return expo.android.versionCode;
  }
};

const env = Constants.expoConfig?.extra?.env || "development";

const Profile = () => {
  const theme = useTheme();
  const isRTL = checkDirection();
  const scrollRef = useRef<any>();
  const { user, logout } = useAuth();
  const { wp, hp } = useResponsive();
  const navigation = useNavigation<any>();

  const { updateEntity: updateProfile } = useEntity("user");
  const { find: findLocations, entities: locations } = useEntity("location");
  const { findOne: getProfile, entity: profile } = useEntity("user");

  const [themeMode, setThemeMode] = useState("light");
  const [openThemeModal, setOpenThemeModal] = useState(false);
  const [openLanguageModal, setOpenLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageType>({
    code: "en",
    name: "",
    flag: LANG_FLAGS_EN,
  });

  const langName: any = {
    ar: t("Arabic"),
    en: t("English"),
    ur: t("Urdu"),
  };

  const subscriptionDetails = getSubscriptionDetails(
    user?.company?.subscriptionEndDate || ""
  );

  const updateProfilePic = async (uri: string) => {
    if (uri && uri !== profile?.profilePicture) {
      try {
        await updateProfile(profile?._id, { profilePicture: uri });
        showToast("success", t("Profile Picture Updated"));
      } catch (error: any) {
        console.log("error", error.message);
      }
    }
  };

  const companyData = [
    {
      text: t("Company Name"),
      value: user?.company?.name?.en || profile?.company?.name || "NA",
    },
    {
      text: t("Default Sales Tax"),
      value: user?.company?.vat ? `${user?.company?.vat?.percentage}%` : "NA",
    },
    { text: t("Phone"), value: user?.company?.phone || "NA" },
    { text: t("Email"), value: user?.company?.email || "NA" },
    // { text: t("Documents"), value: "NA" },
  ];

  const subscriptionData = [
    { text: t("Package"), value: user?.company?.subscriptionType || "NA" },
    {
      text: `${t("No")}. ${t("of Locations")}`,
      value: `${locations?.total || "-"}`,
    },
    {
      text: t("Subscription Status"),
      value: user?.company?.subscriptionEndDate
        ? subscriptionDetails.renewIn >= 0
          ? t("Active")
          : t("Expired")
        : "NA",
    },
    {
      text: t("Expiring in"),
      value: user?.company?.subscriptionEndDate
        ? `${format(
            new Date(user?.company?.subscriptionEndDate || new Date()),
            "dd/MM/yyyy"
          )}\n${subscriptionDetails.renewText}`
        : "NA",
    },
  ];

  const redirectToTijarahWeb = async () => {
    let url;

    if (env === "production") {
      url = `https://app.tijarah360.com/account`;
    } else if (env === "qa") {
      url = `https://tijarah-qa.vercel.app/account/`;
    } else {
      url = `https://tijarah.vercel.app/account/`;
    }

    await WebBrowser.openBrowserAsync(url);
  };

  useEffect(() => {
    const isFocused = navigation.addListener("focus", () => {
      scrollRef?.current?.scrollTo({
        animated: false,
        index: 0,
      });
    });
    return isFocused;
  }, [navigation]);

  useEffect(() => {
    getProfile("profile");
  }, []);

  useEffect(() => {
    findLocations({
      page: 0,
      limit: 100,
      _q: "",
      sort: "desc",
      activeTab: "all",
      companyRef: user?.companyRef,
    });
  }, []);

  useEffect(() => {
    (async () => {
      const lang = (await DB.retrieveData(DBKeys.LANG || "en")) as string;

      const selectedLang = langs.find((language) => language.code == lang);

      if (selectedLang) {
        setSelectedLanguage(selectedLang as any);
      }

      const theme = ((await DB.retrieveData(DBKeys.THEME_MODE)) ||
        "light") as string;

      setThemeMode(theme);
    })();
  }, []);

  return (
    <View>
      <StatusBar
        style={"light" === "light" ? "dark" : "light"}
        backgroundColor={theme.colors.bgColor}
      />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{
          ...styles.container,
          paddingHorizontal: wp("5%"),
          backgroundColor: theme.colors.bgColor,
        }}
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: wp("1.5%"),
          }}
        >
          <ImageUploader
            size={80}
            left={32}
            bottom={35}
            uploadedImage={profile?.profilePicture || user?.profilePicture}
            handleImageChange={(uri: string) => updateProfilePic(uri)}
          />

          <View style={styles.data}>
            <DefaultText fontSize="2xl" fontWeight="bold">
              {trimText(user?.name || "", 30)}
            </DefaultText>

            <View
              style={{
                ...styles.phone_view,
                flexDirection: isRTL ? "row-reverse" : "row",
                justifyContent: isRTL ? "flex-end" : "flex-start",
              }}
            >
              <ICONS.CallIcon />

              <DefaultText
                style={{
                  marginLeft: isRTL ? 0 : getOriginalSize(5),
                  marginRight: isRTL ? getOriginalSize(5) : 0,
                }}
                fontSize="md"
                color="dark.800"
              >
                {user?.phone}
              </DefaultText>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={{
            ...styles.profile_view,
            backgroundColor: theme.colors.bgColor2,
          }}
          onPress={() => {
            setOpenLanguageModal(true);
          }}
        >
          <View style={styles.content_view}>
            <Image
              key={selectedLanguage.code}
              source={langFlags[selectedLanguage.code]}
              style={{
                width: getOriginalSize(45),
                height: getOriginalSize(45),
              }}
            />

            <DefaultText style={{ marginLeft: 12 }} fontWeight="bold">
              {langName[selectedLanguage.code || "en"]}
            </DefaultText>
          </View>

          <DefaultText fontSize="md" fontWeight="semibold" color="primary.1000">
            {t("Change")}
          </DefaultText>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={{
            ...styles.account_view,
            backgroundColor: theme.colors.bgColor2,
          }}
          onPress={() => {
            setOpenThemeModal(true);
          }}
        >
          <View style={styles.content_view}>
            <ICONS.ModeIcon />

            <DefaultText style={{ marginLeft: 12 }} fontWeight="bold">
              {t("Mode")}
            </DefaultText>
          </View>

          <View style={styles.content_view}>
            <DefaultText fontWeight="semibold" color="primary.1000">
              {themeMode === "light" ? t("Light") : t("Dark")}
            </DefaultText>

            <Entypo
              key="drop_down"
              size={24}
              style={{ marginTop: 2, marginLeft: 6 }}
              name={"chevron-small-down"}
              color={theme.colors.primary[1000]}
            />
          </View>
        </TouchableOpacity> */}

        <DefaultText
          style={{
            marginLeft: getOriginalSize(16),
            marginBottom: getOriginalSize(10),
            marginTop: hp("4.5%"),
          }}
          fontWeight="bold"
        >
          {t("Company Details")}
        </DefaultText>

        <View
          style={{
            ...styles.viewSubContainer,
            backgroundColor: theme.colors.bgColor2,
          }}
        >
          {companyData.map((company, index) => {
            return (
              <ProfileRow
                key={index}
                title={company.text}
                value={company.value}
                isDivider={!(companyData.length == index + 1)}
                disabled
              />
            );
          })}
        </View>

        {/* <View
          style={{
            marginBottom: getOriginalSize(10),
            marginHorizontal: getOriginalSize(16),
            marginTop: hp("4.5%"),
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <DefaultText fontWeight="bold">{t("Subscription")}</DefaultText>

          <TouchableOpacity disabled>
            <DefaultText fontWeight="bold" color="text.secondary">
              {t("Renew")}
            </DefaultText>
          </TouchableOpacity>
        </View>

        <View
          style={{
            ...styles.viewSubContainer,
            backgroundColor: theme.colors.bgColor2,
          }}
        >
          {subscriptionData.map((subscription, index) => {
            return (
              <ProfileRow
                key={index}
                title={subscription.text}
                value={subscription.value}
                isDivider={!(subscriptionData.length == index + 1)}
                disabled
              />
            );
          })}
        </View> */}

        <HelpCard />

        <TouchableOpacity
          style={{ marginHorizontal: "30%", alignSelf: "center" }}
          onPress={async () => {
            await logout();
          }}
        >
          <DefaultText fontWeight="bold">{t("Log out")}</DefaultText>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            marginHorizontal: "30%",
            alignSelf: "center",
            marginTop: getOriginalSize(16),
          }}
          onPress={() => {
            redirectToTijarahWeb();
          }}
        >
          <DefaultText fontWeight="bold" color="error.default">
            {t("Delete Account")}
          </DefaultText>
        </TouchableOpacity>

        <DefaultText
          style={{ textAlign: "center", marginTop: getOriginalSize(16) }}
          fontSize="md"
          color="#9EA3AE"
        >
          {`Tijarah360 © 2023 v${expo.version}.${getBuildNumber()}`}
        </DefaultText>

        <Spacer space={hp("12%")} />
      </ScrollView>

      <ChangeLanguage
        visible={openLanguageModal}
        handleClose={() => setOpenLanguageModal(false)}
      />

      <ChangeTheme
        visible={openThemeModal}
        handleClose={() => setOpenThemeModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: STATUSBAR_HEIGHT + getOriginalSize(20),
  },
  data: {
    marginTop: -getOriginalSize(30),
    marginLeft: getOriginalSize(20),
    flexDirection: "column",
  },
  phone_view: {
    marginTop: getOriginalSize(3),
    alignItems: "center",
  },
  profile_view: {
    marginTop: -getOriginalSize(10),
    borderRadius: getOriginalSize(16),
    paddingVertical: getOriginalSize(12),
    paddingHorizontal: getOriginalSize(18),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  account_view: {
    marginTop: getOriginalSize(16),
    borderRadius: getOriginalSize(16),
    paddingVertical: getOriginalSize(18),
    paddingHorizontal: getOriginalSize(20),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  content_view: { flexDirection: "row", alignItems: "center" },
  viewSubContainer: { borderRadius: getOriginalSize(16), overflow: "hidden" },
});

export default Profile;
