import { AntDesign } from "@expo/vector-icons";
import { useRef } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/use-direction-check";
import { useResponsive } from "../../hooks/use-responsiveness";
import ICONS from "../../utils/icons";
import DefaultText, { getOriginalSize } from "../text/Text";
import HelpSheet from "./help-sheet";

export default function HelpCard() {
  const theme = useTheme();
  const { wp, hp } = useResponsive();
  const isRTL = checkDirection();
  const sheetRef = useRef<any>();

  return (
    <View>
      <TouchableOpacity
        style={{
          ...styles.container,
          marginVertical: hp("5.5%"),
          backgroundColor: theme.colors.dark[1000],
        }}
        onPress={() => {
          sheetRef.current.open();
        }}
      >
        <ICONS.ChatIcon />

        <View style={styles.content}>
          <DefaultText fontSize="xl" fontWeight="medium" color="white.1000">
            {t("Need Help?")}
          </DefaultText>

          <DefaultText
            style={{ ...styles.text, width: wp("50%") }}
            fontSize="md"
            fontWeight="medium"
            color="white.1000"
          >
            {t("Connect with Tijarah360 Support!")}
          </DefaultText>
        </View>

        <AntDesign
          key={"right-icon"}
          name={isRTL ? "left" : "right"}
          size={getOriginalSize(20)}
          style={{ marginRight: getOriginalSize(6) }}
          color={theme.colors.white[1000]}
        />
      </TouchableOpacity>

      <HelpSheet sheetRef={sheetRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: getOriginalSize(16),
    marginHorizontal: getOriginalSize(8),
    paddingVertical: getOriginalSize(16),
    paddingHorizontal: getOriginalSize(18),
    flexDirection: "row",
    alignItems: "center",
  },
  content: { flex: 1, marginLeft: getOriginalSize(16) },
  text: { marginTop: getOriginalSize(3), textAlign: "left" },
});
