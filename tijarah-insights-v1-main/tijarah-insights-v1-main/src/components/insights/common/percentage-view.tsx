import { View } from "react-native";
import ICONS from "../../../utils/icons";
import DefaultText, { getOriginalSize } from "../../text/Text";

export const calculatePercentage = (prev: number, current: number) => {
  if (prev == 0 && current == 0) {
    return 0;
  }

  if (!prev) {
    return 100;
  }

  let percentage = ((current - prev) / prev) * 100;

  return percentage;
};

export default function PercentageView({
  prev,
  current,
}: {
  prev: number;
  current: number;
}) {
  return (
    <View
      style={{
        borderRadius: getOriginalSize(20),
        paddingVertical: getOriginalSize(5),
        paddingHorizontal: getOriginalSize(8),
        flexDirection: "row",
        alignItems: "center",
        backgroundColor:
          calculatePercentage(prev, current) > 0 ? "#DEF6E4" : "#FFDDE4",
      }}
    >
      <View
        style={
          calculatePercentage(prev, current) < 0 && {
            transform: [{ rotateY: "180deg" }, { rotateZ: "180deg" }],
          }
        }
      >
        <ICONS.IncreaseIcon
          color={calculatePercentage(prev, current) > 0 ? "#34C759" : "#FF2D55"}
        />
      </View>

      <DefaultText
        style={{
          marginLeft: getOriginalSize(1),
          marginRight: getOriginalSize(5),
        }}
        fontSize="sm"
        fontWeight="bold"
        color={calculatePercentage(prev, current) > 0 ? "#34C759" : "#FF2D55"}
      >
        {`${calculatePercentage(prev, current).toFixed(2)}%`}
      </DefaultText>
    </View>
  );
}
