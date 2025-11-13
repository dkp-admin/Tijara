import React from "react";
import { Image, View } from "react-native";
import { useTheme } from "../../../../context/theme-context";
import { checkInternet } from "../../../../hooks/check-internet";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import { PRODUCT_PLACEHOLDER } from "../../../../utils/constants";

const ImageView = ({
  data,
  borderRadius = 16,
}: {
  data: any;
  borderRadius?: number;
}) => {
  const { hp } = useResponsive();

  const theme = useTheme();

  const isConnected = checkInternet();

  return (
    <View
      style={{
        width: hp("7%"),
        height: hp("7%"),
        borderRadius: borderRadius,
        borderWidth: 1.5,
        borderColor: "#E5E9EC",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.white[1000],
      }}
    >
      <Image
        resizeMode="stretch"
        style={{
          width: hp("7%"),
          height: hp("7%"),
          borderRadius: borderRadius,
        }}
        source={
          isConnected && (data?.localImage || data?.image)
            ? {
                uri: data?.localImage || data?.image,
              }
            : PRODUCT_PLACEHOLDER
        }
      />
    </View>
  );
};

export default ImageView;
