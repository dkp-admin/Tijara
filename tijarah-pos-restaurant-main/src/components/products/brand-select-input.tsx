import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
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
import PermissionPlaceholderComponent from "../permission-placeholder";
import Spacer from "../spacer";
import DefaultText from "../text/Text";

export default function BrandSelectInput({
  sheetRef,
  values,
  handleSelected,
}: {
  sheetRef: any;
  values: any;
  handleSelected: any;
}) {
  const theme = useTheme();
  const { hp } = useResponsive();
  const isConnected = checkInternet();

  const [query, setQuery] = useState("");
  const [brands, setBrands] = useState<any>([]);

  const getBrands = async () => {
    if (!isConnected) {
      setBrands([]);
    }

    try {
      const res = await serviceCaller(endpoint.brands.path, {
        method: endpoint.brands.method,
        query: {
          page: 0,
          limit: 25,
          _q: query,
          sort: "desc",
          activeTab: "active",
        },
      });

      setBrands(res?.results || []);
    } catch (error: any) {
      setBrands([]);
    }
  };

  useEffect(() => {
    getBrands();
  }, [query]);

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
          {t("Select Brand")}
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

        {isConnected ? (
          <View>
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
              placeholderText={t("Search Brand")}
              values={query}
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
              data={brands}
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
                        fontWeight={
                          item._id === values.key ? "medium" : "normal"
                        }
                        color={
                          item._id === values.key
                            ? "primary.1000"
                            : "text.primary"
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
                      title={t("No Brands!")}
                      marginTop={hp("10%")}
                    />
                  </View>
                );
              }}
              ListFooterComponent={() => (
                <View
                  style={{
                    height: hp("40%"),
                    paddingVertical: 20,
                    paddingHorizontal: 26,
                  }}
                >
                  {brands.length === 25 && (
                    <DefaultText fontWeight="medium" color="otherGrey.200">
                      {t("Type in the search bar to find more brands")}
                    </DefaultText>
                  )}
                </View>
              )}
            />
          </View>
        ) : (
          <PermissionPlaceholderComponent
            title={t("Please connect with internet")}
            marginTop="-25%"
          />
        )}
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
