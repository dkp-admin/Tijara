import React, { useCallback, useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { t } from "../../../../../../i18n";
import { useTheme } from "../../../../../context/theme-context";
import { useResponsive } from "../../../../../hooks/use-responsiveness";
import NoDataPlaceholder from "../../../../no-data-placeholder/no-data-placeholder";
import ActivityLogsHeader from "./activity-logs-header";
import ActivityLogsRow from "./activity-logs-row";

export default function OrderActivityLogs({
  activityLogs,
}: {
  activityLogs: any[];
}) {
  const theme = useTheme();
  const { hp } = useResponsive();

  const renderDeletedItemRow = useCallback(({ item, index }: any) => {
    return (
      <ActivityLogsRow
        key={index}
        data={item}
        isLast={activityLogs?.length === index + 1}
      />
    );
  }, []);

  const listEmptyComponent = useMemo(() => {
    return (
      <View
        style={{
          borderBottomWidth: 1,
          borderColor: "#E5E9EC",
          paddingBottom: hp("6%"),
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          backgroundColor: theme.colors.dark[50],
        }}
      >
        <NoDataPlaceholder
          title={t("No Activity Logs!")}
          marginTop={hp("6%")}
        />
      </View>
    );
  }, []);

  return (
    <View style={{ ...styles.container }}>
      <ActivityLogsHeader />

      <FlatList
        scrollEnabled={false}
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        data={activityLogs}
        renderItem={renderDeletedItemRow}
        ListEmptyComponent={listEmptyComponent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
