import { useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { t } from "../../i18n";
import CustomHeader from "../components/common/custom-header";
import SeparatorHorizontalView from "../components/common/separator-horizontal-view";
import DineinCart from "../components/dienin/dinein-cart";
import DineinMenu from "../components/dienin/dinein-menu";
import DineinTableMenu from "../components/dienin/dinein-table-menu";
import DefaultText from "../components/text/Text";
import { checkDirection } from "../hooks/check-direction";
import ICONS from "../utils/icons";

export type DineinStackParamList = {
  TableMenu: any;
  DineinMenuCart: any;
  DineinCart: any;
};

const Stack = createStackNavigator<DineinStackParamList>();

const DineinTableMenuScreen = () => {
  return (
    <>
      <CustomHeader />
      <DineinTableMenu />
    </>
  );
};

const DineinMenuScreen = () => {
  return (
    <>
      <DineinMenu />
    </>
  );
};

const DineinCartScreen = () => {
  return (
    <>
      <DineinCart />
    </>
  );
};

export function MobileDineinNavigator() {
  const isRTL = checkDirection();
  const navigation = useNavigation() as any;

  return (
    <>
      <Stack.Navigator initialRouteName="TableMenu">
        <Stack.Screen
          name="TableMenu"
          options={{ headerShown: false }}
          component={DineinTableMenuScreen}
        />

        <Stack.Screen
          name="DineinMenuCart"
          options={{
            header: () => (
              <View>
                <CustomHeader />

                <TouchableOpacity
                  style={{
                    marginLeft: 10,
                    paddingVertical: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    alignSelf: "flex-start",
                    backgroundColor: "transparent",
                  }}
                  onPress={() => {
                    navigation.goBack();
                  }}
                >
                  <View
                    style={{
                      transform: [{ rotate: isRTL ? "180deg" : "0deg" }],
                    }}
                  >
                    <ICONS.ArrowLeftIcon />
                  </View>

                  <DefaultText
                    style={{ marginHorizontal: 12 }}
                    fontSize="lg"
                    fontWeight="medium"
                  >
                    {t("Tables")}
                  </DefaultText>
                </TouchableOpacity>

                <SeparatorHorizontalView />
              </View>
            ),
          }}
          component={DineinMenuScreen}
        />

        <Stack.Screen
          name="DineinCart"
          options={{
            header: () => (
              <View>
                <CustomHeader />

                <TouchableOpacity
                  style={{
                    marginLeft: 10,
                    paddingVertical: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    alignSelf: "flex-start",
                    backgroundColor: "transparent",
                  }}
                  onPress={() => {
                    navigation.goBack();
                  }}
                >
                  <View
                    style={{
                      transform: [{ rotate: isRTL ? "180deg" : "0deg" }],
                    }}
                  >
                    <ICONS.ArrowLeftIcon />
                  </View>

                  <DefaultText
                    style={{ marginHorizontal: 12 }}
                    fontSize="lg"
                    fontWeight="medium"
                  >
                    {t("Menu")}
                  </DefaultText>
                </TouchableOpacity>

                <SeparatorHorizontalView />
              </View>
            ),
          }}
          component={DineinCartScreen}
        />
      </Stack.Navigator>
    </>
  );
}
