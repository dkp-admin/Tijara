import { useNavigation } from "@react-navigation/core";
import { createStackNavigator } from "@react-navigation/stack";
import React, { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { t } from "../../../i18n";
import CustomHeader from "../../components/common/custom-header";
import SeparatorVerticalView from "../../components/common/separator-vertical-view";
import SideMenu from "../../components/common/side-menu";
import SettingsNavHeader from "../../components/settings/settings-navigation-header";
import DefaultText from "../../components/text/Text";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import Loader from "../../components/loader";
import { debugLog } from "../../utils/log-patch";

const BusinessDetails = lazy(
  () => import("../../components/settings/business-details")
);
const Billing = lazy(() => import("../../components/settings/billing"));
const Hardware = lazy(() => import("../../components/settings/hardware"));

const SettingsStackNav = createStackNavigator();

const Settings = () => {
  const theme = useTheme();
  const navigation = useNavigation() as any;
  const { wp, hp, twoPaneView } = useResponsive();

  const [queryText, setQueryText] = useState<string>("");
  const [selectedMenu, setSelectedMenu] = useState<string>("businessDetails");

  const menuOptions = [
    { title: t("Business Details"), value: "businessDetails" },
    { title: t("Billing"), value: "billing" },
    { title: t("Hardware"), value: "hardware" },
  ];

  const getHeaderText: any = {
    businessDetails: t("BUSINESS DETAILS"),
    billing: t("BILLING"),
    hardware: t("HARDWARE"),
  };

  const getSelectedSettings = useMemo(() => {
    if (selectedMenu === "businessDetails") {
      return (
        <Suspense fallback={<Loader />}>
          <BusinessDetails />
        </Suspense>
      );
    } else if (selectedMenu === "billing") {
      return (
        <Suspense fallback={<Loader />}>
          <Billing />
        </Suspense>
      );
    } else if (selectedMenu === "hardware") {
      return (
        <Suspense fallback={<Loader />}>
          <Hardware />
        </Suspense>
      );
    }
  }, [selectedMenu]);

  const renderSideMenu = useMemo(
    () => (
      <SideMenu
        isSearch={false}
        title={t("SETTINGS")}
        placeholderText={t("Search")}
        queryText={queryText}
        setQueryText={setQueryText}
        selectedMenu={selectedMenu}
        setSelectedMenu={(menu: string) => {
          debugLog(
            getHeaderText[menu],
            { row: menu },
            "settings-screen",
            "selectedMenuFunction"
          );

          if (twoPaneView) {
            setSelectedMenu(menu);
          } else {
            navigation.navigate(menu);
          }
        }}
        menuOptions={menuOptions}
      />
    ),
    [selectedMenu]
  );

  const renderContent = () => (
    <>
      <SeparatorVerticalView />

      <View
        style={{
          flex: 0.75,
          height: "100%",
          backgroundColor: theme.colors.white[1000],
        }}
      >
        <View
          style={{
            height: hp("9.5%"),
            paddingTop: hp("3.75%"),
            paddingLeft: wp("1.75%"),
            paddingRight: wp("0.75%"),
            borderBottomWidth: 1,
            borderColor: theme.colors.dividerColor.secondary,
            backgroundColor: theme.colors.primary[100],
          }}
        >
          <DefaultText fontWeight="medium">
            {getHeaderText[selectedMenu]}
          </DefaultText>
        </View>

        {getSelectedSettings}
      </View>
    </>
  );

  const SettingsMenuComponent = () => {
    return (
      <View style={styles.container}>
        {renderSideMenu}

        {twoPaneView && renderContent()}
      </View>
    );
  };

  useEffect(() => {
    setQueryText("");
  }, []);

  return (
    <>
      <CustomHeader />

      <View
        style={{ ...styles.container, backgroundColor: theme.colors.bgColor }}
      >
        <SettingsStackNav.Navigator>
          <SettingsStackNav.Screen
            name="SettingsMenu"
            options={{ headerShown: false }}
            component={SettingsMenuComponent}
          />

          <SettingsStackNav.Screen
            name="businessDetails"
            options={{
              header: () => <SettingsNavHeader title={t("Business Details")} />,
            }}
            component={BusinessDetails}
          />

          <SettingsStackNav.Screen
            name="billing"
            options={{
              header: () => <SettingsNavHeader title={t("Billing")} />,
            }}
            component={Billing}
          />

          <SettingsStackNav.Screen
            name="hardware"
            options={{
              header: () => <SettingsNavHeader title={t("Hardware")} />,
            }}
            component={Hardware}
          />
        </SettingsStackNav.Navigator>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
});

export default Settings;
