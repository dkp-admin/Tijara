import React, { useCallback, useState } from "react";
import { Alert, ScrollView, TouchableOpacity, View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import useItems from "../../../hooks/use-items";
import { useResponsive } from "../../../hooks/use-responsiveness";
import ICONS from "../../../utils/icons";
import PromotionsTab from "../../billing/left-view/promotions-tab";
import WalletCustomerModal from "../../billing/right-view/modal/wallet-customer-modal";
import Spacer from "../../spacer";
import DefaultText from "../../text/Text";

import useCartStore from "../../../store/cart-item";
import useChannelStore from "../../../store/channel-store";
import cart from "../../../utils/cart";
import MMKVDB from "../../../utils/DB-MMKV";
import OrderNotesModal from "../../modal/order-notes-modal";
import SaveTicketModal from "../../tickets/save-ticket-modal";
import TicketsListModal from "../../tickets/tickets-list";
import showToast from "../../toast";
import CustomChargesTab from "../left-view/custom-charges-tab";
import DiscountsTab from "../left-view/discounts-tab";
import ClearItemsModalBillingNew from "./billing-new-clear-items-modal";
import CustomAmountModalBillingNew from "./custom-amount-modal";
import useCommonApis from "../../../hooks/useCommonApis";

export default function ActionsTabBillingNew(props: any) {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();
  const { setChannel } = useChannelStore();
  const { setCustomer, setSpecialInstructions } = useCartStore() as any;
  const navigation = props.navigation;
  const [visisbleDiscount, setVisibleDiscount] = useState(false);
  const [visisbleCustomers, setVisibleCustomers] = useState(false);
  const [visisbleCustomCharges, setVisibleCustomCharges] = useState(false);
  const [visibleCustomAmount, setVisibleCustomAmount] = useState(false);
  const [visibleClearItemsModal, setVisibleClearItemsModal] = useState(false);
  const [visibleTicketsModal, setVisibleTicketsModal] = useState(false);
  const [visibleOrderNotesModal, setVisibleOrderNotes] = useState(false);
  const [visibleTickets, setVisibleTickets] = useState(false);
  const [visiblePromotionsTab, setVisiblePromotionsTab] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [ticketIndex, setTicketIndex] = useState(null);
  const { items } = useItems();
  const { billingSettings } = useCommonApis();

  const handleClearItems = useCallback(() => {
    Alert.alert(t("Confirmation"), t("Do you want to clear cart items?"), [
      {
        text: t("No"),
        onPress: () => {},
        style: "destructive",
      },
      {
        text: t("Yes"),
        onPress: async () => {
          cart.clearCart();
          setCustomer({});
          setTicketIndex(null);
          setTicketData(null);
          setSpecialInstructions("");

          if (!twoPaneView) {
            navigation.goBack();
          }
          showToast("success", t("Cart items cleared"));
        },
      },
    ]);
  }, []);

  const actionsData = [
    {
      leftIcon: <ICONS.ClearNewItemsIcon />,
      text: t("Clear new items"),
      disabled: items?.length <= 0,
      path: "clear",
    },
    {
      leftIcon: <ICONS.AddCustomAmtIcon isCustom={false} />,
      text: t("Save Ticket"),
      disabled: items?.length <= 0,
      path: "tickets",
    },
    {
      leftIcon: <ICONS.DineinDiscountsIcon />,
      text: t("Promotions"),
      disabled: items?.length <= 0 || !billingSettings?.promotions,
      path: "promotions",
    },
    {
      leftIcon: <ICONS.AddCustomAmtIcon isCustom={false} />,
      text: t("Tickets"),
      disabled: false,
      path: "tickets-list",
    },

    {
      leftIcon: <ICONS.DineinDiscountsIcon />,
      text: t("Discounts"),
      disabled: items?.length <= 0 || !billingSettings?.discounts,
      path: "discounts",
    },

    {
      leftIcon: <ICONS.ServiceChargesIcon />,
      text: t("Service charges"),
      disabled: items?.length <= 0 || !billingSettings?.customCharges,
      path: "charges",
    },
    {
      leftIcon: <ICONS.AddCustomAmtIcon isCustom={true} />,
      text: t("Add custom amount"),
      disabled: !billingSettings?.keypad,
      path: "customAmount",
    },
    {
      leftIcon: <ICONS.AddCustomAmtIcon isCustom={false} />,
      text: t("Order Notes"),
      disabled: false,
      path: "ordernotes",
    },
  ];

  const handleSaveTicket = useCallback(() => {
    setCustomer({});
    setTicketData(null);
    setTicketIndex(null);
    setVisibleTicketsModal(false);
  }, []);

  return (
    <View style={{ flex: 1, height: "100%", paddingHorizontal: hp("2%") }}>
      <ScrollView
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flexWrap: "wrap",
            flexDirection: twoPaneView ? "row" : "column",
          }}
        >
          {actionsData.map((data, index) => {
            return (
              <View
                key={index}
                style={{
                  marginTop: hp("1.75%"),
                  flexDirection: "row",
                  width: twoPaneView ? "50%" : "100%",
                }}
              >
                <TouchableOpacity
                  style={{
                    flex: 1,
                    borderRadius: 8,
                    padding: hp("2%"),
                    flexDirection: "row",
                    justifyContent: "space-between",
                    opacity: data.disabled ? 0.3 : 1,
                    backgroundColor: theme.colors.white[1000],
                    marginRight: twoPaneView && index % 2 === 0 ? 12 : 0,
                  }}
                  onPress={() => {
                    if (data.path === "clear") {
                      // setVisibleClearItemsModal(true);
                      handleClearItems();
                    } else if (data.path === "tickets") {
                      setVisibleTicketsModal(true);
                    } else if (data.path === "tickets-list") {
                      setVisibleTickets(true);
                    } else if (data.path === "discounts") {
                      setVisibleDiscount(true);
                    } else if (data.path === "charges") {
                      setVisibleCustomCharges(true);
                    } else if (data.path === "customAmount") {
                      setVisibleCustomAmount(true);
                    } else if (data.path === "promotions") {
                      setVisiblePromotionsTab(true);
                    } else if (data.path === "ordernotes") {
                      setVisibleOrderNotes(true);
                    }
                  }}
                  disabled={data.disabled}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {data.leftIcon}

                    <DefaultText
                      style={{ marginLeft: 12 }}
                      fontSize="md"
                      fontWeight="medium"
                    >
                      {data.text}
                    </DefaultText>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <Spacer space={hp("10%")} />
      </ScrollView>

      {visisbleDiscount && (
        <DiscountsTab
          visible={visisbleDiscount}
          handleClose={() => setVisibleDiscount(false)}
        />
      )}

      {visisbleCustomers && (
        <WalletCustomerModal
          visible={visisbleCustomers}
          handleSelectedCustomer={(customer: any) => {
            setCustomer(customer);
            setVisibleCustomers(false);
          }}
          handleClose={() => {
            setVisibleCustomers(false);
          }}
        />
      )}

      {visisbleCustomCharges && (
        <CustomChargesTab
          visible={visisbleCustomCharges}
          handleClose={() => setVisibleCustomCharges(false)}
        />
      )}

      {visibleCustomAmount && (
        <CustomAmountModalBillingNew
          visible={visibleCustomAmount}
          handleClose={() => setVisibleCustomAmount(false)}
        />
      )}

      {visiblePromotionsTab && (
        <PromotionsTab
          visible={visiblePromotionsTab}
          handleClose={() => setVisiblePromotionsTab(false)}
        />
      )}

      {visibleTicketsModal && (
        <SaveTicketModal
          data={ticketData}
          items={items}
          visible={visibleTicketsModal}
          handleSave={handleSaveTicket}
          handleClose={() => setVisibleTicketsModal(false)}
        />
      )}
      {visibleOrderNotesModal && (
        <OrderNotesModal
          visible={visibleOrderNotesModal}
          handleClose={() => setVisibleOrderNotes(false)}
        />
      )}

      {visibleTickets && (
        <TicketsListModal
          visible={visibleTickets}
          handleClose={() => setVisibleTickets(false)}
          handleTicketRowTap={(data: any) => {
            setTicketData(data);
            setChannel(data.type);
            setTicketIndex(data?.id);
            setVisibleTickets(false);
            props.jumpTo("checkout");
            setCustomer(data?.customer || {});
            MMKVDB.set("currentTicket", JSON.stringify(data));
          }}
        />
      )}

      {visibleClearItemsModal && (
        <ClearItemsModalBillingNew
          visible={visibleClearItemsModal}
          handleClose={() => setVisibleClearItemsModal(false)}
        ></ClearItemsModalBillingNew>
      )}
    </View>
  );
}
