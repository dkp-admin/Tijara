import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/theme-context";
import ICONS from "../../utils/icons";
import { BackButton } from "../buttons/back-button";
import DefaultText, { getOriginalSize } from "../text/Text";

export default function ActionSheetHeader({
  sheetRef,
  title,
  center = false,
  handleBack = null,
}: {
  sheetRef: any;
  title: string;
  center?: boolean;
  handleBack?: any;
}) {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        paddingTop: getOriginalSize(5),
        paddingBottom: getOriginalSize(16),
        borderBottomColor: theme.colors.dividerColor.main,
        borderBottomWidth: StyleSheet.hairlineWidth,
        alignItems: "center",
        paddingHorizontal: getOriginalSize(25),
        justifyContent: center ? "center" : "flex-start",
      }}
    >
      {handleBack && (
        <BackButton
          style={{
            position: "absolute",
            left: getOriginalSize(20),
            bottom: getOriginalSize(-3),
          }}
          onPress={() => sheetRef.current.close()}
        />
      )}
      <DefaultText
        style={{
          fontSize: getOriginalSize(22),
          marginBottom: getOriginalSize(3),
        }}
        fontWeight="bold"
      >
        {title}
      </DefaultText>

      <TouchableOpacity
        onPress={() => sheetRef.current.close()}
        style={{
          position: "absolute",
          right: getOriginalSize(20),
          bottom: getOriginalSize(16),
        }}
      >
        <ICONS.CloseFilledIcon
          width={getOriginalSize(30)}
          height={getOriginalSize(31)}
        />
      </TouchableOpacity>
    </View>
  );
}
