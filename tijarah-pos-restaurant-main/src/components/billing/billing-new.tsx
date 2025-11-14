import React, { Suspense, lazy, useEffect, useMemo } from "react";
import {
  GestureResponderEvent,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SceneMap, TabView } from "react-native-tab-view";
import { t } from "../../../i18n";
import SeparatorVerticalView from "../../components/common/separator-vertical-view";
import Loader from "../../components/loader";
import { CartContextProvider } from "../../context/cart-context";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import { useMenuFilterStore } from "../../store/menu-filter-store-new";
import DefaultText from "../text/Text";
import BillingNewCart from "./billing-new/billing-new-cart";
import BillingHeaderNew from "./billing-new/billing-new-header";
import QuickItemsTab from "./left-view/quick-items-tab";

// Lazy load BillingMenu component for code splitting
const BillingMenu = lazy(() => import("./billing-new/billing-menu"));

// Memoized MenuTab component to prevent unnecessary re-renders
const MenuTab = React.memo(() => {
  return (
    <Suspense fallback={<Loader />}>
      <BillingMenu />
    </Suspense>
  );
});

// Pre-defined scene map for TabView
const renderScene = SceneMap({
  menu: MenuTab,
  "quick-items": QuickItemsTab,
});

const BillingNew = () => {
  const theme = useTheme();
  const { setCategoryId } = useMenuFilterStore();
  const { hp, twoPaneView } = useResponsive();
  const [index, setIndex] = React.useState(0);

  // Memoize routes array to prevent recreation on each render
  const routes = useMemo(
    () => [
      { key: "menu", title: t("Menu") },
      { key: "quick-items", title: t("Quick Items") },
    ],
    []
  );

  // Set initial category on mount only
  useEffect(() => {
    setCategoryId("all");
  }, [setCategoryId]);

  // Memoize tab press handler
  const handleTabPress = React.useCallback(
    (idx: number) => (event: GestureResponderEvent) => {
      if (event.nativeEvent.changedTouches) setIndex(idx);
    },
    []
  );

  // Memoize tab styles to prevent object recreation
  const getTabStyle = React.useCallback(
    (isActive: boolean) => ({
      paddingVertical: hp("1.25%"),
      marginRight: hp("2.5%"),
      borderBottomColor: theme.colors.primary[1000],
      borderBottomWidth: isActive ? 2 : 0,
    }),
    [hp, theme.colors.primary]
  );

  // Memoize transformed tabs with optimized rendering
  const transformedTabs = useMemo(() => {
    return routes.map((route, idx) => {
      const isActive = index === idx;
      return (
        <TouchableOpacity
          key={route.key}
          style={getTabStyle(isActive)}
          onPress={handleTabPress(idx)}
        >
          <View pointerEvents="none">
            <DefaultText
              style={{ lineHeight: Platform.OS === "android" ? 20 : 0 }}
              fontSize="md"
              fontWeight={isActive ? "medium" : "normal"}
              color={isActive ? "primary.1000" : "otherGrey.200"}
            >
              {route.title}
            </DefaultText>
          </View>
        </TouchableOpacity>
      );
    });
  }, [index, routes, getTabStyle, handleTabPress]);

  // Memoize tab bar component to prevent unnecessary re-renders
  const renderTabBar = React.useCallback(
    () => (
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View
          style={{
            ...styles.tabContainer,
            paddingHorizontal: hp("2%"),
            borderBottomColor: theme.colors.dividerColor.secondary,
            flex: 1,
          }}
        >
          {transformedTabs}
        </View>
        <BillingHeaderNew />
      </View>
    ),
    [transformedTabs]
  );

  return (
    <View
      style={{
        ...styles.container,
        backgroundColor: theme.colors.bgColor,
      }}
    >
      <View style={{ flex: 0.7, paddingVertical: hp("1.5%") }}>
        <TabView
          renderTabBar={renderTabBar}
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
        />
      </View>

      <SeparatorVerticalView />

      {true && (
        <CartContextProvider>
          <View style={{ flex: 0.32 }}>
            <Suspense fallback={<Loader />}>
              <BillingNewCart />
            </Suspense>
          </View>
        </CartContextProvider>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row" },
  tabContainer: {
    borderBottomWidth: 1,
    flexDirection: "row",
  },
});

export default BillingNew;
