import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Keyboard, TouchableOpacity, View } from "react-native";
import { useInfiniteQuery } from "react-query";
import { useDebounce } from "use-debounce";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { useBusinessDetails } from "../../../../hooks/use-business-details";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import useChannelStore from "../../../../store/channel-store";
import ICONS from "../../../../utils/icons";
import EmptyOrLoaderComponent from "../../../empty";
import Input from "../../../input/input";
import Loader from "../../../loader";
import DefaultText from "../../../text/Text";
import AddBillingProductModal from "./add-product-modal";
import ProductRowCatalogue from "./product-row";
import repository from "../../../../db/repository";
import { rowsPerPage } from "../../../../utils/constants";

async function fetchMenu(
  pageParam: number,
  channel: string,
  query: string,
  categoryRef: string
) {
  const [menus, total] = await repository.menuRepository.paginateWithChannel(
    pageParam,
    rowsPerPage,
    channel
  );

  let productCount = 0;
  const filteredProducts = [];

  for (const product of menus[0]?.products || []) {
    if (productCount >= 100) break;

    const isActive = product.status === "active";

    const matchesQuery = query
      ? product.name.en.toLowerCase().includes(query.toLowerCase()) ||
        product.variants.some(
          (variant: any) =>
            variant.sku.includes(query) || variant?.code.includes(query)
        )
      : true;

    const matchesCategory = categoryRef
      ? product.categoryRef === categoryRef
      : true;

    if (isActive && matchesQuery && matchesCategory) {
      filteredProducts.push(product);
      productCount++;
    }
  }

  return {
    results: filteredProducts || [],
    total: filteredProducts?.length || 0,
  };
}

const MenuItemsListCatalogue = ({ categoryId }: any) => {
  const theme = useTheme();
  const { channel } = useChannelStore();
  const { hp, wp, twoPaneView } = useResponsive();
  const { businessDetails } = useBusinessDetails();

  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [visibleAddProduct, setVisibleAddProduct] = useState(false);

  const { data, isLoading } = useInfiniteQuery(
    [`find-menu`, channel, debouncedQuery, categoryId],
    async ({ pageParam = 1 }) => {
      return fetchMenu(pageParam, channel, debouncedQuery, categoryId);
    },
    {
      getNextPageParam: (lastPage) => {
        const { results, total } = lastPage;
        const totalFetched = results.length; // Update to accumulate pages if necessary
        return totalFetched < total
          ? totalFetched / rowsPerPage + 1
          : undefined;
      },
    }
  );

  const productsList = useMemo(() => {
    return data?.pages?.[0]?.results || [];
  }, [data]);

  const renderProduct = useCallback(
    ({ item }: any) => {
      return (
        <ProductRowCatalogue
          data={item}
          industry={businessDetails?.company?.industry}
          negativeBilling={businessDetails?.location?.negativeBilling}
          handleQueryText={() => setQueryText("")}
        />
      );
    },
    [
      businessDetails?.company?.industry,
      businessDetails?.location?.negativeBilling,
    ]
  );

  const listEmptyOrLoaderComponent = React.memo(() => {
    return (
      <EmptyOrLoaderComponent
        isEmpty={productsList.length === 0}
        title={t(
          "Please Create the Menu For Selected the Order Type From Merchant Panel!"
        )}
        showBtn={false}
        btnTitle={t("Add a product")}
        handleOnPress={() => {
          setVisibleAddProduct(true);
        }}
      />
    );
  });

  const footerComponent = useMemo(
    () => (
      <View
        style={{
          height: hp("20%"),
          paddingVertical: 20,
          paddingHorizontal: 26,
        }}
      >
        {productsList?.length === 100 && (
          <DefaultText fontWeight="medium" color="otherGrey.200">
            {t("Type in the search bar to find more products")}
          </DefaultText>
        )}
      </View>
    ),
    [productsList]
  );

  return (
    <View>
      <View
        style={{
          paddingLeft: hp("2%"),
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderColor: theme.colors.dividerColor.secondary,
        }}
      >
        <ICONS.SearchPrimaryIcon />

        <Input
          containerStyle={{
            borderWidth: 0,
            height: hp("7%"),
            width: debouncedQuery ? "80%" : "100%",
            marginLeft: wp("0.25%"),
            backgroundColor: "transparent",
          }}
          allowClear={debouncedQuery != ""}
          style={{
            flex: twoPaneView ? 0.975 : 0.945,
            fontSize: twoPaneView ? 18 : 14,
          }}
          placeholderText={t("Search products with name or SKU")}
          values={queryText}
          handleChange={(val: any) => setQueryText(val)}
        />

        {debouncedQuery && (
          <TouchableOpacity
            style={{
              paddingVertical: 15,
              position: "absolute",
              right: wp("1.5%"),
            }}
            onPress={() => {
              setQueryText("");
              Keyboard.dismiss();
            }}
          >
            <DefaultText fontSize="lg" fontWeight="medium" color="primary.1000">
              {t("Cancel")}
            </DefaultText>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={{ width: twoPaneView ? wp("50%") : wp("100%") }}>
          <Loader marginTop={hp("30%")} />
        </View>
      ) : (
        <FlatList
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={Keyboard.dismiss}
          data={productsList}
          renderItem={renderProduct}
          ListEmptyComponent={listEmptyOrLoaderComponent}
          ListFooterComponent={footerComponent}
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={false}
        />
      )}

      {visibleAddProduct && (
        <AddBillingProductModal
          visible={visibleAddProduct}
          key="add-product"
          handleClose={() => {
            setVisibleAddProduct(false);
          }}
          handleAddProduct={(product: any) => {
            setQueryText("");
            setVisibleAddProduct(false);
          }}
        />
      )}
    </View>
  );
};

export default React.memo(MenuItemsListCatalogue);
