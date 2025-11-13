import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import BillingHome from "../screens/billing/billing";

export type BillingStackParamList = {
  BillingHome: any;
};

const Stack = createStackNavigator<BillingStackParamList>();

export function BillingNavigator() {
  return (
    <Stack.Navigator initialRouteName="BillingHome">
      <Stack.Screen
        name="BillingHome"
        options={{ headerShown: false }}
        component={BillingHome}
      />
    </Stack.Navigator>
  );
}
