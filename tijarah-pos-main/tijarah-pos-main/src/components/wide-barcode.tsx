import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  priceTag: {
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "70%",
    alignSelf: "flex-end",
  },
  companyName: {
    fontSize: 14,
    marginBottom: 5,
  },
  priceView: {
    marginBottom: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 14,
  },
  productDescription: {
    fontSize: 14,
    marginBottom: 5,
  },
  barcode: {
    marginTop: 8,
    marginHorizontal: "10%",
    alignItems: "center",
  },
  barcodeText: {
    fontSize: 14,
    marginTop: 2,
    width: "87%",
  },
  website: {
    fontSize: 14,
    marginTop: 8,
  },
});

const WideBarcode = ({ data }: any) => {
  return (
    <View style={styles.priceTag}>
      {data?.locationName && (
        <Text style={styles.companyName}>Location Name </Text>
      )}
      <View style={styles.priceView}>
        {data?.price && <Text style={styles.price}>SAR 100.00</Text>}
        {(data?.paperSize === "50 mm,25 mm" ||
          data?.paperSize === "75 mm,25 mm") &&
          data?.expiry && (
            <Text style={{ fontSize: 14 }}>{"   |   Exp:12/04/28"}</Text>
          )}
      </View>
      {data?.productNameEn && (
        <Text style={styles.productDescription}>Product Name - English</Text>
      )}
      {data?.productNameAr && (
        <Text style={styles.productDescription}>Product Name - Arabic</Text>
      )}
      {data.barcode ? (
        <View style={styles.barcode}>
          <Image
            source={{
              uri: "https://support.idautomation.com/datastore/photos/photo_590f6ea43d978.png",
            }}
            style={{ width: 300, height: 60 }}
          />
          <Text style={styles.barcodeText}>4067510979468</Text>
        </View>
      ) : (
        <Text style={styles.productDescription}>4067510979468</Text>
      )}
      {data?.paperSize !== "50 mm,25 mm" &&
        data?.paperSize !== "75 mm,25 mm" &&
        data?.expiry && <Text style={styles.website}>Expiry: 12 Apr 2028</Text>}
    </View>
  );
};

export default WideBarcode;
