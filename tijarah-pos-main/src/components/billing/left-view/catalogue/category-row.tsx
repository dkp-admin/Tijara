import React, { useCallback } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { useQuery } from "react-query";
import { useTheme } from "../../../../context/theme-context";
import { checkDirection } from "../../../../hooks/check-direction";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import { PRODUCT_PLACEHOLDER } from "../../../../utils/constants";
import { repo } from "../../../../utils/createDatabaseConnection";
import ICONS from "../../../../utils/icons";
import DefaultText from "../../../text/Text";

export default function CategoryRowCatalogue({ data, handleSelected }: any) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { wp, hp } = useResponsive();

  const { data: productCount } = useQuery(["find-product", data], () => {
    return repo.product.count({
      where: { categoryRef: data._id, status: "active" },
    });
  }) as any;

  const handleOnPress = useCallback(() => {
    handleSelected(data._id, data.name);
  }, []);

  if (productCount === 0) {
    return <></>;
  }

  return (
    <Pressable
      style={{
        paddingVertical: hp("1.75%"),
        paddingHorizontal: hp("2%"),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "transparent",
        borderBottomWidth: 1,
        borderColor: "#E5E9EC",
        borderStyle: "dashed",
      }}
      onPress={handleOnPress}
    >
      <View
        style={{
          width: "75%",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: hp("6.5%"),
            height: hp("6.5%"),
            borderRadius: 16,
            borderWidth: 1.5,
            borderColor: "#E5E9EC",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme.colors.white[1000],
          }}
        >
          <Image
            key={"category-logo"}
            resizeMode="stretch"
            style={{
              width: hp("6.5%"),
              height: hp("6.5%"),
              borderRadius: 16,
            }}
            source={
              data?.localImage
                ? {
                    uri: data?.localImage,
                  }
                : PRODUCT_PLACEHOLDER
            }
          />
        </View>

        <View style={{ marginHorizontal: wp("1.35%") }}>
          <DefaultText fontSize="lg">{data?.name?.en || "NA"}</DefaultText>

          <DefaultText
            style={{ marginTop: 5 }}
            fontSize="lg"
            fontWeight="medium"
          >
            {data?.name?.ar || "NA"}
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dividerStyle: {
    margin: 0,
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: "#E5E9EC",
  },
  bottomView: { flexDirection: "row", alignItems: "center" },
});
