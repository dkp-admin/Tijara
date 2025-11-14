import { FlashList } from "@shopify/flash-list";
import React, { useMemo, useState } from "react";
import { Modal, RefreshControl, StyleSheet, View } from "react-native";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import useTicketStore from "../../store/ticket-store";
import { debugLog } from "../../utils/log-patch";
import ActionSheetHeader from "../action-sheet/action-sheet-header";
import CurrencyView from "../modal/currency-view-modal";
import NoDataPlaceholder from "../no-data-placeholder/no-data-placeholder";
import DefaultText from "../text/Text";
import TicketListHeader from "./ticket-list-header";
import TicketRow from "./ticket-row";

export default function TicketsListModal({
  visible = false,
  handleClose,
  handleTicketRowTap,
}: {
  visible: boolean;
  handleClose?: any;
  handleTicketRowTap?: any;
}) {
  const theme = useTheme();
  const { tickets, clearTicket } = useTicketStore();

  const { hp, twoPaneView } = useResponsive();

  const [refreshing] = useState(false);

  const totalAmountArray = useMemo(() => {
    return tickets.map((data: any) => {
      if (data?.items?.length > 0) {
        return data?.items?.reduce(
          (prev: any, cur: any) => prev + Number(cur.total),
          0
        );
      }
    });
  }, [tickets]);

  const totalAmount = useMemo(() => {
    debugLog(
      "Fetch ticket list from store",
      {},
      "cart-billing-screen",
      "fetchTicketListFromStore"
    );
    if (totalAmountArray.length > 0) {
      return totalAmountArray?.reduce(
        (prev: any, cur: any) => prev + Number(cur),
        0
      );
    }
    return 0;
  }, [totalAmountArray]);

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
            title={t("Tickets")}
            handleLeftBtn={() => handleClose()}
          />

          <FlashList
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => {}} />
            }
            onEndReached={() => {}}
            onEndReachedThreshold={0.01}
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
            data={tickets}
            estimatedItemSize={hp("12%")}
            renderItem={({ item, index }: any) => {
              return (
                <TicketRow
                  data={item}
                  index={index}
                  handleTicketRowTap={(data: any) => handleTicketRowTap(data)}
                />
              );
            }}
            ListHeaderComponent={() => {
              return <TicketListHeader />;
            }}
            ListEmptyComponent={() => {
              return (
                <View style={{ marginHorizontal: 16 }}>
                  <NoDataPlaceholder
                    title={t("No Tickets!")}
                    marginTop={hp("30%")}
                  />
                </View>
              );
            }}
            ListFooterComponent={() => <View style={{ height: hp("10%") }} />}
          />

          <View style={{ width: "100%", bottom: 0, position: "absolute" }}>
            <View
              style={{
                height: 1,
                width: "100%",
                backgroundColor: theme.colors.primary[200],
              }}
            />

            <View
              style={{
                paddingVertical: 16,
                paddingHorizontal: 20,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: theme.colors.primary[100],
              }}
            >
              <DefaultText
                style={{ width: "55%" }}
                fontSize="2xl"
                fontWeight="medium"
              >
                {tickets.length + ` ${t("TICKETS")}`}
              </DefaultText>

              <View style={{ width: "45%" }}>
                <CurrencyView
                  amount={totalAmount?.toFixed(2)}
                  symbolFontsize={14}
                />
              </View>
            </View>
          </View>
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
