import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Modal, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import { repo } from "../../../../utils/createDatabaseConnection";
import dineinCart from "../../../../utils/dinein-cart";
import { debugLog } from "../../../../utils/log-patch";
import ActionSheetHeader from "../../../action-sheet/action-sheet-header";
import NoDataPlaceholder from "../../../no-data-placeholder/no-data-placeholder";
import ReprintTicketHeader from "./reprint-ticket-header";
import ReprintTicketRow from "./reprint-ticket-row";

export default function ReprintTicketModal({
  visible,
  handleClose,
}: {
  visible: boolean;
  handleClose: any;
}) {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();
  const [kitchenMngt, setKitchenMngt] = useState<any[]>([]);
  const [kotData, setKotData] = useState<any[]>([]);

  useEffect(() => {
    repo.kitchenManagement
      .find({
        where: { status: "active" },
      })
      .then((data) => {
        debugLog(
          "Kitchen management fetched from db",
          {},
          "kitchen-management-selection",
          "fetchKitchenManagement"
        );
        setKitchenMngt(data);
      });
  }, []);

  const listHeaderComponent = useMemo(() => <ReprintTicketHeader />, []);

  const listFooterComponent = useMemo(
    () => <View style={{ height: hp("10%") }} />,
    []
  );

  const listEmptyComponent = useMemo(
    () => (
      <View style={{ marginHorizontal: 16 }}>
        <NoDataPlaceholder title={t("No Tickets!")} marginTop={hp("30%")} />
      </View>
    ),
    []
  );

  const renderTicket = useCallback(({ item, index }: any) => {
    return <ReprintTicketRow data={item} index={index} />;
  }, []);

  interface Item {
    id: number;
    name: string;
    sentToKotAt: string;
    // Add other properties as needed
  }

  interface GroupedObject {
    data: Item[];
    kotNumber: number;

    sentToKotAt: string;
  }

  function groupItemsByKotTime(items: Item[]): GroupedObject[] {
    // Sort items by sentToKotAt
    const sortedItems = [...items].sort((a, b) => {
      const dateA = new Date(a.sentToKotAt);
      const dateB = new Date(b.sentToKotAt);
      return (
        Math.floor(dateA.getTime() / 1000) - Math.floor(dateB.getTime() / 1000)
      );
    });

    const groupedObjects: GroupedObject[] = [];
    let currentGroup: GroupedObject | null = null;

    sortedItems.forEach((item) => {
      if (
        !currentGroup ||
        !isWithinTimeWindow(item.sentToKotAt, currentGroup.sentToKotAt)
      ) {
        // Start a new group
        if (currentGroup) {
          groupedObjects.push(currentGroup);
        }
        currentGroup = {
          data: [item],
          kotNumber: groupedObjects.length + 1,
          sentToKotAt: item.sentToKotAt,
        };
      } else {
        // Add to existing group
        currentGroup.data.push(item);
      }
    });

    // Add the last group if it exists
    if (currentGroup) {
      groupedObjects.push(currentGroup);
    }

    return groupedObjects;
  }

  function isWithinTimeWindow(time1: string, time2: string): boolean {
    const date1 = new Date(time1);
    const date2 = new Date(time2);
    const differenceInSeconds = Math.abs(
      Math.floor(date1.getTime() / 1000) - Math.floor(date2.getTime() / 1000)
    );

    // Define your time window here (e.g., 5 seconds)
    const timeWindowSeconds = 5;

    return differenceInSeconds <= timeWindowSeconds;
  }

  useEffect(() => {
    // if (kitchenMngt?.length > 0) {
    const data = [...(dineinCart?.getCartItems() || [])]?.filter(
      (item: any) => item?.sentToKot === true
    );

    const groupedObjects = groupItemsByKotTime(data);

    setKotData(groupedObjects);
    // }
  }, [kitchenMngt]);

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
            title={t("Reprint Ticket")}
            handleLeftBtn={() => {
              handleClose();
            }}
            // rightBtnText={t("Print Receipt")}
            // handleRightBtn={() => {
            //   if (!isPrinterConnected) {
            //     return showToast("info", t("Printer not configured"));
            //   }
            // }}
            permission
          />

          <FlatList
            onEndReached={() => {}}
            onEndReachedThreshold={0.01}
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
            data={kotData}
            renderItem={renderTicket}
            ListHeaderComponent={listHeaderComponent}
            ListEmptyComponent={listEmptyComponent}
            ListFooterComponent={listFooterComponent}
          />
        </View>
      </View>

      <Toast />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { overflow: "hidden", height: "100%" },
});
