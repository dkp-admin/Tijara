import React, { useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import DeletedItemsHeader from "./deleted-items-header";
import DeletedItemsRow from "./deleted-items-row";

export default function DeletedItemsList({
  deletedItems,
}: {
  deletedItems: any[];
}) {
  const renderDeletedItemRow = useCallback(({ item, index }: any) => {
    return (
      <DeletedItemsRow
        key={index}
        data={item}
        isLast={deletedItems?.length === index + 1}
      />
    );
  }, []);

  return (
    <View style={{ ...styles.container }}>
      <DeletedItemsHeader />

      <FlatList
        scrollEnabled={false}
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        data={deletedItems}
        renderItem={renderDeletedItemRow}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
