import React from "react";
import Checkbox from "react-native-bouncy-checkbox";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import ICONS from "../../../utils/icons";
import SeparatorHorizontalView from "../../common/separator-horizontal-view";
import DefaultText from "../../text/Text";
import { t } from "../../../../i18n";
import { checkDirection } from "../../../hooks/check-direction";
import { View } from "react-native";
import CurrencyView from "../../modal/currency-view-modal";
import { useCurrency } from "../../../store/get-currency";

export default function ItemRow({ data, isLast, handleSingleSelection }: any) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { hp } = useResponsive();
  const { currency } = useCurrency();

  const getItemName = () => {
    const box =
      data.type === "box"
        ? `, (${t("Box")} - ${data.noOfUnits} ${t("Units")})`
        : data.type === "crate"
        ? `, (${t("Crate")} - ${data.noOfUnits} ${t("Units")})`
        : "";

    if (isRTL) {
      return data.nameAr + box;
    } else {
      return data.nameEn + box;
    }
  };

  return (
    <>
      <View
        style={{
          paddingVertical: hp("2.5%"),
          paddingHorizontal: hp("2%"),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: theme.colors.white[1000],
        }}
      >
        <View
          style={{ width: "70%", flexDirection: "row", alignItems: "center" }}
        >
          <Checkbox
            isChecked={data.selected}
            fillColor={theme.colors.white[1000]}
            unfillColor={theme.colors.white[1000]}
            iconComponent={
              data.selected ? (
                <ICONS.TickFilledIcon color={theme.colors.primary[1000]} />
              ) : (
                <ICONS.TickEmptyIcon color={theme.colors.primary[1000]} />
              )
            }
            onPress={() => {
              if (!data?.isFree) {
                handleSingleSelection(data, !data.selected);
              }
            }}
          />

          <DefaultText fontSize="lg">{getItemName()}</DefaultText>
        </View>

        {data?.isFree ? (
          <View>
            <DefaultText
              style={{ alignSelf: "flex-end" }}
              fontSize="lg"
              fontWeight="medium"
            >
              {"FREE"}
            </DefaultText>
            <CurrencyView
              amount={Number(data?.amount).toFixed(2)}
              symbolFontsize={13}
              amountFontsize={20}
              decimalFontsize={20}
              strikethrough
            />
          </View>
        ) : data?.isQtyFree ? (
          <View>
            <CurrencyView
              amount={Number(data?.amount).toFixed(2)}
              symbolFontsize={13}
              amountFontsize={20}
              decimalFontsize={20}
            />
          </View>
        ) : (
          <DefaultText
            style={{ alignSelf: "flex-end" }}
            fontSize="lg"
            fontWeight="medium"
          >
            {`${currency} ${data.amount?.toFixed(2)}`}
          </DefaultText>
        )}
      </View>

      {isLast && <SeparatorHorizontalView />}
    </>
  );
}
