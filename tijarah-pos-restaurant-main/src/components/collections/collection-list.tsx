import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  StyleSheet,
  View,
} from "react-native";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import ProductListModal from "../categories/product-list-modal";
import NoDataPlaceholder from "../no-data-placeholder/no-data-placeholder";
import AddEditCollectionModal from "./add-collection-modal";
import CollectionRow from "./collection-row";

const CollectionList = ({
  loadMore,
  collectionsList,
  selectedCollection,
  setSelectedCollection,
  isFetchingNextPage,
}: any) => {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();

  const [visible, setVisible] = useState(false);
  const [visibleAddCollection, setVisibleAddCollection] = useState(false);

  return (
    <View style={{ ...styles.container }}>
      <FlatList
        onEndReached={loadMore}
        onEndReachedThreshold={0.01}
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={Keyboard.dismiss}
        data={collectionsList}
        renderItem={({ item }) => {
          return (
            <CollectionRow
              data={item}
              selectedCollection={selectedCollection}
              handleSelected={(val: number) => {
                if (twoPaneView) {
                  setSelectedCollection(val);
                } else {
                  setVisible(true);
                }
              }}
            />
          );
        }}
        ListEmptyComponent={() => {
          return (
            <View style={{ marginHorizontal: 16 }}>
              <NoDataPlaceholder
                title={t("No Collections!")}
                marginTop={hp("25%")}
                showBtn
                btnTitle={t("Add a collection")}
                handleOnPress={() => {
                  setVisibleAddCollection(true);
                }}
              />
            </View>
          );
        }}
        ListFooterComponent={() => (
          <View style={{ height: hp("10%"), marginBottom: 16 }}>
            {isFetchingNextPage && (
              <ActivityIndicator
                size={"small"}
                color={theme.colors.primary[1000]}
              />
            )}
          </View>
        )}
      />

      {visible && (
        <ProductListModal
          collection={{
            isFromCollection: true,
            collectionId: selectedCollection,
          }}
          visible={visible}
          handleClose={() => setVisible(false)}
        />
      )}

      {visibleAddCollection && (
        <AddEditCollectionModal
          visible={visibleAddCollection}
          handleClose={() => setVisibleAddCollection(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default CollectionList;
