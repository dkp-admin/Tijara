import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import ForgotChangeLoginCode from "../screens/authentication/forgotChangeLoginCode";
import Catalogue from "../screens/more/catalogue";
import Customers from "../screens/more/customers";
import Dashboard from "../screens/more/dashboard";
import Discounts from "../screens/more/discounts";
import MiscellaneousExpenses from "../screens/more/miscellaneous-expenses";
import MoreHome from "../screens/more/more";
import BarcodePrinting from "../screens/more/print";
import Reports from "../screens/more/reports";
import Settings from "../screens/more/settings";
import SubscriptionExpired from "../screens/more/subscription-expired";
import AllOrders from "../screens/orders/order";
import Profile from "../screens/profile/profile";
import Transaction from "../screens/transaction/transaction";
import UpdateStock from "../screens/more/update-stock";
import ChangePrice from "../screens/more/change-price";

export type MoreStackParamList = {
  MoreHome: any;
  Catalogue: any;
  Customers: any;
  Discounts: any;
  MiscellaneousExpenses: any;
  Profile: any;
  ForgotChangeLoginCode: undefined;
  SubscriptionExpired: any;
  Settings: any;
  Dashboard: any;
  Reports: any;
  Transaction: any;
  Print: any;
  UpdateStock: any;
  ChangePrice: any;
  Orders: any;
};

const Stack = createStackNavigator<MoreStackParamList>();

export function MoreNavigator() {
  return (
    <Stack.Navigator initialRouteName="MoreHome">
      <Stack.Screen
        name="MoreHome"
        options={{ headerShown: false }}
        component={MoreHome}
      />

      <Stack.Screen
        name="Dashboard"
        options={{ headerShown: false }}
        component={Dashboard}
      />

      <Stack.Screen
        name="Reports"
        options={{ headerShown: false }}
        component={Reports}
      />

      <Stack.Screen
        name="Transaction"
        options={{ headerShown: false }}
        component={Transaction}
      />

      <Stack.Screen
        name="Orders"
        options={{ headerShown: false }}
        component={AllOrders}
      />

      <Stack.Screen
        name="Print"
        options={{ headerShown: false }}
        component={BarcodePrinting}
      />

      <Stack.Screen
        name="Catalogue"
        options={{ headerShown: false }}
        component={Catalogue}
      />

      <Stack.Screen
        name="Customers"
        options={{ headerShown: false }}
        component={Customers}
      />

      <Stack.Screen
        name="Discounts"
        options={{ headerShown: false }}
        component={Discounts}
      />

      <Stack.Screen
        name="MiscellaneousExpenses"
        options={{ headerShown: false }}
        component={MiscellaneousExpenses}
      />

      <Stack.Screen
        name="Settings"
        options={{ headerShown: false }}
        component={Settings}
      />

      <Stack.Screen
        name="Profile"
        options={{ headerShown: false }}
        component={Profile}
      />

      <Stack.Screen
        name="UpdateStock"
        options={{ headerShown: false }}
        component={UpdateStock}
      />

      <Stack.Screen
        name="ChangePrice"
        options={{ headerShown: false }}
        component={ChangePrice}
      />

      <Stack.Screen
        name="ForgotChangeLoginCode"
        options={{
          headerShown: false,
        }}
        component={ForgotChangeLoginCode}
      />

      <Stack.Screen
        name="SubscriptionExpired"
        options={{
          headerShown: false,
        }}
        component={SubscriptionExpired}
      />
    </Stack.Navigator>
  );
}
