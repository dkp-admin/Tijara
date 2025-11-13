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
import { t } from "../../../i18n";
import { stockReduceActionOptions } from "../variant/stocks/stock-action/types";
import { useTheme } from "../../context/theme-context";
import { useContext, useEffect, useState } from "react";
import serviceCaller from "../../api";
import Loader from "../loader";
import DeviceContext from "../../context/device-context";
import showToast from "../toast";
import { err } from "react-native-svg";

const UpdatePriceSheet = ({
  onUpdate,
  updateSheetRef,
  scannedProduct,
}: any) => {
  const theme = useTheme();
  const [costPrice, setCostPrice] = useState(0) as any;
  const [sellingPrice, setSellingPrice] = useState(0) as any;
  const [loading, setLoading] = useState(false) as any;
  const deviceContext = useContext(DeviceContext) as any;
  const [error, setError] = useState(false);

  useEffect(() => {
    if (scannedProduct?.type !== "box" && scannedProduct?.type !== "crate") {
      let variant = scannedProduct?.variants?.[0];
      scannedProduct.variants = [variant];
      const currentSellingPrice =
        scannedProduct?.variants[0]?.prices?.find(
          (t: any) =>
            t.locationRef.toString() ===
            deviceContext?.user?.locationRef.toString()
        )?.price || 0;
      setCostPrice(scannedProduct.variants[0].costPrice || 0);
      setSellingPrice(
        currentSellingPrice || scannedProduct.variants[0].price || 0
      );
    } else {
      scannedProduct.variants = [scannedProduct.box];
      setCostPrice(scannedProduct.variants[0].costPrice || 0);
      const currentSellingPrice =
        scannedProduct?.variants[0]?.prices?.find(
          (t: any) =>
            t.locationRef.toString() ===
            deviceContext?.user?.locationRef.toString()
        )?.price || 0;
      setCostPrice(scannedProduct.variants[0].costPrice || 0);
      setSellingPrice(
        currentSellingPrice || scannedProduct.variants[0].price || 0
      );
    }
  }, [scannedProduct]);

  return (
    <View style={styles.sheetContainer}>
      <View style={{ paddingHorizontal: 20 }}>
        <View style={styles.sheetHeader}>
          <View style={{ flex: 1 }}></View>
          <DefaultText style={{ flex: 2 }} fontSize="2xl" fontWeight="medium">
            {t("Change Price")}
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
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t("Cost Price")}</Text>
          <TextInput
            style={styles.input}
            value={costPrice?.toString()}
            onChangeText={(text) => {
              const filteredValue = text.replace(/[^0-9.]/g, "");
              if (filteredValue.split(".").length > 2) {
                return;
              }

              const decimalRegex = /^\d+(\.\d{0,2})?$/;

              if (decimalRegex.test(text) || text === "") {
                setCostPrice(text.replace(/[^0-9.]/g, ""));
              }
            }}
            keyboardType="numeric"
            placeholder={t("Enter cost price")}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t("Selling Price")}</Text>
          <TextInput
            style={styles.input}
            value={sellingPrice?.toString()}
            onChangeText={(text) => {
              const filteredValue = text.replace(/[^0-9.]/g, "");
              if (filteredValue.split(".").length > 2) {
                return;
              }

              const decimalRegex = /^\d+(\.\d{0,2})?$/;

              if (decimalRegex.test(text) || text === "") {
                setSellingPrice(text.replace(/[^0-9.]/g, ""));
              }
            }}
            keyboardType="numeric"
            placeholder={t("Enter selling price")}
          />
        </View>
        {error && (
          <Text style={{ color: "red" }}>
            {t("Selling and cost price for Box or Crate cannot be 0")}.
          </Text>
        )}
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
            backgroundColor: theme.colors.primary[1000],
            padding: 15,
            borderRadius: 12,
            alignItems: "center",
            flex: 1,
          }}
          onPress={async () => {
            try {
              setLoading(true);
              if (
                scannedProduct?.type !== "box" &&
                scannedProduct?.type !== "crate"
              ) {
                const payload = {
                  productRef: scannedProduct._id,
                  locationRef: deviceContext?.user?.locationRef,
                  sku: scannedProduct.sku,
                  costPrice: costPrice,
                  price: sellingPrice,
                };

                await serviceCaller("/product/pos/update-price", {
                  method: "PATCH",
                  body: payload,
                });

                setLoading(false);

                onUpdate(true);
              } else {
                if (sellingPrice <= 0 || costPrice <= 0) {
                  setLoading(false);
                  setError(true);
                  setTimeout(() => {
                    setError(false);
                  }, 3000);
                  return;
                }
                const prices = scannedProduct?.box?.prices;
                const currentIdx = prices.findIndex(
                  (t: any) =>
                    t.locationRef?.toString() ===
                    deviceContext?.user?.locationRef?.toString()
                );
                if (currentIdx !== -1) {
                  prices[currentIdx].price = sellingPrice;
                  const payload = {
                    name: scannedProduct?.box?.name,
                    companyRef: scannedProduct?.box?.companyRef,
                    company: {
                      name: scannedProduct?.box?.company.name,
                    },
                    locationRef:
                      scannedProduct?.box?.stockConfiguration[0].locationRef,
                    location: {
                      name: scannedProduct?.box?.stockConfiguration[0].location
                        .name,
                    },
                    categoryRef: scannedProduct?.box?.product.categoryRef,
                    category: {
                      name: scannedProduct?.box?.product.category.name,
                    },
                    type: scannedProduct?.box?.type,
                    code: scannedProduct?.box?.code,
                    costPrice: costPrice,
                    price: sellingPrice,
                    qty: scannedProduct?.box?.qty,
                    description: scannedProduct?.box?.description || "",
                    locations: scannedProduct?.box?.locations,
                    locationRefs: scannedProduct?.box?.locationRefs,
                    stockConfiguration: scannedProduct?.box?.stockConfiguration,
                    prices: prices,
                    product: scannedProduct?.box?.product,
                    boxSku: scannedProduct?.box?.boxSku,
                    crateSku: scannedProduct?.box?.crateSku,
                    productSku: scannedProduct?.box?.productSku,
                    nonSaleable: scannedProduct?.box?.nonSaleable,
                    status: scannedProduct?.box?.status,
                  };
                  console.log("PLOAD", payload);
                  await serviceCaller(
                    "/boxes-crates/" + scannedProduct?.box?._id,
                    {
                      method: "PATCH",
                      body: payload,
                    }
                  );

                  setLoading(false);

                  onUpdate(true);
                }
              }
            } catch (error) {
              console.log(t("error while updating price"), error);
              setLoading(false);
            }
          }}
        >
          <Text style={styles.updateButtonText}>
            {loading ? (
              <ActivityIndicator color={theme.colors.dark[1000]} />
            ) : (
              t("Update Price")
            )}
          </Text>
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
    paddingHorizontal: 20,
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
    fontSize: 26,
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

export default UpdatePriceSheet;
