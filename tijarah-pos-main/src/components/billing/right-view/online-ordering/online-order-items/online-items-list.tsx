import React, { useCallback, useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { t } from "../../../../../../i18n";
import { useTheme } from "../../../../../context/theme-context";
import { useResponsive } from "../../../../../hooks/use-responsiveness";
import NoDataPlaceholder from "../../../../no-data-placeholder/no-data-placeholder";
import OnlineOrderItemsRow from "./online-items-row";
import OnlineOrderItemsHeader from "./order-items-header";

export default function OnlineOrderItemsList({
  items,
  editIndex,
  deleteIndex,
  handleEdit,
  handleDelete,
  handleSave,
  disabled,
  loading,
}: {
  items: any[];
  editIndex: number;
  deleteIndex: number;
  handleEdit: any;
  handleDelete: any;
  handleSave: any;
  disabled: boolean;
  loading: boolean;
}) {
  const theme = useTheme();
  const { hp } = useResponsive();

  const renderItemsRow = useCallback(
    ({ item, index }: any) => {
      return (
        <OnlineOrderItemsRow
          key={index}
          data={item}
          index={index}
          editIndex={editIndex}
          deleteIndex={deleteIndex}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleSave={handleSave}
          disabled={disabled}
          loading={loading}
          isLast={items?.length === index + 1}
        />
      );
    },
    [editIndex, deleteIndex, disabled, loading]
  );

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
        <NoDataPlaceholder title={t("No Items!")} marginTop={hp("6%")} />
      </View>
    );
  }, []);

  return (
    <View
      style={{
        ...styles.container,
        marginTop: hp("2.5%"),
        paddingHorizontal: hp("2%"),
      }}
    >
      <OnlineOrderItemsHeader />

      <FlatList
        scrollEnabled={false}
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        data={items}
        renderItem={renderItemsRow}
        ListEmptyComponent={listEmptyComponent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
