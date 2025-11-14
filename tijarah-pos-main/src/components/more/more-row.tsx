import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import React, { useContext, useEffect, useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { t } from "../../../i18n";
import AuthContext from "../../context/auth-context";
import DeviceContext from "../../context/device-context";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import { useResponsive } from "../../hooks/use-responsiveness";
import { AuthType } from "../../types/auth-types";
import { LanguageType } from "../../types/language-types";
import MMKVDB from "../../utils/DB-MMKV";
import { DBKeys } from "../../utils/DBKeys";
import { LANG_FLAGS_EN, langs } from "../../utils/constants";
import ICONS from "../../utils/icons";
import { debugLog, infoLog } from "../../utils/log-patch";
import { langFlags } from "../language-selection/language-row";
import ChangeLanguage from "../profile/change-language";
import Spacer from "../spacer";
import DefaultText from "../text/Text";
import showToast from "../toast";
import ContactSupport from "./contact-support";

const env = Constants.expoConfig?.extra?.env || "development";

export default function MoreDataRow() {
  const theme = useTheme();
  const isConnected = checkInternet();
  const { wp, hp, twoPaneView } = useResponsive();
  const navigation = useNavigation<any>();
  const authContext = useContext<AuthType>(AuthContext);
  const deviceContext = useContext<any>(DeviceContext);

  const [selectedLanguage, setSelectedLanguage] = useState<LanguageType>({
    code: "en",
    name: "",
    flag: LANG_FLAGS_EN,
  });
  const [openLanguageModal, setOpenLanguageModal] = useState(false);
  const [openContactSupportModal, setOpenContactSupportModal] = useState(false);

  const langName: any = {
    ar: t("Arabic"),
    en: t("English"),
    ur: t("Urdu"),
  };

  const redirectionURL = async (data: string) => {
    let url;
    const phone = authContext.user.phone;
    const posSessionId = MMKVDB.get(DBKeys.POS_SESSION_ID);

    if (env === "production") {
      url = `https://app.tijarah360.com/authentication/authorize?redirectURL=${data}&phone=${phone}&pos_id=${posSessionId}&locationRef=${authContext.user.locationRef}`;
    } else if (env === "qa") {
      url = `https://tijarah-qa.vercel.app/authentication/authorize?redirectURL=${data}&phone=${phone}&pos_id=${posSessionId}&locationRef=${authContext.user.locationRef}`;
    } else if (env === "test") {
      url = `https://tijarah-test.vercel.app/authentication/authorize?redirectURL=${data}&phone=${phone}&pos_id=${posSessionId}&locationRef=${authContext.user.locationRef}`;
    } else {
      url = `https://tijarah-qa.vercel.app/authentication/authorize?redirectURL=${data}&phone=${phone}&pos_id=${posSessionId}&locationRef=${authContext.user.locationRef}`;
    }

    debugLog(
      "Open web view for " + data,
      { url: url },
      "more-tab-screen",
      "handleRowOnPress"
    );
    await WebBrowser.openBrowserAsync(url);
  };

  const moreData = [
    {
      leftIcon: <ICONS.DashboardIcon />,
      text: t("Dashboard"),
      rightIcon: null,
      path: "Dashboard",
      subPath: "",
      show: true,
    },
    {
      leftIcon: <ICONS.ReportsIcon />,
      text: t("Reports"),
      rightIcon: null,
      path: "Reports",
      subPath: "",
      show: true,
    },
    {
      leftIcon: <ICONS.BarcodeIcon />,
      text: t("Barcode Print"),
      rightIcon: null,
      path: "Print",
      subPath: "",
      show: true,
    },
    {
      leftIcon: <ICONS.BottomTransactionIcon />,
      text: t("Order Transactions"),
      rightIcon: null,
      path: "Transaction",
      subPath: "",
      show: true,
    },
    {
      leftIcon: <ICONS.CatalogueIcon />,
      text: t("Catalogue"),
      rightIcon: null,
      path: "Catalogue",
      subPath: "",
      show: true,
    },
    {
      leftIcon: <ICONS.CustomersIcon />,
      text: t("Customers"),
      rightIcon: null,
      path: "Customers",
      subPath: "",
      show: true,
    },
    {
      leftIcon: <ICONS.DiscountsIcon />,
      text: t("Discounts"),
      rightIcon: null,
      path: "Discounts",
      subPath: "",
      show: true,
    },
    {
      leftIcon: <ICONS.ExpensesIcon />,
      text: t("Miscellaneous Expenses"),
      rightIcon: null,
      path: "MiscellaneousExpenses",
      subPath: "",
      show: true,
    },
    {
      leftIcon: <ICONS.SettingsIcon />,
      text: t("Settings"),
      rightIcon: null,
      path: "Settings",
      subPath: "",
      show: true,
    },
    {
      leftIcon: <ICONS.VendorsIcon />,
      text: t("Vendors"),
      rightIcon: null,
      path: "webview",
      subPath: "vendor",
      show: authContext.permission["pos:vendor"]?.read,
    },
    {
      leftIcon: <ICONS.POGRNIcon />,
      text: t("PO/GRN"),
      rightIcon: null,
      path: "webview",
      subPath: "purchase-order",
      show: authContext.permission["pos:po"]?.read,
    },
    {
      leftIcon: <ICONS.InventoryHistoryIcon />,
      text: t("Inventory History"),
      rightIcon: null,
      path: "webview",
      subPath: "history",
      show: authContext.permission["pos:stock-history"]?.read,
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
      subPath: "",
      show: true,
    },
    {
      leftIcon: <ICONS.ProfileCircleIcon />,
      text: t("My Profile"),
      rightIcon: null,
      path: "Profile",
      subPath: "",
      show: true,
    },
    {
      leftIcon: <ICONS.ContactSupportIcon />,
      text: t("Contact Support"),
      rightIcon: null,
      path: "contact-support",
      subPath: "",
      show: true,
    },
  ];

  useEffect(() => {
    const lang = MMKVDB.get(DBKeys.LANG) || "en";

    const selectedLang = langs.find((language) => language.code == lang);

    if (selectedLang) {
      setSelectedLanguage(selectedLang as any);
    }
  }, []);

  return (
    <View
      style={{
        flexWrap: "wrap",
        flexDirection: twoPaneView ? "row" : "column",
      }}
    >
      {moreData.map((data, index) => {
        return (
          <View
            key={index}
            style={{
              marginVertical: hp("1%"),
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
                backgroundColor: theme.colors.bgColor2,
              }}
              onPress={() => {
                if (data.path == "language") {
                  setOpenLanguageModal(true);
                } else if (data.path == "contact-support") {
                  setOpenContactSupportModal(true);
                } else if (data.path === "webview") {
                  if (!isConnected) {
                    infoLog(
                      "Internet not connected",
                      {
                        text: data.text,
                        path: data.path,
                        subPath: data.subPath,
                      },
                      "more-tab-screen",
                      "handleRowOnPress"
                    );
                    showToast("error", t("Please connect with the internet"));
                    return;
                  }

                  if (!data.show) {
                    debugLog(
                      "Permission denied to view screen",
                      {
                        text: data.text,
                        path: data.path,
                        subPath: data.subPath,
                      },
                      "more-tab-screen",
                      "handleRowOnPress"
                    );
                    showToast(
                      "error",
                      t("You don't have permissions to view this screen")
                    );
                    return;
                  }

                  redirectionURL(data.subPath);
                } else {
                  debugLog(
                    "Navigate to " + data.path,
                    { text: data.text, path: data.path, subPath: data.subPath },
                    "more-tab-screen",
                    "handleRowOnPress"
                  );
                  navigation.navigate(data.path);
                }
              }}
              disabled={data.path == ""}
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

            {twoPaneView && <Spacer space={wp("1.75%")} />}
          </View>
        );
      })}

      <ChangeLanguage
        visible={openLanguageModal}
        handleClose={() => setOpenLanguageModal(false)}
      />

      <ContactSupport
        visible={openContactSupportModal}
        handleClose={() => setOpenContactSupportModal(false)}
      />
    </View>
  );
}
