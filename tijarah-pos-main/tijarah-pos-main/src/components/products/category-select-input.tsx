import React, { useContext, useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { ILike } from "typeorm";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import endpoint from "../../api/endpoints";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import { useResponsive } from "../../hooks/use-responsiveness";
import { repo } from "../../utils/createDatabaseConnection";
import ICONS from "../../utils/icons";
import { debugLog, errorLog } from "../../utils/log-patch";
import ItemDivider from "../action-sheet/row-divider";
import Input from "../input/input";
import NoDataPlaceholder from "../no-data-placeholder/no-data-placeholder";
import Spacer from "../spacer";
import DefaultText from "../text/Text";
import { AuthType } from "../../types/auth-types";
import AuthContext from "../../context/auth-context";

export default function CategorySelectInput({
  callApi,
  sheetRef,
  values,
  handleSelected,
  reportingCategory,
}: {
  callApi: boolean;
  sheetRef: any;
  values: any;
  handleSelected: any;
  reportingCategory: boolean;
}) {
  const theme = useTheme();
  const { hp } = useResponsive();
  const isConnected = checkInternet();
  const authContext = useContext<AuthType>(AuthContext);

  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<any>([]);

  const getCategory = async () => {
    try {
      const res = await serviceCaller(endpoint.category.path, {
        method: endpoint.category.method,
        query: {
          page: 0,
          limit: 10,
          _q: query,
          sort: "desc",
          activeTab: "active",
          companyRef: authContext.user.companyRef,
        },
      });

      debugLog(
        "Category fetch from api",
        res?.results?.length,
        "product-add-modal",
        "fetchCategories"
      );

      setCategories(res?.results || []);
    } catch (error: any) {
      errorLog(
        error?.message,
        {},
        "product-add-modal",
        "fetchCategories",
        error
      );
      setCategories([]);
    }
  };

  useEffect(() => {
    if (isConnected) {
      getCategory();
    } else {
      repo.category
        .find({
          take: 10,
          skip: 0,
          where: {
            name: ILike(`%${query}%`),
            status: "active",
          },
        })
        .then((data) => {
          debugLog(
            "Categories fetched from db",
            {},
            "product-add-modal",
            "fetchCategories"
          );
          setCategories(data);
        });
    }
  }, [query, callApi]);

  return (
    //@ts-ignore
    <RBSheet
      ref={sheetRef}
      closeOnDragDown={true}
      closeOnPressMask={true}
      animationType="fade"
      onClose={() => {
        setQuery("");
      }}
      customStyles={{
        container: {
          ...styles.card_view,
          minHeight: hp("75%"),
          backgroundColor: theme.colors.bgColor,
        },
        wrapper: {
          backgroundColor: theme.colors.transparentBg,
        },
      }}
    >
      <View>
        <DefaultText
          style={{ marginLeft: hp("2.25%") }}
          fontSize="2xl"
          fontWeight="medium"
        >
          {reportingCategory
            ? t("Select Reporting Category")
            : t("Select Product Category")}
        </DefaultText>

        <Spacer space={10} />

        <ItemDivider
          style={{
            margin: 0,
            borderWidth: 0,
            borderBottomWidth: 1,
            borderTop: 10,
          }}
        />

        <Input
          leftIcon={
            <ICONS.SearchIcon
              color={
                query?.length > 0
                  ? theme.colors.primary[1000]
                  : theme.colors.dark[600]
              }
            />
          }
          placeholderText={
            reportingCategory
              ? t("Search Reporting Category")
              : t("Search Product Category")
          }
          values={query}
          allowClear
          handleChange={(val: string) => setQuery(val)}
          containerStyle={{
            height: hp("7%"),
            marginTop: hp("2%"),
            borderRadius: 10,
            marginHorizontal: hp("2.25%"),
            backgroundColor: theme.colors.bgColor2,
          }}
          style={{
            ...styles.textInput,
            color: theme.colors.text.primary,
          }}
        />

        <FlatList
          style={{
            marginTop: 5,
            minHeight: hp("60%"),
          }}
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          data={categories}
          renderItem={({ item, index }) => {
            return (
              <>
                <TouchableOpacity
                  key={index}
                  style={{
                    ...styles.item_row,
                    backgroundColor:
                      item._id === values.key
                        ? theme.colors.primary[100]
                        : theme.colors.bgColor,
                  }}
                  onPress={() => {
                    handleSelected({ value: item.name.en, key: item._id });
                  }}
                >
                  <DefaultText
                    fontWeight={item._id === values.key ? "medium" : "normal"}
                    color={
                      item._id === values.key ? "primary.1000" : "text.primary"
                    }
                  >
                    {item.name.en}
                  </DefaultText>
                </TouchableOpacity>

                <ItemDivider
                  style={{
                    margin: 0,
                    borderWidth: 0,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                  }}
                />
              </>
            );
          }}
          ListEmptyComponent={() => {
            return (
              <View style={{ marginHorizontal: 16 }}>
                <NoDataPlaceholder
                  title={t("No Categories!")}
                  marginTop={hp("10%")}
                />
              </View>
            );
          }}
          ListFooterComponent={() => (
            <View
              style={{
                height: hp("28%"),
                paddingVertical: 20,
                paddingHorizontal: 26,
              }}
            >
              {categories.length === 10 && (
                <DefaultText fontWeight="medium" color="otherGrey.200">
                  {t("Type in the search bar to find more categories")}
                </DefaultText>
              )}
            </View>
          )}
        />
      </View>
    </RBSheet>
  );
}

const styles = StyleSheet.create({
  card_view: {
    elevation: 100,
    marginTop: "3%",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  textInput: {
    flex: 0.99,
    marginRight: -16,
  },
  item_row: {
    paddingVertical: 18,
    paddingHorizontal: 26,
    flexDirection: "row",
    alignItems: "center",
  },
});
