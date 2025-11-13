import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import ConnectDevice from "../screens/authentication/connect-device";
import LanguageSelection from "../screens/authentication/language-selection";

export type AuthStackParamList = {
  LanguageSelection: any;
  ConnectDevice: any;
};

const Stack = createStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName="LanguageSelection">
      <Stack.Screen
        name="LanguageSelection"
        options={{
          headerShown: false,
        }}
        component={LanguageSelection}
      />

      <Stack.Screen
        name="ConnectDevice"
        options={{
          headerShown: false,
        }}
        component={ConnectDevice}
      />
    </Stack.Navigator>
  );
}
