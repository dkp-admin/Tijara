import { NavigationContainer } from "@react-navigation/native";
import * as React from "react";
import { ColorSchemeName } from "react-native";
import { LightTheme } from "../theme/theme";
import LinkingConfiguration from "./LinkingConfiguration";
import RootNavigator from "./root-navigator";

export default function Navigation({
  colorScheme,
}: {
  colorScheme: ColorSchemeName;
}) {
  return (
    <NavigationContainer linking={LinkingConfiguration} theme={LightTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}
