import React from "react";
import { TouchableOpacity, View } from "react-native";
import i18n from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import ICONS from "../../../utils/icons";
import ItemDivider from "../../action-sheet/row-divider";
import CurrencyView from "../../modal/currency-view-modal";
import DefaultText from "../../text/Text";

export default function DiscountView({
  handlePress,
  items,
  discountPrice,
}: any) {
  const theme = useTheme();
  const { hp } = useResponsive();

  return (
    <>
      {items?.length > 0 && discountPrice > 0 && (
        <>
          <TouchableOpacity
            style={{
              paddingVertical: 12,
              paddingHorizontal: hp("2%"),
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
            onPress={() => handlePress()}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: hp("6.5%"),
                  height: hp("6.5%"),
                  padding: 10,
                  borderRadius: 8,
                  borderWidth: 1.5,
                  borderColor: theme.colors.primary[100],
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: theme.colors.white[1000],
                }}
              >
                <ICONS.DiscountIcon />
              </View>

              <View style={{ marginHorizontal: hp("1.5%") }}>
                {i18n.currentLocale() == "en" ? (
                  <DefaultText
                    style={{
                      textDecorationColor: "#2727271A",
                    }}
                    fontSize="lg"
                    color="primary.1000"
                  >
                    {"Discount"}
                  </DefaultText>
                ) : (
                  <DefaultText
                    style={{
                      textDecorationColor: "#2727271A",
                    }}
                    fontSize="xl"
                    fontWeight="medium"
                    color="primary.1000"
                  >
                    {"تخفيض"}
                  </DefaultText>
                )}
              </View>
            </View>

            {discountPrice > 0 ? (
              <CurrencyView amount={discountPrice} />
            ) : (
              <DefaultText fontSize={"sm"}>FREE ITEM</DefaultText>
            )}
          </TouchableOpacity>

          <ItemDivider
            style={{
              margin: 0,
              borderWidth: 0,
              borderBottomWidth: 1,
              borderColor: "#E5E9EC",
            }}
          />
        </>
      )}
    </>
  );
}
