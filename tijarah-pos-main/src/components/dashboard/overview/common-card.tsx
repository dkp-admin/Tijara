import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../context/theme-context";
import { checkDirection } from "../../../hooks/check-direction";
import { useResponsive } from "../../../hooks/use-responsiveness";
import ICONS from "../../../utils/icons";
import CurrencyView from "../../modal/currency-view-modal";
import Spacer from "../../spacer";
import DefaultText from "../../text/Text";

export default function CommonCard({
  title,
  icon,
  amount,
  subtitle,
  desc,
  btnTitle,
  btnDisabled,
  handleBtnTap,
}: any) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { wp, hp } = useResponsive();

  return (
    <View
      style={{
        borderRadius: 8,
        paddingTop: hp("2%"),
        paddingBottom: hp("1.5%"),
        paddingHorizontal: wp("2%"),
        backgroundColor: theme.colors.white[1000],
      }}
    >
      <DefaultText fontSize="sm" fontWeight="medium" color="otherGrey.200">
        {title}
      </DefaultText>

      <View
        style={{
          marginTop: 12,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {icon}

        {amount ? (
          <>
            <Spacer space={8} />

            <CurrencyView
              amount={amount}
              symbolFontsize={20}
              amountFontsize={30}
              decimalFontsize={18}
              symbolColor="#111827"
              amountColor="#111827"
              decimalColor="#111827"
            />
          </>
        ) : (
          <DefaultText
            style={{ marginLeft: 8, fontSize: 30, color: "#111827" }}
            fontWeight="medium"
          >
            {subtitle}
          </DefaultText>
        )}
      </View>

      <DefaultText style={{ marginTop: 8 }} fontSize="lg" color="otherGrey.100">
        {desc}
      </DefaultText>

      <View
        style={{
          height: 1,
          marginTop: 14,
          marginHorizontal: -wp("2%"),
          backgroundColor: "#E6E8F0",
        }}
      />

      <TouchableOpacity
        style={{
          marginTop: 12,
          marginLeft: 12,
          flexDirection: "row",
          alignItems: "center",
        }}
        onPress={() => handleBtnTap()}
        disabled={btnDisabled}
      >
        <DefaultText
          style={{ marginRight: 10 }}
          fontSize="md"
          fontWeight="medium"
          color={
            btnDisabled ? theme.colors.placeholder : theme.colors.primary[1000]
          }
        >
          {btnTitle}
        </DefaultText>

        <View
          style={{
            transform: [
              {
                rotate: isRTL ? "180deg" : "0deg",
              },
            ],
          }}
        >
          <ICONS.ArrowForwardIcon
            color={
              btnDisabled
                ? theme.colors.placeholder
                : theme.colors.primary[1000]
            }
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}
