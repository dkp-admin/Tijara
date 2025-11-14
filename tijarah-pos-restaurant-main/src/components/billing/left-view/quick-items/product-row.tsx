import React from "react";
import { Image, Keyboard, TouchableOpacity, View } from "react-native";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { checkDirection } from "../../../../hooks/check-direction";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import { PRODUCT_PLACEHOLDER, getUnitName } from "../../../../utils/constants";
import CurrencyView from "../../../modal/currency-view-modal";
import DefaultText from "../../../text/Text";
import ImageView from "../catalogue/image-view";

interface ProductRowProps {
  data: {
    _id: string;
    name: {
      en: string;
      ar: string;
    };
    localImage?: string;
    variants: {
      unit: string;
      status: string;
      prices: { price: string }[];
    }[];
    category: {
      name: string;
    };
    status: string;
  };
  quickItemsIds?: string[];
  handleOnPress: (data: any) => void;
}

const QuickItemsProductRow: React.FC<ProductRowProps> = ({
  data,
  quickItemsIds,
  handleOnPress,
}) => {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { hp } = useResponsive();

  if (data?.variants?.length === 0) {
    return <></>;
  }

  if (quickItemsIds?.includes(data?._id)) {
    return null;
  }

  return (
    <TouchableOpacity
      style={{
        padding: hp("2%"),
        flexDirection: "row",
        alignItems: "center",
      }}
      onPress={() => {
        handleOnPress(data);
        Keyboard.dismiss();
      }}
    >
      <View
        style={{
          width: "70%",
          marginRight: "7%",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <ImageView data={data} />

        <View style={{ marginHorizontal: hp("1.5%") }}>
          <DefaultText fontSize="lg">{data.name.en}</DefaultText>

          <DefaultText
            style={{ marginTop: 5 }}
            fontSize="lg"
            fontWeight="medium"
          >
            {data.category.name}
          </DefaultText>
        </View>
      </View>

      <View style={{ width: "23%" }}>
        {data.variants?.length > 1 ? (
          <DefaultText style={{ alignSelf: "flex-end" }} fontSize="2xl">
            {`${data.variants.length} ${t("Variants")}`}
          </DefaultText>
        ) : Number(data.variants[0]?.prices?.[0]?.price) ? (
          <View style={{ alignItems: "flex-end" }}>
            <View
              style={{
                flexDirection: isRTL ? "row-reverse" : "row",
                alignItems: "flex-end",
              }}
            >
              <CurrencyView
                amount={Number(data.variants[0].prices?.[0]?.price)?.toFixed(2)}
              />

              <DefaultText fontSize="sm" fontWeight="medium">
                {getUnitName[data.variants[0].unit]}
              </DefaultText>
            </View>
          </View>
        ) : (
          <View style={{ alignItems: "flex-end" }}>
            <View
              style={{
                flexDirection: isRTL ? "row-reverse" : "row",
                alignItems: "flex-end",
              }}
            >
              <DefaultText style={{ alignSelf: "flex-end" }} fontSize="2xl">
                {t("Custom")}
              </DefaultText>

              <DefaultText fontSize="sm" fontWeight="medium">
                {getUnitName[data.variants[0].unit]}
              </DefaultText>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default QuickItemsProductRow;
