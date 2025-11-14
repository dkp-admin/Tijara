import React from "react";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import TabButton from "../buttons/tab-button";
import SeparatorVerticalView from "../common/separator-vertical-view";
import DefaultText from "../text/Text";
import { TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/core";
import ICONS from "../../utils/icons";
import { checkDirection } from "../../hooks/check-direction";

export default function DashboardHeaderView({ activeTab, setActiveTab }: any) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const navigation = useNavigation() as any;
  const { wp, hp, twoPaneView } = useResponsive();

  return (
    <View
      style={{
        height: hp("7%"),
        flexDirection: "row",
        backgroundColor: theme.colors.primary[100],
      }}
    >
      {twoPaneView && (
        <TouchableOpacity
          style={{
            flex: 0.25,
            height: "100%",
            flexDirection: "row",
            alignItems: "center",
            borderBottomWidth: 1,
            paddingTop: hp("2.75%"),
            paddingHorizontal: wp("1.25%"),
            borderColor: theme.colors.dividerColor.secondary,
          }}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <View
            style={{
              marginRight: 10,
              transform: [
                {
                  rotate: isRTL ? "180deg" : "0deg",
                },
              ],
            }}
          >
            <ICONS.ArrowLeftIcon />
          </View>

          <DefaultText fontWeight="medium">{t("DASHBOARD")}</DefaultText>
        </TouchableOpacity>
      )}

      <SeparatorVerticalView />

      <View style={{ flex: twoPaneView ? 0.75 : 1, height: "100%" }}>
        <TabButton
          isDashboard={true}
          tabs={[t("Overview"), t("Sales"), t("Products")]}
          activeTab={activeTab}
          onChange={(tab: any) => {
            setActiveTab(tab);
          }}
        />
      </View>
    </View>
  );
}
