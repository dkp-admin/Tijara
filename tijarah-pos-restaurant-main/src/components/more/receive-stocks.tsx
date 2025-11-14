import { useNavigation } from "@react-navigation/core";
import { format } from "date-fns";
import { CameraView, useCameraPermissions } from "expo-camera";
import { FormikProps, useFormik } from "formik";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import CustomHeader from "../../components/common/custom-header";
import AuthContext from "../../context/auth-context";
import DeviceContext from "../../context/device-context";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/check-direction";
import { useResponsive } from "../../hooks/use-responsiveness";
import ScannerMask from "../../screens/more/components/scanner-mask";
import ICONS from "../../utils/icons";
import ItemDivider from "../action-sheet/row-divider";
import DateInput from "../input/date-input";
import CurrencyView from "../modal/currency-view-modal";
import DefaultText from "../text/Text";
import showToast from "../toast";
import VendorSelectInput from "../variant/stocks/stock-action/vendor-select-input";
import ReceiveProductSheet from "./receive-product-sheet";
import SearchSheet from "./search-product-sheet";
import SuccessSheet from "./success-sheet";
import { useCurrency } from "../../store/get-currency";

const CAMERA_HEIGHT = 200;

const ReceiveStocks = () => {
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const isRTL = checkDirection();
  const { hp, twoPaneView } = useResponsive();
  const searchSheetRef = React.useRef<RBSheet>(null);
  const receiveProductSheetRef = React.useRef<RBSheet>(null);
  const scannedRef = useRef() as any;
  const productListSheetRef = useRef<RBSheet>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const { currency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const authContext = useContext(AuthContext);
  const deviceContext = useContext(DeviceContext) as any;
  const [scannedProduct, setScannedProduct] = useState(null);
  const vendorSheetRef = useRef<RBSheet>(null) as any;
  const successSheetRef = useRef<RBSheet>(null);
  const navigation = useNavigation();
  const [index, setIndex] = useState(-1);
  const [error, setError] = useState(false);

  const formik: FormikProps<any> = useFormik<any>({
    initialValues: {
      vendor: "",
      vendorRef: "",
      invoiceNumber: "",
      deliveryDate: new Date(),
      products: [],
      subTotal: 0,
      vat: 0,
      total: 0,
    },
    onSubmit: async (values) => {},
  });

  const ProductListSheet = () => (
    <RBSheet
      ref={productListSheetRef}
      height={600}
      openDuration={250}
      closeOnDragDown={true}
      closeOnPressMask={true}
      customStyles={{
        container: styles.sheetContainerStyle,
        draggableIcon: styles.draggableIcon,
      }}
    >
      <View style={styles.productListContainer}>
        <View style={styles.productListHeader}>
          <DefaultText
            style={{
              ...styles.productListTitle,
              flex: 1,
              textAlign: "center",
              fontWeight: "semibold",
            }}
          >
            {t("Receiving Products")}
          </DefaultText>
          <TouchableOpacity
            onPress={() => productListSheetRef.current?.close()}
          >
            <ICONS.CloseClearIcon />
          </TouchableOpacity>
        </View>
        <ItemDivider
          style={{
            margin: 0,
            borderWidth: 0,
            borderBottomWidth: 1,
          }}
        />

        <FlatList
          data={formik.values.products}
          keyExtractor={(item) => item.sku}
          ListEmptyComponent={() => (
            <DefaultText
              style={{
                fontSize: 16,
                fontWeight: "bold",
                textAlign: "center",
                marginTop: 50,
              }}
            >
              {t("No products")}
            </DefaultText>
          )}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => {
                setScannedProduct(item);
                setIndex(index);
              }}
              onLongPress={() => {
                Alert.alert(
                  t("Delete Product"),
                  t("Are you sure you want to delete this product?"),
                  [
                    {
                      text: t("Cancel"),
                      style: "cancel",
                    },
                    {
                      text: t("Delete"),
                      style: "destructive",
                      onPress: () => {
                        const updatedProducts = formik.values.products.filter(
                          (p: any, i: number) => i !== index
                        );
                        formik.setFieldValue("products", updatedProducts);
                        if (updatedProducts.length == 0) {
                          setCurrentStep(currentStep - 1);
                        }
                      },
                    },
                  ]
                );
              }}
              style={{
                flexDirection: "row",
                backgroundColor: "#eee",
                padding: 10,
                borderTopLeftRadius: index === 0 ? 10 : 0,
                borderTopRightRadius: index === 0 ? 10 : 0,
                borderBottomLeftRadius:
                  index === formik.values.products.length - 1 ? 10 : 0,
                borderBottomRightRadius:
                  index === formik.values.products.length - 1 ? 10 : 0,
              }}
            >
              <View style={{ flex: 1 }}>
                <DefaultText style={{ ...styles.productListName }}>
                  {item?.name?.en}{" "}
                  {item?.type !== "product" && (
                    <>
                      ({item?.type?.charAt(0).toUpperCase()}
                      {item?.type?.slice(1)} - {item?.box?.qty} Units)
                    </>
                  )}
                  {item.type}
                </DefaultText>
                <DefaultText style={styles.productListSku}>
                  {item?.sku}
                </DefaultText>
              </View>
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "row",
                }}
              >
                <DefaultText
                  style={{ ...styles.productListQuantity, marginRight: 5 }}
                >
                  {item.quantity}
                </DefaultText>
                <ICONS.RightContentIcon />
              </View>
            </TouchableOpacity>
          )}
          style={{ marginTop: 10 }}
        />

        <TouchableOpacity
          style={[
            styles.doneButton,
            { backgroundColor: theme.colors.primary[1000] },
          ]}
          onPress={() => productListSheetRef.current?.close()}
        >
          <DefaultText style={styles.doneButtonText}>{t("Done")}</DefaultText>
        </TouchableOpacity>
      </View>
    </RBSheet>
  );

  const renderStepIndicator = () => (
    <View style={styles.stepContainer}>
      <View
        style={[
          styles.step,
          {
            backgroundColor:
              currentStep >= 1 ? theme.colors.primary[1000] : "#E5E5EA",
          },
        ]}
      >
        <Text
          style={[
            styles.stepText,
            currentStep >= 1 ? {} : { color: "#8E8E93" },
          ]}
        >
          1
        </Text>
      </View>
      <View style={styles.stepDivider} />
      <View
        style={[
          styles.step,
          {
            backgroundColor:
              currentStep >= 2 ? theme.colors.primary[1000] : "#E5E5EA",
          },
        ]}
      >
        <Text
          style={[
            styles.stepText,
            currentStep >= 2 ? {} : { color: "#8E8E93" },
          ]}
        >
          2
        </Text>
      </View>
      <View style={styles.stepDivider} />
      <View
        style={[
          styles.step,
          {
            backgroundColor:
              currentStep >= 3 ? theme.colors.primary[1000] : "#E5E5EA",
          },
        ]}
      >
        <Text
          style={[
            styles.stepText,
            currentStep >= 3 ? {} : { color: "#8E8E93" },
          ]}
        >
          3
        </Text>
      </View>
    </View>
  );

  const renderStep1 = () => (
    <>
      <View style={styles.formGroup}>
        <DefaultText style={styles.label}>{t("Select the Vendor")}</DefaultText>
        <TouchableOpacity
          style={{
            ...styles.drop_down_view,
            height: hp("7.5%"),
            borderRadius: 16,
            opacity: 1,
            backgroundColor: theme.colors.white[1000],
          }}
          onPress={() => {
            vendorSheetRef.current.open();
          }}
        >
          <DefaultText
            fontWeight="normal"
            color={
              formik.values.vendor
                ? theme.colors.otherGrey[100]
                : theme.colors.placeholder
            }
          >
            {formik.values.vendor ? formik.values.vendor : t("Select Vendor")}
          </DefaultText>

          <View
            style={{
              transform: [{ rotate: isRTL ? "180deg" : "0deg" }],
            }}
          >
            <ICONS.RightContentIcon />
          </View>
        </TouchableOpacity>
        <VendorSelectInput
          sheetRef={vendorSheetRef}
          values={{
            key: formik.values.vendorRef,
            value: formik.values.vendor,
          }}
          handleSelected={(val: any) => {
            if (val?.key && val?.value) {
              formik.setFieldValue("vendorRef", val.key);
              formik.setFieldValue("vendor", val.value);
              vendorSheetRef.current.close();
            }
          }}
        />
      </View>

      <DefaultText style={styles.label}>{t("Invoice Details")}</DefaultText>
      <View style={{ backgroundColor: "#fff", borderRadius: 10 }}>
        <View
          style={{
            flexDirection: "row",
            padding: 10,
            borderBottomWidth: 1,
            borderBottomColor: "#eee",
            paddingHorizontal: 20,
          }}
        >
          <DefaultText style={{ flex: 1 }}>Invoice Number</DefaultText>
          <TextInput
            value={formik.values.invoiceNumber}
            onChangeText={(text) => formik.setFieldValue("invoiceNumber", text)}
            style={{
              textAlign: "right",
              paddingRight: 10,
              fontSize: 16,
              fontWeight: "100",
              fontFamily: theme.fonts.circulatStd,
            }}
            placeholder="#ABCDO123"
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <DefaultText style={{ flex: 1 }}>Delivery Date</DefaultText>
          <DateInput
            placeholderText={t("Select date")}
            mode="datetime"
            rightIcon={false}
            style={{ width: 175, fontSize: 16 }}
            dateFormat="MMM d, yyyy, hh:mm a"
            values={formik.values.deliveryDate}
            handleChange={(val: any) => {
              formik.setFieldValue("deliveryDate", val);
            }}
          />
        </View>
      </View>
    </>
  );

  const [maskBounds, setMaskBounds] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const lastScanTime = useRef(0);
  const SCAN_COOLDOWN = 2000; // 2 seconds cooldown between scans

  const isPointInMask = (point: { x: number; y: number }) => {
    return (
      point.x >= maskBounds.x &&
      point.x <= maskBounds.x + maskBounds.width &&
      point.y >= maskBounds.y &&
      point.y <= maskBounds.y + maskBounds.height
    );
  };

  // scannedRef.current = false;

  const handleBarCodeScanned = async ({ type, data, bounds }: any) => {
    if (scannedProduct) return;
    const currentTime = Date.now();
    const timeSinceLastScan = currentTime - lastScanTime.current;

    // Check if we're still in cooldown period
    if (timeSinceLastScan < SCAN_COOLDOWN) {
      return;
    }

    // Check if scan is inside mask
    if (bounds && isPointInMask({ x: bounds.origin.x, y: bounds.origin.y })) {
      return;
    }
    if (!scannedRef.current) {
      scannedRef.current = true;
      lastScanTime.current = currentTime;
      try {
        const product = await serviceCaller("/product/scan-product", {
          method: "GET",
          query: {
            page: 0,
            sort: "asc",
            activeTab: "all",
            limit: 1,
            _q: data,
            companyRef: authContext?.user?.companyRef,
            locationRef: authContext?.user?.locationRef,
            showCustomPrice: false,
          },
        });

        const variant = product?.variants?.find(
          (t: any) =>
            t.sku === data ||
            t.parentSku === data ||
            t.sku === product?.box?.productSku
        );
        console.log(product.type);

        const variantExists =
          product.type === "item" || product.type === "product"
            ? formik.values.products
                .filter((t: any) => t.type === "product")
                .findIndex((t: any) => {
                  return (
                    t.variants?.[0].sku.toString() === variant.sku.toString()
                  );
                })
            : -1;

        const boxExists =
          product.type == "box"
            ? formik.values.products
                .filter((t: any) => t.type == "box")
                .findIndex(
                  (t: any) => t?.box && t?.box?.boxSku === product?.box?.boxSku
                )
            : -1;

        const crateExists =
          product.type == "crate"
            ? formik.values.products
                .filter((t: any) => t.type == "crate")
                .findIndex(
                  (t: any) =>
                    t?.box && t?.box?.crateSku === product?.box?.crateSku
                )
            : -1;

        if (variantExists !== -1 || boxExists !== -1 || crateExists !== -1) {
          setError(true);
          scannedRef.current = false;
          setTimeout(() => {
            setError(false);
          }, 2000);
          return;
        }
        product.variants = [variant];

        if (product?.multiVariants) {
          product.name = {
            en: `${product?.name?.en} - ${product?.variants?.[0]?.name?.en}`,
            ar: `${product?.name?.ar} - ${product?.variants?.[0]?.name?.ar}`,
          };
        }

        setScannedProduct({
          ...product,
          sku: data,
        });

        scannedRef.current = false;
      } catch (error) {
        showToast("error", "Product not found");
        console.log(JSON.stringify(error));
        scannedRef.current = false;
      }
    }
  };

  const getItemVAT = () => {
    const allVats = formik.values.products.map((prod: any) => {
      return prod.tax.percentage;
    });

    return (
      allVats.reduce((pv: any, cv: any) => pv + Number(cv || 0), 0) /
        allVats.length || 0
    );
  };

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <View
        style={{
          flex: 1,

          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 18,
            marginBottom: 20,
          }}
        >
          {t("Scan the product barcode")}
        </Text>

        <ScannerMask onMaskLayout={(layout: any) => setMaskBounds(layout)}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={handleBarCodeScanned}
          />
        </ScannerMask>
        <Text style={{ color: "red", marginTop: 10 }}>
          {error ? t("Product already added") : ""}
        </Text>

        <Text style={styles.orText}>OR</Text>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => searchSheetRef.current?.open()}
        >
          <ICONS.SearchIcon color="#9E9E9E" />
          <Text style={styles.searchButtonText}>{t("Search product")}</Text>
        </TouchableOpacity>

        <RBSheet
          ref={searchSheetRef}
          height={400}
          openDuration={250}
          closeOnDragDown={true}
          closeOnPressMask={true}
          customStyles={{
            container: styles.sheetContainerStyle,
            draggableIcon: styles.draggableIcon,
          }}
        >
          <SearchSheet
            searchSheetRef={searchSheetRef}
            prodIds={formik.values.products.map((p: any) =>
              (p?._id || p?.productRef)?.toString()
            )}
            boxIds={formik.values.products.map((p: any) =>
              p?.boxId?.toString()
            )}
            skus={formik.values.products.map((p: any) => p?.variants?.[0].sku)}
            setScannedProduct={(prod: any) => {
              setScannedProduct(prod);
              scannedRef.current = true;
            }}
          />
        </RBSheet>

        <RBSheet
          ref={receiveProductSheetRef}
          height={640}
          openDuration={250}
          closeOnDragDown={true}
          closeOnPressMask={true}
          keyboardAvoidingViewEnabled={true}
          onClose={() => {
            scannedRef.current = false;
            setScannedProduct(null);
          }}
          customStyles={{
            container: styles.sheetContainerStyle,
            draggableIcon: styles.draggableIcon,
          }}
        >
          <ReceiveProductSheet
            scannedProduct={scannedProduct}
            onReceive={(prod: any) => {
              formik.setFieldValue("products", [
                ...formik.values.products,
                prod,
              ]);
              receiveProductSheetRef.current?.close();
            }}
            sheetRef={receiveProductSheetRef}
            setScannedProduct={setScannedProduct}
          />
        </RBSheet>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <ScrollView>
      <View style={styles.reviewContainer}>
        <DefaultText style={styles.sectionTitle}>
          {t("Invoice Details")}
        </DefaultText>
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <DefaultText style={styles.detailLabel}>
              {t("Vendor Name")}
            </DefaultText>
            <DefaultText style={styles.detailValue}>
              {formik.values.vendor}
            </DefaultText>
          </View>
          <View style={styles.detailRow}>
            <DefaultText style={styles.detailLabel}>
              {t("Vendor Invoice No")}.
            </DefaultText>
            <DefaultText style={styles.detailValue}>
              {formik.values.invoiceNumber}
            </DefaultText>
          </View>
          <View style={styles.detailRow}>
            <DefaultText style={styles.detailLabel}>
              {t("Delivery Date")}
            </DefaultText>
            <DefaultText style={styles.detailValue}>
              {format(formik.values.deliveryDate, "dd/MM/yyyy")}
            </DefaultText>
          </View>
        </View>

        <View style={styles.productSummaryCard}>
          <TouchableOpacity
            style={styles.productHeader}
            onPress={() => productListSheetRef.current?.open()}
          >
            <View>
              <DefaultText style={styles.productCount}>
                {formik.values.products?.length} {t("Products")}
              </DefaultText>
              <DefaultText style={styles.quantityText}>
                {formik.values.products.reduce((total: any, prod: any) => {
                  return total + prod.quantity;
                }, 0)}{" "}
                {t("Qty")}.
              </DefaultText>
            </View>
            <DefaultText style={styles.viewButton}>{t("VIEW")}</DefaultText>
          </TouchableOpacity>

          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <DefaultText>{t("Sub Total")}</DefaultText>
              <DefaultText>
                {formik.values.products
                  .reduce((total: any, prod: any) => {
                    return total + prod.subTotal;
                  }, 0)
                  .toFixed(2)}
              </DefaultText>
            </View>
            <View style={styles.summaryRow}>
              <DefaultText>{t("Discount")}</DefaultText>
              <DefaultText>{currency} -0.00</DefaultText>
            </View>
            <View style={styles.summaryRow}>
              <DefaultText>
                {t("VAT")} @{getItemVAT()}%
              </DefaultText>

              <DefaultText>
                {currency}{" "}
                {formik.values.products
                  .reduce((total: any, prod: any) => {
                    return total + prod.vatAmount;
                  }, 0)
                  ?.toFixed(2)}
              </DefaultText>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <DefaultText style={styles.totalLabel}>{t("Total")}</DefaultText>
              <DefaultText style={styles.totalAmount}>
                {currency}{" "}
                {formik.values.products
                  .reduce((total: any, prod: any) => {
                    console.log(prod.total);
                    return total + prod.total;
                  }, 0)
                  ?.toFixed(2)}
              </DefaultText>
            </View>
          </View>
        </View>
      </View>
      <RBSheet
        ref={receiveProductSheetRef}
        height={630}
        openDuration={250}
        closeOnDragDown={true}
        closeOnPressMask={true}
        onClose={() => {
          scannedRef.current = false;
          setScannedProduct(null);
        }}
        customStyles={{
          container: styles.sheetContainerStyle,
          draggableIcon: styles.draggableIcon,
        }}
      >
        <ReceiveProductSheet
          disabled={true}
          scannedProduct={scannedProduct}
          onReceive={(prod: any) => {
            formik.setFieldValue("products", [...formik.values.products, prod]);
            receiveProductSheetRef.current?.close();
          }}
          sheetRef={receiveProductSheetRef}
          onDeleteProduct={() => {
            const products = formik.values.products;
            products.splice(index, 1);
            formik.setFieldValue("products", [...products]);
            receiveProductSheetRef.current?.close();
          }}
          setScannedProduct={setScannedProduct}
        />
      </RBSheet>
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderProductListSheet = () => <ProductListSheet />;

  useEffect(() => {
    if (scannedProduct) {
      receiveProductSheetRef.current?.open();
    }
  }, [scannedProduct]);

  console.log(deviceContext?.user?.company.name.en);

  const handleSubmit = async () => {
    const prms = formik.values.products.map(async (p: any) => {
      let boxCount = 0;
      let crateCount = 0;
      let productCount = 0;

      if (p?.type === "box") {
        boxCount = p?.quantity;
        productCount = p?.box?.qty * p?.quantity;
      }

      if (p?.type === "crate") {
        crateCount = p?.quantity;
        boxCount = p?.quantity * p?.box?.qty;
        const boxes = await serviceCaller("/boxes-crates", {
          method: "GET",
          query: {
            page: 0,
            sort: "asc",
            activeTab: "active",
            limit: 10,
            _q: p?.box?.boxSku,
            companyRef: authContext?.user?.companyRef,
            isComposite: false,
          },
        });

        productCount = boxes?.results?.[0].qty * boxCount;
      }

      console.log(boxCount, crateCount, productCount);

      return {
        productRef: p._id,
        categoryRef: p?.categoryRef,
        category: p?.category,
        boxQuantity: 0,
        boxCount: boxCount,
        crateCount: crateCount,
        boxSku: p?.box?.boxSku,
        sku: p.sku,
        code: "",
        hasMultipleVariants: false,
        selling: p?.variants?.[0]?.price || 0,
        expiry: "",
        name: p.name,
        variant: p?.variants?.[0]?.name,
        batching: false,
        quantity: p.quantity,
        cost: p?.unitCost,
        available: productCount || p.quantity,
        count: productCount || p.quantity,
        tracking: p?.tracking,
        discount: 0,
        vatRef: p?.taxRef,
        type: p.type === "product" ? "item" : p?.type,
        unitCount: 1,
        vat: p?.tax?.percentage || p?.vatPercentage,
        vatAmount: p?.vatAmount,
        total: p?.total,
        remaining: 0,
        received: p.quantity,
        returnQty: 0,
        note: "-",
        status: "pending",
        boxCrateRef: p?.box?._id,
      };
    });
    const itms = await Promise.all(prms);
    setLoading(true);
    const payload = {
      orderNum: "",
      type: "grn",
      companyRef: deviceContext?.user?.companyRef,
      locationRef: deviceContext?.user?.locationRef,
      company: { name: deviceContext?.user?.company?.name?.en },
      orderDate: new Date(),
      expectedDate: formik.values.deliveryDate,
      billToRef: deviceContext?.user?.locationRef,
      shipToRef: deviceContext?.user?.locationRef,
      vendorRef: formik.values.vendorRef,
      vendorInvoiceNumber: formik.values.invoiceNumber,
      billTo: {
        name: {
          en: deviceContext?.user?.location?.name,
          ar: deviceContext?.user?.location?.name,
        },
      },
      shipTo: {
        name: {
          en: deviceContext?.user?.location?.name,
          ar: deviceContext?.user?.location?.name,
        },
      },
      forceCompleted: false,
      vendor: {
        name: formik.values.vendor,
      },
      status: "completed",
      action: "received-grn",
      items: itms,
      message: "",
      billing: {
        paymentStatus: "unpaid",
        fee: 0,
        freight: 0,
        total: formik.values.products
          .reduce((total: any, product: any) => total + product.total, 0)
          ?.toFixed(2),
        subTotal: formik.values.products
          .reduce((total: any, product: any) => total + product.subTotal, 0)
          ?.toFixed(2),
        vatAmount: formik.values.products
          .reduce((total: any, product: any) => total + product.vatAmount, 0)
          ?.toFixed(2),
        vatPercentage: (
          (formik.values.products.reduce(
            (total: any, product: any) => total + product.vatAmount,
            0
          ) /
            formik.values.products.reduce(
              (total: any, product: any) => total + product.subTotal,
              0
            )) *
            100 || formik.values.products?.[0].vatPercentage
        )?.toFixed(2),
        discountPercentage: 0,
        discountAmount: 0,
        discountType: "percentage",
      },
    };
    console.log("payload", JSON.stringify(payload));
    serviceCaller("/purchase-order", {
      method: "POST",
      body: payload,
    })
      .then((res) => {
        console.log(res);
        setLoading(false);
        successSheetRef.current?.open();
      })
      .catch((err) => {
        console.log(JSON.stringify(err));
        setLoading(false);
        showToast("error", t("Failed to receive stock."));
      });
  };

  const handleDone = () => {
    navigation.goBack();
  };

  const handleUpdateMore = () => {
    successSheetRef.current?.close();
    formik.resetForm();
    setCurrentStep(1);
  };

  if (!permission?.granted) {
    // Camera permissions are not granted yet.
    return (
      <View
        style={{
          flex: 1,
          paddingHorizontal: 20,
          alignItems: "center",
          marginTop: 150,
        }}
      >
        <Text style={{}}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader />

      <View style={styles.content}>
        <View style={styles.header}>
          <DefaultText style={styles.title}>{t("Receive Stocks")}</DefaultText>
          <DefaultText style={styles.subtitle}>
            {currentStep === 1
              ? t("Order Details")
              : currentStep === 2
              ? t("Products")
              : t("Review")}
          </DefaultText>
        </View>

        {renderStepIndicator()}

        <View style={styles.form}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {renderProductListSheet()}
          <RBSheet
            ref={successSheetRef}
            height={550}
            openDuration={250}
            closeOnDragDown={false}
            closeOnPressMask={false}
            customStyles={{
              container: styles.sheetContainerStyle,
            }}
          >
            <SuccessSheet
              handleDone={handleDone}
              handleUpdateMore={handleUpdateMore}
              type="stock"
            />
          </RBSheet>
        </View>

        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "110%",
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
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.backButton,
                {
                  backgroundColor: theme.colors.primary[100],
                  alignItems: "center",
                  justifyContent: "center",
                },
              ]}
              onPress={() => {
                if (currentStep === 1) {
                  navigation.goBack();
                } else {
                  setCurrentStep(currentStep - 1);
                }
              }}
            >
              <ICONS.ArrowLeftIcon
                color={
                  currentStep === 1
                    ? theme.colors.dark[100]
                    : theme.colors.primary[1000]
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.nextButton,
                { backgroundColor: theme.colors.primary[1000] },
              ]}
              onPress={async () => {
                if (currentStep === 1 && formik.values.vendorRef === "") {
                  showToast("error", t("Please select vendor to continue"));
                  return;
                }

                if (currentStep === 2 && formik.values.products.length === 0) {
                  showToast("error", t("Please select product to continue"));
                  return;
                }
                if (currentStep < 3) {
                  setCurrentStep(currentStep + 1);
                } else {
                  await handleSubmit();
                }
              }}
            >
              {loading ? (
                <>
                  <ActivityIndicator
                    size={"small"}
                    color={theme.colors.dark[400]}
                  />
                </>
              ) : (
                <>
                  {currentStep === 2 ? (
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View style={{ flexDirection: "column", flex: 1 }}>
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <DefaultText
                            style={{ fontWeight: "semibold", color: "#fff" }}
                          >
                            {formik.values.products.length}
                          </DefaultText>
                          <DefaultText
                            style={{ color: "#fff", fontWeight: "200" }}
                          >
                            {" "}
                            {t("Products")}
                          </DefaultText>
                        </View>
                        <CurrencyView
                          amount={formik.values.products
                            .reduce(
                              (total: any, product: any) =>
                                total + product.total,
                              0
                            )
                            .toFixed(2)}
                          amountColor="#fff"
                          symbolColor="#fff"
                          decimalColor="#fff"
                        />
                      </View>
                      <View>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <DefaultText style={styles.nextButtonText}>
                            {t("Next")}
                          </DefaultText>
                          <ICONS.ArrowRightIcon
                            scaleX={0.8}
                            scaleY={0.8}
                            style={{ marginTop: 10 }}
                          />
                        </View>
                      </View>
                    </View>
                  ) : (
                    <DefaultText style={styles.nextButtonText}>
                      {currentStep === 3 ? t("Submit") : t("Next")}
                    </DefaultText>
                  )}
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#8E8E93",
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  step: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  stepText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  stepDivider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E5EA",
    marginHorizontal: 8,
    borderBottomWidth: 1,
    borderStyle: "dashed",
  },
  form: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "semibold",
    marginBottom: 8,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  selectButtonText: {
    flex: 1,
    fontSize: 16,
    color: "#8E8E93",
  },
  input: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
  },
  backButton: {
    backgroundColor: "#E5E5EA",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  nextButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    marginRight: 10,
  },
  drop_down_view: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  stepContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#F2F2F7",
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
    width: "96%",
    padding: 15,
    borderRadius: 25,
    marginTop: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 3,
  },
  searchButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "thin",
    color: "#9E9E9E",
    minWidth: 250,
  },
  // Sheet Styles
  sheetContainerStyle: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#FFF",
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
    backgroundColor: "#F5F5F5",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  doneButtonText: {
    color: "#fff",
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
  },
  productNameText: {
    fontSize: 16,
    color: "#000000",
    marginBottom: 4,
  },
  productSkuText: {
    fontSize: 14,
    color: "#666666",
  },
  reviewContainer: {
    flex: 1,
    width: "100%",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  detailLabel: {
    color: "#000000",
    fontSize: 16,
  },
  detailValue: {
    color: "#8E8E93",
    fontSize: 16,
  },
  productSummaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 20,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  productCount: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  quantityText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  viewButton: {
    color: "#47B881",
    fontSize: 16,
    fontWeight: "500",
  },
  summarySection: {
    padding: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "600",
  },
  productListContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  productListHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  productListTitle: {
    fontSize: 24,
    fontWeight: "600",
  },
  productListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  productListName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  productListSku: {
    fontSize: 14,
    color: "#8E8E93",
  },
  productListRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  productListQuantity: {
    fontSize: 16,
    color: "#8E8E93",
  },
});

export default ReceiveStocks;
