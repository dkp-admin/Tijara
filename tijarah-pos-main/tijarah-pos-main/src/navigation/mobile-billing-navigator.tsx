import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { EventRegister } from "react-native-event-listeners";
import BillingLeftTabView from "../components/billing/billing-left-tab-view";
import BillingRightOrderView from "../components/billing/billing-right-order-view";
import CustomHeader from "../components/common/custom-header";
import StartShiftModal from "../components/modal/start-shift-modal";
import { CartContextProvider } from "../context/cart-context";
import MMKVDB from "../utils/DB-MMKV";
import { DBKeys } from "../utils/DBKeys";
import cart from "../utils/cart";
import { repo } from "../utils/createDatabaseConnection";
import { Text, TouchableOpacity } from "react-native";
import { debugLog } from "../utils/log-patch";
import SunmiV2Printer from "react-native-sunmi-v2-printer";

export type BillingStackParamList = {
  ProductList: any;
  Cart: any;
};

const Stack = createStackNavigator<BillingStackParamList>();

const BillingProductScreen = () => {
  return (
    <CartContextProvider>
      <CustomHeader />
      <BillingLeftTabView />
    </CartContextProvider>
  );
};

const BillingCartScreen = () => {
  return (
    <CartContextProvider>
      <CustomHeader />
      <BillingRightOrderView />
    </CartContextProvider>
  );
};

export function MobileBillingNavigator() {
  const [defaultCash, setDefaultCash] = React.useState(0);
  const [openStartShift, setOpenStartShift] = React.useState(false);

  React.useMemo(() => {
    (async () => {
      const openDrawer = MMKVDB.get(DBKeys.CASH_DRAWER) || "";

      if (openDrawer === "open") {
        const billingData = await repo.billingSettings.find({});

        setDefaultCash(billingData[0]?.defaultCash);
        setOpenStartShift(billingData[0]?.cashManagement);
      }
    })();
  }, []);

  React.useMemo(() => {
    const itemsArray = MMKVDB.get("cartItems");

    if (itemsArray?.length > 0) {
      cart.addItemsToCart(itemsArray, (itm: any) => {
        EventRegister.emit("itemAdded", itm);
      });
    }
  }, []);

  return (
    <>
      <Stack.Navigator initialRouteName="ProductList">
        <Stack.Screen
          name="ProductList"
          options={{ headerShown: false }}
          component={BillingProductScreen}
        />

        <Stack.Screen
          name="Cart"
          options={{ headerShown: false }}
          component={BillingCartScreen}
        />
      </Stack.Navigator>

      {openStartShift && (
        <StartShiftModal
          defaultCash={defaultCash}
          visible={openStartShift}
          handleClose={() => setOpenStartShift(false)}
        />
      )}
    </>
  );
}
