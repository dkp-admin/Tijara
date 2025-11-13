import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../context/theme-context";
import { checkDirection } from "../../../hooks/check-direction";
import { useResponsive } from "../../../hooks/use-responsiveness";
import ICONS from "../../../utils/icons";
import DefaultText from "../../text/Text";

export default function PrinterRow({
  isFirst,
  isLast,
  data,
  handleOnPress,
}: any) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { hp } = useResponsive();

  return (
    <>
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: hp("2.25%"),
          marginHorizontal: hp("2%"),
          paddingHorizontal: hp("2%"),
          borderTopLeftRadius: isFirst ? 16 : 0,
          borderTopRightRadius: isFirst ? 16 : 0,
          borderBottomLeftRadius: isLast ? 16 : 0,
          borderBottomRightRadius: isLast ? 16 : 0,
          backgroundColor: theme.colors.white[1000],
        }}
        onPress={() => handleOnPress(data)}
      >
        <View>
          <DefaultText color="black.1000">{data.name}</DefaultText>

          <DefaultText
            style={{ marginTop: 8 }}
            fontSize="lg"
            color="otherGrey.100"
          >
            {data.device_name || data.ip}
          </DefaultText>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <DefaultText
            style={{ marginRight: 12 }}
            fontSize="2xl"
            color="otherGrey.200"
          >
            {data?.enableBarcodes && "Barcode"}
            {data?.enableReceipts && data?.enableBarcodes && ", "}
            {data?.enableReceipts && "Receipt"}
            {data?.enableKOT && data?.enableReceipts && ", "}
            {data?.enableKOT && "KOT"}
          </DefaultText>

          <View style={{ transform: [{ rotate: isRTL ? "180deg" : "0deg" }] }}>
            <ICONS.RightContentIcon />
          </View>
        </View>
      </TouchableOpacity>

      {!isLast && !isFirst && (
        <View
          style={{
            borderWidth: 0.5,
            marginHorizontal: hp("2%"),
            borderColor: theme.colors.dividerColor.secondary,
          }}
        />
      )}
    </>
  );
}
