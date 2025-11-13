import React, { useContext, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import DeviceContext from "../../context/device-context";
import { useTheme } from "../../context/theme-context";
import ICONS from "../../utils/icons";
import ItemDivider from "../action-sheet/row-divider";
import DefaultText from "../text/Text";
import showToast from "../toast";
import { useCurrency } from "../../store/get-currency";

const decimalRegex = /^\d+(\.\d{0,2})?$/;

const ReceiveProductSheet = ({
  scannedProduct,
  onReceive,
  sheetRef,
  disabled = false,
  onDeleteProduct,
  products,
}: any) => {
  const theme = useTheme();
  const [quantity, setQuantity] = useState("");
  const [unitCostPrice, setUnitCostPrice] = useState(null) as any;
  const [sellingPrice, setSellingPrice] = useState(null) as any;
  const [isSellingPriceChanged, setIsSellingPriceChanged] = useState(false);
  const deviceContext = useContext(DeviceContext) as any;
  const [unitVat, setUnitVat] = useState(null) as any;
  const [totalVat, setTotalVat] = useState(null) as any;
  const [totalAmount, setTotalAmount] = useState(null) as any;
  const { currency } = useCurrency();

  const [loading, setLoading] = useState(false);

  // const { subTotal, vatAmount, total, vatPercentage } = calculateTotals();

  useEffect(() => {
    if (scannedProduct.quantity) {
      setQuantity(scannedProduct.quantity);
    }
    if (scannedProduct) {
      let price =
        scannedProduct?.type === "product"
          ? scannedProduct?.variants?.[0]?.costPrice || 0
          : scannedProduct?.box?.costPrice || 0;

      if (scannedProduct?.unitCost) {
        price = scannedProduct?.total / scannedProduct?.quantity;
      }

      // Calculate price excluding VAT
      const taxPercentage = scannedProduct?.tax?.percentage || 0;
      const priceExcludingVAT = price / (1 + taxPercentage / 100);

      setUnitCostPrice(priceExcludingVAT.toFixed(2));
      if (scannedProduct?.type === "product") {
        setSellingPrice(
          Number(
            scannedProduct?.variants?.[0]?.prices.find(
              (t: any) =>
                t.locationRef.toString() ===
                deviceContext?.user?.locationRef.toString()
            ).price || 0
          ).toFixed(2)
        );
      } else {
        setSellingPrice(
          Number(
            scannedProduct?.box?.prices.find(
              (t: any) =>
                t.locationRef.toString() ===
                deviceContext?.user?.locationRef.toString()
            ).price || 0
          ).toFixed(2)
        );
      }
    }
  }, [scannedProduct]);

  useEffect(() => {
    const price =
      scannedProduct?.type === "product"
        ? scannedProduct?.variants?.[0]?.costPrice || 0
        : scannedProduct?.box?.costPrice || 0;

    // Calculate price excluding VAT
    const taxPercentage = scannedProduct?.tax?.percentage || 0;
    const priceExcludingVAT = unitCostPrice
      ? unitCostPrice
      : price / (1 + taxPercentage / 100);
    const taxAmt =
      (Number(priceExcludingVAT) * scannedProduct?.tax?.percentage) / 100;
    setUnitVat(taxAmt.toFixed(2));
    console.log("setting", taxAmt * Number(quantity || 1));
    setTotalVat((taxAmt * Number(quantity || 1)).toFixed(2));

    setTotalAmount(Number(price) * Number(quantity || 1));
  }, [unitCostPrice, quantity]);

  const handlePriceUpdate = async () => {
    try {
      setLoading(true);
      if (scannedProduct?.type !== "box" && scannedProduct?.type !== "crate") {
        const payload = {
          productRef: scannedProduct._id,
          locationRef: deviceContext?.user?.locationRef,
          sku: scannedProduct.sku,
          costPrice: unitCostPrice,
          price: sellingPrice,
        };

        await serviceCaller("/product/pos/update-price", {
          method: "PATCH",
          body: payload,
        });

        setLoading(false);
      } else {
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
            locationRef: scannedProduct?.box?.stockConfiguration[0].locationRef,
            location: {
              name: scannedProduct?.box?.stockConfiguration[0].location.name,
            },
            categoryRef: scannedProduct?.box?.product.categoryRef,
            category: {
              name: scannedProduct?.box?.product.category.name,
            },
            type: scannedProduct?.box?.type,
            code: scannedProduct?.box?.code,
            costPrice: unitCostPrice,
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

          await serviceCaller("/boxes-crates/" + scannedProduct?.box?._id, {
            method: "PATCH",
            body: payload,
          });

          setLoading(false);
        }
      }
    } catch (error) {
      console.log(t("error while updating price"), error);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={"padding"} style={styles.sheetContainer}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentContainer}>
          {/* Header remains the same */}
          <View style={styles.sheetHeader}>
            <View style={{ flex: 1 }} />
            <DefaultText style={{ flex: 2 }} fontSize="2xl" fontWeight="medium">
              {t("Receive product")}
            </DefaultText>
            <TouchableOpacity onPress={() => sheetRef?.current?.close()}>
              <ICONS.CloseClearIcon />
            </TouchableOpacity>
          </View>

          <ItemDivider style={styles.divider} />

          {/* Product info remains the same */}
          <View style={styles.productInfo}>
            <DefaultText style={styles.productName}>
              {scannedProduct?.name?.en}{" "}
              {scannedProduct?.type !== "product" && (
                <>
                  ({scannedProduct?.type?.charAt(0).toUpperCase()}
                  {scannedProduct?.type?.slice(1)} - {scannedProduct?.box?.qty}{" "}
                  Units)
                </>
              )}
            </DefaultText>
            <DefaultText style={styles.productCode}>
              {scannedProduct?.sku}
            </DefaultText>
          </View>

          <View style={styles.formGroup}>
            <DefaultText style={styles.label}>
              {t("Receiving Quantity")}
            </DefaultText>
            <TextInput
              editable={!disabled}
              style={styles.input}
              value={quantity > 0 ? quantity.toString() : quantity}
              defaultValue={quantity}
              onChangeText={(text: string) => {
                const numericValue = text.replace(/[^0-9]/g, "");
                setQuantity(numericValue);
              }}
              keyboardType="numeric"
              placeholder={t("Enter quantity")}
            />
          </View>
          <DefaultText style={styles.detailsTitle}>{t("Details")}</DefaultText>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <DefaultText style={styles.detailLabel}>
                {t("Unit Cost")}
              </DefaultText>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <DefaultText>{currency}</DefaultText>
                <TextInput
                  style={[styles.detailValue, { fontSize: 16 }]}
                  value={`${unitCostPrice}`}
                  editable={!disabled}
                  onChangeText={(val) => {
                    const filteredValue = val.replace(/[^0-9.]/g, "");

                    if (filteredValue.split(".").length > 2) {
                      return;
                    }

                    if (decimalRegex.test(val) || val === "") {
                      setUnitCostPrice(filteredValue);
                    }
                  }}
                  placeholder="0.00"
                />
              </View>
            </View>

            <View style={styles.detailRow}>
              <DefaultText style={styles.detailLabel}>
                {t("Total VAT")} ({scannedProduct?.tax?.percentage || 0}%)
              </DefaultText>
              <DefaultText style={styles.detailValue}>
                {currency} {totalVat}
              </DefaultText>
            </View>

            <View style={styles.detailRow}>
              <DefaultText style={styles.detailLabel}>
                {t("Total Amount")}
              </DefaultText>
              <DefaultText style={styles.detailValue}>
                {currency}{" "}
                {(
                  Number(unitCostPrice) * Number(quantity || 1) +
                  Number(totalVat)
                ).toFixed(2)}
              </DefaultText>
            </View>
          </View>
          <View style={{ ...styles.detailsContainer, marginTop: 8 }}>
            <View style={styles.detailRow}>
              <DefaultText style={styles.detailLabel}>
                {t("Sale Price")}
              </DefaultText>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <DefaultText>{currency} </DefaultText>
                <TextInput
                  style={[styles.detailValue, { fontSize: 16 }]}
                  value={`${sellingPrice}`}
                  editable={!disabled}
                  onChangeText={(value) => {
                    const filteredValue = value.replace(/[^0-9.]/g, "");
                    // Prevent multiple decimal points
                    if (filteredValue.split(".").length > 2) {
                      return;
                    }
                    if (decimalRegex.test(value) || value === "") {
                      setSellingPrice(filteredValue);
                      setIsSellingPriceChanged(true);
                    }
                  }}
                  placeholder="0.00"
                />
              </View>
            </View>
          </View>
          <View style={{ height: 70 }} />
        </View>
      </ScrollView>

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
        {disabled ? (
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.red.default,
              padding: 15,
              borderRadius: 12,
              alignItems: "center",
              flex: 1,
            }}
            onPress={() => {
              onDeleteProduct();
            }}
          >
            <DefaultText style={styles.receiveButtonText}>
              {t("Remove product")}
            </DefaultText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.primary[1000],
              padding: 15,
              borderRadius: 12,
              alignItems: "center",
              flex: 1,
            }}
            onPress={() => {
              if (quantity) {
                if (sellingPrice < 0) {
                  showToast("error", t("Please enter valid selling price."));
                  return;
                }
                if (isSellingPriceChanged) {
                  handlePriceUpdate();
                }
                const total =
                  Number(unitCostPrice) * Number(quantity || 1) +
                  Number(totalVat);

                onReceive({
                  ...scannedProduct,
                  quantity: Number(quantity),
                  unitCost: Number(unitCostPrice),
                  vatPercentage:
                    scannedProduct?.product?.tax?.percentage ||
                    scannedProduct?.tax?.percentage ||
                    0,
                  subTotal: Number(total) - Number(totalVat),
                  vatAmount: Number(totalVat),
                  total: total,
                });
              }
            }}
          >
            <DefaultText style={styles.receiveButtonText}>
              {t("Receive product")}
            </DefaultText>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  sheetHeader: {
    flexDirection: "row",
    paddingBottom: 10,
    alignItems: "center",
  },
  divider: {
    margin: 0,
    borderWidth: 0,
    borderBottomWidth: 1,
    borderTopWidth: 1,
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
  input: {
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 12,
    fontSize: 26,
    color: "#000000",
  },
  summaryContainer: {
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontWeight: "600",
  },
  totalAmount: {
    fontWeight: "600",
    color: "#000000",
  },
  receiveButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  receiveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  detailsContainer: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 15,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  detailLabel: {
    fontSize: 16,
    color: "#000000",
  },
  detailValue: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
});

export default ReceiveProductSheet;
