import { useNavigation } from "@react-navigation/core";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../context/theme-context";
import useItems from "../../../hooks/use-items";
import ICONS from "../../../utils/icons";
import CurrencyView from "../../modal/currency-view-modal";
import DefaultText from "../../text/Text";
import { debugLog } from "../../../utils/log-patch";

export default function FloatingDineinCartView() {
  const theme = useTheme();
  // const { totalQty, totalAmount } = useItems();

  const navigation = useNavigation() as any;

  return (
    <View>
      {1 > 0 && (
        <TouchableOpacity
          onPress={() => {
            debugLog(
              "Navigate to dinein cart screen",
              {},
              "dinein-menu-screen",
              "floatingCartButtonOnpress"
            );
            navigation.navigate("DineinCart");
          }}
        >
          <View
            style={{
              borderRadius: 16,
              paddingLeft: 15,
              paddingRight: 30,
              paddingVertical: 5,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: theme.colors.primary[200],
            }}
          >
            <ICONS.ShoppingCartIcon />

            <View style={{ marginLeft: 5, alignItems: "flex-end" }}>
              <DefaultText
                fontSize="xl"
                fontWeight="medium"
                color="primary.1000"
              >
                {`${1} ${"Items"}`}
              </DefaultText>

              <CurrencyView
                amount={Number(100).toFixed(2)}
                symbolFontsize={13}
                amountFontsize={20}
                decimalFontsize={20}
                symbolColor="primary.1000"
                amountColor="primary.1000"
                decimalColor="primary.1000"
              />
            </View>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}
