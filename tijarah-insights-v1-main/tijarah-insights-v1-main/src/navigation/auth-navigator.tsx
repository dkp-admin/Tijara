import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import ForgotPassword from "../screens/authentication/forgot-password";
import LanguageSelection from "../screens/authentication/language-selection";
import Login from "../screens/authentication/login";
import ResetPassword from "../screens/authentication/reset-password";
import Welcome from "../screens/authentication/welcome";

export type AuthStackParamList = {
  LanguageSelection: any;
  Welcome: any;
  Login: any;
  ForgotPassword: any;
  ResetPassword: any;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName="LanguageSelection">
      <Stack.Screen
        name="LanguageSelection"
        component={LanguageSelection}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Welcome"
        component={Welcome}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPassword}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPassword}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
