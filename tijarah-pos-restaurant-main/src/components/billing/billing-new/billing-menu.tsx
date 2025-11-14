import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
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
import { t } from "../../../../i18n";
import DeviceContext from "../../../context/device-context";
import { useTheme } from "../../../context/theme-context";
import repository from "../../../db/repository";
import { useResponsive } from "../../../hooks/use-responsiveness";
import useCommonApis from "../../../hooks/useCommonApis";
import useChannelStore from "../../../store/channel-store";
import useMenuStore from "../../../store/menu-filter-store";
import ICONS from "../../../utils/icons";
import SeparatorVerticalView from "../../common/separator-vertical-view";
import DineinCategoryRow from "../../dienin/dinein-menu/category-row";
import EmptyOrLoaderComponent from "../../empty";
import Input from "../../input/input";
import Loader from "../../loader";
import DefaultText from "../../text/Text";
import FloatingCartView from "../left-view/cart-view";
import BillingMenuGridRow from "./billing-menu-grid-row";
import { useMenuFilterStore } from "../../../store/menu-filter-store-new";

const ITEMS_PER_PAGE = 50;

async function fetchMenuProducts(
  query: string,
  categoryRef: string,
  vegOnly: boolean,
  page: number = 1,
  itemsPerPage: number = 52,
  orderType = "dine-in"
) {
  const menu = await repository.menuRepository.findByOrderType(orderType);

  if (!menu) {
    return {
      results: [],
      total: 0,
      categories: [],
      currentPage: page,
      totalPages: 0,
      hasMore: false,
    };
  }

  const filteredProducts = menu.products.filter((product) => {
    const isActive = product.status === "active";

    const matchesQuery = query
      ? product.name.en.toLowerCase().includes(query.toLowerCase()) ||
        product.variants.some(
          (variant) =>
            variant.sku?.toLowerCase().includes(query.toLowerCase()) ||
            variant?.code?.toLowerCase().includes(query.toLowerCase())
        )
      : true;

    const matchesCategory =
      categoryRef !== "all" ? product.categoryRef === categoryRef : true;

    const matchesContains = vegOnly ? product.contains === "veg" : true;

    return isActive && matchesQuery && matchesCategory && matchesContains;
  });

  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Ensure page number is within valid range
  const validPage = Math.max(1, Math.min(page, totalPages));

  const startIndex = (validPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedProducts = filteredProducts.splice(startIndex, endIndex);

  return {
    results: paginatedProducts,
    total: totalItems,
    categories: menu.categories,
    currentPage: validPage,
    totalPages,
    hasMore: validPage < totalPages,
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
  const { billingSettings } = useCommonApis();
  const { channel } = useChannelStore();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      [`find-menu`, debouncedQuery, categoryId, vegOnly, channel],
      async ({ pageParam = 0 }: any) => {
        const response: any = await fetchMenuProducts(
          debouncedQuery,
          categoryId,
          vegOnly,
          pageParam,
          ITEMS_PER_PAGE,
          channel
        );

        // Check if veg only filter is active and no results found
        if (vegOnly && response.results.length === 0) {
          return {
            ...response,
            noVegItems: true, // Add flag to indicate no veg items found
          };
        }

        return response;
      },
      {
        getNextPageParam: (lastPage, allPages) => {
          const totalFetched = lastPage?.results?.length || 0;

          return totalFetched < allPages[0]?.total
            ? totalFetched / ITEMS_PER_PAGE + 1
            : undefined;
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

  const noVegItems: Boolean = useMemo(() => {
    return data?.pages?.[0]?.noVegItems || false;
  }, [data]);

  const renderCategory = useCallback(({ item }: any) => {
    return <DineinCategoryRow data={item} />;
  }, []);

  const renderMenu = useCallback(
    ({ item }: any) => {
      return (
        <BillingMenuGridRow
          key={item?._id}
          data={item}
          negativeBilling={businessDetails?.location?.negativeBilling}
        />
      );
    },
    [businessDetails?.location?.negativeBilling]
  );

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const menuEmptyComponent = React.memo(() => {
    return (
      <EmptyOrLoaderComponent
        isEmpty={menuProducts.length === 0}
        title={
          noVegItems
            ? t("There are no veg items in this category")
            : t(
                "Please Create the Menu For Selected the Order Type From Merchant Panel"
              )
        }
        showBtn={false}
        btnTitle={""}
        handleOnPress={() => {}}
      />
    );
  });

  const footerComponent = useMemo(
    () => (
      <View style={{ height: hp("10%"), marginBottom: 16 }}>
        {isFetchingNextPage && (
          <ActivityIndicator
            size={"small"}
            color={theme.colors.primary[1000]}
          />
        )}
      </View>
    ),
    [isFetchingNextPage]
  );

  const getItemLayout = useCallback(
    (data: any, index: number) => {
      const itemHeight = hp("15%"); // Approximate height of each item
      return {
        length: itemHeight,
        offset: itemHeight * index,
        index,
      };
    },
    [hp]
  );

  return (
    <>
      <View style={styles.container}>
        <View
          style={{
            flex: twoPaneView ? 0.1 : 0.2,
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
              keyExtractor={(d) => d?._id.toString()}
              ListFooterComponent={footerComponent}
              keyboardShouldPersistTaps="always"
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={true}
              initialNumToRender={10}
              getItemLayout={(data, index) => ({
                length: 50, // Adjust based on your category item height
                offset: 50 * index,
                index,
              })}
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
                flex: 0.85,
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
                flex: 0.15,
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
              onScrollBeginDrag={Keyboard.dismiss}
              onEndReachedThreshold={0.01}
              numColumns={twoPaneView ? 5 : 2}
              bounces={false}
              alwaysBounceVertical={false}
              showsVerticalScrollIndicator={false}
              data={menuProducts}
              renderItem={renderMenu}
              ListEmptyComponent={menuEmptyComponent}
              ListFooterComponent={footerComponent}
              maxToRenderPerBatch={10}
              windowSize={10}
              removeClippedSubviews={true}
              getItemLayout={getItemLayout}
              initialNumToRender={20}
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
          <FloatingCartView billing={billingSettings} />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row" },
});

export default React.memo(DineinMenu);
