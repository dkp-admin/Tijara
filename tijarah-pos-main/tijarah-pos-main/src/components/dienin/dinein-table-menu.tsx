import React, { useMemo } from "react";
import {
  GestureResponderEvent,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SceneMap, TabView } from "react-native-tab-view";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import { debugLog } from "../../utils/log-patch";
import DefaultText from "../text/Text";
import TableTab from "./dinein-table-menu/table-tab";

const renderScene = SceneMap({
  table: TableTab,
});

export default function DineinTableMenu() {
  const theme = useTheme();

  const { hp } = useResponsive();

  const [index, setIndex] = React.useState(0);

  const routes = useMemo(() => {
    return [{ key: "table", title: t("Tables") }];
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
            debugLog(
              route.title + " dinein tab",
              route,
              "dinein-screen",
              "tabOnPress"
            );
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

  return (
    <>
      <View style={{ flex: 1, height: "100%" }}>
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
    </>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    borderBottomWidth: 1,
    flexDirection: "row",
  },
});
