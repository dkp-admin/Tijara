import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import React, { useContext, useEffect, useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { t } from "../../../i18n";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import { useResponsive } from "../../hooks/use-responsiveness";
import { AuthType } from "../../types/auth-types";
import { LanguageType } from "../../types/language-types";
import MMKVDB from "../../utils/DB-MMKV";
import { DBKeys } from "../../utils/DBKeys";
import { LANG_FLAGS_EN, langs } from "../../utils/constants";
import ICONS from "../../utils/icons";
import { langFlags } from "../language-selection/language-row";
import ChangeLanguage from "../profile/change-language";
import Spacer from "../spacer";
import DefaultText from "../text/Text";
import showToast from "../toast";
import ContactSupport from "./contact-support";
import PrepareUpdate from "./prepare-update";
import { useSubscription } from "../../store/subscription-store";

const env = Constants.expoConfig?.extra?.env || "development";

export default function MoreDataRow() {
  const theme = useTheme();
  const isConnected = checkInternet();
  const { wp, hp, twoPaneView } = useResponsive();
  const navigation = useNavigation<any>();
  const authContext = useContext<AuthType>(AuthContext);
  const { hasPermission } = useSubscription();
  const [pendingOplogs, setPendingOpLogs] = useState<any>([]);

  const [selectedLanguage, setSelectedLanguage] = useState<LanguageType>({
    code: "en",
    name: "",
    flag: LANG_FLAGS_EN,
  });
  const [openLanguageModal, setOpenLanguageModal] = useState(false);
  const [prepareUpdateModal, setPrepareUpdateModal] = useState(false);
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
      key: "dashboard",
    },
    {
      leftIcon: <ICONS.ReportsIcon />,
      text: t("Reports"),
      rightIcon: null,
      path: "Reports",
      subPath: "",
      show: true,
      key: "reports",
    },
    {
      leftIcon: <ICONS.BarcodeIcon />,
      text: t("Barcode Print"),
      rightIcon: null,
      path: "Print",
      subPath: "",
      show: true,
      // key: "barcode_print", // Not in modules, will be shown by default
    },
    {
      leftIcon: <ICONS.BottomTransactionIcon />,
      text: t("Order Transactions"),
      rightIcon: null,
      path: "Transaction",
      subPath: "",
      show: true,
      key: "orders", // Not in modules, but we'll allow it for now
    },
    {
      leftIcon: <ICONS.BottomTransactionIcon />,
      text: t("All orders"),
      rightIcon: null,
      path: "Orders",
      subPath: "",
      show: true,
      key: "orders",
    },
    {
      leftIcon: <ICONS.CatalogueIcon />,
      text: t("Catalogue"),
      rightIcon: null,
      path: "Catalogue",
      subPath: "",
      show: true,
      key: "product_catalogue",
    },
    twoPaneView
      ? null
      : {
          leftIcon: <ICONS.StockUpdate />,
          text: t("Update Stock"),
          rightIcon: null,
          path: "UpdateStock",
          subPath: "",
          show: true,
          // key: "update_stock", // Not in modules
        },
    twoPaneView
      ? null
      : {
          leftIcon: <ICONS.WalletIcon />,
          text: t("Price Change"),
          rightIcon: null,
          path: "ChangePrice",
          subPath: "",
          show: true,
          key: "price_adjustment",
        },
    twoPaneView
      ? null
      : {
          leftIcon: <ICONS.StockAdd />,
          text: t("Receive Stocks"),
          rightIcon: null,
          path: "ReceiveStocks",
          subPath: "",
          show: true,
          // key: "receive_stocks", // Not in modules
        },
    {
      leftIcon: <ICONS.CustomersIcon />,
      text: t("Customers"),
      rightIcon: null,
      path: "Customers",
      subPath: "",
      show: true,
      key: "customers",
    },
    {
      leftIcon: <ICONS.DiscountsIcon />,
      text: t("Discounts"),
      rightIcon: null,
      path: "Discounts",
      subPath: "",
      show: true,
      key: "discounts",
    },
    {
      leftIcon: <ICONS.ExpensesIcon />,
      text: t("Miscellaneous Expenses"),
      rightIcon: null,
      path: "MiscellaneousExpenses",
      subPath: "",
      show: true,
      key: "miscellaneous_expenses",
    },
    {
      leftIcon: <ICONS.SettingsIcon />,
      text: t("Settings"),
      rightIcon: null,
      path: "Settings",
      subPath: "",
      show: true,
      // key: "settings", // Not in modules
    },
    {
      leftIcon: <ICONS.PrinterOrderIcon color={"black"} rectColor={"#fff"} />,
      text: t("Hardwares & Printers"),
      rightIcon: null,
      path: "Hardwares",
      subPath: "",
      show: true,
      // key: "hardwares_printers", // Not in modules
    },
    {
      leftIcon: <ICONS.VendorsIcon />,
      text: t("Vendors"),
      rightIcon: null,
      path: "webview",
      subPath: "vendor",
      show: authContext.permission["pos:vendor"]?.read,
      key: "vendors",
    },
    {
      leftIcon: <ICONS.POGRNIcon />,
      text: t("PO/GRN"),
      rightIcon: null,
      path: "webview",
      subPath: "purchase-order",
      show: authContext.permission["pos:po"]?.read,
      key: "purchase_order",
    },
    {
      leftIcon: <ICONS.InventoryHistoryIcon />,
      text: t("Inventory History"),
      rightIcon: null,
      path: "webview",
      subPath: "history",
      show: authContext.permission["pos:stock-history"]?.read,
      key: "inventory_history",
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
      // key: "language", // Not in modules
    },
    {
      leftIcon: <ICONS.ProfileCircleIcon />,
      text: t("My Profile"),
      rightIcon: null,
      path: "Profile",
      subPath: "",
      show: true,
      // key: "profile", // Not in modules
    },
    {
      leftIcon: <ICONS.ContactSupportIcon />,
      text: t("Contact Support"),
      rightIcon: null,
      path: "contact-support",
      subPath: "",
      show: true,
      // key: "contact_support", // Not in modules
    },
    // {
    //   leftIcon: <ICONS.PrepareUpdateIcon />,
    //   text: t("Prepare for update"),
    //   rightIcon: null,
    //   path: "prepare-update",
    //   subPath: "",
    //   show: true,
    // },
  ];

  useEffect(() => {
    const lang = MMKVDB.get(DBKeys.LANG) || "en";
    const selectedLang = langs.find((language) => language.code === lang);
    if (selectedLang) {
      setSelectedLanguage(selectedLang as any);
    }
  }, []);

  const filteredMoreData = moreData
    .filter((item) => item)
    .filter((data: any) => {
      if (!data.key) return true;

      return hasPermission(data.key);
    });

  return (
    <View
      style={{
        flexWrap: "wrap",
        flexDirection: twoPaneView ? "row" : "column",
      }}
    >
      {filteredMoreData.map((data: any, index) => (
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
            onPress={async () => {
              if (data.path === "language") {
                setOpenLanguageModal(true);
              } else if (data.path === "contact-support") {
                setOpenContactSupportModal(true);
              } else if (data.path === "webview") {
                if (!isConnected) {
                  showToast("error", t("Please connect with the internet"));
                  return;
                }

                if (!data.show) {
                  showToast(
                    "error",
                    t("You don't have permissions to view this screen")
                  );
                  return;
                }

                redirectionURL(data.subPath);
              } else if (data.path === "prepare-update") {
                setPrepareUpdateModal(true);
              } else {
                navigation.navigate("OtherNavigator", {
                  screen: data.path,
                });
              }
            }}
            disabled={data.path === ""}
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
      ))}

      <ChangeLanguage
        visible={openLanguageModal}
        handleClose={() => setOpenLanguageModal(false)}
      />

      {prepareUpdateModal && (
        <PrepareUpdate
          visible={prepareUpdateModal}
          handleClose={() => setPrepareUpdateModal(false)}
        />
      )}

      <ContactSupport
        visible={openContactSupportModal}
        handleClose={() => setOpenContactSupportModal(false)}
      />
    </View>
  );
}
