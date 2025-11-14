import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import OnlineOrderDetails from "../screens/online-orders/online-order-details";
import OnlineOrdering from "../screens/online-orders/online-orders";

export type OnlineStackParamList = {
  OnlineOrdering: any;
  OnlineOrderDetails: any;
};

const Stack = createStackNavigator<OnlineStackParamList>();

export function OnlineNavigator() {
  return (
    <Stack.Navigator initialRouteName="OnlineOrdering">
      <Stack.Screen
        name="OnlineOrdering"
        options={{ headerShown: false }}
        component={OnlineOrdering}
      />

      <Stack.Screen
        name="OnlineOrderDetails"
        options={{ headerShown: false }}
        component={OnlineOrderDetails}
      />
    </Stack.Navigator>
  );
}
