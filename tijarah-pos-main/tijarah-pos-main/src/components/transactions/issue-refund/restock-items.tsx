import { FlashList } from "@shopify/flash-list";
import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import ActionSheetHeader from "../../action-sheet/action-sheet-header";
import { PrimaryButton } from "../../buttons/primary-button";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import Spacer from "../../spacer";
import DefaultText from "../../text/Text";
import Label from "../../text/label";
import showToast from "../../toast";
import IssueRefundReasonModal from "./issue-refund-reason";
import ItemHeader from "./item-header";
import ItemRow from "./item-row";
import { debugLog } from "../../../utils/log-patch";

export default function RestockItemsModal({
  data,
  visible = false,
  handleClose,
  handleRestockItems,
}: {
  data: any;
  visible: boolean;
  handleClose: any;
  handleRestockItems: any;
}) {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();

  const [itemList, setItemList] = useState<any>([]);
  const [restockData, setRestockData] = useState<any>({});
  const [openIssueReason, setOpenIssueReason] = useState(false);

  const handleSelection = (selected: boolean) => {
    const data = itemList.map((item: any) => {
      return { ...item, selected: selected };
    });

    setItemList(data);
  };

  const handleSingleSelection = (dataObj: any, selected: boolean) => {
    const data = itemList.map((item: any) => {
      if (dataObj.id == item.id) {
        return { ...item, selected: selected };
      } else {
        return item;
      }
    });

    setItemList(data);
  };

  useEffect(() => {
    if (visible) {
      const itemsData = data.selectedItems.filter((item: any) => item.selected);

      setItemList(itemsData || []);
    }
  }, [visible]);

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
          backgroundColor: "transparent",
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
            isClose={false}
            title={t("Restock Items")}
            handleLeftBtn={() => handleClose()}
          />

          <View
            style={{
              minHeight: "80%",
              marginTop: hp("1%"),
              paddingVertical: hp("3%"),
              paddingHorizontal: hp("2.5%"),
            }}
          >
            <FlashList
              onEndReached={() => {}}
              onEndReachedThreshold={0.01}
              alwaysBounceVertical={false}
              showsVerticalScrollIndicator={false}
              data={itemList}
              estimatedItemSize={hp("15%")}
              renderItem={({ item, index }) => {
                return (
                  <ItemRow
                    key={index}
                    data={item}
                    isLast={index == itemList.length}
                    handleSingleSelection={(data: any, selected: boolean) => {
                      handleSingleSelection(data, selected);
                    }}
                  />
                );
              }}
              ListHeaderComponent={() => {
                const selectedItem = itemList.filter(
                  (item: any) => item.selected
                )?.length;

                return (
                  <>
                    <DefaultText
                      fontSize="lg"
                      fontWeight="medium"
                      color="otherGrey.100"
                    >
                      {`#${data.order.orderNum}`}
                    </DefaultText>

                    <Spacer space={hp("2.5%")} />

                    <DefaultText fontSize="xl" fontWeight="medium">
                      {t("Select Items to Restock")}
                    </DefaultText>

                    <DefaultText
                      style={{ marginTop: 8 }}
                      fontSize="lg"
                      color={theme.colors.otherGrey[100]}
                    >
                      {t("Items will be restocked in their respective batches")}
                    </DefaultText>

                    <Spacer space={hp("5.5%")} />

                    <Label>{t("ITEMS")}</Label>

                    <ItemHeader
                      selected={selectedItem == itemList.length}
                      handleSelection={(selected: boolean) =>
                        handleSelection(selected)
                      }
                    />
                  </>
                );
              }}
              ListEmptyComponent={() => {
                return (
                  <View style={{ marginHorizontal: 16 }}>
                    <NoDataPlaceholder
                      title={t("No Items!")}
                      marginTop={hp("30%")}
                    />
                  </View>
                );
              }}
              ListFooterComponent={() => <View style={{ height: hp("5%") }} />}
            />
          </View>

          <View
            style={{
              ...styles.footer,
              paddingVertical: hp("3.5%"),
              paddingHorizontal: hp("2%"),
              backgroundColor: "#FFFFFF",
            }}
          >
            <View style={{ flex: 1 }}>
              <PrimaryButton
                reverse
                style={{ paddingVertical: hp("2%") }}
                textStyle={{ fontSize: 18 }}
                title={t("Skip")}
                onPress={() => {
                  setRestockData({
                    order: data.order,
                    restockItems: [],
                    selectedItems: data.selectedItems,
                    amount: data.amount,
                    vat: data.vat,
                    discountAmount: data.discountAmount,
                    vatWithoutDiscount: data.vatWithoutDiscount,
                  });
                  setOpenIssueReason(true);
                }}
              />
            </View>

            <Spacer space={hp("3%")} />

            <View style={{ flex: 1 }}>
              <PrimaryButton
                style={{ paddingVertical: hp("2%") }}
                textStyle={{ fontSize: 18 }}
                title={t("Restock")}
                onPress={() => {
                  const selectedItem = itemList.filter(
                    (item: any) => item.selected
                  );

                  if (selectedItem.length === 0) {
                    showToast("error", t("Please Select Item"));
                    return;
                  }

                  const restockItems = itemList.filter(
                    (item: any) => item.selected && item.tracking
                  );

                  debugLog(
                    "Items selected for restock",
                    restockItems,
                    "orders-refund-screen",
                    "handleRestockFunction"
                  );

                  setRestockData({
                    order: data.order,
                    restockItems: restockItems,
                    selectedItems: data.selectedItems,
                    amount: data.amount,
                    vat: data.vat,
                    discountAmount: data.discountAmount,
                    vatWithoutDiscount: data.vatWithoutDiscount,
                  });
                  setOpenIssueReason(true);
                }}
                disabled={itemList.length === 0}
              />
            </View>
          </View>
        </View>
      </View>

      {openIssueReason && (
        <IssueRefundReasonModal
          data={restockData}
          visible={openIssueReason}
          handleClose={() => setOpenIssueReason(false)}
          handleIssueRefund={(data: any) => {
            handleRestockItems(data);
            setOpenIssueReason(false);
          }}
        />
      )}

      <Toast />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    height: "100%",
  },
  footer: {
    flex: 1,
    bottom: 0,
    margin: 0,
    width: "100%",
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    elevation: 24,
    shadowRadius: 24,
    shadowOpacity: 24,
    shadowColor: "#15141F",
    shadowOffset: { width: 16, height: 16 },
  },
});
