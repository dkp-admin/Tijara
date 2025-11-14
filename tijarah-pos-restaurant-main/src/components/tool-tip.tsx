import { useState } from "react";
import { TouchableOpacity } from "react-native";
import Tooltip from "react-native-walkthrough-tooltip";
import { useTheme } from "../context/theme-context";
import ICONS from "../utils/icons";
import DefaultText from "./text/Text";

export default function ToolTip({
  smallInfoIcon = false,
  infoMsg,
}: {
  smallInfoIcon?: boolean;
  infoMsg?: string;
}) {
  const theme = useTheme();

  const [visible, setVisible] = useState(false);

  return (
    <Tooltip
      isVisible={visible}
      content={
        <DefaultText
          noOfLines={2}
          fontWeight="semibold"
          fontSize="md"
          color="dark.800"
        >
          {infoMsg}
        </DefaultText>
      }
      arrowSize={{ width: 12, height: 12 }}
      arrowStyle={{
        elevation: 16,
        shadowRadius: 2,
        shadowOpacity: 2,
        shadowColor: theme.colors.dark[800],
        shadowOffset: { width: 0.5, height: 0.5 },
      }}
      contentStyle={{
        borderRadius: 8,
        elevation: 16,
        shadowRadius: 24,
        shadowOpacity: 24,
        shadowColor: theme.colors.dark[800],
        shadowOffset: { width: 16, height: 16 },
        backgroundColor: theme.colors.white[1000],
      }}
      displayInsets={{ top: 20, bottom: 20, left: 20, right: 20 }}
      backgroundColor="transparent"
      placement="bottom"
      onClose={() => setVisible(false)}
    >
      <TouchableOpacity
        // style={{ marginTop: 1, paddingHorizontal: 5 }}
        onPress={() => setVisible(true)}
      >
        {smallInfoIcon ? (
          <ICONS.InfoSmallIcon />
        ) : (
          <ICONS.InfoCircleMediumIcon />
        )}
      </TouchableOpacity>
    </Tooltip>
  );
}
