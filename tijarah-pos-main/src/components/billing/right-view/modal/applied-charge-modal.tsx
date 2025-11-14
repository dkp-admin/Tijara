import { FlashList } from "@shopify/flash-list";
import React from "react";
import { Modal, StyleSheet, View } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import cart from "../../../../utils/cart";
import { debugLog } from "../../../../utils/log-patch";
import ActionSheetHeader from "../../../action-sheet/action-sheet-header";
import NoDataPlaceholder from "../../../no-data-placeholder/no-data-placeholder";
import AppliedChargeRow from "../row/applied-charge-row";

export default function AppliedChargeModal({
  data,
  visible = false,
  handleClose,
}: {
  data: any;
  visible: boolean;
  handleClose?: any;
}) {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();

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
        <View
          style={{
            ...styles.container,
            marginHorizontal: twoPaneView ? "20%" : "0%",
            backgroundColor: theme.colors.bgColor,
          }}
        >
          <ActionSheetHeader
            title={t("Applied Charges")}
            handleLeftBtn={() => handleClose()}
          />

          <FlashList
            onEndReached={() => {}}
            onEndReachedThreshold={0.01}
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
            data={data}
            estimatedItemSize={hp("12%")}
            renderItem={({ item, index }) => {
              return (
                <AppliedChargeRow
                  key={index}
                  data={item}
                  handleOnRemove={(data: any) => {
                    cart.removeCharges(index, (charges: any) => {
                      debugLog(
                        "Charge removed from cart",
                        data,
                        "cart-billing-screen",
                        "handleRemoveChargeFunction"
                      );
                      EventRegister.emit("chargeRemoved", charges);
                    });
                  }}
                />
              );
            }}
            ListEmptyComponent={() => {
              return (
                <View style={{ marginHorizontal: 16 }}>
                  <NoDataPlaceholder
                    title={t("No Applied Charges!")}
                    marginTop={hp("30%")}
                  />
                </View>
              );
            }}
            ListFooterComponent={() => <View style={{ height: hp("10%") }} />}
          />
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
