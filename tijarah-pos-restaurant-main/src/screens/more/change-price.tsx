import React, { useContext, useRef, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Button } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { CameraView, useCameraPermissions } from "expo-camera";
import CustomHeader from "../../components/common/custom-header";
import ICONS from "../../utils/icons";
import SuccessSheet from "../../components/more/success-sheet";
import serviceCaller from "../../api";
import showToast from "../../components/toast";
import { AuthType } from "../../types/auth-types";
import AuthContext from "../../context/auth-context";
import SearchSheet from "../../components/more/search-product-sheet";
import UpdatePriceSheet from "../../components/more/update-price";
import ScannerMask from "./components/scanner-mask";
import { useNavigation } from "@react-navigation/core";

const CAMERA_HEIGHT = 200;

interface ProductData {
  name: string;
  code: string;
}

const ChangePrice = () => {
  const [scannedProduct, setScannedProduct] = useState<ProductData | null>(
    null
  );
  const authContext = useContext<AuthType>(AuthContext) as any;
  const searchSheetRef = React.useRef<RBSheet>(null);
  const updateSheetRef = React.useRef<RBSheet>(null);
  const successSheetRef = React.useRef<RBSheet>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const scannedRef = useRef() as any;
  const navigation = useNavigation();

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{}}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: any) => {
    console.log(data);
    if (!scannedRef.current) {
      scannedRef.current = true;
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
          (t: any) => t?.sku === data || t?.parentSku === data
        );

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
        updateSheetRef.current?.open();
      } catch (error) {
        showToast("error", "Product not found");
        console.log(JSON.stringify(error));
        scannedRef.current = false;
      }
    }
  };

  const handlePriceUpdate = (isSuccess = false) => {
    console.log("updated");
    if (scannedRef.current) {
      scannedRef.current = false;
      updateSheetRef?.current?.close();
      if (isSuccess) {
        successSheetRef?.current?.open();
      }
    }
  };

  console.log(scannedRef.current);

  const handleUpdateMore = () => {
    successSheetRef?.current?.close();
  };

  const handleDone = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.mainContainer}>
      <CustomHeader />

      <View style={styles.container}>
        <Text style={styles.title}>Scan the product barcode</Text>

        <ScannerMask>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={handleBarCodeScanned}
          />
        </ScannerMask>

        <Text style={styles.orText}>OR</Text>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => searchSheetRef.current?.open()}
        >
          <ICONS.SearchIcon color="#9E9E9E" />
          <Text style={styles.searchButtonText}>Search product</Text>
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
            updateSheetRef={updateSheetRef}
            searchSheetRef={searchSheetRef}
            setScannedProduct={(prod: any) => {
              scannedRef.current = true;
              setScannedProduct(prod);
            }}
          />
        </RBSheet>

        <RBSheet
          ref={updateSheetRef}
          onClose={handlePriceUpdate}
          height={600}
          openDuration={250}
          closeOnDragDown={true}
          closeOnPressMask={true}
          animationType="fade"
          dragFromTopOnly
          customStyles={{
            container: styles.sheetContainerStyle,
            draggableIcon: styles.draggableIcon,
          }}
        >
          <UpdatePriceSheet
            onUpdate={handlePriceUpdate}
            updateSheetRef={updateSheetRef}
            scannedProduct={scannedProduct}
          />
        </RBSheet>

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
            type="price"
          />
        </RBSheet>
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
});

export default ChangePrice;
