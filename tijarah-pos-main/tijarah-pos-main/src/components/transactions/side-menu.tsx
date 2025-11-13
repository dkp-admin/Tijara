import { format } from "date-fns";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import {
  default as React,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";

import { useNavigation } from "@react-navigation/core";
import {
  ActivityIndicator,
  Keyboard,
  SectionList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { t } from "../../../i18n";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/check-direction";
import { useResponsive } from "../../hooks/use-responsiveness";
import { AuthType } from "../../types/auth-types";
import MMKVDB from "../../utils/DB-MMKV";
import { DBKeys } from "../../utils/DBKeys";
import ICONS from "../../utils/icons";
import { debugLog, infoLog } from "../../utils/log-patch";
import SeparatorHorizontalView from "../common/separator-horizontal-view";
import Input from "../input/input";
import NoDataPlaceholder from "../no-data-placeholder/no-data-placeholder";
import DefaultText from "../text/Text";
import OrderRow from "./order-row";

export default function TransactionSideMenu({
  filter,
  loadMore,
  orderData,
  queryText,
  setQueryText,
  selectedOrder,
  setSelectedOrder,
  isFetchingNextPage,
  handleFilterBtnTap,
  loading,
}: any) {
  const env = Constants.expoConfig?.extra?.env || "development";

  const theme = useTheme();
  const isRTL = checkDirection();
  const navigation = useNavigation() as any;
  const { wp, hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);
  const sectionListRef = useRef() as any;

  const renderOrderRow = useCallback(
    ({ item }: any) => {
      return (
        <OrderRow
          key={item.id}
          data={item}
          selectedOrder={selectedOrder?._id}
          setSelectedOrder={setSelectedOrder}
          sectionListRef={sectionListRef}
        />
      );
    },
    [selectedOrder]
  );

  const renderSectionHeader = useCallback(
    ({ section: { header } }: any) => (
      <View style={{ backgroundColor: theme.colors.bgColor }}>
        <DefaultText
          style={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            backgroundColor: "#8A959E1A",
          }}
          fontSize="sm"
          color="otherGrey.200"
        >
          {format(new Date(header), "EEEE, MMMM dd, yyyy")}
        </DefaultText>
      </View>
    ),
    []
  );

  const renderEmpty = useMemo(() => {
    return () => {
      return (
        <View style={{ marginHorizontal: 16 }}>
          {loading ? (
            <ActivityIndicator
              size={"large"}
              style={{ marginTop: hp("30%") }}
            />
          ) : (
            <NoDataPlaceholder title={t("No Orders!")} marginTop={hp("30%")} />
          )}
        </View>
      );
    };
  }, [loading]);

  const containerStyle = useMemo(() => {
    return {
      height: twoPaneView ? hp("9.5%") : hp("7%"),
      paddingHorizontal: wp("1.25%"),
      borderBottomWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderColor: theme.colors.dividerColor.secondary,
      backgroundColor: theme.colors.primary[100],
    };
  }, []) as any;

  const searchContainerStyle = useMemo(() => {
    return {
      borderRadius: 16,
      marginVertical: 10,
      marginHorizontal: 12,
      paddingLeft: wp("1.5"),
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#8A959E1A",
    };
  }, []) as any;

  const redirectionURL = async (data: string) => {
    let url;
    const phone = authContext.user.phone;
    const posSessionId = MMKVDB.get(DBKeys.POS_SESSION_ID);

    if (env === "production") {
      url = `https://app.tijarah360.com/authentication/authorize?redirectURL=${data}&phone=${phone}&pos_id=${posSessionId}&locationRef=${authContext.user.locationRef}`;
    } else if (env === "qa") {
      url = `https://tijarah-qa.vercel.app/authentication/authorize?redirectURL=${data}&phone=${phone}&pos_id=${posSessionId}&locationRef=${authContext.user.locationRef}`;
    } else if (env === "test") {
      url = `https://tijarah-test.vercel.app/authentication/authorize?redirectURL=${data}&phone=${phone}&pos_id=${posSessionId}&locationRef=${authContext.user.locationRef}`;
    } else {
      url = `https://tijarah-qa.vercel.app/authentication/authorize?redirectURL=${data}&phone=${phone}&pos_id=${posSessionId}&locationRef=${authContext.user.locationRef}`;
    }

    debugLog(
      "Open web view for " + data,
      { url: url },
      "more-tab-screen",
      "handleRowOnPress"
    );
    await WebBrowser.openBrowserAsync(url);
  };

  const renderFooter = useMemo(
    () => (
      <View style={{ height: hp("15%"), marginBottom: 16 }}>
        {isFetchingNextPage && (
          <ActivityIndicator
            size={"small"}
            color={theme.colors.primary[1000]}
          />
        )}
        <TouchableOpacity onPress={() => redirectionURL("orders")}>
          <Text
            style={{
              fontFamily: theme.fonts.circulatStd,
              textAlign: "center",
              marginTop: 10,
            }}
          >
            For older orders, please refer to web{" "}
            <ICONS.OpenInNewTab color={theme.colors.primary[1000]} />{" "}
          </Text>
        </TouchableOpacity>
      </View>
    ),
    [isFetchingNextPage]
  );

  if (!authContext.permission["pos:order"]?.read) {
    infoLog(
      "Permission denied to view this screen",
      {},
      "orders-screen",
      "handlePermission"
    );

    return (
      <View
        style={{
          height: "100%",
          width: "100%",
          backgroundColor: theme.colors.white[1000],
        }}
      >
        <TouchableOpacity
          style={{
            height: twoPaneView ? hp("9.5%") : hp("7%"),
            paddingHorizontal: wp("1.25%"),
            borderBottomWidth: 1,
            flexDirection: "row",
            alignItems: "center",
            borderColor: theme.colors.dividerColor.secondary,
            backgroundColor: theme.colors.primary[100],
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

          <DefaultText fontWeight="medium">
            {t("ORDER TRANSACTIONS")}
          </DefaultText>
        </TouchableOpacity>

        <NoDataPlaceholder
          title={t("You don't have permission to view this screen")}
          marginTop={hp("35%")}
        />
      </View>
    );
  }

  return (
    <View
      style={{
        height: "100%",
        width: twoPaneView ? "30%" : "100%",
        backgroundColor: theme.colors.white[1000],
      }}
    >
      <View style={containerStyle}>
        <TouchableOpacity
          style={{
            maxWidth: "60%",
            flexDirection: "row",
            alignItems: "center",
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

          <DefaultText fontWeight="medium">
            {t("ORDER TRANSACTIONS")}
          </DefaultText>
        </TouchableOpacity>

        <TouchableOpacity
          onFocus={(e) => e.preventDefault()}
          onPress={(e) => handleFilterBtnTap()}
        >
          {Object.keys(filter).length > 0 ? (
            <ICONS.FilterAppliedIcon />
          ) : (
            <ICONS.FilterSquareIcon />
          )}
        </TouchableOpacity>
      </View>

      <View style={searchContainerStyle}>
        <ICONS.SearchPrimaryIcon />

        <Input
          containerStyle={{
            borderWidth: 0,
            height: hp("6.5%"),
            backgroundColor: "transparent",
          }}
          allowClear
          style={{ flex: 0.96 }}
          placeholderText={t("Search receipt")}
          values={queryText}
          handleChange={(val: any) => setQueryText(val)}
        />
      </View>

      <SeparatorHorizontalView />

      <View style={{ flex: 1 }}>
        <SectionList
          ref={sectionListRef}
          onEndReached={loadMore}
          onEndReachedThreshold={0.01}
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={Keyboard.dismiss}
          sections={orderData}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderOrderRow as any}
          stickySectionHeadersEnabled
          renderSectionHeader={renderSectionHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          keyboardShouldPersistTaps="always"
        />
      </View>
    </View>
  );
}
