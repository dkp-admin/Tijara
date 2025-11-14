import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import ActionSheetHeader from "../../../action-sheet/action-sheet-header";
import TabButton from "../../../buttons/tab-button";
import QuickItemsCollectionList from "./collections-list";
import QuickItemsProductList from "./product-list";

export function QuickItemsModal({
  quickItemsIds,
  visible = false,
  handleClose,
  onAdd = () => {},
}: any) {
  const theme = useTheme();
  const { twoPaneView } = useResponsive();

  const [activeTab, setActiveTab] = useState(0);

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
          backgroundColor: theme.colors.transparentBg,
        }}
      >
        <TouchableOpacity
          style={{ position: "absolute", left: 100000 }}
          onPress={(e) => {
            e.preventDefault();
          }}
        >
          <Text>PRESS</Text>
        </TouchableOpacity>

        <View
          style={{
            ...styles.container,
            marginHorizontal: twoPaneView ? "20%" : "0%",
            backgroundColor: theme.colors.bgColor,
          }}
        >
          <ActionSheetHeader
            title={t("Quick Items")}
            handleLeftBtn={() => handleClose()}
          />

          <TabButton
            tabs={[t("Product"), t("Collection")]}
            activeTab={activeTab}
            onChange={(tab: any) => {
              setActiveTab(tab);
            }}
          />

          {activeTab === 0 ? (
            <QuickItemsProductList
              quickItemsIds={quickItemsIds}
              onAdd={onAdd}
            />
          ) : (
            <QuickItemsCollectionList
              quickItemsIds={quickItemsIds}
              onAdd={onAdd}
            />
          )}
        </View>
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
