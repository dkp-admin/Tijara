import nextFrame from "next-frame";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Keyboard, TouchableOpacity, View } from "react-native";
import { useInfiniteQuery } from "react-query";
import { ILike, Like } from "typeorm";
import { t } from "../../../../../i18n";
import { useBusinessDetails } from "../../../../hooks/use-business-details";
import { useResponsive } from "../../../../hooks/use-responsiveness";
// import useChannelStore from "../../../../store/channel-store";
import { useDebounce } from "use-debounce";
import { useTheme } from "../../../../context/theme-context";
import { repo } from "../../../../utils/createDatabaseConnection";
import ICONS from "../../../../utils/icons";
import { debugLog } from "../../../../utils/log-patch";
import EmptyOrLoaderComponent from "../../../empty";
import Input from "../../../input/input";
import Loader from "../../../loader";
import DefaultText from "../../../text/Text";
import AddBillingProductModal from "./add-product-modal";
import ProductRowCatalogue from "./product-row";

const rowsPerPage = 100;

async function fetchProducts(
  pageParam: number,
  categoryId: string,
  query: string
  // channel: string
) {
  let dbQuery = {} as any;

  if (categoryId) {
    dbQuery["categoryRef"] = categoryId;
  }

  if (query) {
    dbQuery["name"] = ILike(`%${query}%`);
  }

  // if (channel) {
  //   dbQuery["channels"] = ILike(`%${channel}%`);
  // }

  dbQuery["status"] = "active";

  const queryBuilder = repo.product
    .createQueryBuilder("products")
    .where({ ...dbQuery });

  if (query && (Number(query) || 0) > 0) {
    queryBuilder.orWhere("products.variants LIKE :variantSku", {
      variants: "sku",
      variantSku: `%${query}%`,
    });
  }

  if (query) {
    queryBuilder.orWhere("products.variants LIKE :variantCode", {
      variants: "code",
      variantCode: `%${query}%`,
    });
  }

  await nextFrame();

  return queryBuilder
    .take(rowsPerPage)
    .skip(rowsPerPage * (pageParam - 1))
    .getManyAndCount();
}

async function fetchBoxesCrates(query: string) {
  return repo.boxCrates.findOne({
    where: [
      { boxSku: Like(`%${query}%`), status: "active", nonSaleable: false },
      { crateSku: Like(`%${query}%`), status: "active", nonSaleable: false },
      { code: Like(`%${query}%`), status: "active", nonSaleable: false },
    ],
  });
}

async function fetchProductsAndBoxCrates(
  pageParam: number,
  categoryId: string,
  query: string
) {
  const productPromise = fetchProducts(pageParam, categoryId, query);
  const boxCratePromise = fetchBoxesCrates(query);

  // Run both queries in parallel
  const [products, boxCrate] = await Promise.all([
    productPromise,
    boxCratePromise,
  ]);

  if (query && boxCrate && products?.[0]?.length === 0) {
    const prod = await repo.product
      .createQueryBuilder("products")
      .where("products.variants LIKE :variantSku", {
        variants: "sku",
        variantSku: `%${boxCrate.productSku}%`,
      })
      .getOne();

    if (prod) {
      return [[prod]];
    }
  }

  return products;
}

const ProductListCatalogue = ({ categoryId }: any) => {
  const theme = useTheme();
  // const { channel } = useChannelStore();
  const { hp, wp, twoPaneView } = useResponsive();
  const { businessDetails } = useBusinessDetails();

  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [visibleAddProduct, setVisibleAddProduct] = useState(false);

  const { data, isLoading } = useInfiniteQuery(
    [`find-product`, debouncedQuery, categoryId],
    async ({ pageParam = 1 }) => {
      return fetchProductsAndBoxCrates(pageParam, categoryId, debouncedQuery);
    }
    // {
    //   getNextPageParam: (lastPage, allPages) => {
    //     const totalRecords = lastPage[1];
    //     const currentPageSize = lastPage[0]?.length || 0;
    //     const nextPage = allPages.length + 1;
    //     if (
    //       currentPageSize < rowsPerPage ||
    //       currentPageSize === totalRecords
    //     ) {
    //       return null; // No more pages to fetch
    //     }
    //     return nextPage;
    //   },
    // }
  );

  const productsList = useMemo(() => {
    const products =
      data?.pages?.flatMap(
        (page) => page[0]?.filter((t) => t?.status === "active") || []
      ) || [];
    debugLog(
      "Catalogue product list fetch from db",
      {},
      "billing-screen",
      "fetchCatalogueProduct"
    );
    return products;
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
        title={t("No Products!")}
        showBtn
        btnTitle={t("Add a product")}
        handleOnPress={() => {
          debugLog(
            "Add billing product modal opened",
            {},
            "billing-screen",
            "productCatalogueEmptyList"
          );
          setVisibleAddProduct(true);
        }}
      />
    );
  });

  const footerComponent = useMemo(
    () => (
      // <View style={{ height: hp("10%"), marginBottom: 16 }}>
      //   {isFetchingNextPage && (
      //     <ActivityIndicator
      //       size={"small"}
      //       color={theme.colors.primary[1000]}
      //     />
      //   )}
      // </View>

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

  // const loadMore = useCallback(async () => {
  //   await nextFrame();
  //   if (hasNextPage && !isFetchingNextPage) {
  //     fetchNextPage();
  //   }
  // }, [hasNextPage, isFetchingNextPage]);

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
          //TODO:ADD-DEBOUNCE
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
        <FlatList // Change from FlatList to VirtualizedList
          // onEndReached={loadMore}
          // onEndReachedThreshold={0.01}
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          data={productsList}
          renderItem={renderProduct}
          ListEmptyComponent={listEmptyOrLoaderComponent}
          ListFooterComponent={footerComponent}
          keyboardShouldPersistTaps="always"
        />
      )}

      {visibleAddProduct && (
        <AddBillingProductModal
          visible={visibleAddProduct}
          key="add-product"
          handleClose={() => {
            debugLog(
              "Add billing product modal closed",
              {},
              "billing-screen",
              "handleClose"
            );
            setVisibleAddProduct(false);
          }}
          handleAddProduct={(product: any) => {
            debugLog(
              "Add billing product modal closed",
              {},
              "billing-screen",
              "handleAddProduct"
            );
            setQueryText("");
            setVisibleAddProduct(false);
          }}
        />
      )}
    </View>
  );
};

export default React.memo(ProductListCatalogue);
