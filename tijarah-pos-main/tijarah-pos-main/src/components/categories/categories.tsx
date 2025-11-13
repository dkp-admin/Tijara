import { useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { t } from "../../../i18n";
import { useResponsive } from "../../hooks/use-responsiveness";
import SeparatorVerticalView from "../common/separator-vertical-view";
import NoDataPlaceholder from "../no-data-placeholder/no-data-placeholder";
import ProductList from "../products/products-list";
import CategoryList from "./category-list";
import AuthContext from "../../context/auth-context";
import { AuthType } from "../../types/auth-types";
import { debugLog } from "../../utils/log-patch";

const CategoryStackNavigator = createStackNavigator();

const Categories = () => {
  const { hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);
  const navigation = useNavigation() as any;

  const [selectedCategory, setSelectedCategory] = useState(null);

  const ProductListMemoizedCategory = () => (
    <ProductList categoryId={selectedCategory} />
  );

  const CategoryListComponent = useMemo(
    () => () =>
      (
        <CategoryList
          handleSelectCategory={setSelectedCategory}
          navigateToProduct={handleNavigate}
        />
      ),
    []
  );

  const handleNavigate = useCallback((name: any) => {
    debugLog(
      "Navigate to product screen",
      { categoryName: name },
      "catalogue-categories-screen",
      "handleNavigate"
    );
    navigation.navigate("CatalogueProduct", { categoryName: name });
  }, []);

  return (
    <View style={styles.container}>
      <View
        style={{
          flex:
            authContext.permission["pos:category"]?.read && twoPaneView
              ? 0.35
              : 1,
        }}
      >
        <CategoryStackNavigator.Navigator>
          <CategoryStackNavigator.Screen
            name="CatalogueCategory"
            options={{
              headerShown: false,
            }}
            component={CategoryListComponent}
          />

          <CategoryStackNavigator.Screen
            name="CatalogueProduct"
            options={{
              headerShown: false,
            }}
            component={ProductListMemoizedCategory}
          />
        </CategoryStackNavigator.Navigator>
      </View>

      <SeparatorVerticalView />

      {authContext.permission["pos:category"]?.read && twoPaneView && (
        <View style={{ flex: 0.65 }}>
          {selectedCategory ? (
            <ProductListMemoizedCategory />
          ) : (
            <NoDataPlaceholder
              title={t("No Products!")}
              marginTop={hp("40%")}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
});

export default Categories;
