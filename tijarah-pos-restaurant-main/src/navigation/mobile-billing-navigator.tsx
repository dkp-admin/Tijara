import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { EventRegister } from "react-native-event-listeners";
import BillingMenu from "../components/billing/billing-new/billing-menu";
import BillingNewCart from "../components/billing/billing-new/billing-new-cart";
import CustomHeader from "../components/common/custom-header";
import StartShiftModal from "../components/modal/start-shift-modal";
import { CartContextProvider } from "../context/cart-context";
import repository from "../db/repository";
import MMKVDB from "../utils/DB-MMKV";
import { DBKeys } from "../utils/DBKeys";
import cart from "../utils/cart";

export type BillingStackParamList = {
  ProductList: any;
  Cart: any;
};

const Stack = createStackNavigator<BillingStackParamList>();

const BillingProductScreen = () => {
  return (
    <CartContextProvider>
      <CustomHeader />
      <BillingMenu />
    </CartContextProvider>
  );
};

const BillingCartScreen = () => {
  return (
    <CartContextProvider>
      <CustomHeader />
      <BillingNewCart />
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
        const billingData = await repository.billing.findAll();

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
