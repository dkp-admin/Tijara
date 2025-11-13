import { default as React, useCallback, useMemo, useState } from "react";
import {
  Keyboard,
  TouchableOpacity,
  View,
  VirtualizedList,
} from "react-native";
import { useInfiniteQuery } from "react-query";
import { ILike } from "typeorm";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { CategoryModel } from "../../../../database/category/category";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import { repo } from "../../../../utils/createDatabaseConnection";
import ICONS from "../../../../utils/icons";
import { debugLog } from "../../../../utils/log-patch";
import EmptyOrLoaderComponent from "../../../empty";
import Input from "../../../input/input";
import Loader from "../../../loader";
import DefaultText from "../../../text/Text";
import CategoryRowCatalogue from "./category-row";

const rowsPerPage = 100;

const CategoryListCatalogue = ({
  setSelectedCategory,
  navigateToProduct = () => {},
}: any) => {
  const theme = useTheme();
  const { hp, wp, twoPaneView } = useResponsive();
  const [queryText, setQueryText] = useState("");

  const { data, isLoading } = useInfiniteQuery(
    [`find-category`, queryText],
    async ({ pageParam = 1 }) => {
      let dbQuery = {} as any;

      if (queryText) {
        dbQuery["name"] = ILike(`%${queryText}%`);
      }

      dbQuery["status"] = "active";

      return repo.category.findAndCount({
        take: rowsPerPage,
        skip: rowsPerPage * (pageParam - 1),
        where: dbQuery,
      });
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

  const handleSelected = useCallback((val: string, name: any) => {
    setSelectedCategory(val);
    navigateToProduct(name);
    Keyboard.dismiss();
  }, []);

  const categories = useMemo(() => {
    const categoryList = data?.pages?.flatMap((page) => page[0] || []) || [];
    debugLog(
      "Catalogue categories list fetch from db",
      {},
      "billing-screen",
      "fetchCatalogueProduct"
    );
    return categoryList;
  }, [data]);

  // const loadMore = () => {
  //   if (hasNextPage && !isFetchingNextPage) {
  //     fetchNextPage();
  //   }
  // };

  const renderCategory = useCallback(({ item }: any) => {
    return <CategoryRowCatalogue data={item} handleSelected={handleSelected} />;
  }, []);

  const listEmptyOrLoaderComponent = useMemo(() => {
    return (
      <EmptyOrLoaderComponent
        isEmpty={categories.length === 0}
        title={t("No Categories!")}
        showBtn={false}
        btnTitle={t("Add a category")}
        handleOnPress={() => {}}
      />
    );
  }, []);

  const footerComponent = useMemo(
    () => (
      <View
        style={{
          height: hp("20%"),
          paddingVertical: 20,
          paddingHorizontal: 26,
        }}
      >
        {categories?.length === 100 && (
          <DefaultText fontWeight="medium" color="otherGrey.200">
            {t("Type in the search bar to find more categories")}
          </DefaultText>
        )}
      </View>
    ),
    []
  );

  const keyExtractor = useCallback((item: CategoryModel) => item._id, []);

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
            width: queryText ? "80%" : "100%",
            marginLeft: wp("0.25%"),
            backgroundColor: "transparent",
          }}
          allowClear={queryText != ""}
          style={{
            flex: twoPaneView ? 0.975 : 0.945,
            fontSize: twoPaneView ? 18 : 14,
          }}
          placeholderText={t("Search categories")}
          values={queryText}
          //TODO:ADD-DEBOUNCE
          handleChange={(val: any) => setQueryText(val)}
        />

        {queryText && (
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
        <VirtualizedList // Change from FlatList to VirtualizedList
          // onEndReached={loadMore}
          // onEndReachedThreshold={0.01}
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={Keyboard.dismiss}
          data={categories}
          renderItem={renderCategory}
          ListEmptyComponent={listEmptyOrLoaderComponent}
          ListFooterComponent={footerComponent}
          keyExtractor={keyExtractor}
          initialNumToRender={20} // You can adjust this value as needed
          getItemCount={() => categories.length}
          getItem={(data, index) => data[index]}
          keyboardShouldPersistTaps="always"
        />
      )}
    </View>
  );
};

export default CategoryListCatalogue;
