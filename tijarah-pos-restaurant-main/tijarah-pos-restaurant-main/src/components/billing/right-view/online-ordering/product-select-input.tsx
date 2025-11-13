import React, { useEffect, useState } from "react";
import {
  FlatList,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { useDebounce } from "use-debounce";
import { t } from "../../../../../i18n";
import serviceCaller from "../../../../api";
import endpoint from "../../../../api/endpoints";
import { useTheme } from "../../../../context/theme-context";
import { checkDirection } from "../../../../hooks/check-direction";
import { checkInternet } from "../../../../hooks/check-internet";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import ICONS from "../../../../utils/icons";
import ItemDivider from "../../../action-sheet/row-divider";
import Input from "../../../input/input";
import Loader from "../../../loader";
import NoDataPlaceholder from "../../../no-data-placeholder/no-data-placeholder";
import PermissionPlaceholderComponent from "../../../permission-placeholder";
import Spacer from "../../../spacer";
import DefaultText from "../../../text/Text";

export default function ProductSelectInput({
  sheetRef,
  industry,
  orderType,
  companyRef,
  locationRef,
  handleSelected,
}: {
  sheetRef: any;
  industry: string;
  orderType: string;
  companyRef: string;
  locationRef: string;
  handleSelected: any;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { wp, hp } = useResponsive();
  const isConnected = checkInternet();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [debouncedQuery] = useDebounce(query, 500);
  const [products, setProducts] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  const getProducts = async () => {
    if (!isConnected) {
      setProducts([]);
    }

    setLoading(true);

    try {
      if (industry === "restaurant") {
        const res = await serviceCaller(endpoint.restaurantMenu.path, {
          method: endpoint.restaurantMenu.method,
          query: {
            companyRef: companyRef,
            locationRef: locationRef,
            _q: debouncedQuery || "",
            orderType: orderType?.toLowerCase(),
          },
        });

        if (res?.results) {
          const data: any[] = [];

          res?.results?.products?.forEach((prod: any) => {
            const variants = prod?.variants?.filter(
              (v: any) =>
                !v?.nonSaleable &&
                v?.unit === "perItem" &&
                v?.prices?.find(
                  (p: any) =>
                    p?.locationRef === locationRef && Number(p?.price || 0) > 0
                )
            );

            if (variants?.length > 0) {
              data.push({
                ...prod,
                boxRefs: [],
                crateRefs: [],
                variants: variants,
              });
            }
          });

          setProducts(data);
          Keyboard.dismiss();
        }
      } else {
        const res = await serviceCaller(endpoint.retailMenu.path, {
          method: endpoint.retailMenu.method,
          query: {
            page: 0,
            limit: 100,
            sort: "desc",
            activeTab: "active",
            companyRef: companyRef,
            locationRef: locationRef,
            _q: debouncedQuery || "",
          },
        });

        if (res?.results?.length > 0) {
          const data: any[] = [];

          res?.results?.forEach((result: any) => {
            const variants = result?.variants?.filter(
              (v: any) =>
                !v?.nonSaleable &&
                v?.unit === "perItem" &&
                v?.prices?.find(
                  (p: any) =>
                    p?.locationRef === locationRef && Number(p?.price || 0) > 0
                )
            );

            const boxes = result?.boxes?.filter((b: any) => !b?.nonSaleable);

            if (variants?.length > 0 || boxes?.length > 0) {
              data.push({ ...result, boxes: boxes, variants: variants });
            }
          });

          setProducts(data);
          Keyboard.dismiss();
        }
      }
    } catch (error: any) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, [debouncedQuery, industry, orderType, companyRef, locationRef]);

  return (
    //@ts-ignore
    <RBSheet
      ref={sheetRef}
      closeOnDragDown={true}
      closeOnPressMask={true}
      animationType="fade"
      onClose={() => {
        setQuery("");
        setSelected({ _id: "", en_name: "", ar_name: "" });
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
            {t("Select Item")}
          </DefaultText>

          <TouchableOpacity
            style={{
              right: wp("1.5%"),
              position: "absolute",
              paddingVertical: 15,
              paddingHorizontal: 12,
            }}
            onPress={() => {
              handleSelected(selected);
            }}
            disabled={selected?._id === ""}
          >
            <DefaultText
              fontSize="2xl"
              fontWeight="medium"
              color={
                selected?._id !== "" ? "primary.1000" : theme.colors.placeholder
              }
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
              placeholderText={
                industry === "restaurant"
                  ? t("Search item with name and SKU")
                  : t("Search product with name and SKU")
              }
              values={query}
              allowClear={query !== ""}
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

            {loading ? (
              <Loader style={{ marginTop: hp("30%") }} />
            ) : (
              <FlatList
                style={{ marginTop: 5, minHeight: hp("60%") }}
                onScroll={() => {
                  Keyboard.dismiss();
                }}
                alwaysBounceVertical={false}
                showsVerticalScrollIndicator={false}
                data={products}
                renderItem={({ item, index }) => {
                  return (
                    <>
                      <TouchableOpacity
                        key={index}
                        style={{
                          ...styles.item_row,
                          backgroundColor:
                            item._id === selected?._id
                              ? theme.colors.primary[100]
                              : theme.colors.bgColor,
                        }}
                        onPress={() => {
                          Keyboard.dismiss();
                          setSelected(item);
                        }}
                      >
                        <DefaultText
                          fontWeight={
                            item._id === selected?._id ? "medium" : "normal"
                          }
                          color={
                            item._id === selected?._id
                              ? "primary.1000"
                              : "text.primary"
                          }
                        >
                          {isRTL ? item.name.ar : item.name.en}
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
                        title={t("No Items!")}
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
                    {products.length === 100 && (
                      <DefaultText fontWeight="medium" color="otherGrey.200">
                        {t("Type in the search bar to find more items")}
                      </DefaultText>
                    )}
                  </View>
                )}
              />
            )}
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
