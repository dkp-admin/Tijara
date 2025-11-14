import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useMemo } from "react";
import { t } from "../../i18n";
import { useTheme } from "../context/theme-context";
import { useResponsive } from "../hooks/use-responsiveness";
import useCommonApis from "../hooks/useCommonApis";
import BillingHome from "../screens/billing/billing";
import ICONS from "../utils/icons";
import CustomBottomTab from "./custom-bottom-tab";
import { DineinNavigator } from "./dinein-navigator";
import { MobileBillingNavigator } from "./mobile-billing-navigator";
import { MobileDineinNavigator } from "./mobile-dinein-navigator";
import { MoreNavigator } from "./more-navigator";
import { NotificationNavigator } from "./notification-navigator";
import { OnlineNavigator } from "./online-navigator";

const Tab = createBottomTabNavigator();

function BottomTabNavigator() {
  const theme = useTheme();
  const { businessData } = useCommonApis();
  const { twoPaneView } = useResponsive();
  const Dinein = useMemo(
    () => (twoPaneView ? DineinNavigator : MobileDineinNavigator),
    []
  );
  const Billing = useMemo(
    () => (twoPaneView ? BillingHome : MobileBillingNavigator),
    []
  );

  return (
    <>
      <Tab.Navigator
        tabBar={(props) => <CustomBottomTab {...props} />}
        initialRouteName={
          Boolean(businessData?.location?.dinein)
            ? "DineinNavigator"
            : "BillingNavigator"
        }
        detachInactiveScreens
        screenOptions={{
          tabBarStyle: {
            backgroundColor: theme.colors.tabBottomColor,
          },
          tabBarActiveTintColor: theme.colors.primary[1000],
        }}
      >
        {Boolean(businessData?.location?.dinein) && (
          <Tab.Screen
            name={t("Tables")}
            options={{
              headerShown: false,
              tabBarIcon: ({ focused, color, size }) => {
                if (color == theme.colors.primary[1000]) {
                  return (
                    <ICONS.BottomTablesFilledIcon
                      fontSize={size}
                      color={color}
                    />
                  );
                } else {
                  return (
                    <ICONS.BottomTablesIcon fontSize={size} color={color} />
                  );
                }
              },
            }}
            component={Dinein}
          />
        )}

        <Tab.Screen
          name={t("Billing")}
          options={{
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
              if (color == theme.colors.primary[1000]) {
                return (
                  <ICONS.BottomBillingFilledIcon
                    fontSize={size}
                    color={color}
                  />
                );
              } else {
                return (
                  <ICONS.BottomBillingIcon fontSize={size} color={color} />
                );
              }
            },
          }}
          component={Billing}
        />

        {Boolean(
          businessData?.location?.qrOrderingConfiguration?.qrOrdering ||
            businessData?.location?.qrOrderingConfiguration?.onlineOrdering
        ) && (
          <Tab.Screen
            name={t("Online Orders")}
            options={{
              headerShown: false,
              tabBarIcon: ({ focused, color, size }) => {
                if (color == theme.colors.primary[1000]) {
                  return (
                    <ICONS.BottomOnlineOrdersFilledIcon
                      fontSize={size}
                      color={color}
                    />
                  );
                } else {
                  return (
                    <ICONS.BottomOnlineOrdersIcon
                      fontSize={size}
                      color={color}
                    />
                  );
                }
              },
            }}
            component={OnlineNavigator}
          />
        )}

        {Boolean(
          businessData?.location?.qrOrderingConfiguration?.qrOrdering ||
            businessData?.location?.qrOrderingConfiguration?.onlineOrdering
        ) && (
          <Tab.Screen
            name={t("Notifications")}
            options={{
              headerShown: false,
              tabBarIcon: ({ focused, color, size }) => {
                if (color == theme.colors.primary[1000]) {
                  return (
                    <ICONS.BottomNotificationFilledIcon
                      fontSize={size}
                      color={color}
                    />
                  );
                } else {
                  return (
                    <ICONS.BottomNotificationIcon
                      fontSize={size}
                      color={color}
                    />
                  );
                }
              },
            }}
            component={NotificationNavigator}
          />
        )}

        <Tab.Screen
          name={t("More")}
          options={{
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
              if (color == theme.colors.primary[1000]) {
                return (
                  <ICONS.BottomMoreFilledIcon fontSize={size} color={color} />
                );
              } else {
                return <ICONS.BottomMoreIcon fontSize={size} color={color} />;
              }
            },
          }}
          component={MoreNavigator}
        />

        {/* {twoPaneView && (
          <Tab.Screen
            name={t("My Profile")}
            options={{
              headerShown: false,
              tabBarIcon: ({ focused, color, size }) => {
                if (color == theme.colors.primary[1000]) {
                  return (
                    <ICONS.ProfileCircleFilledIcon
                      fontSize={size}
                      color={color}
                    />
                  );
                } else {
                  return (
                    <ICONS.ProfileCircleIcon fontSize={size} color={color} />
                  );
                }
              },
            }}
            component={ProfileNavigator}
          />
        )} */}
      </Tab.Navigator>
    </>
  );
}

export default BottomTabNavigator;
