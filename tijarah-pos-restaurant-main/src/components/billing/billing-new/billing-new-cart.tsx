import React, { useMemo } from "react";
import {
  GestureResponderEvent,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { TabView } from "react-native-tab-view";

import { EventRegister } from "react-native-event-listeners";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { useMenuTab } from "../../../store/menu-tab-store";
import MMKVDB from "../../../utils/DB-MMKV";
import DefaultText from "../../text/Text";
import ActionsTabBillingNew from "./billing-new-actions-tab";
import CheckoutTabBilling from "./billing-new-checkout-tab";

const renderScene = ({ route, jumpTo }: any) => {
  switch (route.key) {
    case "checkout":
      return <CheckoutTabBilling jumpTo={jumpTo} />;
    case "actions":
      return <ActionsTabBillingNew jumpTo={jumpTo} />;
  }
};

export default function BillingNewCart() {
  const theme = useTheme();
  const { hp } = useResponsive();

  const { tab, changeTab } = useMenuTab();
  const routes = useMemo(() => {
    return [
      { key: "checkout", title: t("Checkout") },
      { key: "actions", title: t("Actions") },
    ];
  }, []);

  const transformedTabs = useMemo(() => {
    return routes.map((route, idx) => {
      return (
        <TouchableOpacity
          key={idx}
          style={{
            paddingVertical: hp("1.25%"),
            marginRight: hp("2.5%"),
            borderBottomColor: theme.colors.primary[1000],
            borderBottomWidth: tab == idx ? 2 : 0,
          }}
          onPress={(event: GestureResponderEvent) => {
            if (route.key === "actions") {
              const tableData = MMKVDB.get("activeTableDineIn");
              EventRegister.emit("tableUpdated", tableData);
            }

            if (event.nativeEvent.changedTouches) changeTab(idx);
          }}
        >
          <View pointerEvents="none">
            <DefaultText
              style={{ lineHeight: Platform.OS == "android" ? 20 : 0 }}
              fontSize="md"
              fontWeight={tab == idx ? "medium" : "normal"}
              color={tab == idx ? "primary.1000" : "otherGrey.200"}
            >
              {route.title}
            </DefaultText>
          </View>
        </TouchableOpacity>
      );
    });
  }, [tab, routes]);

  return (
    <View style={{ flex: 1, paddingVertical: hp("1.5%") }}>
      <TabView
        renderTabBar={({ jumpTo }) => (
          <View
            style={{
              ...styles.tabContainer,
              paddingHorizontal: hp("2%"),
              borderBottomColor: theme.colors.dividerColor.secondary,
            }}
          >
            {transformedTabs}
          </View>
        )}
        navigationState={{ index: tab, routes }}
        renderScene={renderScene}
        onIndexChange={changeTab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    borderBottomWidth: 1,
    flexDirection: "row",
  },
});
