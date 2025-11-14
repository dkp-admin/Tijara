import { useNavigation } from "@react-navigation/native";
import React, { useContext, useEffect, useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { t } from "../../../i18n";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import { AuthType } from "../../types/auth-types";
import { LanguageType } from "../../types/language-types";
import MMKVDB from "../../utils/DB-MMKV";
import { DBKeys } from "../../utils/DBKeys";
import { LANG_FLAGS_EN, langs } from "../../utils/constants";
import ICONS from "../../utils/icons";
import { debugLog } from "../../utils/log-patch";
import { trimText } from "../../utils/trim-text";
import { langFlags } from "../language-selection/language-row";
import Spacer from "../spacer";
import DefaultText from "../text/Text";
import ChangeLanguage from "./change-language";

export default function ProfileDataRow() {
  const theme = useTheme();
  const { wp, hp, twoPaneView } = useResponsive();
  const navigation = useNavigation<any>();
  const authContext = useContext<AuthType>(AuthContext);

  // const [darkMode, setDarkMode] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageType>({
    code: "en",
    name: "",
    flag: LANG_FLAGS_EN,
  });
  const [openLanguageModal, setOpenLanguageModal] = useState(false);

  const langName: any = {
    ar: t("Arabic"),
    en: t("English"),
    ur: t("Urdu"),
  };

  const profileData = [
    {
      leftIcon: <ICONS.CallIcon />,
      text: authContext?.user?.phone,
      rightIcon: null,
      path: "",
      disabled: true,
    },
    {
      leftIcon: <ICONS.EmailIcon />,
      text: email,
      rightIcon: null,
      path: "",
      disabled: true,
    },
    {
      leftIcon: <ICONS.ChangePinIcon />,
      text: t("Change login code"),
      rightIcon: null,
      path: "ForgotChangeLoginCode",
      disabled: !authContext.permission["pos:user"]?.["change-pin"],
    },
    {
      leftIcon: <ICONS.LanguageIcon />,
      text: langName[selectedLanguage.code || "en"],
      rightIcon: (
        <Image
          key={selectedLanguage.code}
          source={langFlags[selectedLanguage.code]}
        />
      ),
      path: "language",
      disabled: false,
    },
    // {
    //   leftIcon: <ICONS.ModeIcon />,
    //   text: t("Dark mode"),
    //   rightIcon: (
    //     <Switch
    //       style={{
    //         transform:
    //           Platform.OS == "ios"
    //             ? [{ scaleX: 0.9 }, { scaleY: 0.9 }]
    //             : [{ scaleX: 1.5 }, { scaleY: 1.5 }],
    //         height: hp("5%"),
    //       }}
    //       trackColor={{
    //         false: "rgba(120, 120, 128, 0.16)",
    //         true: "#34C759",
    //       }}
    //       thumbColor={theme.colors.white[1000]}
    //       onValueChange={async (value) => {
    //         setDarkMode(value ? "dark" : "light");
    //         MMKVDB.set(
    //           DBKeys.THEME_MODE,
    //           value ? "dark" : "light"
    //         );
    //         EventRegister.emit("changeTheme", value ? "dark" : "light");
    //       }}
    //       value={darkMode == "dark"}
    //     />
    //   ),
    //   path: "",
    //   disabled: false,
    // },
  ];

  useEffect(() => {
    const lang = MMKVDB.get(DBKeys.LANG) || "en";

    const selectedLang = langs.find((language) => language.code == lang);

    if (selectedLang) {
      setSelectedLanguage(selectedLang as any);
    }

    // const theme: any = MMKVDB.get(DBKeys.THEME_MODE) || "light";

    // setDarkMode(theme);
  }, []);

  useEffect(() => {
    const data = authContext.user.email?.split("@");
    const emailText = `${trimText(data[0], 35)}@${data[1]}`;

    setEmail(emailText);
  }, [authContext]);

  return (
    <View
      style={{
        flexWrap: "wrap",
        flexDirection: twoPaneView ? "row" : "column",
      }}
    >
      {profileData.map((data, index) => {
        return (
          <View
            key={index}
            style={{
              marginTop: hp("2.25%"),
              flexDirection: "row",
              width: twoPaneView ? "50%" : "100%",
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                borderRadius: 14,
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: hp("2%"),
                paddingHorizontal: hp("1.5%"),
                backgroundColor: theme.colors.white[1000],
              }}
              onPress={() => {
                if (data.path == "ForgotChangeLoginCode") {
                  debugLog(
                    "navigate to change login code",
                    authContext?.user,
                    "profile-screen",
                    "handleRowOnPress"
                  );
                  navigation.navigate("ForgotChangeLoginCode", {
                    title: t("Change login code"),
                    userData: {
                      ...authContext?.user,
                      key: authContext.user?._id,
                      value: `${authContext.user?.name} (${authContext.user?.phone})`,
                    },
                    isFromProfile: true,
                  });
                } else if (data.path == "language") {
                  setOpenLanguageModal(true);
                } else {
                  navigation.navigate(data.path);
                }
              }}
              disabled={data.disabled}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {data.leftIcon}

                <DefaultText
                  style={{ marginLeft: wp("1.7%") }}
                  fontWeight="medium"
                >
                  {data.text}
                </DefaultText>
              </View>

              {data.rightIcon}
            </TouchableOpacity>

            <Spacer space={wp("1.75%")} />
          </View>
        );
      })}

      <ChangeLanguage
        visible={openLanguageModal}
        handleClose={() => setOpenLanguageModal(false)}
      />
    </View>
  );
}
