import { StyleSheet, Text, TouchableOpacity } from "react-native";

import { View } from "react-native";
import SuccessIcon from "./success-icon";
import { useTheme } from "../../context/theme-context";
import { t } from "../../../i18n";
import { useContext } from "react";
import DeviceContext from "../../context/device-context";

const UpdateStockSheet = ({
  handleDone,
  handleUpdateMore,
  type = "stock",
}: any) => {
  const theme = useTheme();
  const deviceContext = useContext(DeviceContext) as any;

  return (
    <View style={{ flex: 1 }}>
      <SuccessIcon />
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        {type === "price" ? (
          <Text style={styles.successTitle}>{t("Price Updated")}!</Text>
        ) : (
          <Text style={styles.successTitle}>{t("Stocks Updated")}!</Text>
        )}
        {type === "price" ? (
          <Text style={styles.successText}>
            {t("Price has been updated in")}{" "}
            <Text style={styles.locationText}>
              {deviceContext?.user?.location.name}
            </Text>
            .
          </Text>
        ) : (
          <Text style={styles.successText}>
            {t("Stocks has been updated in")}{" "}
            <Text style={styles.locationText}>
              {deviceContext?.user?.location.name}
            </Text>
            .
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
          display: "flex",
          flexDirection: "row",
          gap: 12,
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
          onPress={handleDone}
        >
          <Text style={styles.updateButtonText}>{t("Done")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: theme.colors.primary[100],
            padding: 15,
            borderRadius: 12,
            alignItems: "center",
            flex: 1,
          }}
          onPress={handleUpdateMore}
        >
          <Text
            style={{
              ...styles.updateButtonText,
              color: theme.colors.primary[1000],
            }}
          >
            {t("Update More")}
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
    fontSize: 20,
    fontWeight: "300",
    color: "#000000",
    marginBottom: 8,
    marginTop: 30,
  },
  successText: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 30,
    fontWeight: "100",
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
