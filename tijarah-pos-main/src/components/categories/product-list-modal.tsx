import React from "react";
import { Modal, StyleSheet, View } from "react-native";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import ActionSheetHeader from "../action-sheet/action-sheet-header";
import ProductList from "../products/products-list";

export default function ProductListModal({
  category,
  collection,
  visible = false,
  handleClose,
}: {
  category?: any;
  collection?: any;
  visible: boolean;
  handleClose?: any;
}) {
  const theme = useTheme();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent={false}
      style={{ height: "100%" }}
    >
      <View
        style={{
          ...styles.container,
          backgroundColor: theme.colors.white[1000],
        }}
      >
        <ActionSheetHeader
          title={t("Product List")}
          handleLeftBtn={() => handleClose()}
        />

        <ProductList
        // isFromCategory={category?.isFromCategory}
        // categoryId={category?.categoryId}
        // isFromCollection={collection?.isFromCollection}
        // collectionId={collection?.collectionId}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    height: "100%",
  },
});
