import { View, Text, Image, StyleSheet } from "react-native";
import { useResponsive } from "../hooks/use-responsiveness";

const styles = StyleSheet.create({
  bagLabel: {
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#fff",
    padding: 10,
    alignItems: "center",
    fontSize: 16,
    width: "100%",
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    fontWeight: "bold",
    width: "100%",
  },
  barcodeSection: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  leftNumber: {
    writingDirection: "rtl",
    transform: [{ rotate: "-90deg" }],
  },
  sku: {
    textAlign: "center",
    letterSpacing: 4,
    position: "relative",
    fontSize: 20,
  },
  barcode: {},

  rightNumber: {
    writingDirection: "rtl",
    transform: [{ rotate: "90deg" }],
  },
  details: {
    flexDirection: "row",
    marginTop: 10,
    fontWeight: "bold",
    justifyContent: "space-between",
    width: "100%",
  },
  detailItem: {
    marginBottom: 5,
  },
  title: {
    fontWeight: "normal",
  },
  value: {
    fontWeight: "bold",
  },
});

const SquareBarcodeTemplate = ({ data }: any) => {
  const { wp, twoPaneView } = useResponsive();
  return (
    <View style={styles.bagLabel}>
      {data?.companyName && (
        <View style={styles.topSection}>
          <Text style={{ fontWeight: "bold" }}>Company Name</Text>
          <Text style={{ fontWeight: "bold" }}>CONVERSION BAG 1212</Text>
        </View>
      )}
      {data?.barcode && (
        <View style={styles.barcodeSection}>
          <Text style={styles.leftNumber}>2274</Text>
          <View style={styles.barcode}>
            <Image
              source={{
                uri: "https://support.idautomation.com/datastore/photos/photo_590f6ea43d978.png",
              }}
              alt="Barcode Image"
              style={{
                width: twoPaneView ? wp("20%") : wp("60%"),
                height: 150,
              }}
            />
          </View>
          <Text style={styles.leftNumber}>1118454</Text>
        </View>
      )}
      {data?.barcode && <Text style={styles.sku}>4645645664664</Text>}
      <View style={styles.details}>
        {data?.productName && (
          <View style={styles.detailItem}>
            <Text style={styles.title}>Product Name</Text>
          </View>
        )}
        {data?.price && (
          <View style={styles.detailItem}>
            <Text style={styles.title}>M.R.P. SAR:</Text>
            <Text style={styles.value}>798</Text>
          </View>
        )}
        {data?.expiryDate && (
          <View style={styles.detailItem}>
            <Text style={styles.title}>Expiry Date</Text>
            <Text style={styles.value}>16 April 24</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default SquareBarcodeTemplate;
