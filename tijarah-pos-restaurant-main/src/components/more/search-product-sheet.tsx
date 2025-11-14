import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import serviceCaller from "../../api";
import React, { useContext, useState } from "react";
import { AuthType } from "../../types/auth-types";
import AuthContext from "../../context/auth-context";
import ICONS from "../../utils/icons";
import DefaultText, { getOriginalSize } from "../text/Text";
import { t } from "../../../i18n";

const CAMERA_HEIGHT = 200;

const SearchSheet = ({
  updateSheetRef,
  searchSheetRef,
  setScannedProduct,
  prodIds = [],
  boxIds = [],
  skus = [],
}: any) => {
  const authContext = useContext<AuthType>(AuthContext) as any;
  const [searchResults, setSearchResults] = useState([]) as any;
  const [searchQuery, setSearchQuery] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null) as any;

  React.useEffect(() => {
    console.log("calling");
    const debounceTimer = setTimeout(async () => {
      try {
        const products = await serviceCaller("/product", {
          method: "GET",
          query: {
            page: 0,
            sort: "asc",
            activeTab: "active",
            limit: 10,
            _q: searchQuery,
            companyRef: authContext?.user?.companyRef,
            locationRef: authContext?.user?.locationRef,
          },
        });

        const boxAndCrates = await serviceCaller("/boxes-crates", {
          method: "GET",
          query: {
            page: 0,
            sort: "asc",
            activeTab: "active",
            limit: 10,
            _q: searchQuery,
            companyRef: authContext?.user?.companyRef,
            isComposite: false,
          },
        });

        const boxes = boxAndCrates?.results?.map((b: any) => {
          return {
            ...b.product,
            box: b,
            type: b.type,
            variants: [b?.product],
            boxId: b?._id,
          };
        });

        const allProds = [...products?.results];

        setSearchResults([
          ...allProds
            ?.flatMap((p: any) => {
              console.log(p?.name);
              const nameMatches = p.name.en
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

              const relevantVariants = nameMatches
                ? p.variants
                : p.variants.filter((variant: any) =>
                    variant.sku
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  );

              return relevantVariants
                ?.filter((t: any) => t)
                ?.map((variant: any) => ({
                  ...p,
                  currentVariant: variant,
                  name: {
                    en:
                      p.variants?.length > 1
                        ? `${p?.name?.en} - ${variant?.name?.en}`
                        : `${p?.name?.en}`,
                    ar:
                      p.variants?.length > 1
                        ? `${p?.name?.en} - ${variant?.name?.en}`
                        : `${p?.name?.en}`,
                  },
                  variants: [variant],
                }));
            })
            .filter((item: any) => {
              return !skus.includes(item.variants?.[0].sku);
            }),
          ...boxes.filter((t: any) => {
            return !boxIds.includes(t?.box?._id || "NA");
          }),
        ]);
      } catch (error) {
        console.log("Search error::::::", error);
        setSearchResults([]);
      } finally {
        setInitialized(true);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, authContext?.user]);

  console.log(boxIds);

  return (
    <View style={styles.sheetContainer}>
      <View style={styles.sheetHeader}>
        <View style={{ flex: 1 }}></View>
        <DefaultText style={{ flex: 2 }} fontSize="2xl" fontWeight="medium">
          {t("Search Product")}
        </DefaultText>
        <TouchableOpacity
          onPress={() => {
            searchSheetRef?.current?.close();
          }}
        >
          <ICONS.CloseClearIcon />
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "center" }}>
        <TextInput
          style={[
            styles.searchInput,
            { paddingRight: 30 }, // Add padding for the clear button
          ]}
          placeholder={t("Search by product name or code")}
          placeholderTextColor="#9E9E9E"
          value={searchQuery}
          onChangeText={async (text) => {
            setSearchQuery(text);
          }}
        />
        {searchQuery ? (
          <TouchableOpacity
            style={{
              position: "absolute",
              right: 15,
              top: 8,
              padding: 5,
            }}
            onPress={() => setSearchQuery("")}
          >
            <Text style={{ fontSize: 16, color: "#9E9E9E" }}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView style={styles.searchResults}>
        {searchResults.map((product: any, index: number) => (
          <TouchableOpacity
            key={index}
            style={styles.searchResultItem}
            onPress={() => {
              setSelectedIndex(index);
              setScannedProduct({
                ...product,
                sku:
                  product.type === "box"
                    ? product.box?.boxSku
                    : product.type === "crate"
                    ? product.box?.crateSku
                    : product.variants?.[0]?.sku,
                type: product?.type ? product?.type : "product",
                _id: product?._id || product?.productRef,
              });
              searchSheetRef.current?.close();
              if (updateSheetRef) {
                updateSheetRef.current?.open();
              }
            }}
          >
            {index === selectedIndex ? (
              <ICONS.RadioFilledIcon
                width={getOriginalSize(24)}
                height={getOriginalSize(24)}
              />
            ) : (
              <ICONS.RadioEmptyIcon
                width={getOriginalSize(24)}
                height={getOriginalSize(24)}
              />
            )}
            <View style={{ marginLeft: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.productNameText}>
                  {product?.type == "box"
                    ? product?.box?.name?.en
                    : product?.name?.en}
                </Text>
                {(product?.type == "box" || product?.type == "crate") && (
                  <Text
                    style={[
                      styles.productNameText,
                      {
                        marginLeft: 5,
                        fontSize: 16,
                        textTransform: "capitalize",
                      },
                    ]}
                  >
                    ({product?.type})
                  </Text>
                )}
              </View>
              <Text style={styles.productSkuText}>
                {product.type === "box"
                  ? product.box?.boxSku
                  : product.type === "crate"
                  ? product.box?.crateSku
                  : product.variants?.[0]?.sku}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        {searchResults.length == 0 && initialized && (
          <Text style={styles.productNameText}>{t("No results found")}</Text>
        )}

        {!initialized && <ActivityIndicator size={"small"} />}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 150,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
  },
  cameraContainer: {
    width: "100%",
    height: CAMERA_HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#000",
  },
  orText: {
    fontSize: 16,
    fontWeight: "500",
    marginVertical: 20,
    color: "#000000",
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 15,
    borderRadius: 25,
    marginTop: 10,
    backgroundColor: "#fff",
  },
  searchButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "thin",
    color: "#9E9E9E",
  },
  // Sheet Styles
  sheetContainerStyle: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  draggableIcon: {
    backgroundColor: "#DDDDDD",
    width: 60,
  },
  sheetContainer: {
    paddingHorizontal: 20,
  },
  sheetHeader: {
    flexDirection: "row",
    paddingBottom: 10,
    alignItems: "center",
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
    color: "#000000",
  },
  searchInput: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: "#F5F5F5",
    color: "#000000",
  },
  // Update Sheet Styles
  productInfo: {
    marginBottom: 20,
  },
  productName: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 4,
  },
  productCode: {
    fontSize: 14,
    color: "#666666",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 8,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 12,
  },
  selectButtonText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#666666",
  },
  input: {
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    color: "#000000",
  },
  calculationBox: {
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 12,
  },
  calculationText: {
    fontSize: 16,
    color: "#666666",
  },

  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  // Success Sheet Styles
  successContent: {
    alignItems: "center",
    paddingTop: 20,
  },
  successIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#47B881",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 30,
    textAlign: "center",
  },
  locationText: {
    fontWeight: "600",
    color: "#000000",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  doneButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  doneButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "500",
  },
  updateMoreButton: {
    flex: 1,
    backgroundColor: "#47B881",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  updateMoreButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  searchResults: {
    marginTop: 20,
    maxHeight: 300,
  },
  searchResultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    flexDirection: "row",
    alignItems: "center",
  },
  productNameText: {
    fontSize: 18,
    color: "#000000",
    marginBottom: 4,
    textAlign: "center",
  },
  productSkuText: {
    fontSize: 14,
    color: "#666666",
  },
});

export default SearchSheet;
