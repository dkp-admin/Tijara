import React from "react";
import { TouchableOpacity, View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import ICONS from "../../../utils/icons";
import DefaultText from "../../text/Text";
import { useCurrency } from "../../../store/get-currency";

export default function PaymentRow({
  data,
  index,
  disabled,
  handleDelete,
}: {
  data: any;
  index: number;
  disabled: boolean;
  handleDelete: any;
}) {
  const theme = useTheme();
  const { currency } = useCurrency();

  const { wp, hp } = useResponsive();

  if (!data) {
    return <></>;
  }

  return (
    <View
      style={{
        paddingVertical: hp("2.5%"),
        paddingHorizontal: hp("1.75%"),
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderColor: "#E5E9EC",
        backgroundColor: theme.colors.white[1000],
      }}
    >
      <DefaultText
        style={{ width: "48%", textTransform: "capitalize" }}
        fontSize="lg"
        fontWeight="medium"
      >
        {data.paymentMethod}
      </DefaultText>

      <DefaultText style={{ width: "45%" }} fontSize="lg" fontWeight="medium">
        {`${currency} ${Number(data?.amount || 0)?.toFixed(2)}`}
      </DefaultText>

      <TouchableOpacity
        style={{
          opacity: disabled ? 0.5 : 1,
          width: "7%",
          marginLeft: wp("1.75%"),
          marginRight: wp("4%"),
        }}
        onPress={() => handleDelete(index)}
        disabled={disabled}
      >
        <ICONS.CloseClearIcon color={theme.colors.red.default} />
      </TouchableOpacity>
    </View>
  );
}
