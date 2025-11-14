import nextFrame from "next-frame";
import { default as React, useCallback, useMemo, useState } from "react";
import { FlatList, Keyboard, TouchableOpacity, View } from "react-native";
import { useInfiniteQuery } from "react-query";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import useChannelStore from "../../../../store/channel-store";
import ICONS from "../../../../utils/icons";
import EmptyOrLoaderComponent from "../../../empty";
import Input from "../../../input/input";
import Loader from "../../../loader";
import DefaultText from "../../../text/Text";
import MenuCategoryRowCatalogue from "./menu-category-row";
import repository from "../../../../db/repository";

const rowsPerPage = 100;

async function fetchMenu(pageParam: any, channel: string) {
  return repository.menuRepository.paginateWithChannel(
    pageParam,
    rowsPerPage,
    channel
  );
}

const MenuCategoryListCatalogue = ({
  setSelectedCategory,
  navigateToProduct = () => {},
}: any) => {
  const theme = useTheme();
  const { channel } = useChannelStore();
  const { hp, wp, twoPaneView } = useResponsive();
  const [queryText, setQueryText] = useState("");

  const { data, isLoading } = useInfiniteQuery(
    [`find-menu`, channel],
    async ({ pageParam = 1 }) => {
      return fetchMenu(pageParam, channel);
    }
  );

  const handleSelected = useCallback((val: string, name: any) => {
    setSelectedCategory(val);
    navigateToProduct(name);
    Keyboard.dismiss();
  }, []);

  const categories = useMemo(() => {
    let categoryList: any[] = [];

    data?.pages?.map((page: any) => {
      const menuList = page[0];

      menuList?.[0]?.categories?.forEach((category: any) => {
        const count = menuList?.[0]?.products?.filter((prod: any) => {
          if (
            prod.status === "active" &&
            category.categoryRef === prod.categoryRef
          ) {
            return prod;
          }
        })?.length;

        const queryRegex = new RegExp(queryText, "i");
        // Filter categories based on queryText and category.name.en
        if (
          queryText.length > 0 &&
          category?.name?.en &&
          queryRegex.test(category.name.en)
        ) {
          categoryList.push({ ...category, productCount: count || 0 });
        } else if (queryText.length == 0) {
          categoryList.push({ ...category, productCount: count || 0 });
        }
      });
    }) || [];

    return categoryList;
  }, [data, queryText]);

  const renderCategory = useCallback(({ item }: any) => {
    return (
      <MenuCategoryRowCatalogue data={item} handleSelected={handleSelected} />
    );
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
        <FlatList
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={Keyboard.dismiss}
          data={categories}
          renderItem={renderCategory}
          ListEmptyComponent={listEmptyOrLoaderComponent}
          ListFooterComponent={footerComponent}
          keyboardShouldPersistTaps="always"
        />
      )}
    </View>
  );
};

export default MenuCategoryListCatalogue;
