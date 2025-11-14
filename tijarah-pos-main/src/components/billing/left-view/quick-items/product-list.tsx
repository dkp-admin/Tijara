import nextFrame from "next-frame";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { Keyboard, View, VirtualizedList } from "react-native";
import { useInfiniteQuery } from "react-query";
import { ILike, Like, Not } from "typeorm";
import { t } from "../../../../../i18n";
import AuthContext from "../../../../context/auth-context";
import { useTheme } from "../../../../context/theme-context";
import { ProductModel } from "../../../../database/product/product";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import { AuthType } from "../../../../types/auth-types";
import { repo } from "../../../../utils/createDatabaseConnection";
import ICONS from "../../../../utils/icons";
import ItemDivider from "../../../action-sheet/row-divider";
import SeparatorHorizontalView from "../../../common/separator-horizontal-view";
import Input from "../../../input/input";
import Loader from "../../../loader";
import NoDataPlaceholder from "../../../no-data-placeholder/no-data-placeholder";
import Spacer from "../../../spacer";
import DefaultText from "../../../text/Text";
import QuickItemsProductRow from "./product-row";
import { debugLog } from "../../../../utils/log-patch";

const rowsPerPage = 50;

async function fetchProducts(pageParam: any, query: any) {
  let dbQuery = {} as any;

  dbQuery["variants"] = Not(Like(":nonSaleable"));

  dbQuery["name"] = ILike(`%${query}%`);

  dbQuery["status"] = "active";

  const queryBuilder = repo.product
    .createQueryBuilder("products")
    .where({ ...dbQuery })
    .setParameter("nonSaleable", false);

  if (query) {
    queryBuilder
      .orWhere("products.variants LIKE :variantSku", {
        variants: "sku",
        variantSku: `%${query}%`,
      })
      .orWhere("products.boxes LIKE :boxSku", {
        boxes: "sku",
        boxSku: `%${query}%`,
      });
  }

  await nextFrame();

  return queryBuilder
    .take(rowsPerPage)
    .skip(rowsPerPage * (pageParam - 1))
    .getManyAndCount();
}

const QuickItemsProductList = ({ quickItemsIds, onAdd }: any) => {
  const theme = useTheme();
  const { wp, hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);

  const [queryText, setQueryText] = useState("");

  const { data, isLoading } = useInfiniteQuery(
    [`find-product`, queryText],
    async ({ pageParam = 1 }) => {
      return fetchProducts(pageParam, queryText);
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
    const products = data?.pages?.flatMap((page) => page[0] || []) || [];
    debugLog(
      "Quick items product list fetch from db",
      {},
      "billing-screen",
      "fetchQuickItemsProduct"
    );
    return products;
  }, [data]);

  const handleOnPress = useCallback((data: any, item: any) => {
    onAdd({ ...item, type: "product" });
  }, []);

  const renderProduct = useCallback(
    ({ item }: any) => {
      return (
        <QuickItemsProductRow
          data={item}
          quickItemsIds={quickItemsIds}
          handleOnPress={(data: any) => handleOnPress(data, item)}
        />
      );
    },
    [quickItemsIds, handleOnPress]
  );

  const listFooterComponent = useMemo(
    () => (
      <View
        style={{
          height: hp("20%"),
          paddingVertical: 20,
          paddingHorizontal: 26,
        }}
      >
        {productsList?.length === 50 && (
          <DefaultText fontWeight="medium" color="otherGrey.200">
            {t("Type in the search bar to find more products")}
          </DefaultText>
        )}
      </View>
    ),
    [productsList]
  );

  const emptyComponent = useMemo(() => {
    return (
      <View style={{ marginHorizontal: 16 }}>
        <NoDataPlaceholder title={t("No Products!")} marginTop={hp("30%")} />
      </View>
    );
  }, []);

  // const loadMore = () => {
  //   if (hasNextPage && !isFetchingNextPage) {
  //     fetchNextPage();
  //   }
  // };

  const keyExtractor = useCallback((item: ProductModel) => item._id, []);

  if (!authContext.permission["pos:product"]?.read) {
    debugLog(
      "Permission denied to view this screen",
      {},
      "billing-screen",
      "fetchQuickItemsProduct"
    );
    return (
      <View style={{ marginHorizontal: 16 }}>
        <NoDataPlaceholder
          title={t("You don't have permission to view this screen")}
          marginTop={hp("35%")}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          paddingVertical: hp("1.5%"),
        }}
      >
        <View
          style={{
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.dividerColor.secondary,
            paddingLeft: wp("2%"),
            marginHorizontal: hp("2.5%"),
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <ICONS.SearchPrimaryIcon />

          <Input
            containerStyle={{
              borderWidth: 0,
              height: hp("7.25%"),
              marginLeft: wp("0.25%"),
              backgroundColor: "transparent",
            }}
            allowClear={queryText != ""}
            style={{
              flex: twoPaneView ? 0.975 : 0.945,
            }}
            placeholderText={t("Search products with name or SKU")}
            values={queryText}
            handleChange={(val: any) => setQueryText(val)}
          />
        </View>

        <Spacer space={hp("1.5%")} />

        <SeparatorHorizontalView />

        {isLoading ? (
          <Loader marginTop={hp("30%")} />
        ) : (
          <VirtualizedList
            // onEndReached={loadMore}
            // onEndReachedThreshold={0.5}
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={Keyboard.dismiss}
            data={productsList}
            renderItem={renderProduct}
            ItemSeparatorComponent={() => (
              <ItemDivider
                style={{
                  margin: 0,
                  borderWidth: 0,
                  borderBottomWidth: 1,
                  borderColor: "#E5E9EC",
                }}
              />
            )}
            ListEmptyComponent={emptyComponent}
            ListFooterComponent={listFooterComponent}
            keyExtractor={keyExtractor}
            initialNumToRender={20} // You can adjust this value as needed
            getItemCount={() => productsList.length}
            getItem={(data, index) => data[index]}
            keyboardShouldPersistTaps="always"
          />
        )}
      </View>
    </View>
  );
};

export default QuickItemsProductList;
