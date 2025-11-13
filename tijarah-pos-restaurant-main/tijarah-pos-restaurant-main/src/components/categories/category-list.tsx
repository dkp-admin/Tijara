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
import { t } from "../../../i18n";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import { AuthType } from "../../types/auth-types";
import { rowsPerPage } from "../../utils/constants";
import Loader from "../loader";
import NoDataPlaceholder from "../no-data-placeholder/no-data-placeholder";
import AddEditCategoryModal from "./add-category-modal";
import CategoryNavigationHeader from "./category-navigation-header";
import CategoryRow from "./category-row";
import repository from "../../db/repository";
import { Category } from "../../db/schema/category";

const CategoryList = ({
  handleSelectCategory,
  navigateToProduct = () => {},
}: any) => {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [visibleAddCategory, setVisibleAddCategory] = useState(false);
  const [queryText, setQueryText] = useState("");

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      ["find-categories", queryText],
      async ({ pageParam = 1 }) => {
        const whereClause = queryText.trim()
          ? `WHERE json_extract(name, '$.en') LIKE '%${queryText}%' OR json_extract(name, '$.ar') LIKE '%${queryText}%'`
          : "";
        return repository.categoryRepository.getPaginatedCategories(
          pageParam,
          rowsPerPage,
          whereClause
        );
      },
      {
        getNextPageParam: (lastPage, allPages) => {
          const [categories, totalCount] = lastPage;
          const currentPage = allPages.length;
          const totalPages = Math.ceil(totalCount / rowsPerPage);

          return currentPage < totalPages ? currentPage + 1 : undefined;
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
    setSelectedCategory(val);
    handleSelectCategory(val);
    if (!twoPaneView) {
      navigateToProduct(name);
    }
    Keyboard.dismiss();
  }, []);

  const handleAddCategory = useCallback(() => {
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

  const keyExtractor = useCallback(
    (item: Category, index: any) => `${item._id}${index}`,
    []
  );

  if (!authContext.permission["pos:category"]?.read) {
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
