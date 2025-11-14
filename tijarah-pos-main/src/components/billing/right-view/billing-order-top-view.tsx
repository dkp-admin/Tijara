import { useNavigation } from "@react-navigation/core";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { checkDirection } from "../../../hooks/check-direction";
import { useResponsive } from "../../../hooks/use-responsiveness";
import ICONS from "../../../utils/icons";
import DefaultText from "../../text/Text";
import MoreOptionsMenu from "./more-option-menu";

export default function BillingOrderTopView({
  ticketName,
  handleClearItems,
  handleSaveTicket,
  handleNewTicket,
  handleTickets,
}: any) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const navigation = useNavigation() as any;
  const { hp, twoPaneView } = useResponsive();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        marginRight: hp("1%"),
        borderColor: theme.colors.dividerColor.secondary,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          width: twoPaneView ? "50%" : "80%",
        }}
      >
        {!twoPaneView && (
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
          >
            <View
              style={{
                paddingVertical: 10,
                paddingHorizontal: 16,
                marginRight: 8,
                transform: [
                  {
                    rotate: isRTL ? "180deg" : "0deg",
                  },
                ],
              }}
            >
              <ICONS.PrimaryArrowLeftIcon />
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View
        style={{
          height: hp("5.65%"),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
          width: twoPaneView ? "50%" : "20%",
        }}
      >
        {twoPaneView && (
          <DefaultText fontSize="lg" fontWeight="normal">
            {ticketName || t("Current Sale")}
          </DefaultText>
        )}

        <MoreOptionsMenu
          handleClearItems={handleClearItems}
          handleSaveTicket={handleSaveTicket}
          handleNewTicket={handleNewTicket}
          handleTickets={handleTickets}
        />
      </View>
    </View>
  );
}
