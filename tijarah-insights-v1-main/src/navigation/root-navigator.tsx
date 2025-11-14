import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import { EventRegister } from "react-native-event-listeners";
import { useAuth } from "../hooks/use-auth";
import AuthNavigator from "./auth-navigator";
import BottomTabNavigator from "./bottom-navigator";

export type RootStackParamList = {
  AuthNavigator: undefined;
  MainNavigator: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, logout } = useAuth();

  React.useEffect(() => {
    const listener = EventRegister.addEventListener("logged_out", async () => {
      logout().then((res: any) => console.log(res));
    });
    return () => {
      EventRegister.removeEventListener(listener as string);
    };
  }, []);

  return (
    <Stack.Navigator initialRouteName="AuthNavigator">
      {!user ? (
        <Stack.Screen
          name="AuthNavigator"
          component={AuthNavigator}
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
