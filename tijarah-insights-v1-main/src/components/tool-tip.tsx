import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Tooltip from "react-native-walkthrough-tooltip";
import { useTheme } from "../context/theme-context";
import ICONS from "../utils/icons";
import DefaultText, { getOriginalSize } from "./text/Text";

export default function ToolTip({ infoMsg }: { infoMsg?: string }) {
  const theme = useTheme();

  const [visible, setVisible] = useState(false);

  return (
    <Tooltip
      isVisible={visible}
      content={
        <DefaultText
          noOfLines={15}
          fontWeight="semibold"
          fontSize="md"
          color="dark.800"
        >
          {infoMsg}
        </DefaultText>
      }
      // arrowSize={{ width: getOriginalSize(12), height: getOriginalSize(12) }}
      // arrowStyle={{
      //   elevation: getOriginalSize(16),
      //   shadowRadius: getOriginalSize(2),
      //   shadowOpacity: getOriginalSize(2),
      //   shadowColor: theme.colors.dark[800],
      //   shadowOffset: {
      //     width: getOriginalSize(0.5),
      //     height: getOriginalSize(0.5),
      //   },
      // }}
      contentStyle={{
        marginTop: -getOriginalSize(48),
        borderRadius: getOriginalSize(8),
        elevation: getOriginalSize(16),
        shadowRadius: getOriginalSize(24),
        shadowOpacity: getOriginalSize(24),
        shadowColor: theme.colors.dark[800],
        shadowOffset: {
          width: getOriginalSize(16),
          height: getOriginalSize(16),
        },
        backgroundColor: theme.colors.white[1000],
      }}
      displayInsets={{
        top: getOriginalSize(20),
        bottom: getOriginalSize(20),
        left: getOriginalSize(20),
        right: getOriginalSize(20),
      }}
      backgroundColor="transparent"
      placement="bottom"
      onClose={() => setVisible(false)}
      showChildInTooltip={false}
    >
      <TouchableOpacity
        style={{
          marginTop: getOriginalSize(1),
          paddingHorizontal: getOriginalSize(5),
        }}
        onPress={() => setVisible(true)}
      >
        <ICONS.InfoIcon />
      </TouchableOpacity>
    </Tooltip>
  );
}
