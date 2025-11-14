import { useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { TouchableOpacity, View } from "react-native";
import { t } from "../../i18n";
import CustomHeader from "../components/common/custom-header";
import SeparatorHorizontalView from "../components/common/separator-horizontal-view";
import DefaultText from "../components/text/Text";
import { checkDirection } from "../hooks/check-direction";
import DineinHome from "../screens/dinein/dinein";
import DineinMenuCart from "../screens/dinein/dinein-menu-cart";
import ICONS from "../utils/icons";

export type DineinStackParamList = {
  DineinHome: any;
  DineinMenuCart: any;
};

const Stack = createStackNavigator<DineinStackParamList>();

export function DineinNavigator() {
  const isRTL = checkDirection();
  const navigation = useNavigation() as any;

  return (
    <Stack.Navigator initialRouteName="DineinHome">
      <Stack.Screen
        name="DineinHome"
        options={{ headerShown: false }}
        component={DineinHome}
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
        component={DineinMenuCart}
      />
    </Stack.Navigator>
  );
}
