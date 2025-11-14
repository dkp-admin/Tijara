import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { useInfiniteQuery } from "react-query";
import { useDebounce } from "use-debounce";
import { t } from "../../../i18n";
import DefaultText from "../../components/text/Text";
import DeviceContext from "../../context/device-context";
import { useTheme } from "../../context/theme-context";
import repository from "../../db/repository";
import { useResponsive } from "../../hooks/use-responsiveness";
import useMenuStore from "../../store/menu-filter-store";
import ICONS from "../../utils/icons";
import SeparatorVerticalView from "../common/separator-vertical-view";
import EmptyOrLoaderComponent from "../empty";
import Input from "../input/input";
import Loader from "../loader";
import FloatingDineinCartView from "./dinein-menu/cart-view";
import DineinCategoryRow from "./dinein-menu/category-row";
import DineinMenuGridRow from "./dinein-menu/menu-grid-row";
import { useMenuFilterStore } from "../../store/menu-filter-store-new";
const ITEMS_PER_PAGE = 50;

async function fetchMenuProducts(
  query: string,
  categoryRef: string,
  vegOnly: boolean,
  page: number = 1,
  itemsPerPage: number = 12
) {
  // Fetch menu data from the database
  const menu = await repository.menuRepository.findByOrderType("dine-in");

  if (!menu) {
    return { results: [], total: 0, categories: [] };
  }

  // Filter and search products
  const filteredProducts = menu.products.filter((product) => {
    // Check for active status
    const isActive = product.status === "active";

    // Check for query in name, SKU, or code
    const matchesQuery = query
      ? product.name.en.toLowerCase().includes(query.toLowerCase()) ||
        product.variants.some(
          (variant) =>
            variant.sku.includes(query) || variant?.code?.includes(query)
        )
      : true;

    // Check for categoryRef
    const matchesCategory =
      categoryRef !== "all" ? product.categoryRef === categoryRef : true;

    // Check for contains
    const matchesContains = vegOnly ? product.contains === "veg" : true;

    return isActive && matchesQuery && matchesCategory && matchesContains;
  });

  // Apply pagination
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return {
    results: paginatedProducts,
    total: filteredProducts.length,
    categories: menu.categories,
    currentPage: page,
    totalPages: totalPages,
    hasMore: page < totalPages,
  };
}

