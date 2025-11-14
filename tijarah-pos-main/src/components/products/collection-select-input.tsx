import React, { useContext, useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import Checkbox from "react-native-bouncy-checkbox";
import RBSheet from "react-native-raw-bottom-sheet";
import { ILike } from "typeorm";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import endpoint from "../../api/endpoints";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import { useResponsive } from "../../hooks/use-responsiveness";
import { AuthType } from "../../types/auth-types";
import { repo } from "../../utils/createDatabaseConnection";
import ICONS from "../../utils/icons";
import { debugLog, errorLog } from "../../utils/log-patch";
import ItemDivider from "../action-sheet/row-divider";
import Input from "../input/input";
import NoDataPlaceholder from "../no-data-placeholder/no-data-placeholder";
import Spacer from "../spacer";
import DefaultText from "../text/Text";

export default function CollectionSelectInput({
  callApi,
  sheetRef,
  selectedIds,
  selectedNames,
  productRef,
  productPrice,
  handleSelected,
}: {
  callApi: boolean;
  sheetRef: any;
  selectedIds: any;
  selectedNames: any;
  productRef: string;
  productPrice: string;
  handleSelected: any;
}) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();
  const isConnected = checkInternet();
  const authContext = useContext<AuthType>(AuthContext);

  const [query, setQuery] = useState("");
  const [collections, setCollections] = useState<any>([]);
  const [collIds, setCollIds] = useState<string[]>([]);
  const [collNames, setCollNames] = useState<string[]>([]);

  const getBCollections = async () => {
    try {
      const res = await serviceCaller(endpoint.collection.path, {
        method: endpoint.collection.method,
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
        "Collections fetch from api",
        res?.results?.length,
        "product-add-modal",
        "fetchCollections"
      );

      setCollections(res?.results || []);
    } catch (error: any) {
      errorLog(
        error?.message,
        {},
        "product-add-modal",
        "fetchCollections",
        error
      );
      setCollections([]);
    }
  };

  const isSelected = (item: any) => {
    if (collIds?.length > 0) {
      return collIds.includes(item._id);
    }

    return false;
  };

  const handleAddOrRemove = async (collectionIds: string[], type: string) => {
    if (productRef) {
      try {
        const data = {
          products: [
            {
              productRef: productRef,
              price: productPrice,
            },
          ],
          productRefs: [productRef],
          collectionRefs: collectionIds,
          type: type,
        };

        await serviceCaller(endpoint.assignCollection.path, {
          method: endpoint.assignCollection.method,
          body: data,
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    if (isConnected) {
      getBCollections();
    } else {
      repo.collection
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
            "Collections fetched from db",
            {},
            "product-add-modal",
            "fetchCollections"
          );
          setCollections(data);
        });
    }
  }, [query, callApi]);

  useEffect(() => {
    setCollIds(selectedIds);
  }, [selectedIds]);

  useEffect(() => {
    setCollNames(selectedNames);
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
            {t("Select Product Collections")}
          </DefaultText>

          <TouchableOpacity
            style={{
              paddingVertical: 15,
              paddingHorizontal: 12,
              position: "absolute",
              right: wp("1.5%"),
            }}
            onPress={() => {
              handleSelected(collIds, collNames);
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
          placeholderText={t("Search Product Collections")}
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
          data={collections}
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
                    const idx = collIds?.indexOf(item?._id);
                    const index = collNames?.indexOf(item?.name?.en);

                    if (idx === -1) {
                      setCollIds([...collIds, item?._id]);
                      handleAddOrRemove([...collIds, item?._id], "assign");
                    } else {
                      const newIds = [...collIds];
                      newIds.splice(idx, 1);
                      setCollIds(newIds);
                      handleAddOrRemove([item?._id], "remove");
                    }

                    if (index === -1) {
                      setCollNames([...collNames, item?.name?.en]);
                    } else {
                      const newNames = [...collNames];
                      newNames.splice(index, 1);
                      setCollNames(newNames);
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
              {collections.length === 10 && (
                <DefaultText fontWeight="medium" color="otherGrey.200">
                  {t("Type in the search bar to find more collections")}
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
