import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";

const WINDOW_HEIGHT = Dimensions.get("window").height;
const WINDOW_WIDTH = Dimensions.get("window").width;
const SCANNER_AREA_HEIGHT = 150;
const SCANNER_AREA_WIDTH = 300;
const CORNER_WIDTH = 30; // Increased from 20
const CORNER_HEIGHT = 30; // Increased from 20
const CORNER_BORDER_WIDTH = 3;
const CORNER_BORDER_COLOR = "#FFF";
const CORNER_RADIUS = 10; // Added corner radius
const SCANNER_AREA_RADIUS = 15; // Added scanner area radius

const ScannerMask = ({ children, onMaskLayout }: any) => {
  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <View
          style={styles.scannerArea}
          onLayout={(event) => {
            const layout = event.nativeEvent.layout;
            onMaskLayout && onMaskLayout(layout);
          }}
        >
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: SCANNER_AREA_HEIGHT,
    width: SCANNER_AREA_WIDTH,
    overflow: "hidden",
    borderRadius: SCANNER_AREA_RADIUS,
  },
  overlay: {
    position: "absolute",
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 1,
    borderRadius: SCANNER_AREA_RADIUS,
  },
  scannerArea: {
    height: SCANNER_AREA_HEIGHT,
    width: SCANNER_AREA_WIDTH,
    backgroundColor: "transparent",
    borderRadius: SCANNER_AREA_RADIUS,
  },
  corner: {
    position: "absolute",
    width: CORNER_WIDTH,
    height: CORNER_HEIGHT,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderLeftWidth: CORNER_BORDER_WIDTH,
    borderTopWidth: CORNER_BORDER_WIDTH,
    borderColor: CORNER_BORDER_COLOR,
    borderTopLeftRadius: CORNER_RADIUS,
  },
  topRight: {
    top: 0,
    right: 0,
    borderRightWidth: CORNER_BORDER_WIDTH,
    borderTopWidth: CORNER_BORDER_WIDTH,
    borderColor: CORNER_BORDER_COLOR,
    borderTopRightRadius: CORNER_RADIUS,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderLeftWidth: CORNER_BORDER_WIDTH,
    borderBottomWidth: CORNER_BORDER_WIDTH,
    borderColor: CORNER_BORDER_COLOR,
    borderBottomLeftRadius: CORNER_RADIUS,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderRightWidth: CORNER_BORDER_WIDTH,
    borderBottomWidth: CORNER_BORDER_WIDTH,
    borderColor: CORNER_BORDER_COLOR,
    borderBottomRightRadius: CORNER_RADIUS,
  },
});

export default ScannerMask;
