import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { t } from "../../i18n";
import { useTheme } from "../context/theme-context";
import Insights from "../screens/insights/insights";
import Notifications from "../screens/notifications/notifications";
import Profile from "../screens/profile/profile";
import Reports from "../screens/reports/reports";
import ICONS from "../utils/icons";
import CustomBottomTab from "./custom-bottom-tab";

const Tab = createBottomTabNavigator();

function BottomTabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomBottomTab {...props} />}
      initialRouteName="Insights"
      detachInactiveScreens
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.tabBottomColor,
        },
        tabBarActiveTintColor: theme.colors.primary[1000],
      }}
    >
      <Tab.Screen
        name={"Insights"}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            if (color === theme.colors.primary[1000]) {
              return (
                <ICONS.InsightsFilledBottomIcon fontSize={size} color={color} />
              );
            } else {
              return <ICONS.InsightsBottomIcon fontSize={size} color={color} />;
            }
          },
        }}
        component={Insights}
      />

      {/* <Tab.Screen
        name={("Reports")}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            if (color === theme.colors.primary[1000]) {
              return (
                <ICONS.ReportsFilledBottomIcon fontSize={size} color={color} />
              );
            } else {
              return <ICONS.ReportsBottomIcon fontSize={size} color={color} />;
            }
          },
        }}
        component={Reports}
      /> */}

      {/* <Tab.Screen
        name={("Notifications")}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            if (color === theme.colors.primary[1000]) {
              return (
                <ICONS.NotificationsFilledBottomIcon
                  fontSize={size}
                  color={color}
                />
              );
            } else {
              return (
                <ICONS.NotificationsBottomIcon fontSize={size} color={color} />
              );
            }
          },
        }}
        component={Notifications}
      /> */}

      <Tab.Screen
        name={"Profile"}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            if (color === theme.colors.primary[1000]) {
              return (
                <ICONS.ProfileFilledBottomIcon fontSize={size} color={color} />
              );
            } else {
              return <ICONS.ProfileBottomIcon fontSize={size} color={color} />;
            }
          },
        }}
        component={Profile}
      />
    </Tab.Navigator>
  );
}

export default BottomTabNavigator;
