import React, { useRef } from "react";
import { TouchableOpacity, View } from "react-native";
import { Menu, MenuItem } from "react-native-material-menu";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { ChannelsName } from "../../../utils/constants";
import ICONS from "../../../utils/icons";
import ItemDivider from "../../action-sheet/row-divider";
import DefaultText from "../../text/Text";

export default function ChannelMenuOptions({
  channel,
  channelList,
  handleChannel,
}: {
  channel: string;
  channelList: string[];
  handleChannel: any;
}) {
  const theme = useTheme();
  const menu = useRef<any>();
  const { hp } = useResponsive();

  return (
    <Menu
      ref={menu}
      style={{
        borderRadius: 16,
        marginTop: hp("5%"),
        justifyContent: "flex-end",
        height: channelList?.length * hp("7.5%"),
        backgroundColor: theme.colors.white[1000],
      }}
      anchor={
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingRight: hp("2%"),
            paddingTop: hp("1.5%"),
            paddingBottom: hp("0.75%"),
          }}
          onPress={() => {
            menu.current.show();
          }}
        >
          <DefaultText fontSize="lg" fontWeight="medium">
            {ChannelsName[channel] || channel}
          </DefaultText>

          <View style={{ marginTop: 5, marginLeft: 8 }}>
            <ICONS.ArrowDownIcon
              width={12}
              opacity={1}
              color={theme.colors.text.primary}
            />
          </View>
        </TouchableOpacity>
      }
      onRequestClose={() => {
        menu.current.hide();
      }}
    >
      {channelList?.map((list: string, index: number) => {
        return (
          <View key={index}>
            <MenuItem
              style={{ borderRadius: 16, height: hp("7.5%") }}
              onPress={() => {
                handleChannel(list);
                menu.current.hide();
              }}
            >
              <DefaultText fontSize="lg" fontWeight="medium">
                {ChannelsName[list] || list}
              </DefaultText>
            </MenuItem>

            {channelList?.length - 1 > index && (
              <ItemDivider
                style={{
                  margin: 0,
                  borderWidth: 0,
                  borderBottomWidth: 1.5,
                  borderColor: "#E5E9EC",
                }}
              />
            )}
          </View>
        );
      })}
    </Menu>
  );
}
