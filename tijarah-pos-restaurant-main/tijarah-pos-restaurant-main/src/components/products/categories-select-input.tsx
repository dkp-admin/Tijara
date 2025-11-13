import React, { useContext, useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import Checkbox from "react-native-bouncy-checkbox";
import RBSheet from "react-native-raw-bottom-sheet";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import endpoint from "../../api/endpoints";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import { useResponsive } from "../../hooks/use-responsiveness";
import ICONS from "../../utils/icons";
import ItemDivider from "../action-sheet/row-divider";
import Input from "../input/input";
import NoDataPlaceholder from "../no-data-placeholder/no-data-placeholder";
import Spacer from "../spacer";
import DefaultText from "../text/Text";
import { AuthType } from "../../types/auth-types";
import AuthContext from "../../context/auth-context";
import repository from "../../db/repository";

export default function CategoriesSelectInput({
  callApi,
  sheetRef,
  selectedIds,
  selectedNames,
  handleSelected,
}: {
  callApi: boolean;
  sheetRef: any;
  selectedIds: any;
  selectedNames: any;
  handleSelected: any;
}) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();
  const isConnected = checkInternet();
  const authContext = useContext<AuthType>(AuthContext);

  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<any>([]);
  const [catIds, setCatIds] = useState<string[]>([]);
  const [catNames, setCatNames] = useState<string[]>([]);

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

      setCategories(res?.results || []);
    } catch (error: any) {
      setCategories([]);
    }
  };

  const isSelected = (item: any) => {
    if (catIds?.length > 0) {
      return catIds.includes(item._id);
    }

    return false;
  };

  useEffect(() => {
    if (isConnected) {
      getCategory();
    } else {
      repository.categoryRepository
        .find({
          take: 10,
          skip: 0,
          where: {
            name: query,
            status: "active",
          },
        })
        .then((data) => {
          setCategories(data);
        });
    }
  }, [query, callApi]);

  useEffect(() => {
    setCatIds(selectedIds);
  }, [selectedIds]);

  useEffect(() => {
    setCatNames(selectedNames);
  }, [selectedNames]);

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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <DefaultText
            style={{ marginLeft: hp("2.25%") }}
            fontSize="2xl"
            fontWeight="medium"
          >
            {t("Select Categories")}
          </DefaultText>

          <TouchableOpacity
            style={{
              paddingVertical: 15,
              paddingHorizontal: 12,
              position: "absolute",
              right: wp("1.5%"),
            }}
            onPress={() => {
              handleSelected(catIds, catNames);
            }}
          >
            <DefaultText
              fontSize="2xl"
              fontWeight="medium"
              color="primary.1000"
            >
              {t("Add")}
            </DefaultText>
          </TouchableOpacity>
        </View>

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
          placeholderText={t("Search Categories")}
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
          style={{ marginTop: 5, minHeight: hp("60%") }}
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
                    backgroundColor: theme.colors.bgColor,
                  }}
                  onPress={() => {
                    const idx = catIds?.indexOf(item?._id);
                    const index = catNames?.indexOf(item?.name?.en);

                    if (idx === -1) {
                      setCatIds([...catIds, item?._id]);
                    } else {
                      const newIds = [...catIds];
                      newIds.splice(idx, 1);
                      setCatIds(newIds);
                    }

                    if (index === -1) {
                      setCatNames([...catNames, item?.name?.en]);
                    } else {
                      const newNames = [...catNames];
                      newNames.splice(index, 1);
                      setCatNames(newNames);
                    }
                  }}
                >
                  <Checkbox
                    style={{ marginRight: -hp("0.5%") }}
                    isChecked={isSelected(item)}
                    fillColor={theme.colors.white[1000]}
                    unfillColor={theme.colors.white[1000]}
                    iconComponent={
                      isSelected(item) ? (
                        <ICONS.TickFilledIcon
                          width={25}
                          height={25}
                          color={theme.colors.primary[1000]}
                        />
                      ) : (
                        <ICONS.TickEmptyIcon
                          width={25}
                          height={25}
                          color={theme.colors.primary[1000]}
                        />
                      )
                    }
                    disableBuiltInState
                    disabled
                  />

                  <DefaultText
                    fontWeight={isSelected(item) ? "medium" : "normal"}
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
                  title={t("No Collections!")}
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
