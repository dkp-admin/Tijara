import React from "react";
import { Platform, Switch, View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import ICONS from "../../../utils/icons";
import DefaultText from "../../text/Text";
import { ChannelsName } from "../../../utils/constants";

export default function OrderTypeRow({
  data,
  active,
  handleStatusChange,
}: any) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();

  return (
    <View
      style={{
        borderBottomWidth: 1,
        borderColor: "#E5E9EC",
        paddingVertical: hp("1.75%"),
        paddingHorizontal: hp("2.25%"),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: theme.colors.white[1000],
        flex: 1,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <ICONS.MenuIcon />

        <DefaultText
          style={{ marginLeft: wp("2%") }}
          fontSize="lg"
          fontWeight="medium"
        >
          {ChannelsName[data.name] || data.name}
        </DefaultText>
      </View>

      <View style={{ marginRight: wp("1%"), alignItems: "flex-end" }}>
        <Switch
          style={{
            marginRight: 8,
            transform:
              Platform.OS == "ios"
                ? [{ scaleX: 0.9 }, { scaleY: 0.9 }]
                : [{ scaleX: 1.5 }, { scaleY: 1.5 }],
            height: hp("5%"),
          }}
          trackColor={{
            false: "rgba(120, 120, 128, 0.16)",
            true: "#34C759",
          }}
          thumbColor={theme.colors.white[1000]}
          onValueChange={(val: any) => {
            handleStatusChange(val, data);
          }}
          value={data.status}
        />
      </View>
    </View>
  );
}
