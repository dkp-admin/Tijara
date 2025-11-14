import React from "react";
import { Alert, Image, Linking, TouchableOpacity, View } from "react-native";
import { t } from "../../../i18n";
import DefaultText from "../../components/text/Text";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import { useTimezoneValidator } from "../../store/timezone-validator";
import { TIJARAH_LOGO } from "../../utils/constants";
import ICONS from "../../utils/icons";
import useCommonApis from "../../hooks/useCommonApis";

const InvalidTimezone = () => {
  const theme = useTheme();
  const { hp, wp, twoPaneView } = useResponsive();
  const { timezoneMismatchError, autoTimezoneError } = useTimezoneValidator();
  const { businessData } = useCommonApis();

  if (!twoPaneView) {
    return (
      <>
        <View style={{ alignItems: "center", marginTop: hp("10%"), flex: 1 }}>
          <Image source={TIJARAH_LOGO} resizeMode="contain" />
        </View>
        <View
          style={{
            backgroundColor: theme.colors.primary[200],
            marginHorizontal: wp("2.5%"),
            borderRadius: 8,
            paddingVertical: hp("2%"),
          }}
        >
          <View>
            <DefaultText
              style={{
                textAlign: "center",
                fontSize: 27,
                color: theme.colors.primary[1000],
              }}
            >
              {t("Invalid Date Time settings!")}
            </DefaultText>
            <DefaultText
              color="primary"
              style={{
                fontSize: 20,
                marginTop: hp("2.5%"),
                textAlign: "center",
              }}
            >
              {t("Your device time settings are misconfigured")}
            </DefaultText>
            <DefaultText
              color="primary"
              style={{
                fontSize: 18,
                marginTop: hp("1%"),
                textAlign: "center",
                color: "#000",
              }}
            >
              {t("Please correct the settings and try again")}
            </DefaultText>
          </View>
          <View style={{ marginTop: hp("2.5%"), alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View>
                {!autoTimezoneError ? (
                  <ICONS.TickFilledIcon
                    width={25}
                    height={25}
                    color={theme.colors.primary[1000]}
                  />
                ) : (
                  <ICONS.CloseClearIcon
                    width={25}
                    height={25}
                    color={theme.colors.red["default"]}
                  />
                )}
              </View>
              <View>
                <DefaultText>
                  {t("Use Network-provided time is on")}
                </DefaultText>
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginTop: hp("2.5%"),
              }}
            >
              <View>
                {!timezoneMismatchError ? (
                  <ICONS.TickFilledIcon
                    width={25}
                    height={25}
                    color={theme.colors.primary[1000]}
                  />
                ) : (
                  <ICONS.CloseClearIcon
                    width={25}
                    height={25}
                    color={theme.colors.red["default"]}
                  />
                )}
              </View>
              <View>
                {timezoneMismatchError ? (
                  <DefaultText>
                    {`${t(`Timezone is incorrect, expected timezone `)}(${
                      businessData?.company?.timezone
                    })`}
                  </DefaultText>
                ) : (
                  <DefaultText>{t("Timezone is correct")}</DefaultText>
                )}
              </View>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              gap: 15,
              alignItems: "flex-end",
              justifyContent: "flex-end",
              width: "96%",
              marginTop: hp("2.5%"),
            }}
          >
            <TouchableOpacity
              onPress={() => {
                Linking.sendIntent("android.settings.DATE_SETTINGS").catch(() =>
                  Alert.alert("Error", "Unable to open general settings.")
                );
              }}
              style={{
                marginTop: 20,
                backgroundColor: theme.colors.primary[1000],
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 8,
              }}
            >
              <DefaultText style={{ fontSize: 14, color: "#fff" }}>
                {t("Open Settings")}
              </DefaultText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                useTimezoneValidator.getState().checkTimezone(); //
              }}
              style={{
                marginTop: 20,
                backgroundColor: theme.colors.primary[1000],
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 8,
              }}
            >
              <DefaultText style={{ fontSize: 14, color: "#fff" }}>
                {t("Recheck")}
              </DefaultText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flex: 1 }}></View>
      </>
    );
  }

  return (
    <>
      <View style={{ alignItems: "center", marginTop: hp("10%"), flex: 1 }}>
        <Image source={TIJARAH_LOGO} resizeMode="contain" />
      </View>

      <View
        style={{
          justifyContent: "center",
          alignItems: "center", // Add this to center horizontally
          flexDirection: "row",
          flex: 2,
          backgroundColor: theme.colors.primary[200],
          alignSelf: "center", // Add this to ensure the entire view is centered
          width: wp("50%"), // Optional: you might want to adjust the width
          borderRadius: 8,
        }}
      >
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            flex: 2,
            borderRadius: 8,
          }}
        >
          <View>
            <DefaultText
              style={{
                textAlign: "center",
                fontSize: 27,
                color: theme.colors.primary[1000],
              }}
            >
              {t("Invalid Date Time settings!")}
            </DefaultText>
            <DefaultText
              color="primary"
              style={{
                fontSize: 20,
                marginTop: hp("2.5%"),
                textAlign: "center",
              }}
            >
              {t("Your device time settings are misconfigured")}
            </DefaultText>
            <DefaultText
              color="primary"
              style={{
                fontSize: 18,
                marginTop: hp("1%"),
                textAlign: "center",
                color: "#000",
              }}
            >
              {t("Please correct the settings and try again")}
            </DefaultText>
          </View>
          <View style={{ marginTop: hp("2.5%") }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View>
                {!autoTimezoneError ? (
                  <ICONS.TickFilledIcon
                    width={25}
                    height={25}
                    color={theme.colors.primary[1000]}
                  />
                ) : (
                  <ICONS.CloseClearIcon
                    width={25}
                    height={25}
                    color={theme.colors.red["default"]}
                  />
                )}
              </View>
              <View>
                <DefaultText>
                  {t("Use Network-provided time is on")}
                </DefaultText>
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: hp("2.5%"),
              }}
            >
              <View>
                {!timezoneMismatchError ? (
                  <ICONS.TickFilledIcon
                    width={25}
                    height={25}
                    color={theme.colors.primary[1000]}
                  />
                ) : (
                  <ICONS.CloseClearIcon
                    width={25}
                    height={25}
                    color={theme.colors.red["default"]}
                  />
                )}
              </View>
              <View>
                {!timezoneMismatchError ? (
                  <DefaultText>
                    {`${t(`Timezone is incorrect, expected timezone `)}(${
                      businessData?.company?.timezone
                    })`}
                  </DefaultText>
                ) : (
                  <DefaultText>{t("Timezone is correct")}</DefaultText>
                )}
              </View>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              gap: 15,
              alignItems: "flex-end",
              justifyContent: "flex-end",
              width: "90%",
              marginTop: hp("2.5%"),
            }}
          >
            <TouchableOpacity
              onPress={() => {
                Linking.sendIntent("android.settings.DATE_SETTINGS").catch(() =>
                  Alert.alert("Error", "Unable to open general settings.")
                );
              }}
              style={{
                marginTop: 20,
                backgroundColor: theme.colors.primary[1000],
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 8,
              }}
            >
              <DefaultText style={{ fontSize: 14, color: "#fff" }}>
                {t("Open Settings")}
              </DefaultText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                useTimezoneValidator.getState().checkTimezone(); //
              }}
              style={{
                marginTop: 20,
                backgroundColor: theme.colors.primary[1000],
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 8,
              }}
            >
              <DefaultText style={{ fontSize: 14, color: "#fff" }}>
                {t("Recheck")}
              </DefaultText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={{ flex: 1 }}></View>
    </>
  );
};

export default InvalidTimezone;
