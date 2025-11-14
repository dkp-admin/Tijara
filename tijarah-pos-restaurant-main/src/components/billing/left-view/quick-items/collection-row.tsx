import React from "react";
import { Image, Keyboard, TouchableOpacity, View } from "react-native";
import { useQuery } from "react-query";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import { PRODUCT_PLACEHOLDER } from "../../../../utils/constants";
import DefaultText from "../../../text/Text";
import repository from "../../../../db/repository";

interface CollectionRowProps {
  data: any;
  quickItemsIds?: string[];
  handleOnPress: (data: any) => void;
}

export default function QuickItemsCollectionRow({
  data,
  quickItemsIds,
  handleOnPress,
}: CollectionRowProps) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();

  if (quickItemsIds?.includes(data?._id)) {
    return null;
  }

  const { data: productCount } = useQuery(["find-product", data], () => {
    return repository.productRepository.count({
      where: { collectionsRefs: { _like: data._id } },
    });
  }) as any;

  return (
    <TouchableOpacity
      style={{
        paddingVertical: hp("1.75%"),
        paddingHorizontal: hp("2%"),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "transparent",
      }}
      onPress={() => {
        handleOnPress(data);
        Keyboard.dismiss();
      }}
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

      <DefaultText style={{ marginRight: 4 }} fontSize="2xl">
        {`${productCount || 0} ${t("Products")}`}
      </DefaultText>
    </TouchableOpacity>
  );
}
