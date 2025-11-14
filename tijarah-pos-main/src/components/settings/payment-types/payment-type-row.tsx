import React from "react";
import { Platform, Switch, View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import ICONS from "../../../utils/icons";
import DefaultText from "../../text/Text";
import showToast from "../../toast";
import { debugLog } from "../../../utils/log-patch";

export default function PaymentTypeRow({
  data,
  active,
  walletEnabled,
  creditEnabled,
  handleStatusChange,
}: any) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();

  return (
    <View
      style={{
        borderBottomWidth: 1,
        borderColor: "#E5E9EC",
        paddingVertical: hp("1.75%"),
        paddingHorizontal: hp("2.25%"),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: theme.colors.white[1000],
        flex: 1,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <ICONS.MenuIcon />

        <DefaultText
          style={{ marginLeft: wp("2%") }}
          fontSize="lg"
          fontWeight="medium"
        >
          {t(data.name)}
        </DefaultText>
      </View>

      <View style={{ marginRight: wp("1%"), alignItems: "flex-end" }}>
        <Switch
          style={{
            marginRight: 8,
            transform:
              Platform.OS == "ios"
                ? [{ scaleX: 0.9 }, { scaleY: 0.9 }]
                : [{ scaleX: 1.5 }, { scaleY: 1.5 }],
            height: hp("5%"),
          }}
          trackColor={{
            false: "rgba(120, 120, 128, 0.16)",
            true: "#34C759",
          }}
          thumbColor={theme.colors.white[1000]}
          onValueChange={(val: any) => {
            if (!walletEnabled && data.name === "Wallet") {
              debugLog(
                "Please enabled loyalty settings from web",
                data,
                "setting-billing-screen",
                "handlePaymentStatus"
              );
              showToast("info", t("Please enabled loyalty settings from web"));
              return;
            } else if (!creditEnabled && data.name === "Credit") {
              debugLog(
                "Please enabled credit settings from web",
                data,
                "setting-billing-screen",
                "handlePaymentStatus"
              );
              showToast("info", t("Please enabled credit settings from web"));
              return;
            }

            handleStatusChange(val, data);
          }}
          value={
            (!walletEnabled && data.name === "Wallet") ||
            (!creditEnabled && data.name === "Credit")
              ? false
              : data.status
          }
        />
      </View>
    </View>
  );
}
