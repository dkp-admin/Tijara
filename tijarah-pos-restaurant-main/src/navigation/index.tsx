import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import * as React from "react";
import { ColorSchemeName } from "react-native";
import { DarkTheme, LightTheme } from "../theme/theme";
import LinkingConfiguration from "./LinkingConfiguration";
import RootNavigator from "./root-navigator";
import SyncWrapper from "../components/event/event-wrapper";
import ExternalDisplay, {
  useExternalDisplay,
} from "react-native-external-display";
import { CartContextProvider } from "../context/cart-context";
import Welcome from "../components/customer-display/welcome";
import { View } from "react-native";

export default function Navigation({
  colorScheme,
}: {
  colorScheme: ColorSchemeName;
}) {
  const navigationRef = useNavigationContainerRef();

  const screens = useExternalDisplay();

  const handleNavigationError = () => {
    const state = navigationRef.getRootState();
    if (!state || state.routes.length === 0) {
      console.warn("No screens to pop to.");
      return;
    }
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      onUnhandledAction={handleNavigationError}
      linking={LinkingConfiguration}
      theme={LightTheme}
    >
      {Object.keys(screens)[0] && (
        <ExternalDisplay
          mainScreenStyle={{ flex: 1 }}
          fallbackInMainScreen
          screen={Object.keys(screens)[0]}
        >
          <CartContextProvider>
            <Welcome />
          </CartContextProvider>
        </ExternalDisplay>
      )}

      <SyncWrapper />

      <RootNavigator />
    </NavigationContainer>
  );
}
