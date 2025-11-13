import { useIsFocused } from "@react-navigation/core";
import React, { useCallback, useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import repository from "../../../db/repository";
import { useResponsive } from "../../../hooks/use-responsiveness";
import useChannelStore from "../../../store/channel-store";
import cart from "../../../utils/cart";
import MMKVDB from "../../../utils/DB-MMKV";
import SaveTicketModal from "../../tickets/save-ticket-modal";
import ChannelMenuOptions from "../left-view/channel-menu-options";

export default function BillingHeaderNew() {
  const theme = useTheme();
  const isFocused = useIsFocused();
  const [visibleSaveTickets, setVisibleSaveTickets] = useState(false);
  const { hp } = useResponsive();
  const { channel, setChannel, channelList, setChannelList } =
    useChannelStore();
  const [ticketData, setTicketData] = useState(null);

  const handleSaveTicketsAlert = useCallback((payload: string) => {
    MMKVDB.set("selectedOrderType", payload);
    Alert.alert(
      t("Confirmation"),
      `${t("You have items in your cart")}. ${t(
        "Would you like to save them as a ticket or clear the cart?"
      )}`,
      [
        {
          text: t("Save as Ticket"),
          onPress: async () => {
            const ticketDataMM = JSON.parse(MMKVDB.get("currentTicket"));
            setTicketData(ticketDataMM);
            setVisibleSaveTickets(true);
          },
        },
        {
          text: t("Clear Cart"),
          onPress: () => {
            cart.clearCart();
            setChannel(payload);
            MMKVDB.set("orderType", payload);
          },
          style: "destructive",
        },
      ]
    );
  }, []);

  const channelMenuOptions = useMemo(() => {
    return (
      <ChannelMenuOptions
        channel={channel}
        channelList={channelList}
        handleChannel={(channel: string) => {
          if (cart?.getCartItems().length > 0) {
            handleSaveTicketsAlert(channel);
          } else {
            setChannel(channel);
            MMKVDB.set("orderType", channel);
          }
        }}
      />
    );
  }, [channel, channelList]);

  useMemo(() => {
    if (isFocused) {
      repository.billing.findAll().then((billingSetting: any) => {
        const billingSettings = billingSetting[0];

        if (billingSettings?.orderTypesList?.length > 0) {
          const orderTypes = billingSettings.orderTypesList?.filter(
            (type: any) => type.status
          );

          const list = orderTypes?.map((type: any) => {
            return type.name;
          });

          if (!list.includes(channel)) {
            setChannel(list[0]?.toLowerCase());
            MMKVDB.set("orderType", list[0]?.toLowerCase());
            cart.clearCart();
          }

          if (channelList?.length !== list?.length) {
            setChannelList(list);
          }
        }
      });
    }
  }, [isFocused]);

  return (
    <>
      <View
        style={{
          ...styles.tabContainer,
          paddingHorizontal: hp("2%"),
          borderBottomColor: theme.colors.dividerColor.secondary,
        }}
      >
        {channelMenuOptions}
      </View>
      {visibleSaveTickets && (
        <SaveTicketModal
          data={ticketData}
          handleSave={() => {
            setVisibleSaveTickets(false);
            const orderType = MMKVDB.get("selectedOrderType");
            setChannel(orderType);
            MMKVDB.set("orderType", orderType);
          }}
          handleClose={() => setVisibleSaveTickets(false)}
          visible={visibleSaveTickets}
          items={cart?.getCartItems()}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
