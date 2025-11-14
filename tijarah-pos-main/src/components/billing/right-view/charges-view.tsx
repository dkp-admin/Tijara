import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../context/theme-context";
import { checkDirection } from "../../../hooks/check-direction";
import { useResponsive } from "../../../hooks/use-responsiveness";
import ICONS from "../../../utils/icons";
import ItemDivider from "../../action-sheet/row-divider";
import CurrencyView from "../../modal/currency-view-modal";
import DefaultText from "../../text/Text";

export default function ChargesView({
  handlePress,
  items,
  chargesApplied,
}: {
  handlePress: any;
  items: any;
  chargesApplied: any;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { hp } = useResponsive();

  return (
    <View>
      {items?.length > 0 &&
        chargesApplied?.map((charge: any) => {
          return (
            <View key={charge.chargeId}>
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
                      borderWidth: 1.25,
                      borderColor: theme.colors.placeholder,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: theme.colors.white[1000],
                    }}
                  >
                    <ICONS.CustomChargeIcon />
                  </View>

                  <View style={{ marginHorizontal: hp("1.5%") }}>
                    <DefaultText
                      style={{
                        textDecorationColor: "#2727271A",
                      }}
                      fontSize="lg"
                      color="primary.1000"
                    >
                      {isRTL ? charge.name.ar : charge.name.en}
                    </DefaultText>
                  </View>
                </View>

                <CurrencyView amount={`${charge.total?.toFixed(2)}`} />
              </TouchableOpacity>

              <ItemDivider
                style={{
                  margin: 0,
                  borderWidth: 0,
                  borderBottomWidth: 1,
                  borderColor: "#E5E9EC",
                }}
              />
            </View>
          );
        })}
    </View>
  );
}
