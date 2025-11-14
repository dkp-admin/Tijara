import { NavigationContainer } from "@react-navigation/native";
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

export default function Navigation({
  colorScheme,
}: {
  colorScheme: ColorSchemeName;
}) {
  const screens = useExternalDisplay();

  return (
    <NavigationContainer linking={LinkingConfiguration} theme={LightTheme}>
      {Object.keys(screens)[0] && (
        <ExternalDisplay
          mainScreenStyle={{ flex: 1 }}
          fallbackInMainScreen
          screen={Object.keys(screens)[0]}
        >
          {/* <CartContextProvider>
          {items?.length > 0 ? (
            <CartView />
          ) : lastOrder ? (
            <Success />
          ) : ( */}
          <CartContextProvider>
            <Welcome />
          </CartContextProvider>
          {/* )}
        </CartContextProvider> */}
        </ExternalDisplay>
      )}
      <SyncWrapper />
      <RootNavigator />
    </NavigationContainer>
  );
}
