import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import Transaction from "../screens/transaction/transaction";

export type TransactionStackParamList = {
  Transaction: any;
};

const Stack = createStackNavigator<TransactionStackParamList>();

export function TransactionNavigator() {
  return (
    <Stack.Navigator initialRouteName="Transaction">
      <Stack.Screen
        name="Transaction"
        options={{ headerShown: false }}
        component={Transaction}
      />
    </Stack.Navigator>
  );
}
