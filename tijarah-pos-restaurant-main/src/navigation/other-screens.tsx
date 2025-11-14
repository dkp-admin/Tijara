import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { EventRegister } from "react-native-event-listeners";
import AuthContext from "../context/auth-context";
import DeviceContext from "../context/device-context";
import ForgotChangeLoginCode from "../screens/authentication/forgotChangeLoginCode";
import Catalogue from "../screens/more/catalogue";
import SalesSummaryReports from "../screens/more/components/sales-summary";
import Customers from "../screens/more/customers";
import Dashboard from "../screens/more/dashboard";
import Discounts from "../screens/more/discounts";
import MiscellaneousExpenses from "../screens/more/miscellaneous-expenses";
import BarcodePrinting from "../screens/more/print";
import Reports from "../screens/more/reports";
import Settings from "../screens/more/settings";
import SubscriptionExpired from "../screens/more/subscription-expired";
import OnlineOrderDetails from "../screens/online-orders/online-order-details";
import OnlineOrdering from "../screens/online-orders/online-orders";
import AllOrders from "../screens/orders/order";
import Profile from "../screens/profile/profile";
import Transaction from "../screens/transaction/transaction";
import { logoutDevice } from "../utils/logoutDevice";
import OrdersReport from "../components/reports/orders-report";
import CashDrawerReport from "../components/reports/cash-drawer-report";
import Hardware from "../components/settings/hardware";
import UpdateStock from "../screens/more/update-stock";
import ChangePrice from "../screens/more/change-price";
import ReceiveStocks from "../components/more/receive-stocks";

export type OtherScreensParamList = {
  Catalogue: any;
  Customers: any;
  Discounts: any;
  MiscellaneousExpenses: any;
  Profile: any;
  ForgotChangeLoginCode: undefined;
  SubscriptionExpired: any;
  Settings: any;
  Dashboard: any;
  Reports: any;
  Transaction: any;
  Print: any;
  Orders: any;
  OnlineOrdering: any;
  OnlineOrderDetails: any;
  SalesReport: any;
  OrderReport: any;
  CashDrawerReport: any;
  Hardwares: any;
  UpdateStock: any;
  ChangePrice: any;
  ReceiveStocks:any;
};

const Stack = createStackNavigator<OtherScreensParamList>();

export default function OtherNavigator() {
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
    <Stack.Navigator initialRouteName="Dashboard">
      <Stack.Screen
        name="Dashboard"
        options={{ headerShown: false }}
        component={Dashboard}
      />
      <Stack.Screen
        name="UpdateStock"
        options={{ headerShown: false }}
        component={UpdateStock}
      />

      <Stack.Screen
        name="ChangePrice"
        options={{ headerShown: false }}
        component={ChangePrice}
      />

<Stack.Screen
        name="ReceiveStocks"
        options={{ headerShown: false }}
        component={ReceiveStocks}
      />

      <Stack.Screen
        name="Reports"
        options={{ headerShown: false }}
        component={Reports}
      />

      <Stack.Screen
        name="SalesReport"
        options={{ headerShown: false }}
        component={SalesSummaryReports}
      />

      <Stack.Screen
        name="CashDrawerReport"
        options={{ headerShown: false }}
        component={CashDrawerReport}
      />

      <Stack.Screen
        name="OrderReport"
        options={{ headerShown: false }}
        component={OrdersReport}
      />

      <Stack.Screen
        name="Transaction"
        options={{ headerShown: false }}
        component={Transaction}
      />

      <Stack.Screen
        name="Orders"
        options={{ headerShown: false }}
        component={AllOrders}
      />

      <Stack.Screen
        name="Print"
        options={{ headerShown: false }}
        component={BarcodePrinting}
      />

      <Stack.Screen
        name="Catalogue"
        options={{ headerShown: false }}
        component={Catalogue}
      />

      <Stack.Screen
        name="Customers"
        options={{ headerShown: false }}
        component={Customers}
      />

      <Stack.Screen
        name="Discounts"
        options={{ headerShown: false }}
        component={Discounts}
      />

      <Stack.Screen
        name="MiscellaneousExpenses"
        options={{ headerShown: false }}
        component={MiscellaneousExpenses}
      />

      <Stack.Screen
        name="Settings"
        options={{ headerShown: false }}
        component={Settings}
      />

      <Stack.Screen
        name="Hardwares"
        options={{ headerShown: false }}
        component={Hardware}
      />

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

      <Stack.Screen
        name="SubscriptionExpired"
        options={{
          headerShown: false,
        }}
        component={SubscriptionExpired}
      />
      <Stack.Screen
        name="OnlineOrdering"
        options={{ headerShown: false }}
        component={OnlineOrdering}
      />

      <Stack.Screen
        name="OnlineOrderDetails"
        options={{ headerShown: false }}
        component={OnlineOrderDetails}
      />
    </Stack.Navigator>
  );
}
