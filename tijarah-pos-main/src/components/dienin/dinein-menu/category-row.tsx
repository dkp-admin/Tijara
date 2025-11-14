import React, { useCallback } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../context/theme-context";
import { checkDirection } from "../../../hooks/check-direction";
import { useResponsive } from "../../../hooks/use-responsiveness";
import useMenuStore from "../../../store/menu-filter-store";
import { PRODUCT_PLACEHOLDER } from "../../../utils/constants";
import DefaultText from "../../text/Text";

export default function DineinCategoryRow({ data }: { data: any }) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { hp } = useResponsive();
  const { categoryId, setCategoryId } = useMenuStore();

  const handleOnPress = useCallback(() => {
    setCategoryId(data._id);
  }, []);

  const getBgColor = () => {
    if (data?._id === categoryId) {
      return theme.colors.primary[1000];
    } else {
      return theme.colors.white[1000];
    }
  };

  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: hp("2.25%"),
      }}
      onPress={handleOnPress}
    >
      <View
        style={{
          width: "95%",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: hp("1.5%"),
        }}
      >
        <View
          style={{
            width: hp("7%"),
            height: hp("7%"),
            borderRadius: 6,
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
              borderRadius: 6,
            }}
            source={
              data?.image
                ? {
                    uri: data?.image,
                  }
                : PRODUCT_PLACEHOLDER
            }
          />
        </View>

        <DefaultText
          style={{ marginTop: 3, textAlign: "center", lineHeight: 18 }}
          fontSize="md"
          noOfLines={2}
        >
          {isRTL ? data.name.ar : data.name.en}
        </DefaultText>
      </View>

      <View
        style={{
          width: "5%",
          height: "100%",
          borderTopLeftRadius: 8,
          borderBottomLeftRadius: 8,
          backgroundColor: getBgColor(),
        }}
      />
    </TouchableOpacity>
  );
}
