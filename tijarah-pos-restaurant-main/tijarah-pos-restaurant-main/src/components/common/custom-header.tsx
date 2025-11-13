import { Feather } from "@expo/vector-icons";
import { differenceInDays, startOfDay } from "date-fns";
import React, { useCallback, useContext, useEffect, useMemo } from "react";
import { StatusBar, View } from "react-native";
import i18n, { t } from "../../../i18n";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import {
  getSubscriptionDetails,
  useBusinessDetails,
} from "../../hooks/use-business-details";
import { useResponsive } from "../../hooks/use-responsiveness";
import MMKVDB from "../../utils/DB-MMKV";
import { DBKeys } from "../../utils/DBKeys";
import { trimText } from "../../utils/trim-text";
import DefaultText from "../text/Text";
import showToast from "../toast";
import ToolTip from "../tool-tip";
import { useIsFocused } from "@react-navigation/core";

export default function CustomHeader() {
  const theme = useTheme();
  const isFocused = useIsFocused();
  const { wp, hp, twoPaneView } = useResponsive();
  const isConnected = checkInternet();
  const authContext = useContext(AuthContext);
  const { businessDetails, subscriptionDetails } = useBusinessDetails();

  const handleLogout = useCallback(async () => {
    const subscrition = getSubscriptionDetails(
      businessDetails?.company?.subscriptionEndDate
    );

    if (subscrition.renewIn < 0) {
      MMKVDB.remove(DBKeys.USER);
      MMKVDB.remove(DBKeys.USERTYPE);
      MMKVDB.remove(DBKeys.USER_PERMISSIONS);

      authContext.logout();

      showToast("success", t("Logout Successfully!"));
    }
  }, [businessDetails]);

  const persistentSynced = useMemo(() => {
    const lastSyncedDate = MMKVDB.get(DBKeys.ORDER_LAST_SYNCED_AT);
    const currentDate = startOfDay(new Date());

    const lastSyncDays = differenceInDays(
      currentDate,
      new Date(lastSyncedDate)
    );

    return {
      syncDays: lastSyncDays,
      showAlert: lastSyncDays >= 15,
    };
  }, [isFocused]);

  const getLocationName = () => {
    if (i18n.currentLocale() == "ar") {
      if (businessDetails?.location?.name?.ar) {
        return `${trimText(
          businessDetails?.location?.name?.ar,
          25
        )}, ${trimText(businessDetails?.location?.address?.city, 20)}`;
      } else {
        return "";
      }
    } else {
      if (businessDetails?.location?.name?.en) {
        return `${trimText(
          businessDetails?.location?.name?.en,
          25
        )}, ${trimText(businessDetails?.location?.address?.city, 20)}`;
      } else {
        return "";
      }
    }
  };

  useEffect(() => {
    handleLogout();
  }, [businessDetails]);

  return (
    <View>
      <StatusBar
        barStyle={"light-content"}
        backgroundColor={
          isConnected ? theme.colors.primary[1000] : theme.colors.red.default
        }
      />

      <View
        style={{
          width: "100%",
          paddingBottom: 20,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
          paddingTop: hp("1.25%"),
          paddingLeft: hp("1.8%"),
          backgroundColor: isConnected
            ? theme.colors.primary[1000]
            : theme.colors.red.default,
        }}
      >
        {twoPaneView ? (
          <DefaultText
            style={{ position: "absolute", left: wp("1.75%") }}
            fontSize="lg"
            fontWeight="medium"
            color="white.1000"
          >
            {getLocationName()}
          </DefaultText>
        ) : (
          <DefaultText
            style={{ position: "absolute", left: hp("2%"), width: "35%" }}
            noOfLines={1}
            fontSize="lg"
            fontWeight="medium"
            color="white.1000"
          >
            {getLocationName()}
          </DefaultText>
        )}

        {!isConnected && (
          <DefaultText
            style={{ position: "absolute" }}
            fontSize="lg"
            fontWeight="normal"
            color="white.1000"
          >
            {t("Offline")}
          </DefaultText>
        )}

        {twoPaneView ? (
          <DefaultText
            style={{ position: "absolute", right: wp("1.75%") }}
            fontSize="lg"
            fontWeight="normal"
            color="white.1000"
          >
            {subscriptionDetails.text}
          </DefaultText>
        ) : (
          <View
            style={{
              position: "absolute",
              right: hp("2%"),
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {subscriptionDetails.text && (
              <View
                style={{
                  paddingHorizontal: hp("1%"),
                }}
              >
                <ToolTip
                  smallInfoIcon={true}
                  infoMsg={subscriptionDetails.text}
                />
              </View>
            )}
          </View>
        )}
      </View>

      {persistentSynced.showAlert && (
        <View
          style={{
            width: "100%",
            paddingBottom: 20,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            paddingTop: hp("1.25%"),
            paddingLeft: hp("1.8%"),
            backgroundColor: "#E68C48",
          }}
        >
          <View
            style={{
              position: "absolute",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Feather name="alert-triangle" size={20} color="#fff" />

            <DefaultText
              style={{ marginLeft: 10 }}
              fontSize="lg"
              fontWeight="normal"
              color="white.1000"
            >
              {t("info_msg_for_persistent_alert_data_not_synced_15_days")}
            </DefaultText>
          </View>
        </View>
      )}
    </View>
  );
}
