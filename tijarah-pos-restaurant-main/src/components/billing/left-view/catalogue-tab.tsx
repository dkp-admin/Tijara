import React, { Suspense, lazy, useContext, useMemo } from "react";
import { View } from "react-native";
import { useResponsive } from "../../../hooks/use-responsiveness";
import useCommonApis from "../../../hooks/useCommonApis";
import Loader from "../../loader";

const MenuItemsListCatalogue = lazy(
  () => import("../left-view/catalogue/menu-items-list")
);
const MenuCategoriesCatalogue = lazy(
  () => import("../left-view/catalogue/menu-categories")
);
const ProductListCatalogue = lazy(
  () => import("../left-view/catalogue/products-list")
);
const CategoriesCatalogue = lazy(
  () => import("../left-view/catalogue/categories")
);

const CatalogueTab = React.memo(() => {
  const { wp, twoPaneView } = useResponsive();
  const { businessData, billingSettings } = useCommonApis();

  const CatalogueComponent = useMemo(() => {
    if (billingSettings?.catalogueManagement) {
      return businessData?.company?.industry === "restaurant"
        ? MenuItemsListCatalogue
        : ProductListCatalogue;
    } else {
      return businessData?.company?.industry === "restaurant"
        ? MenuCategoriesCatalogue
        : CategoriesCatalogue;
    }
  }, [billingSettings?.catalogueManagement, businessData?.company?.industry]);

  return (
    <View style={{ flex: 1, height: "100%" }}>
      <View style={{ width: "100%" }} />
      <Suspense fallback={<Loader />}>
        <View
          style={{ flex: 1, maxWidth: twoPaneView ? wp("50%") : wp("100%") }}
        >
          <CatalogueComponent />
        </View>
      </Suspense>
    </View>
  );
});

CatalogueTab.displayName = "CatalogueTab";

export default CatalogueTab;
