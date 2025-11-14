import React, { useCallback, useMemo } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useQuery } from "react-query";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/check-direction";
import { useResponsive } from "../../hooks/use-responsiveness";
import { PRODUCT_PLACEHOLDER } from "../../utils/constants";
import ICONS from "../../utils/icons";
import ItemDivider from "../action-sheet/row-divider";
import DefaultText from "../text/Text";
import ImageView from "../billing/left-view/catalogue/image-view";
import repository from "../../db/repository";

export default function CategoryRow({ data, selected, handleSelected }: any) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { wp, hp, twoPaneView } = useResponsive();

  const { data: productCount } = useQuery(["find-product", data], () => {
    return repository.productRepository.count({
      where: { categoryRef: data._id },
    });
  });

  const handleOnPress = useCallback(() => {
    handleSelected(data._id, data.name);
  }, []);

  const imageSource = useMemo(() => {
    return data?.localImage
      ? {
          uri: data.localImage,
        }
      : PRODUCT_PLACEHOLDER;
  }, []);

  const getBgColor = () => {
    if (twoPaneView && data?._id == selected) {
      return "#8A959E1A";
    } else {
      return theme.colors.white[1000];
    }
  };

  return (
    <>
      <TouchableOpacity
        style={{
          paddingVertical: hp("1.75%"),
          paddingHorizontal: hp("2%"),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: getBgColor(),
        }}
        onPress={handleOnPress}
      >
        <View style={styles.containerView}>
          <ImageView data={data} />
          <View style={{ marginHorizontal: wp("1.35%") }}>
            <DefaultText fontSize="lg">{data.name.en}</DefaultText>

            <DefaultText
              style={{ marginTop: 5 }}
              fontSize="lg"
              fontWeight="medium"
            >
              {data.name.ar}
            </DefaultText>
          </View>
        </View>

        <View style={styles.bottomView}>
          <DefaultText style={{ textAlign: "right" }} fontSize="2xl">
            {`${productCount || 0}`}
          </DefaultText>

          <View
            style={{
              marginTop: 2.5,
              marginLeft: hp("1.75%"),
              transform: [
                {
                  rotate: isRTL ? "180deg" : "0deg",
                },
              ],
            }}
          >
            <ICONS.RightContentIcon />
          </View>
        </View>
      </TouchableOpacity>

      <ItemDivider style={styles.dividerStyle} />
    </>
  );
}

const styles = StyleSheet.create({
  containerView: {
    width: "75%",
    flexDirection: "row",
    alignItems: "center",
  },
  subContainerView: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E5E9EC",
    alignItems: "center",
    justifyContent: "center",
  },
  dividerStyle: {
    margin: 0,
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: "#E5E9EC",
  },
  bottomView: { flexDirection: "row", alignItems: "center" },
});
