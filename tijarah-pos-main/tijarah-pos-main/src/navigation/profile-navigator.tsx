import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import ForgotChangeLoginCode from "../screens/authentication/forgotChangeLoginCode";
import Profile from "../screens/profile/profile";

export type ProfileStackParamList = {
  Profile: any;
  ForgotChangeLoginCode: undefined;
};

const Stack = createStackNavigator<ProfileStackParamList>();

export function ProfileNavigator() {
  return (
    <Stack.Navigator initialRouteName="Profile">
      <Stack.Screen
        name="Profile"
        options={{ headerShown: false }}
        component={Profile}
      />

      <Stack.Screen
        name="ForgotChangeLoginCode"
        options={{
          headerShown: false,
        }}
        component={ForgotChangeLoginCode}
      />
    </Stack.Navigator>
  );
}
