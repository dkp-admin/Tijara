import { useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import CategoryHeader from "../../../categories/category-header";
import MenuCategoryListCatalogue from "./menu-category-list";
import MenuItemsListCatalogue from "./menu-items-list";

const MenuCategoriesCatalogue = () => {
  const navigation = useNavigation() as any;
  const CategoryStackNavigator = createStackNavigator();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const ProductListMemoizedBilling = React.memo(() => (
    <MenuItemsListCatalogue categoryId={selectedCategory} />
  ));

  const handleNavigate = useCallback((name: any) => {
    navigation.navigate("MenuItemListBilling", {
      categoryName: name,
      isRestaurant: true,
    });
  }, []);

  const CategoryListBilling = React.memo(() => (
    <MenuCategoryListCatalogue
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      navigateToProduct={handleNavigate}
    />
  ));

  return (
    <View style={styles.container}>
      <CategoryStackNavigator.Navigator>
        <CategoryStackNavigator.Screen
          name="MenuCategoryListBilling"
          options={{ headerShown: false }}
          component={CategoryListBilling}
        />

        <CategoryStackNavigator.Screen
          name="MenuItemListBilling"
          options={{
            header: CategoryHeader,
          }}
          component={ProductListMemoizedBilling}
        />
      </CategoryStackNavigator.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row" },
});

export default MenuCategoriesCatalogue;
