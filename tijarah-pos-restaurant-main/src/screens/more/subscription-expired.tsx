import { useNavigation } from "@react-navigation/core";
import { format } from "date-fns";
import React, { useContext } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import i18n, { t } from "../../../i18n";
import { PrimaryButton } from "../../components/buttons/primary-button";
import Spacer from "../../components/spacer";
import DefaultText from "../../components/text/Text";
import AuthContext from "../../context/auth-context";
import DeviceContext from "../../context/device-context";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import useCommonApis from "../../hooks/useCommonApis";
import { COMPANY_PLACEHOLDER, USER_TYPES } from "../../utils/constants";
import ICONS from "../../utils/icons";

const SubscriptionExpired = () => {
  const theme = useTheme();
  const navigation = useNavigation() as any;
  const authContext = useContext(AuthContext) as any;
  const deviceContext = useContext(DeviceContext) as any;

  const { hp } = useResponsive();
  const { businessData } = useCommonApis() as any;

  const getDeviceCode = () => {
    let formattedString = "";

    const deviceCode = deviceContext.user?.phone?.split("");

    deviceCode?.map((code: string, index: number) => {
      if (index == 3) {
        formattedString = formattedString + code?.replace(code, `${code} - `);
      } else {
        formattedString = formattedString + code?.replace(code, `${code} `);
      }
    });

    return formattedString;
  };

  const getRenewalText = () => {
    if (authContext?.user?.userType == USER_TYPES.ADMIN) {
      return `${t("Your subscription has expired on")} ${format(
        new Date(businessData?.company?.subscriptionEndDate),
        "dd/MM/yyyy"
      )}. ${t(
        "Renew your subscription to continue using Tijarah from the button below or from merchant portal"
      )}. ${t("After renewal, you will have to relaunch the application")}.`;
    } else {
      return `${t("Your company account holder")}, ${
        businessData?.company?.owner?.name || ""
      } ${t("must renew subscription to continue using Tijarah")}.`;
    }
  };

  return (
    <>
      <ScrollView
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          ...styles.container,
          backgroundColor: theme.colors.bgColor,
        }}
      >
        <View
          style={{
            marginHorizontal: "10%",
            alignItems: "flex-start",
          }}
        >
          <View
            style={{
              ...styles.company_view,
              marginTop: hp("6%"),
            }}
          >
            <View
              style={{
                ...styles.image_view,
                width: hp("13%"),
                height: hp("13%"),
              }}
            >
              <Image
                key={"company-logo"}
                resizeMode="contain"
                style={{
                  width: hp("11%"),
                  height: hp("11%"),
                }}
                borderRadius={15}
                source={
                  businessData?.company?.logo
                    ? {
                        uri: businessData.company.logo,
                      }
                    : COMPANY_PLACEHOLDER
                }
              />
            </View>

            <View style={{ marginLeft: hp("2%") }}>
              <DefaultText fontSize="2xl" fontWeight="medium">
                {i18n.currentLocale() == "ar"
                  ? businessData?.company?.name?.ar || "NA"
                  : businessData?.company?.name?.en || "NA"}
              </DefaultText>

              <DefaultText style={{ marginTop: 5 }}>
                {i18n.currentLocale() == "ar"
                  ? businessData?.location?.name?.ar || "NA"
                  : businessData?.location?.name?.en || "NA"}
              </DefaultText>

              <DefaultText
                style={{ marginTop: 4 }}
                fontSize="lg"
                color="otherGrey.100"
              >
                {getDeviceCode()}
              </DefaultText>
            </View>
          </View>

          <Spacer space={hp("2%")} />

          <View
            style={{
              width: "100%",
              borderBottomWidth: 1,
              borderStyle: "dashed",
              borderColor: "#C2C2C2",
            }}
          />

          <Spacer space={hp("4%")} />

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <ICONS.InfoCircleIcon />

            <DefaultText
              style={{ marginLeft: hp("2%") }}
              fontSize="3xl"
              fontWeight="medium"
              color="primary.1000"
            >
              {t("Subscription Expired!")}
            </DefaultText>
          </View>

          <DefaultText
            style={{ marginTop: hp("2%"), lineHeight: 30 }}
            fontWeight="normal"
            color="otherGrey.100"
          >
            {getRenewalText()}
          </DefaultText>

          {authContext?.user?.userType == USER_TYPES.ADMIN && (
            <PrimaryButton
              style={{
                marginTop: hp("3.25%"),
                paddingVertical: hp("1.8%"),
                paddingHorizontal: hp("12%"),
              }}
              textStyle={{
                fontSize: 16,
                fontWeight: theme.fontWeights.medium,
                fontFamily: theme.fonts.circulatStd,
              }}
              title={t("Renew now")}
              onPress={() => {}}
            />
          )}

          <PrimaryButton
            style={{
              marginTop: hp("3.25%"),
              paddingVertical: hp("1.8%"),
              paddingHorizontal: hp("12%"),
            }}
            textStyle={{
              fontSize: 16,
              fontWeight: theme.fontWeights.medium,
              fontFamily: theme.fonts.circulatStd,
            }}
            title={t("Login")}
            onPress={() => {
              navigation.goBack();
            }}
          />
        </View>

        <Spacer space={hp("5%")} />
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  company_view: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  image_view: {
    padding: 5,
    borderWidth: 1,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#8A959E4D",
  },
});

export default SubscriptionExpired;
