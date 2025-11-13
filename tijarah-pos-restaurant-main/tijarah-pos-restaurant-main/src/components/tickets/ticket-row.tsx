import { formatDistanceToNow } from "date-fns";
import React, { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
// import useItems from "../../hooks/use-items";
import { useResponsive } from "../../hooks/use-responsiveness";
// import useCartStore from "../../store/cart-item";
import useTicketStore from "../../store/ticket-store";
// import { autoApplyCustomCharges } from "../../utils/auto-apply-custom-charge";
import cart from "../../utils/cart";
// import { getItemSellingPrice } from "../../utils/get-price";
import { ChannelsName } from "../../utils/constants";
import ICONS from "../../utils/icons";
import { showAlert } from "../../utils/showAlert";
import SeparatorHorizontalView from "../common/separator-horizontal-view";
import DefaultText from "../text/Text";
import useCartStore from "../../store/cart-item";
import { useCurrency } from "../../store/get-currency";

export default function TicketRow({ data, index, handleTicketRowTap }: any) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();
  const { removeSingleTicket } = useTicketStore() as any;
  const { setCustomer } = useCartStore();
  const { currency } = useCurrency();

  const totalTicketAmount = useMemo(() => {
    if (data?.items?.length > 0) {
      return data?.items?.reduce(
        (prev: any, cur: any) => prev + Number(cur.total),
        0
      );
    }
    return 0;
  }, [data]);

  const addTicketToCart = () => {
    if (cart.cartItems.length === 0) {
      cart.addItemsToCart(data.items, (items: any) => {
        EventRegister.emit("itemAdded", items);
      });

      return;
    }

    if (data?.customer) {
      setCustomer(data?.customer);
    }

    data.items.forEach((ticketItem: any) => {
      const idx = cart.cartItems?.findIndex(
        (item: any) => ticketItem?.sellingPrice && item.sku === ticketItem.sku
      );

      const isSpecialItem =
        ticketItem.name.en === "Open Item" ||
        ticketItem?.unit !== "perItem" ||
        ticketItem?.isOpenPrice;

      if (idx !== -1 && !isSpecialItem) {
        const updatedQty = cart.cartItems[idx].qty + ticketItem.qty;
        const updatedTotal =
          (cart.cartItems[idx].sellingPrice + cart.cartItems[idx].vatAmount) *
          updatedQty;

        cart.updateCartItem(
          idx,
          {
            ...cart.cartItems[idx],
            qty: updatedQty,
            total: updatedTotal,
          },
          (updatedItems: any) => {
            EventRegister.emit("itemUpdated", updatedItems);
          }
        );

        const total =
          (cart.cartItems[idx].sellingPrice + cart.cartItems[idx].vatAmount) *
          ticketItem.qty;

        // autoApplyCustomCharges(
        //   channel,
        //   total + totalAmount - totalCharges + totalCharges,
        //   getItemSellingPrice(total, ticketItem.vat) + subTotalWithoutDiscount
        // );
      } else {
        cart.addToCart(ticketItem, (items: any) => {
          EventRegister.emit("itemAdded", items);
        });
        // autoApplyCustomCharges(
        //   channel,
        //   ticketItem.total + totalAmount - totalCharges + totalCharges,
        //   getItemSellingPrice(ticketItem.total, ticketItem.vat) +
        //     subTotalWithoutDiscount
        // );
      }
    });
  };

  const showDeleteTicketAlert = async () => {
    await showAlert({
      confirmation: t("Delete Ticket?"),
      alertMsg: t("Are you sure you want to delete this ticket?"),
      btnText1: t("No"),
      btnText2: t("Yes"),
      onPressBtn1: () => {},
      onPressBtn2: () => {
        removeSingleTicket(index);
      },
    });
  };

  return (
    <TouchableOpacity
      onPress={() => {
        addTicketToCart();
        handleTicketRowTap({ ...data, id: index });
      }}
    >
      <View
        style={{
          paddingVertical: hp("1.5%"),
          paddingHorizontal: hp("2%"),
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.colors.white[1000],
        }}
      >
        <DefaultText style={{ width: "30%" }} fontSize="lg" fontWeight="normal">
          {data.name}
        </DefaultText>

        <DefaultText style={{ width: "20%" }} fontSize="lg" fontWeight="normal">
          {ChannelsName[data.type] || data.type}
        </DefaultText>

        <DefaultText style={{ width: "20%" }} fontSize="lg" fontWeight="normal">
          {`${currency} ${totalTicketAmount.toFixed(2)}`}
        </DefaultText>

        <DefaultText
          style={{ width: "25%", paddingRight: wp("1%"), textAlign: "right" }}
          fontSize="lg"
          fontWeight="normal"
        >
          {formatDistanceToNow(new Date(data.createdAt), { addSuffix: true })}
        </DefaultText>

        <TouchableOpacity
          style={{
            width: "5%",
            alignItems: "flex-end",
            padding: 10,
          }}
          onPress={() => showDeleteTicketAlert()}
        >
          <ICONS.CloseClearIcon color={theme.colors.red.default} />
        </TouchableOpacity>
      </View>

      <SeparatorHorizontalView />
    </TouchableOpacity>
  );
}
