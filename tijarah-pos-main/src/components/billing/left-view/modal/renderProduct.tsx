import { TouchableOpacity, View, ViewStyle } from "react-native";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import { getUnitName } from "../../../../utils/constants";
import DefaultText from "../../../text/Text";

const renderVariantItem = (
  item: any,
  index: number,
  isSelected: any,
  setQuantity: any,
  setTotalPrice: any,
  setVariantData: any,
  setVisibleProductCustomPrice: any,
  setSelectedVariant: any,
  selectedVariant: any,
  getVariantPrice: any
) => {
  const { wp, hp } = useResponsive();
  const theme = useTheme();
  const variantItemStyle: ViewStyle = {
    width: wp("100%") / 3.7,
    marginBottom: hp("2%"),
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: hp("2.25%"),
    paddingHorizontal: wp("1.4%"),
    borderWidth: isSelected(item) ? 2 : 0,
    borderColor: isSelected(item)
      ? theme.colors.primary[1000]
      : theme.colors.placeholder,
    backgroundColor: theme.colors.white[1000],
  };

  const handlePress = () => {
    if (item.sellingPrice) {
      if (item.unit === "perItem") {
        setQuantity(1);
      } else {
        setQuantity();
      }
      setTotalPrice(item.sellingPrice || 0);
    } else {
      setVariantData(item);
      setVisibleProductCustomPrice(true);
    }

    setSelectedVariant(item);
  };

  return (
    <TouchableOpacity
      key={index}
      style={variantItemStyle}
      onPress={handlePress}
      disabled={item.name.en === selectedVariant?.name.en}
    >
      <DefaultText fontSize="2xl" fontWeight="normal" color={"otherGrey.100"}>
        {item.name.en || "Regular"}
      </DefaultText>

      <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
        <DefaultText fontSize="lg" fontWeight="normal" color={"otherGrey.100"}>
          {getVariantPrice(item)}
        </DefaultText>

        <DefaultText style={{ fontSize: 11 }} fontWeight="normal">
          {getUnitName[item.unit]}
        </DefaultText>
      </View>
    </TouchableOpacity>
  );
};

export default renderVariantItem;
