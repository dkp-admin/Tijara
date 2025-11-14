import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { checkInternet } from "../../../hooks/check-internet";
import { useResponsive } from "../../../hooks/use-responsiveness";
import {
  DINEIN_PRODUCT_PLACEHOLDER,
  PRODUCT_PLACEHOLDER,
} from "../../../utils/constants";
import DefaultText from "../../text/Text";

const MenuImageView = ({
  data,
  textColor,
  availabilityText,
}: {
  data: any;
  textColor: string;
  availabilityText: string;
}) => {
  const theme = useTheme();
  const { hp } = useResponsive();
  const isConnected = checkInternet();

  return (
    <View
      style={{
        ...styles.container,
        height: hp("15%"),
        backgroundColor: theme.colors.white[1000],
      }}
    >
      <Image
        resizeMode="cover"
        style={{
          ...styles.image,
          height: hp("15%"),
        }}
        source={
          isConnected && (data?.localImage || data?.image)
            ? {
                uri: data?.localImage || data?.image,
              }
            : DINEIN_PRODUCT_PLACEHOLDER
        }
      />

      {availabilityText === t("Out of Stock") && (
        <View style={styles.greyOutOverlay} />
      )}

      {availabilityText !== "" && (
        <View
          style={{
            ...styles.availableView,
            backgroundColor: theme.colors.bgColor2,
          }}
        >
          <DefaultText
            style={{ textAlign: "center" }}
            fontSize="md"
            color={textColor}
          >
            {availabilityText}
          </DefaultText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  greyOutOverlay: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: "#22212566",
  },
  availableView: {
    bottom: 0,
    position: "absolute",
    paddingBottom: 1.5,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
});

export default MenuImageView;
