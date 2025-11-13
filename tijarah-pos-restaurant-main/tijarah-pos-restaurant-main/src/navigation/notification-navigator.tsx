import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import Notification from "../screens/notification/notification";

export type NotificationStackParamList = {
  Notification: any;
};

const Stack = createStackNavigator<NotificationStackParamList>();

export function NotificationNavigator() {
  return (
    <Stack.Navigator initialRouteName="Notification">
      <Stack.Screen
        name="Notification"
        options={{ headerShown: false }}
        component={Notification}
      />
    </Stack.Navigator>
  );
}
