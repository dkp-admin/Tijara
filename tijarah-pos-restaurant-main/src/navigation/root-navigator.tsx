import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { EventRegister } from "react-native-event-listeners";
import AuthContext from "../context/auth-context";
import DeviceContext from "../context/device-context";
import { logoutDevice } from "../utils/logoutDevice";
import { AuthNavigator } from "./auth-navigation";
import BottomTabNavigator from "./bottom-navigator";
import { LoginNavigator } from "./login-navigation";
import OtherNavigator from "./other-screens";
import { useResponsive } from "../hooks/use-responsiveness";
import { DineinNavigator } from "./dinein-navigator";
import { MobileDineinNavigator } from "./mobile-dinein-navigator";
import Constants from "expo-constants";
import { Database } from "../db";

export type RootStackParamList = {
  AuthNavigator: undefined;
  LoginNavigator: undefined;
  MainNavigator: undefined;
  OtherNavigator: undefined;
  DineInNavigator: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const deviceContext = React.useContext(DeviceContext) as any;
  const authContext = React.useContext(AuthContext) as any;

  const { twoPaneView } = useResponsive();
  const Dinein = React.useMemo(
    () => (twoPaneView ? DineinNavigator : MobileDineinNavigator),
    []
  );

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

  React.useEffect(() => {
    if (!Constants.expoConfig?.version) return;
    Database.getInstance()
      .checkVersionAndMigrate(Constants.expoConfig.version)
      .then((r) => {
        console.log(r);
        if (r) {
          authContext.logout();
        }
      });
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
        <>
          <Stack.Screen
            name="MainNavigator"
            component={BottomTabNavigator}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="OtherNavigator"
            component={OtherNavigator}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="DineInNavigator"
            component={Dinein}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
