import { useNavigation } from "@react-navigation/core";
import { createStackNavigator } from "@react-navigation/stack";
import React, { Suspense, lazy, useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { t } from "../../../i18n";
import Categories from "../../components/categories/categories";
import CustomHeader from "../../components/common/custom-header";
import SeparatorVerticalView from "../../components/common/separator-vertical-view";
import GlobalProductList from "../../components/global-products/global-products-list";
import Loader from "../../components/loader";
import ProductList from "../../components/products/products-list";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import { debugLog } from "../../utils/log-patch";

const SideMenu = lazy(() => import("../../components/common/side-menu"));

const CatalogueStackNav = createStackNavigator();

const ProductsListComponent = () => {
  return <ProductList />;
};

const CategoryListComponent = () => {
  return <Categories />;
};

const GlobalProductsListComponent = () => {
  return <GlobalProductList />;
};

const Catalogue = () => {
  const theme = useTheme();
  const navigation = useNavigation() as any;
  const { twoPaneView } = useResponsive();

  const [selectedMenu, setSelectedMenu] = useState(
    twoPaneView ? "products" : ""
  );

  const menuOptions = [
    { title: t("Products"), desc: "", value: "products" },
    { title: t("Categories"), desc: "", value: "categories" },
    {
      title: t("Global Products"),
      desc: `${t(
        "These are the products on Tijarah platform and not your products inventory"
      )}. ${t(
        "You can add products from the list to your products offerings"
      )}.`,
      value: "globalProducts",
    },
  ];

  const handleNavigate = useCallback((menu: string) => {
    if (menu === "products") {
      navigation.navigate("Products");
    } else if (menu === "categories") {
      navigation.navigate("Categories");
    } else if (menu === "globalProducts") {
      navigation.navigate("GlobalProducts");
    }
  }, []);

  const renderSideMenu = () => (
    <Suspense fallback={<Loader />}>
      <SideMenu
        title={t("CATALOGUE")}
        selectedMenu={selectedMenu}
        setSelectedMenu={(menu: string) => {
          debugLog(
            menu,
            { row: menu },
            "catalogue-screen",
            "selectedMenuFunction"
          );
          setSelectedMenu(menu);

          if (!twoPaneView) {
            handleNavigate(menu);
          }
        }}
        menuOptions={menuOptions}
      />
    </Suspense>
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
        {twoPaneView && selectedMenu === "products" && ProductsListComponent()}

        {twoPaneView &&
          selectedMenu === "categories" &&
          CategoryListComponent()}

        {twoPaneView &&
          selectedMenu === "globalProducts" &&
          GlobalProductsListComponent()}
      </View>
    </>
  );

  const CatalogueMenuComponent = useMemo(
    () => () => {
      return (
        <View style={styles.container}>
          {renderSideMenu()}

          {twoPaneView && renderContent()}
        </View>
      );
    },
    [selectedMenu]
  );

  return (
    <>
      <CustomHeader />

      <View
        style={{ ...styles.container, backgroundColor: theme.colors.bgColor }}
      >
        <CatalogueStackNav.Navigator>
          <CatalogueStackNav.Screen
            name="Menu"
            options={{ headerShown: false }}
            component={CatalogueMenuComponent}
          />

          <CatalogueStackNav.Screen
            name="Products"
            options={{ headerShown: false }}
            component={ProductsListComponent}
          />

          <CatalogueStackNav.Screen
            name="Categories"
            options={{ headerShown: false }}
            component={CategoryListComponent}
          />

          <CatalogueStackNav.Screen
            name="GlobalProducts"
            options={{ headerShown: false }}
            component={GlobalProductsListComponent}
          />
        </CatalogueStackNav.Navigator>
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

export default Catalogue;