const DineinMenu = () => {
  const theme = useTheme();
  const { categoryId } = useMenuFilterStore();
  const deviceContext = useContext(DeviceContext) as any;
  const { wp, hp, twoPaneView } = useResponsive();
  const businessDetails = deviceContext?.user?.company;
  const [vegOnly, setVegOnly] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [categories, setCategories] = useState([
    { _id: "all", name: { en: "All", ar: "الجميع" } },
  ]);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      [`find-menu`, debouncedQuery, categoryId, vegOnly],
      async ({ pageParam = 1 }: any) => {
        const response = await fetchMenuProducts(
          debouncedQuery,
          categoryId,
          vegOnly,
          pageParam,
          ITEMS_PER_PAGE
        );
        return response;
      },
      {
        getNextPageParam: (lastPage: any, allPages: any) => {
          const nextPage = allPages.length + 1;
          return lastPage.length === ITEMS_PER_PAGE ? nextPage : undefined;
        },
      }
    );

  useEffect(() => {
    if (data?.pages[0]?.categories) {
      const categooryList = data?.pages[0]?.categories?.map((category: any) => {
        return {
          _id: category.categoryRef,
          name: category.name,
          image: category?.image,
        };
      });

      setCategories([
        { _id: "all", name: { en: "All", ar: "الجميع" }, image: "" },
        ...(categooryList || []),
      ]);
    }
  }, [data]);

  const menuProducts = useMemo(() => {
    return data?.pages?.[0]?.results || [];
  }, [data]);

  const renderCategory = useCallback(({ item }: any) => {
    return <DineinCategoryRow data={item} />;
  }, []);

  const renderMenu = useCallback(
    ({ item }: any) => {
      return (
        <DineinMenuGridRow
          data={item}
          negativeBilling={businessDetails?.location?.negativeBilling}
          handleQueryText={() => setQueryText("")}
        />
      );
    },
    [businessDetails?.location?.negativeBilling]
  );

  const loadMore = () => {
    console.log("loadMore", hasNextPage);
    if (hasNextPage && !isFetchingNextPage) {
      console.log("Loading Next Page");
      fetchNextPage();
    }
  };

  const menuEmptyComponent = React.memo(() => {
    return (
      <EmptyOrLoaderComponent
        isEmpty={menuProducts.length === 0}
        title={t(
          "Please Create the Menu For Selected the Order Type From Merchant Panel"
        )}
        showBtn={false}
        btnTitle={""}
        handleOnPress={() => {}}
      />
    );
  });

  const footerComponent = useMemo(
    () => <View style={{ height: hp("8%") }}></View>,
    []
  );

  return (
    <>
      <View style={styles.container}>
        <View
          style={{
            flex: 0.1,
            backgroundColor: theme.colors.white[1000],
          }}
        >
          {isLoading && !categories?.length ? (
            <Loader marginTop={hp("35%")} />
          ) : (
            <FlatList
              alwaysBounceVertical={false}
              showsVerticalScrollIndicator={false}
              data={categories}
              renderItem={renderCategory}
              ListFooterComponent={footerComponent}
              keyboardShouldPersistTaps="always"
            />
          )}
        </View>

        <SeparatorVerticalView />

        <View style={{ flex: 0.9 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                flex: 0.87,
                paddingLeft: hp("2%"),
                flexDirection: "row",
                alignItems: "center",
                borderBottomWidth: 1,
                borderRightWidth: 1,
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
                placeholderText={t("Search an item")}
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
                  <DefaultText
                    fontSize="lg"
                    fontWeight="medium"
                    color="primary.1000"
                  >
                    {t("Cancel")}
                  </DefaultText>
                </TouchableOpacity>
              )}
            </View>

            <View
              style={{
                flex: 0.13,
                height: "100%",
                flexDirection: "row",
                alignItems: "center",
                paddingLeft: hp("2%"),
                paddingRight: hp("1%"),
                borderBottomWidth: 1,
                borderColor: theme.colors.dividerColor.secondary,
              }}
            >
              <DefaultText
                style={{ marginTop: -3, marginRight: 5 }}
                fontSize="md"
                color="otherGrey.100"
              >
                {t("Veg Only")}
              </DefaultText>

              <Switch
                style={{
                  transform:
                    Platform.OS == "ios"
                      ? [{ scaleX: 0.9 }, { scaleY: 0.9 }]
                      : [{ scaleX: 1 }, { scaleY: 1 }],
                  height: hp("5%"),
                }}
                trackColor={{
                  false: "rgba(120, 120, 128, 0.16)",
                  true: "#34C759",
                }}
                thumbColor={theme.colors.bgColor2}
                value={vegOnly}
                onValueChange={(val) => {
                  setVegOnly(val);
                }}
              />
            </View>
          </View>

          {isLoading && debouncedQuery === "" ? (
            <Loader marginTop={hp("30%")} />
          ) : (
            <FlatList
              contentContainerStyle={{ padding: hp("2%") }}
              keyExtractor={(_, index) => index.toString()}
              onEndReached={loadMore}
              onEndReachedThreshold={0.1}
              numColumns={twoPaneView ? 5 : 2}
              bounces={false}
              alwaysBounceVertical={false}
              showsVerticalScrollIndicator={false}
              data={menuProducts}
              renderItem={renderMenu}
              ListEmptyComponent={menuEmptyComponent}
              ListFooterComponent={footerComponent}
              keyboardShouldPersistTaps="always"
            />
          )}
        </View>
      </View>

      {!twoPaneView && (
        <View
          style={{
            right: "6%",
            bottom: "12%",
            position: "absolute",
            borderRadius: 16,
            backgroundColor: theme.colors.white[1000],
          }}
        >
          <FloatingDineinCartView />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row" },
});

export default React.memo(DineinMenu);
