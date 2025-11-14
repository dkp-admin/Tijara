import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { EventRegister } from "react-native-event-listeners";
import AuthContext from "../context/auth-context";
import DeviceContext from "../context/device-context";
import { logoutDevice } from "../utils/logoutDevice";
import { AuthNavigator } from "./auth-navigation";
import { LoginNavigator } from "./login-navigation";
import BillingHome from "../screens/billing/billing";
import BottomTabNavigator from "./bottom-navigator";
import Welcome from "../components/customer-display/welcome";

export type RootStackParamList = {
  AuthNavigator: undefined;
  LoginNavigator: undefined;
  MainNavigator: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const deviceContext = React.useContext(DeviceContext) as any;
  const authContext = React.useContext(AuthContext) as any;

  React.useEffect(() => {
    const listener = EventRegister.addEventListener("logged_out", async () => {
      try {
        authContext.logout();
        logoutDevice(deviceContext);
      } catch (error) {
        console.log(error);
      }
    });
    return () => {
      EventRegister.removeEventListener(listener as string);
    };
  }, []);

  return (
    <Stack.Navigator initialRouteName="AuthNavigator">
      {!deviceContext.user ? (
        <Stack.Screen
          name="AuthNavigator"
          component={AuthNavigator}
          options={{ headerShown: false }}
        />
      ) : !authContext.user ? (
        <Stack.Screen
          name="LoginNavigator"
          component={LoginNavigator}
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen
          name="MainNavigator"
          component={BottomTabNavigator}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}
