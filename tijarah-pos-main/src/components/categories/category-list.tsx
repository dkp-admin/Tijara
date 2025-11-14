import { useIsFocused } from "@react-navigation/core";
import {
  default as React,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  View,
  VirtualizedList,
} from "react-native";
import { useInfiniteQuery } from "react-query";
import { ILike } from "typeorm";
import { t } from "../../../i18n";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { CategoryModel } from "../../database/category/category";
import { useResponsive } from "../../hooks/use-responsiveness";
import { AuthType } from "../../types/auth-types";
import { rowsPerPage } from "../../utils/constants";
import { repo } from "../../utils/createDatabaseConnection";
import { debugLog } from "../../utils/log-patch";
import Loader from "../loader";
import NoDataPlaceholder from "../no-data-placeholder/no-data-placeholder";
import AddEditCategoryModal from "./add-category-modal";
import CategoryNavigationHeader from "./category-navigation-header";
import CategoryRow from "./category-row";

const CategoryList = ({
  handleSelectCategory,
  navigateToProduct = () => {},
}: any) => {
  const theme = useTheme();
  const focused = useIsFocused();
  const { hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);

  const [queryText, setQueryText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [visibleAddCategory, setVisibleAddCategory] = useState(false);

  const { data, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery(
      [`find-category`, queryText, focused],
      async ({ pageParam = 1 }) => {
        const categories = await repo.category.findAndCount({
          take: rowsPerPage,
          skip: rowsPerPage * (pageParam - 1),
          where: {
            name: ILike(`%${queryText}%`),
          },
        });

        debugLog(
          "Catgeories fetched from db",
          {},
          "catalogue-categories-screen",
          "fetchCategories"
        );

        return categories;
      },
      {
        getNextPageParam: (lastPage, allPages) => {
          const totalRecords = lastPage[1];
          const currentPageSize = lastPage[0]?.length || 0;
          const nextPage = allPages.length + 1;
          if (
            currentPageSize < rowsPerPage ||
            currentPageSize === totalRecords
          ) {
            return null; // No more pages to fetch
          }
          return nextPage;
        },
      }
    );

  const categories = useMemo(
    () => data?.pages?.flatMap((page) => page[0] || []) || [],
    [data]
  );

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleSelected = useCallback((val: any, name: any) => {
    debugLog(
      "Selected category: " + name,
      { categoryRef: val },
      "catalogue-categories-screen",
      "handleSelected"
    );
    setSelectedCategory(val);
    handleSelectCategory(val);
    if (!twoPaneView) {
      navigateToProduct(name);
    }
    Keyboard.dismiss();
  }, []);

  const handleAddCategory = useCallback(() => {
    debugLog(
      "Create category modal opened",
      {},
      "catalogue-categories-screen",
      "handleAddCategory"
    );
    setVisibleAddCategory(true);
  }, []);

  const emptyComponent = useMemo(() => {
    return (
      <View style={{ marginHorizontal: 16 }}>
        <NoDataPlaceholder
          title={t("No Categories!")}
          marginTop={hp("25%")}
          showBtn={authContext.permission["pos:category"]?.create}
          btnTitle={t("Add a category")}
          handleOnPress={handleAddCategory}
        />
      </View>
    );
  }, []);

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

  const renderCategory = useCallback(
    ({ item }: any) => {
      return (
        <CategoryRow
          data={item}
          selected={selectedCategory}
          handleSelected={handleSelected}
        />
      );
    },
    [selectedCategory]
  );

  const keyExtractor = useCallback((item: CategoryModel) => item._id, []);

  if (!authContext.permission["pos:category"]?.read) {
    debugLog(
      "Permission denied for this screen",
      {},
      "catalogue-categories-screen",
      "fetchCategories"
    );

    return (
      <View style={{ marginHorizontal: 16 }}>
        <NoDataPlaceholder
          title={t("You don't have permissions to view this screen")}
          marginTop={hp("25%")}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CategoryNavigationHeader
        queryText={queryText}
        setQueryText={setQueryText}
      />

      {isLoading ? (
        <Loader marginTop={hp("40%")} />
      ) : (
        <VirtualizedList // Change from FlatList to VirtualizedList
          onEndReached={loadMore}
          onEndReachedThreshold={0.01}
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={Keyboard.dismiss}
          data={categories}
          renderItem={renderCategory}
          ListEmptyComponent={emptyComponent}
          ListFooterComponent={footerComponent}
          keyExtractor={keyExtractor}
          initialNumToRender={8} // You can adjust this value as needed
          getItemCount={() => categories.length}
          getItem={(data, index) => data[index]}
          keyboardShouldPersistTaps="always"
        />
      )}

      {visibleAddCategory && (
        <AddEditCategoryModal
          visible={visibleAddCategory}
          handleClose={() => {
            debugLog(
              "Create category modal closed",
              {},
              "catalogue-categories-screen",
              "handleClose"
            );
            setVisibleAddCategory(false);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default CategoryList;
