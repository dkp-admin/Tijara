import React, { useContext, useRef } from "react";
import { TouchableOpacity } from "react-native";
import { Menu, MenuItem } from "react-native-material-menu";
import { t } from "../../../../i18n";
import AuthContext from "../../../context/auth-context";
import { useTheme } from "../../../context/theme-context";
import { checkDirection } from "../../../hooks/check-direction";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { AuthType } from "../../../types/auth-types";
import ICONS from "../../../utils/icons";
import DefaultText from "../../text/Text";

export default function CompleteOptionsMenu({
  handlePrint,
  handlePreview,
  loading,
  // productSameChannel,
  billingSettings,
}: any) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const menu = useRef<any>();
  const { wp, hp } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);

  return (
    <Menu
      ref={menu}
      style={{
        marginTop: -hp("10%"),
        marginLeft: wp("1%"),
        borderRadius: 16,
        height: hp("8%"),
        justifyContent: "flex-end",
        backgroundColor: "#CCE2D7",
      }}
      anchor={
        <TouchableOpacity
          style={{
            padding: 20,
            paddingLeft: isRTL ? wp("0.5") : wp("1.4"),
          }}
          onPress={() => {
            menu.current.show();
          }}
          disabled={
            !authContext.permission["pos:order"]?.create ||
            // !productSameChannel ||
            loading
          }
        >
          <ICONS.ArrowUpIcon
            color={
              authContext.permission["pos:order"]?.create &&
              // productSameChannel &&
              !loading
                ? theme.colors.primary[1000]
                : theme.colors.placeholder
            }
          />
        </TouchableOpacity>
      }
      onRequestClose={() => {
        menu.current.hide();
      }}
    >
      <MenuItem
        style={{
          height: hp("8%"),
          paddingVertical: 18,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
        onPress={async () => {
          handlePrint(
            billingSettings?.defaultCompleteBtn == "with-print" ? false : true
          );

          menu.current.hide();
        }}
      >
        {/* {isRTL ? ( */}
        <DefaultText
          style={{ marginLeft: 12 }}
          fontSize="lg"
          fontWeight="medium"
          color="primary.1000"
        >
          {billingSettings?.defaultCompleteBtn == "with-print"
            ? t("Complete without print")
            : t("Complete with print")}
        </DefaultText>
        {/* ) : (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {billingSettings?.defaultCompleteBtn == "with-print" ? (
              <ICONS.WithoutPrinterIcon color={theme.colors.primary[1000]} />
            ) : (
              <ICONS.PrinterIcon color={theme.colors.primary[1000]} />
            )}

            <DefaultText
              style={{ marginLeft: 12 }}
              fontSize="lg"
              fontWeight="medium"
              color="primary.1000"
            >
              {billingSettings?.defaultCompleteBtn == "with-print"
                ? t("Complete without print")
                : t("Complete with print")}
            </DefaultText>
          </View>
        )} */}
      </MenuItem>

      {/* <ItemDivider
        style={{
          margin: 0,
          borderWidth: 0,
          borderBottomWidth: 1.5,
          borderColor: theme.colors.primary[300],
        }}
      />

      <MenuItem
        style={{
          height: hp("8%"),
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
        }}
        onPress={() => {
          handlePreview();
          menu.current.hide();
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <ICONS.PreviewIcon />

          <DefaultText
            style={{ marginLeft: 12 }}
            fontSize="lg"
            fontWeight="medium"
            color="primary.1000"
          >
            {"Preview"}
          </DefaultText>
        </View>
      </MenuItem> */}
    </Menu>
  );
}
