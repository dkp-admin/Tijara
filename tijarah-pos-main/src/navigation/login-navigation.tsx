import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import ForgotChangeLoginCode from "../screens/authentication/forgotChangeLoginCode";
import Login from "../screens/authentication/login";
import SyncFetchData from "../screens/authentication/sync-fetch-data";
import SubscriptionExpired from "../screens/more/subscription-expired";

export type AuthStackParamList = {
  Login: undefined;
  ForgotChangeLoginCode: undefined;
  SyncFetchData: undefined;
  SubscriptionExpired: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

export function LoginNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        options={{
          headerShown: false,
        }}
        component={Login}
      />

      <Stack.Screen
        name="ForgotChangeLoginCode"
        options={{
          headerShown: false,
        }}
        component={ForgotChangeLoginCode}
      />

      <Stack.Screen
        name="SyncFetchData"
        options={{
          headerShown: false,
        }}
        component={SyncFetchData}
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
