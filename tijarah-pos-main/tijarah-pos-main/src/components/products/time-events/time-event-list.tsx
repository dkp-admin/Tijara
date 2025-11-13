import React, { useCallback, useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import TimeEventHeader from "./time-event-header";
import TimeEventRow from "./time-event-row";

export default function TimeEventList({ timeEvents }: any) {
  const theme = useTheme();
  const { hp } = useResponsive();

  const renderTimeEventRow = useCallback(({ item, index }: any) => {
    return <TimeEventRow key={index} data={item} />;
  }, []);

  const listEmptyComponent = useMemo(() => {
    return (
      <View
        style={{
          paddingBottom: hp("6%"),
          backgroundColor: theme.colors.white[1000],
        }}
      >
        <NoDataPlaceholder title={t("No Time Events!")} marginTop={hp("6%")} />
      </View>
    );
  }, []);

  return (
    <View style={{ ...styles.container }}>
      <TimeEventHeader />

      <FlatList
        scrollEnabled={false}
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        data={timeEvents}
        renderItem={renderTimeEventRow}
        ListEmptyComponent={listEmptyComponent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
