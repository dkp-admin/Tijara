import { useIsFocused } from "@react-navigation/core";
import React, { useContext, useMemo, useState } from "react";
import {
  GestureResponderEvent,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SceneMap, TabView } from "react-native-tab-view";
import { t } from "../../../i18n";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import useCommonApis from "../../hooks/useCommonApis";
import useChannelStore from "../../store/channel-store";
import { AuthType } from "../../types/auth-types";
import MMKVDB from "../../utils/DB-MMKV";

import DefaultText from "../text/Text";
import FloatingCartView from "./left-view/cart-view";
import CatalogueOptionsMenu from "./left-view/catalogue-menu-options";
import CatalogueTab from "./left-view/catalogue-tab";
import ChannelMenuOptions from "./left-view/channel-menu-options";
import CustomChargesTab from "./left-view/custom-charges-tab";
import DiscountsTab from "./left-view/discounts-tab";
import KeypadTab from "./left-view/keypad-tab";
import KeypadModal from "./left-view/keypad/keypad-modal";
import PromotionsTab from "./left-view/promotions-tab";
import QuickItemsTab from "./left-view/quick-items-tab";
import cart from "../../utils/cart";
import repository from "../../db/repository";

const renderScene = SceneMap({
  keypad: KeypadTab,
  catalogue: CatalogueTab,
  quickItems: QuickItemsTab,
});

export default function BillingLeftTabView() {
  const theme = useTheme();
  const isFocused = useIsFocused();
  const { businessData } = useCommonApis();
  const authContext = useContext<AuthType>(AuthContext);
  const { hp, twoPaneView } = useResponsive();
  const { channel, setChannel, channelList, setChannelList } =
    useChannelStore();
  const [index, setIndex] = React.useState(twoPaneView ? 1 : 0);
  const [billingData, setBillingData] = useState(null) as any;
  const [visisbleDiscount, setVisibleDiscount] = useState(false);
  const [visisbleCustomCharges, setVisibleCustomCharges] = useState(false);
  const [visiblePromotionsTab, setVisiblePromotionsTab] = useState(false);
  const [visibleKeypadTab, setVisibleKeypadTab] = useState(false);

  const routes = useMemo(() => {
    const data = twoPaneView
      ? [
          { key: "keypad", title: t("Keypad") },
          { key: "catalogue", title: t("Catalogue") },
          { key: "quickItems", title: t("Quick Items") },
        ]
      : [
          { key: "catalogue", title: t("Catalogue") },
          { key: "quickItems", title: t("Quick Items") },
        ];

    if (twoPaneView && billingData && !billingData?.keypad) {
      data.shift();
    }

    return data;
  }, [billingData, businessData]);

  const transformedTabs = useMemo(() => {
    return routes.map((route, idx) => {
      return (
        <TouchableOpacity
          key={idx}
          style={{
            paddingVertical: hp("1.25%"),
            marginHorizontal: twoPaneView ? 0 : hp("2%"),
            borderBottomColor: theme.colors.primary[1000],
            borderBottomWidth: index == idx ? 2 : 0,
          }}
          onPress={(event: GestureResponderEvent) => {
            if (event.nativeEvent.changedTouches) setIndex(idx);
          }}
        >
          <View pointerEvents="none">
            <DefaultText
              style={{ lineHeight: Platform.OS == "android" ? 20 : 0 }}
              fontSize="md"
              fontWeight={index == idx ? "medium" : "normal"}
              color={index == idx ? "primary.1000" : "otherGrey.200"}
            >
              {route.title}
            </DefaultText>
          </View>
        </TouchableOpacity>
      );
    });
  }, [index, routes]);

  const channelMenuOptions = useMemo(() => {
    return (
      <ChannelMenuOptions
        channel={channel}
        channelList={channelList}
        handleChannel={(channel: string) => {
          cart.clearCart();
          setChannel(channel);
          MMKVDB.set("orderType", channel);
        }}
      />
    );
  }, [channel, channelList]);

  const catalogueMenuOptions = useMemo(() => {
    return (
      <CatalogueOptionsMenu
        handleDiscount={() => setVisibleDiscount(true)}
        handleCustomCharges={() => setVisibleCustomCharges(true)}
        handlePromotions={() => setVisiblePromotionsTab(true)}
        handleKeypad={() => setVisibleKeypadTab(true)}
        billingSettings={billingData}
      />
    );
  }, [billingData]);

  useMemo(() => {
    if (isFocused) {
      repository.billing.findAll().then((billingSetting: any) => {
        const billingSettings = billingSetting[0];

        if (billingSettings?.orderTypesList?.length > 0) {
          const orderTypes = billingSettings.orderTypesList?.filter(
            (type: any) => type.status
          );

          const list = orderTypes?.map((type: any) => {
            return type.name;
          });

          if (!list.includes(channel)) {
            setChannel(list[0]?.toLowerCase());
            MMKVDB.set("orderType", list[0]?.toLowerCase());
            cart.clearCart();
          }

          if (channelList?.length !== list?.length) {
            setChannelList(list);
          }
        }

        setBillingData(billingSettings);
      });
    }
  }, [isFocused]);

  return (
    <View style={{ flex: 1, height: "100%" }}>
      <TabView
        renderTabBar={({ jumpTo }) => (
          <View
            style={{
              ...styles.tabContainer,
              paddingHorizontal: hp("2%"),
              borderBottomColor: theme.colors.dividerColor.secondary,
            }}
          >
            {channelMenuOptions}
            {transformedTabs}
            {catalogueMenuOptions}
          </View>
        )}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
      />

      {!twoPaneView && (
        <View
          style={{
            right: "6%",
            bottom: "12%",
            position: "absolute",
            borderRadius: 16,
            backgroundColor: theme.colors.white[1000],
          }}
        >
          <FloatingCartView billing={billingData} />
        </View>
      )}

      {visisbleDiscount && (
        <DiscountsTab
          visible={visisbleDiscount}
          handleClose={() => setVisibleDiscount(false)}
        />
      )}

      {visisbleCustomCharges && (
        <CustomChargesTab
          visible={visisbleCustomCharges}
          handleClose={() => setVisibleCustomCharges(false)}
        />
      )}
      {visiblePromotionsTab && (
        <PromotionsTab
          visible={visiblePromotionsTab}
          handleClose={() => setVisiblePromotionsTab(false)}
        />
      )}
      {visibleKeypadTab && (
        <KeypadModal
          visible={visibleKeypadTab}
          handleClose={() => setVisibleKeypadTab(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
