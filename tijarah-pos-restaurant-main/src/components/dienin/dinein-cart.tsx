import { useNavigation } from "@react-navigation/core";
import React, { useEffect, useMemo, useState } from "react";
import {
  GestureResponderEvent,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SceneMap, TabView } from "react-native-tab-view";
import { t } from "../../../i18n";
import DefaultText from "../../components/text/Text";
import { useTheme } from "../../context/theme-context";
import useItemsDineIn from "../../hooks/use-items-dinein";
import { useResponsive } from "../../hooks/use-responsiveness";
import useDineinCartStore from "../../store/dinein-cart-store";
import MMKVDB from "../../utils/DB-MMKV";
import ActionsTab from "./dinein-cart/actions-tab";
import CheckoutTab from "./dinein-cart/checkout-tab";
import { EventRegister } from "react-native-event-listeners";

const renderScene = SceneMap({
  checkout: CheckoutTab,
  actions: ActionsTab,
});

export default function DineinCart() {
  const theme = useTheme();
  const { hp } = useResponsive();
  const { itemRowClick, setItemRowClick } = useDineinCartStore();
  const navigation = useNavigation() as any;
  const { items } = useItemsDineIn();
  const tData = MMKVDB.get("activeTableDineIn");
  const [tableData, setTableData] = useState(tData || {});

  const [index, setIndex] = React.useState(0);

  const routes = useMemo(() => {
    return [
      { key: "checkout", title: t("Checkout") },
      { key: "actions", title: t("Actions") },
    ];
  }, []);

  useEffect(() => {
    EventRegister.addEventListener("tableUpdated", async (data) => {
      setTableData(data);
    });

    return () => {
      EventRegister.removeEventListener("tableUpdated");
    };
  }, []);

  const transformedTabs = useMemo(() => {
    return routes.map((route, idx) => {
      return (
        <TouchableOpacity
          key={idx}
          style={{
            paddingVertical: hp("1.25%"),
            marginRight: hp("2.5%"),
            borderBottomColor: theme.colors.primary[1000],
            borderBottomWidth: index == idx ? 2 : 0,
          }}
          onPress={(event: GestureResponderEvent) => {
            if (route.key === "actions") {
              const tableData = MMKVDB.get("activeTableDineIn");
              EventRegister.emit("tableUpdated", tableData);
            }

            if (event.nativeEvent.changedTouches) setIndex(idx);
          }}
        >
          <View pointerEvents="none">
            <DefaultText
              style={{ lineHeight: Platform.OS == "android" ? 20 : 0 }}
              fontSize="md"
              fontWeight={index == idx ? "medium" : "normal"}
              color={index == idx ? "primary.1000" : "otherGrey.200"}
            >
              {route.title}
            </DefaultText>
          </View>
        </TouchableOpacity>
      );
    });
  }, [index, routes]);

  useEffect(() => {
    setItemRowClick(false);
  }, []);

  return (
    <View style={{ flex: 1, paddingVertical: hp("1.5%") }}>
      <View
        style={{
          borderBottomWidth: 1,
          paddingBottom: hp("1.1%"),
          paddingHorizontal: hp("2%"),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottomColor: theme.colors.dividerColor.secondary,
        }}
      >
        <DefaultText fontSize="2xl" fontWeight="medium">
          {tableData?.label}
        </DefaultText>

        <TouchableOpacity
          style={{
            borderRadius: 5,
            paddingVertical: hp("0.75%"),
            paddingHorizontal: hp("2%"),
            backgroundColor:
              items?.length > 0 ? theme.colors.primary[1000] : "gray",
          }}
          disabled={items?.length <= 0}
          onPress={() => {
            if (itemRowClick) {
              const updatedItems = items;

              updatedItems?.forEach(
                (item: any, index: number) => (items[index].selected = false)
              );

              setItemRowClick(false);
            }

            if (!itemRowClick) {
              navigation.navigate("MainNavigator", {
                path: "DineinHome",
              });
            }
          }}
        >
          <DefaultText color="white.1000">
            {itemRowClick ? t("Done") : t("Save")}
          </DefaultText>
        </TouchableOpacity>
      </View>

      <TabView
        renderTabBar={({ jumpTo }) => (
          <View
            style={{
              ...styles.tabContainer,
              paddingHorizontal: hp("2%"),
              borderBottomColor: theme.colors.dividerColor.secondary,
            }}
          >
            {transformedTabs}
          </View>
        )}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    borderBottomWidth: 1,
    flexDirection: "row",
  },
});
