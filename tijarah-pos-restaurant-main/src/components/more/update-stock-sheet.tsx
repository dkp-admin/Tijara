import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { View } from "react-native";
import DefaultText from "../text/Text";
import ICONS from "../../utils/icons";
import ItemDivider from "../action-sheet/row-divider";
import SelectInput from "../input/select-input";
import { t } from "i18n-js";
import { stockReduceActionOptions } from "../variant/stocks/stock-action/types";
import { useTheme } from "../../context/theme-context";
import { useContext, useEffect, useState } from "react";
import serviceCaller from "../../api";
import Loader from "../loader";
import DeviceContext from "../../context/device-context";
import React from "react";
import showToast from "../toast";

const UpdateStockSheet = ({
  onUpdate,
  updateSheetRef,
  scannedProduct,
}: any) => {
  const theme = useTheme();
  const deviceContext = useContext(DeviceContext) as any;
  const [selectedReason, setSelectedReason] = useState({
    value: "Damaged",
    key: "damaged",
  }) as any;
  const [reduceAmount, setReduceAmount] = useState("") as any;
  const [loading, setLoading] = useState(false);
  const [availableStock, setAvailableStock] = useState(0);

  useEffect(() => {
    if (scannedProduct?.type !== "box" && scannedProduct?.type !== "crate") {
      let variant = scannedProduct?.variants?.[0];

      let stock = variant?.stockConfiguration?.find((t: any) => {
        return (
          t.locationRef?.toString() ===
          deviceContext?.user?.locationRef.toString()
        );
      });
      scannedProduct.variants = [variant];
      if (typeof stock?.count === "number" && !isNaN(stock?.count)) {
        setAvailableStock(stock?.count);
      }
    } else {
      let stock = scannedProduct?.box?.stockConfiguration?.find((t: any) => {
        return (
          t.locationRef?.toString() ===
          deviceContext?.user?.locationRef.toString()
        );
      });

      let variant = scannedProduct?.box;
      let oldVar = scannedProduct?.variants;
      scannedProduct.variants = [variant];
      scannedProduct["oldVariant"] = oldVar;
      if (typeof stock?.count === "number" && !isNaN(stock?.count)) {
        setAvailableStock(stock?.count);
      }
    }
  }, [scannedProduct]);

  return (
    <View style={styles.sheetContainer}>
      <View style={{ paddingHorizontal: 20 }}>
        <View style={styles.sheetHeader}>
          <View style={{ flex: 1 }}></View>
          <DefaultText style={{ flex: 2 }} fontSize="2xl" fontWeight="medium">
            {t("Update Stock")}
          </DefaultText>
          <TouchableOpacity
            onPress={() => {
              updateSheetRef?.current?.close();
            }}
          >
            <ICONS.CloseClearIcon />
          </TouchableOpacity>
        </View>
        <ItemDivider
          style={{
            margin: 0,
            borderWidth: 0,
            borderBottomWidth: 1,
            borderTop: 10,
          }}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>
            {scannedProduct?.name?.en}{" "}
            {scannedProduct?.type !== "product" && (
              <>
                ({scannedProduct?.type?.charAt(0).toUpperCase()}
                {scannedProduct?.type?.slice(1)} - {scannedProduct?.box?.qty}{" "}
                Units)
              </>
            )}
          </Text>
          <Text style={styles.productCode}>{scannedProduct?.sku}</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t("Update Reason")}</Text>
          <SelectInput
            containerStyle={{
              ...styles.input,
              borderWidth: 0,
            }}
            clearValues={false}
            isTwoText={false}
            allowSearch={false}
            leftText={`${t("Update Reason")} *`}
            placeholderText={t("Select update reason")}
            options={stockReduceActionOptions}
            values={selectedReason}
            handleChange={(val: any) => {
              if (val.key && val.value) {
                setSelectedReason(val);
              }
            }}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Reduce Stock *</Text>
          <TextInput
            style={styles.input}
            value={reduceAmount}
            onChangeText={(text) => {
              const numericValue = text.replace(/[^0-9]/g, "");
              setReduceAmount(numericValue);
            }}
            keyboardType="numeric"
            placeholder={t("Enter count")}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t("Updated Stocks")}</Text>
          <View style={styles.calculationBox}>
            <Text style={styles.calculationText}>
              {availableStock} - {reduceAmount || 0} ={" "}
              {availableStock - Number(reduceAmount || 0)}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          backgroundColor: "#fff",
          padding: 20,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -8,
          },
          shadowOpacity: 0.5,
          shadowRadius: 8,
          elevation: 10,
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor:
              Number(reduceAmount) <= 0
                ? theme.colors.primary[200]
                : theme.colors.primary[1000],
            padding: 15,
            borderRadius: 12,
            alignItems: "center",
            flex: 1,
          }}
          disabled={Number(reduceAmount) <= 0}
          onPress={async () => {
            if (Number(reduceAmount) > 0) {
              setLoading(true);
              // update stock
              console.log("--", scannedProduct?.type);
              try {
                if (scannedProduct?.type === "product") {
                  const payload = {
                    productRef: scannedProduct._id,
                    product: {
                      name: scannedProduct.name,
                    },
                    companyRef: scannedProduct.companyRef,
                    company: {
                      name: scannedProduct.company.name,
                    },
                    locationRef: deviceContext?.user?.locationRef,
                    location: {
                      name: deviceContext?.user?.location?.name,
                    },
                    categoryRef: scannedProduct.categoryRef,
                    category: {
                      name: scannedProduct.category.name,
                    },
                    variant: {
                      name: scannedProduct.variants[0].name,
                      type: scannedProduct.variants[0].type,
                      unit: scannedProduct.variants[0].unitCount,
                      qty: Number(reduceAmount),
                      sku: scannedProduct.variants[0].sku,
                      costPrice: scannedProduct.variants[0].costPrice,
                      sellingPrice: scannedProduct.variants[0].price,
                    },
                    hasMultipleVariants: scannedProduct.multiVariants,
                    sku: scannedProduct.sku,
                    batching: scannedProduct.batching,
                    action: selectedReason.key,
                    expiry: null,
                    price: scannedProduct.variants[0].costPrice,
                    count: availableStock - Number(reduceAmount),
                    sourceRef: null,
                    destRef: null,
                    available: -Number(reduceAmount),
                    received: 0,
                    previousStockCount: availableStock,
                  };

                  await serviceCaller("/stock-history", {
                    method: "POST",
                    body: payload,
                  });
                } else if (scannedProduct?.type === "box") {
                  const stockConfigurations =
                    scannedProduct?.box?.stockConfiguration;
                  const idx =
                    scannedProduct?.box?.stockConfiguration?.findIndex(
                      (t: any) =>
                        t.locationRef?.toString() ===
                        deviceContext?.user?.locationRef?.toString()
                    );
                  if (idx !== -1) {
                    stockConfigurations[idx].count =
                      availableStock - Number(reduceAmount);
                    const payload = {
                      name: scannedProduct?.box?.name,
                      companyRef: scannedProduct?.box?.companyRef,
                      company: {
                        name: scannedProduct?.box?.company.name,
                      },
                      locationRef: deviceContext?.user?.locationRef,
                      location: {
                        name: deviceContext?.user?.location?.name,
                      },
                      categoryRef: scannedProduct?.box?.product.categoryRef,
                      category: {
                        name: scannedProduct?.box?.product.category.name,
                      },
                      type: scannedProduct?.box?.type,
                      code: scannedProduct?.box?.code,
                      costPrice: scannedProduct?.box?.costPrice,
                      price: scannedProduct?.box?.price,
                      qty: scannedProduct?.box?.qty,
                      description: scannedProduct?.box?.description || "",
                      locations: scannedProduct?.box?.locations,
                      locationRefs: scannedProduct?.box?.locationRefs,
                      stockConfiguration:
                        scannedProduct?.box?.stockConfiguration,
                      prices: scannedProduct?.box?.prices,
                      product: scannedProduct?.box?.product,
                      boxSku: scannedProduct?.box?.boxSku,
                      crateSku: scannedProduct?.box?.crateSku,
                      productSku: scannedProduct?.box?.productSku,
                      nonSaleable: scannedProduct?.box?.nonSaleable,
                      status: scannedProduct?.box?.status,
                    };
                    await serviceCaller(
                      "/boxes-crates/" + scannedProduct?.box?._id,
                      {
                        method: "PATCH",
                        body: payload,
                      }
                    );
                  }

                  const product = await serviceCaller("/product/scan-product", {
                    method: "GET",
                    query: {
                      page: 0,
                      sort: "asc",
                      activeTab: "all",
                      limit: 1,
                      _q: scannedProduct?.box?.productSku,
                      companyRef: deviceContext?.user?.companyRef,
                      locationRef: deviceContext?.user?.locationRef,
                      showCustomPrice: false,
                    },
                  });

                  const variant = product?.variants?.find(
                    (t: any) =>
                      t.sku === scannedProduct?.box?.productSku ||
                      t.parentSku === scannedProduct?.box?.productSku
                  );

                  const itemReduction = reduceAmount * scannedProduct?.box?.qty;
                  console.log("::::STOCK CONFIG:::::", variant);

                  const itemStock = variant?.stockConfiguration?.find(
                    (t: any) =>
                      t.locationRef?.toString() ===
                      deviceContext?.user?.locationRef?.toString()
                  );

                  const itemAvailableStock = itemStock?.count;

                  console.log(":::ITEM REDUCTION::::::", itemReduction);
                  console.log(
                    ":::ITEM AVAILABLE STOCK::::::",
                    itemAvailableStock
                  );

                  const payload = {
                    productRef: scannedProduct._id,
                    product: {
                      name: scannedProduct?.name,
                    },
                    companyRef: deviceContext?.user?.companyRef,
                    company: {
                      name: deviceContext?.user?.company?.name?.en,
                    },
                    locationRef: deviceContext?.user?.locationRef,
                    location: {
                      name: deviceContext?.user?.location?.name,
                    },
                    categoryRef: scannedProduct.categoryRef,
                    category: {
                      name: scannedProduct.category.name,
                    },
                    variant: {
                      name: scannedProduct.oldVariant[0].name,
                      type: "item",
                      unit: scannedProduct.oldVariant[0].unitCount,
                      qty: Number(itemReduction),
                      sku: scannedProduct.oldVariant[0].sku,
                      costPrice: scannedProduct.oldVariant[0].costPrice,
                      sellingPrice: scannedProduct.oldVariant[0].price,
                    },
                    hasMultipleVariants: scannedProduct.multiVariants,
                    sku: scannedProduct.sku,
                    batching: scannedProduct.batching,
                    action: selectedReason.key,
                    expiry: null,
                    price: scannedProduct.oldVariant[0].costPrice,
                    count: itemAvailableStock - Number(itemReduction),
                    sourceRef: null,
                    destRef: null,
                    available: -Number(reduceAmount),
                    received: 0,
                    previousStockCount: itemAvailableStock,
                  };

                  console.log(":::::PAYLOAD:::::", payload);

                  await serviceCaller("/stock-history", {
                    method: "POST",
                    body: payload,
                  });
                } else if (scannedProduct?.type === "crate") {
                  const stockConfigurations =
                    scannedProduct?.box?.stockConfiguration;
                  const idx =
                    scannedProduct?.box?.stockConfiguration?.findIndex(
                      (t: any) =>
                        t.locationRef?.toString() ===
                        deviceContext?.user?.locationRef?.toString()
                    );
                  if (idx !== -1) {
                    stockConfigurations[idx].count =
                      availableStock - Number(reduceAmount);
                    const payload = {
                      name: scannedProduct?.box?.name,
                      companyRef: scannedProduct?.box?.companyRef,
                      company: {
                        name: scannedProduct?.box?.company.name,
                      },
                      locationRef: deviceContext?.user?.locationRef,
                      location: {
                        name: deviceContext?.user?.location?.name,
                      },
                      categoryRef: scannedProduct?.box?.product.categoryRef,
                      category: {
                        name: scannedProduct?.box?.product.category.name,
                      },
                      type: scannedProduct?.box?.type,
                      code: scannedProduct?.box?.code,
                      costPrice: scannedProduct?.box?.costPrice,
                      price: scannedProduct?.box?.price,
                      qty: scannedProduct?.box?.qty,
                      description: scannedProduct?.box?.description || "",
                      locations: scannedProduct?.box?.locations,
                      locationRefs: scannedProduct?.box?.locationRefs,
                      stockConfiguration:
                        scannedProduct?.box?.stockConfiguration,
                      prices: scannedProduct?.box?.prices,
                      product: scannedProduct?.box?.product,
                      boxSku: scannedProduct?.box?.boxSku,
                      crateSku: scannedProduct?.box?.crateSku,
                      productSku: scannedProduct?.box?.productSku,
                      nonSaleable: scannedProduct?.box?.nonSaleable,
                      status: scannedProduct?.box?.status,
                    };
                    await serviceCaller(
                      "/boxes-crates/" + scannedProduct?.box?._id,
                      {
                        method: "PATCH",
                        body: payload,
                      }
                    );
                  }

                  const box = await serviceCaller("/product/scan-product", {
                    method: "GET",
                    query: {
                      page: 0,
                      sort: "asc",
                      activeTab: "all",
                      limit: 1,
                      _q: scannedProduct?.box?.boxSku,
                      companyRef: deviceContext?.user?.companyRef,
                      locationRef: deviceContext?.user?.locationRef,
                      showCustomPrice: false,
                    },
                  });

                  let boxQty = 1;
                  let numberOfProdQty = 1;

                  if (box) {
                    const stockConfigurations = box?.box?.stockConfiguration;
                    const idx = box?.box?.stockConfiguration?.findIndex(
                      (t: any) =>
                        t.locationRef?.toString() ===
                        deviceContext?.user?.locationRef?.toString()
                    );
                    if (idx !== -1) {
                      boxQty = scannedProduct?.box?.qty * Number(reduceAmount);
                      numberOfProdQty = box?.box?.qty;
                      stockConfigurations[idx].count =
                        stockConfigurations[idx].count -
                        scannedProduct?.box?.qty * Number(reduceAmount);

                      const payload = {
                        name: box?.box?.name,
                        companyRef: box?.box?.companyRef,
                        company: {
                          name: box?.box?.company.name,
                        },
                        locationRef: deviceContext?.user?.locationRef,
                        location: {
                          name: deviceContext?.user?.location?.name,
                        },
                        categoryRef: box?.box?.product.categoryRef,
                        category: {
                          name: box?.box?.product.category.name,
                        },
                        type: "box",
                        code: box?.box?.code,
                        costPrice: box?.box?.costPrice,
                        price: box?.box?.price,
                        qty: box?.box?.qty,
                        description: box?.box?.description || "",
                        locations: box?.box?.locations,
                        locationRefs: box?.box?.locationRefs,
                        stockConfiguration: box?.box?.stockConfiguration,
                        prices: box?.box?.prices,
                        product: box?.box?.product,
                        boxSku: box?.box?.boxSku,
                        crateSku: box?.box?.crateSku,
                        productSku: box?.box?.productSku,
                        nonSaleable: box?.box?.nonSaleable,
                        status: box?.box?.status,
                      };
                      await serviceCaller("/boxes-crates/" + box?.box?._id, {
                        method: "PATCH",
                        body: payload,
                      });
                    }
                  }

                  const product = await serviceCaller("/product/scan-product", {
                    method: "GET",
                    query: {
                      page: 0,
                      sort: "asc",
                      activeTab: "all",
                      limit: 1,
                      _q: scannedProduct?.box?.productSku,
                      companyRef: deviceContext?.user?.companyRef,
                      locationRef: deviceContext?.user?.locationRef,
                      showCustomPrice: false,
                    },
                  });

                  const variant = product?.variants?.find(
                    (t: any) =>
                      t.sku === scannedProduct?.box?.productSku ||
                      t.parentSku === scannedProduct?.box?.productSku
                  );

                  const itemReduction = boxQty * numberOfProdQty;
                  console.log("::::STOCK CONFIG:::::", variant);

                  const itemStock = variant?.stockConfiguration?.find(
                    (t: any) =>
                      t.locationRef?.toString() ===
                      deviceContext?.user?.locationRef?.toString()
                  );

                  const itemAvailableStock = itemStock?.count;

                  console.log(":::ITEM REDUCTION::::::", itemReduction);
                  console.log(
                    ":::ITEM AVAILABLE STOCK::::::",
                    itemAvailableStock
                  );

                  const payload = {
                    productRef: scannedProduct._id,
                    product: {
                      name: scannedProduct?.name,
                    },
                    companyRef: deviceContext?.user?.companyRef,
                    company: {
                      name: deviceContext?.user?.company?.name?.en,
                    },
                    locationRef: deviceContext?.user?.locationRef,
                    location: {
                      name: deviceContext?.user?.location?.name,
                    },
                    categoryRef: scannedProduct.categoryRef,
                    category: {
                      name: scannedProduct.category.name,
                    },
                    variant: {
                      name: scannedProduct.oldVariant[0].name,
                      type: "item",
                      unit: scannedProduct.oldVariant[0].unitCount,
                      qty: Number(itemReduction),
                      sku: scannedProduct.oldVariant[0].sku,
                      costPrice: scannedProduct.oldVariant[0].costPrice,
                      sellingPrice: scannedProduct.oldVariant[0].price,
                    },
                    hasMultipleVariants: scannedProduct.multiVariants,
                    sku: scannedProduct.sku,
                    batching: scannedProduct.batching,
                    action: selectedReason.key,
                    expiry: null,
                    price: scannedProduct.oldVariant[0].costPrice,
                    count: itemAvailableStock - Number(itemReduction),
                    sourceRef: null,
                    destRef: null,
                    available: -Number(reduceAmount),
                    received: 0,
                    previousStockCount: itemAvailableStock,
                  };

                  console.log(":::::PAYLOAD:::::", payload);

                  await serviceCaller("/stock-history", {
                    method: "POST",
                    body: payload,
                  });
                }
                setLoading(false);
                onUpdate(true);
              } catch (error) {
                console.log("error while updating stock", error);
                setLoading(false);
              }
            } else {
              showToast("error", t("Please enter stock count."));
            }
          }}
        >
          {loading ? (
            <ActivityIndicator size={"small"} color={theme.colors.dark[1000]} />
          ) : (
            <Text style={styles.updateButtonText}>{t("Update Stock")}</Text>
          )}
        </TouchableOpacity>
      </View>
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
    alignItems: "center",
    marginTop: 150,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
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
    // paddingHorizontal: 20,
    flex: 1,
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
    fontSize: 24,
    color: "#000000",
  },
  calculationBox: {
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 12,
  },
  calculationText: {
    fontSize: 24,
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
});

export default UpdateStockSheet;
