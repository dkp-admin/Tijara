import React, { useRef } from "react";
import { TouchableOpacity } from "react-native";
import { Menu, MenuItem } from "react-native-material-menu";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import ICONS from "../../../utils/icons";
import ItemDivider from "../../action-sheet/row-divider";
import DefaultText from "../../text/Text";

export default function CatalogueOptionsMenu({
  handleDiscount,
  handleCustomCharges,
  billingSettings,
  handlePromotions,
  handleKeypad,
}: {
  handleDiscount: any;
  handleCustomCharges: any;
  billingSettings: any;
  handlePromotions: any;
  handleKeypad: any;
}) {
  const theme = useTheme();
  const menu = useRef<any>();
  const { hp, twoPaneView } = useResponsive();

  return (
    <Menu
      ref={menu}
      style={{
        borderRadius: 16,
        marginTop: hp("3.75%"),
        justifyContent: "flex-end",
        height: twoPaneView ? hp("22.5%") : hp("30%"),
        backgroundColor: theme.colors.white[1000],
      }}
      anchor={
        <TouchableOpacity
          style={{
            paddingLeft: hp("2%"),
            paddingVertical: hp("0.75%"),
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
      {!twoPaneView && (
        <>
          <MenuItem
            style={{
              height: hp("7.5%"),
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            }}
            onPress={() => {
              menu.current.hide();
              handleKeypad();
            }}
            disabled={!billingSettings?.keypad}
          >
            <DefaultText
              fontSize="lg"
              fontWeight="medium"
              color={
                billingSettings?.keypad
                  ? theme.colors.text.primary
                  : theme.colors.placeholder
              }
            >
              {t("Keypad")}
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
        </>
      )}

      <MenuItem
        style={{
          height: hp("7.5%"),
          borderTopLeftRadius: twoPaneView ? 16 : 0,
          borderTopRightRadius: twoPaneView ? 16 : 0,
        }}
        onPress={() => {
          menu.current.hide();
          handlePromotions();
        }}
        disabled={!billingSettings?.promotions}
      >
        <DefaultText
          fontSize="lg"
          fontWeight="medium"
          color={
            billingSettings?.promotions
              ? theme.colors.text.primary
              : theme.colors.placeholder
          }
        >
          {t("Promotions")}
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
          menu.current.hide();
          handleDiscount();
        }}
        disabled={!billingSettings?.discounts}
      >
        <DefaultText
          fontSize="lg"
          fontWeight="medium"
          color={
            billingSettings?.discounts
              ? theme.colors.text.primary
              : theme.colors.placeholder
          }
        >
          {t("Discounts")}
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
          menu.current.hide();
          handleCustomCharges();
        }}
        disabled={!billingSettings?.customCharges}
      >
        <DefaultText
          fontSize="lg"
          fontWeight="medium"
          color={
            billingSettings?.customCharges
              ? theme.colors.text.primary
              : theme.colors.placeholder
          }
        >
          {t("Custom Charges")}
        </DefaultText>
      </MenuItem>
    </Menu>
  );
}
