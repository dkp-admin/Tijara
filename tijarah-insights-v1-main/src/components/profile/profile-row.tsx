import { Entypo } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/use-direction-check";
import { useResponsive } from "../../hooks/use-responsiveness";
import DefaultText, { getOriginalSize } from "../text/Text";

export default function ProfileRow({
  title,
  value = "",
  leftArrow = false,
  isDivider = true,
  disabled,
  press,
  handlePress,
}: {
  title?: string;
  value?: string;
  isText?: boolean;
  leftArrow?: boolean;
  isDivider?: boolean;
  disabled?: boolean;
  press?: boolean;
  handlePress?: any;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { wp } = useResponsive();

  return (
    <TouchableOpacity
      style={{
        padding: getOriginalSize(16),
        borderStyle: "solid",
        borderWidth: 0,
        borderBottomWidth: isDivider ? getOriginalSize(1.15) : 0,
        borderColor: theme.colors.dividerColor.main,
        backgroundColor: theme.colors.bgColor2,
      }}
      disabled={disabled || !press}
      onPress={() => handlePress()}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <DefaultText
          style={{ width: wp("40%") }}
          fontSize="lg"
          fontWeight="semibold"
        >
          {title}
        </DefaultText>

        <View
          style={{
            marginRight: leftArrow ? getOriginalSize(16) : 0,
            width: wp("40%"),
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <DefaultText
            style={{ textAlign: "right" }}
            fontSize="lg"
            color="#3C3C4399"
          >
            {value}
          </DefaultText>

          {leftArrow && (
            <Entypo
              name={isRTL ? "chevron-thin-left" : "chevron-thin-right"}
              key="right-arrow"
              style={{
                marginLeft: isRTL ? getOriginalSize(3) : getOriginalSize(10),
              }}
              color="#3C3C4399"
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
