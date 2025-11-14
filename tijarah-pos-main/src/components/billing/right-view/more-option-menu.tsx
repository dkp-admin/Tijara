import React, { useEffect, useRef, useState } from "react";
import { TouchableOpacity } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import { Menu, MenuItem } from "react-native-material-menu";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import cart from "../../../utils/cart";
import ICONS from "../../../utils/icons";
import ItemDivider from "../../action-sheet/row-divider";
import DefaultText from "../../text/Text";

export default function MoreOptionsMenu({
  handleClearItems,
  handleSaveTicket,
  handleNewTicket,
  handleTickets,
}: any) {
  const theme = useTheme();
  const menu = useRef<any>();
  const { hp, twoPaneView } = useResponsive();

  const cartItem = cart.getCartItems();

  return (
    <Menu
      ref={menu}
      style={{
        marginTop: hp("3.75%"),
        borderRadius: 16,
        height: hp("22.5%"),
        justifyContent: "flex-end",
        backgroundColor: theme.colors.white[1000],
      }}
      anchor={
        <TouchableOpacity
          style={{
            paddingVertical: hp("0.75%"),
            paddingLeft: hp("2%"),
            paddingRight: twoPaneView ? hp("2%") : hp("5%"),
          }}
          onPress={() => {
            menu.current.show();
          }}
        >
          <ICONS.MoreIcon />
        </TouchableOpacity>
      }
      onRequestClose={() => {
        menu.current.hide();
      }}
    >
      <MenuItem
        style={{
          height: hp("7.5%"),
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
        onPress={() => {
          if (cartItem?.length > 0) {
            handleClearItems();
            menu.current.hide();
          }
        }}
        disabled={cartItem?.length == 0}
      >
        <DefaultText
          fontSize="lg"
          fontWeight="medium"
          color={
            cartItem?.length == 0
              ? theme.colors.placeholder
              : theme.colors.text.primary
          }
        >
          {t("Clear Items")}
        </DefaultText>
      </MenuItem>

      <ItemDivider
        style={{
          margin: 0,
          borderWidth: 0,
          borderBottomWidth: 1.5,
          borderColor: "#E5E9EC",
        }}
      />

      <MenuItem
        style={{
          height: hp("7.5%"),
        }}
        onPress={() => {
          handleSaveTicket();
          menu.current.hide();
        }}
        disabled={cartItem?.length == 0}
      >
        <DefaultText
          fontSize="lg"
          fontWeight="medium"
          color={
            cartItem?.length == 0
              ? theme.colors.placeholder
              : theme.colors.text.primary
          }
        >
          {t("Save Ticket")}
        </DefaultText>
      </MenuItem>

      <ItemDivider
        style={{
          margin: 0,
          borderWidth: 0,
          borderBottomWidth: 1.5,
          borderColor: "#E5E9EC",
        }}
      />

      <MenuItem
        style={{
          height: hp("7.5%"),
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
        }}
        onPress={() => {
          handleTickets();
          menu.current.hide();
        }}
      >
        <DefaultText fontSize="lg" fontWeight="medium">
          {t("Tickets")}
        </DefaultText>
      </MenuItem>
    </Menu>
  );
}
