import React from "react";
import { TouchableOpacity, View } from "react-native";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/check-direction";
import { checkInternet } from "../../hooks/check-internet";
import { useResponsive } from "../../hooks/use-responsiveness";
import { getUnitName } from "../../utils/constants";
import ICONS from "../../utils/icons";
import CurrencyView from "../modal/currency-view-modal";
import DefaultText from "../text/Text";
import showToast from "../toast";
import { infoLog } from "../../utils/log-patch";

export default function VariantRow({
  data,
  disabled,
  handleStockPress,
  handleOnPress,
}: any) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const isConnected = checkInternet();
  const { wp, hp, twoPaneView } = useResponsive();

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
      {twoPaneView ? (
        <>
          <View
            style={{
              width: "27%",
              marginRight: "3%",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <ICONS.MenuIcon />

            <DefaultText
              style={{ marginLeft: wp("1%") }}
              fontSize="lg"
              fontWeight="medium"
            >
              {isRTL ? data.ar_name : data.en_name}
            </DefaultText>
          </View>

          <View style={{ width: "17%", marginRight: "3%" }}>
            <DefaultText fontSize="lg" fontWeight="medium">
              {data.sku}
            </DefaultText>
          </View>

          <View
            style={{
              width: "22%",
              marginRight: "3%",
              flexDirection: isRTL ? "row-reverse" : "row",
              alignItems: "flex-end",
            }}
          >
            {data?.prices?.[0]?.price ? (
              <CurrencyView
                amount={Number(data.prices[0].price)?.toFixed(2)}
                amountFontsize={18}
                decimalFontsize={18}
              />
            ) : (
              <DefaultText
                style={{ alignSelf: "flex-end" }}
                fontSize="xl"
                fontWeight="medium"
              >
                {t("Custom")}
              </DefaultText>
            )}

            <DefaultText fontSize="sm" fontWeight="medium">
              {getUnitName[data.unit]}
            </DefaultText>
          </View>

          <TouchableOpacity
            style={{
              width: "17%",
              marginRight: "3%",
              alignItems: "flex-end",
              opacity: disabled ? 0.5 : 1,
            }}
            onPress={() => {
              if (!isConnected) {
                infoLog(
                  "Internet not connected",
                  data,
                  "add-variant-modal",
                  "handleOnPressRow"
                );
                showToast("info", t("Please connect with internet"));
                return;
              }

              handleStockPress(data);
            }}
            disabled={disabled}
          >
            <DefaultText fontSize="lg" fontWeight="medium" color="primary.1000">
              {data.stocks?.[0]?.enabledTracking
                ? data.stocks[0].stockCount || 0
                : t("Manage Stock")}
            </DefaultText>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View
            style={{
              width: "52%",
              marginRight: "3%",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <ICONS.MenuIcon />

            <View style={{ marginLeft: wp("1%") }}>
              <DefaultText fontSize="lg" fontWeight="medium">
                {isRTL ? data.ar_name : data.en_name}
              </DefaultText>

              <DefaultText
                style={{ marginTop: 5 }}
                fontSize="lg"
                fontWeight="medium"
              >
                {data.sku}
              </DefaultText>
            </View>
          </View>

          <View
            style={{
              width: "37%",
              marginRight: "3%",
              alignItems: "flex-end",
            }}
          >
            <View
              style={{
                flexDirection: isRTL ? "row-reverse" : "row",
              }}
            >
              {data?.prices?.[0]?.price ? (
                <CurrencyView
                  amount={Number(data.prices[0].price)?.toFixed(2)}
                  amountFontsize={18}
                  decimalFontsize={18}
                />
              ) : (
                <DefaultText
                  style={{ alignSelf: "flex-end" }}
                  fontSize="xl"
                  fontWeight="medium"
                >
                  {t("Custom")}
                </DefaultText>
              )}

              <DefaultText fontSize="sm" fontWeight="medium">
                {getUnitName[data.unit]}
              </DefaultText>
            </View>

            <TouchableOpacity
              onPress={() => {
                if (!isConnected) {
                  infoLog(
                    "Internet not connected",
                    data,
                    "add-variant-modal",
                    "handleOnPressRow"
                  );
                  showToast("info", t("Please connect with internet"));
                  return;
                }

                handleStockPress(data);
              }}
              disabled={disabled}
            >
              <DefaultText
                fontSize="lg"
                fontWeight="medium"
                color="primary.1000"
              >
                {data.stocks?.[0]?.enabledTracking
                  ? data.stocks[0].stockCount || 0
                  : t("Manage Stock")}
              </DefaultText>
            </TouchableOpacity>
          </View>
        </>
      )}

      <TouchableOpacity
        style={{
          opacity: disabled ? 0.5 : 1,
          width: "5%",
          marginLeft: wp("1.75%"),
          marginRight: wp("2%"),
          transform: [
            {
              rotate: isRTL ? "180deg" : "0deg",
            },
          ],
        }}
        onPress={() => handleOnPress(data)}
        disabled={disabled}
      >
        <ICONS.RightArrowBoldIcon />
      </TouchableOpacity>
    </View>
  );
}
