import { useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import CategoryHeader from "../../../categories/category-header";
import CategoryListCatalogue from "./category-list";
import ProductListCatalogue from "./products-list";

const CategoriesCatalogue = () => {
  const navigation = useNavigation() as any;
  const CategoryStackNavigator = createStackNavigator();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const ProductListMemoizedBilling = React.memo(() => (
    <ProductListCatalogue categoryId={selectedCategory} />
  ));

  const handleNavigate = useCallback((name: any) => {
    navigation.navigate("ProductListBilling", { categoryName: name });
  }, []);

  const CategoryListBilling = React.memo(() => (
    <CategoryListCatalogue
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      navigateToProduct={handleNavigate}
    />
  ));

  return (
    <View style={styles.container}>
      <CategoryStackNavigator.Navigator>
        <CategoryStackNavigator.Screen
          name="CategoryListBilling"
          options={{ headerShown: false }}
          component={CategoryListBilling}
        />

        <CategoryStackNavigator.Screen
          name="ProductListBilling"
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
  container: {
    flex: 1,
    flexDirection: "row",
  },
});

export default CategoriesCatalogue;
