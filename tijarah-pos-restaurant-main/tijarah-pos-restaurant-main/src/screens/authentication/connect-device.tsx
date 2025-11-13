import { format } from "date-fns";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import endpoint from "../../api/endpoints";
import { PrimaryButton } from "../../components/buttons/primary-button";
import FloatingLangView from "../../components/common/floating-lang-view";
import Input from "../../components/input/input";
import OTPTextView from "../../components/input/otp-input";
import Spacer from "../../components/spacer";
import DefaultText from "../../components/text/Text";
import showToast from "../../components/toast";
import DeviceContext from "../../context/device-context";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import { useResponsive } from "../../hooks/use-responsiveness";
import MMKVDB from "../../utils/DB-MMKV";
import { DBKeys } from "../../utils/DBKeys";
import { TIJARAH_LOGO } from "../../utils/constants";
import { ERRORS } from "../../utils/errors";
import ICONS from "../../utils/icons";
import { logInfo, sendDirectLog, setupLogger } from "../../utils/axiom-logger";

const ConnectDevice = () => {
  const theme = useTheme();
  const otpInput = useRef<any>();
  const isConnected = checkInternet();
  const { wp, hp, twoPaneView } = useResponsive();
  const deviceContext = useContext(DeviceContext) as any;

  const [deviceCode, setDeviceCode] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [userBlocked, setUserBlocked] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [blockedUntil, setBlockedUntil] = useState<any>("");

  const handleNext = async () => {
    if (deviceCode.length == 0) {
      showToast("error", t("Invalid device code or password"));
      return;
    }

    if (otp.length != 6) {
      showToast("error", t("Invalid device code or password"));
      return;
    }

    if (isConnected) {
      setLoading(true);

      try {
        const res = await serviceCaller(endpoint.login.path, {
          method: endpoint.login.method,
          body: {
            email: deviceCode + "@posApp",
            password: otp,
            authType: "email",
            app: "pos_restaurant_app",
          },
        });

        sendDirectLog("device response", "info", {
          method: endpoint.login.method,
          body: {
            email: deviceCode + "@posApp",
            password: otp,
            authType: "email",
          },
          response: res,
        });

        if (res?.user && res?.token) {
          setWrongAttempts(0);
          setBlockedUntil("");

          MMKVDB.set(DBKeys.DEVICE_OTP_WRONG_ATTEMPTS, "0");
          MMKVDB.set(DBKeys.DEVICE_OTP_BLOCKED_UNTIL, "");
          MMKVDB.set(DBKeys.DEVICE, res.user);
          MMKVDB.set(DBKeys.TOKEN, res.token);
          setupLogger({
            deviceCode: res.user.phone,
          });
          deviceContext.login(res.user);
        } else {
          showToast("error", t("Invalid device code or password"));
        }
      } catch (error: any) {
        if (error?.code === "bad_password") {
          handleWrongAttempt();
        }

        showToast("error", t("Invalid device code or password"));
      } finally {
        setLoading(false);
      }
    } else {
      showToast("info", t("Please connect with internet"));
    }
  };

  const handleWrongAttempt = () => {
    // Increment the wrong attempts count
    setWrongAttempts((prevAttempts) => prevAttempts + 1);

    // Store wrong attempts count
    MMKVDB.set(DBKeys.DEVICE_OTP_WRONG_ATTEMPTS, `${wrongAttempts + 1}`);

    // Block user based on conditions
    let blockedTime = "";

    if (wrongAttempts + 1 === 3) {
      // More than 3 wrong attempts in 1 minute, block for 5 minutes
      blockedTime = `${new Date().getTime() + 5 * 60 * 1000}`;
    } else if (wrongAttempts + 1 === 5) {
      // More than 5 wrong attempts in 10 minutes, block for 30 minutes
      blockedTime = `${new Date().getTime() + 30 * 60 * 1000}`;
    } else if (wrongAttempts + 1 === 10) {
      // More than 10 wrong attempts in 1 hour, block for a day
      blockedTime = `${new Date().getTime() + 24 * 60 * 60 * 1000}`;
    }

    // Store blockedUntil timestamp
    setBlockedUntil(blockedTime);
    MMKVDB.set(DBKeys.DEVICE_OTP_BLOCKED_UNTIL, blockedTime);
  };

  const fetchData = async () => {
    // Retrieve stored wrong attempts count and blockedUntil timestamp
    const storedWrongAttempts =
      MMKVDB.get(DBKeys.DEVICE_OTP_WRONG_ATTEMPTS) || "0";

    const storedBlockedUntil = MMKVDB.get(DBKeys.DEVICE_OTP_BLOCKED_UNTIL);

    setWrongAttempts(Number(storedWrongAttempts));
    setBlockedUntil(Number(storedBlockedUntil));
  };

  useEffect(() => {
    setWrongAttempts(0);
    setBlockedUntil("");
    fetchData();
  }, []);

  useEffect(() => {
    // Check if the user is blocked
    if (Number(blockedUntil) > 0) {
      // Calculate remaining time until unblocking
      const remainingTime = blockedUntil - new Date().getTime();

      if (remainingTime > 0) {
        // User is blocked, you can show a message or disable the input here
        setUserBlocked(true);
      } else {
        // Unblock the user when the timer expires
        setUserBlocked(false);
        setBlockedUntil("");
        MMKVDB.set(DBKeys.DEVICE_OTP_BLOCKED_UNTIL, "");
      }
    }
  }, [blockedUntil]);

  return (
    <View
      style={{
        ...styles.container,
        paddingHorizontal: twoPaneView ? wp("28%") : wp("5%"),
        backgroundColor: theme.colors.bgColor,
      }}
    >
      <ScrollView
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          marginTop: hp("8%"),
        }}
      >
        <View style={{ alignItems: "center" }}>
          <Image source={TIJARAH_LOGO} resizeMode="contain" />
        </View>

        <View
          style={{
            marginTop: hp("5%"),
          }}
        >
          <Input
            style={{ width: "100%" }}
            label={t("DEVICE CODE")}
            placeholderText={t("Enter device code")}
            values={deviceCode}
            autoCapitalize="characters"
            handleChange={(val: any) => {
              setDeviceCode(val);
            }}
          />

          <DefaultText
            style={{ marginTop: hp("2%"), marginLeft: wp("1.5%") }}
            fontWeight="normal"
          >
            {`${t(
              "Enter the device code & password generated on Tijarah Merchant panel to connect"
            )}.`}
          </DefaultText>
        </View>

        <Spacer space={hp("4.5%")} />

        <OTPTextView
          //@ts-ignore
          textInputStyle={{
            marginHorizontal: wp("0.5%"),
            height: twoPaneView ? wp("6%") : wp("13%"),
            width: twoPaneView ? wp("6%") : wp("13%"),
            flexDirection: "row",
            fontSize: hp("4%"),
            fontWeight: theme.fontWeights.medium,
            backgroundColor: theme.colors.primary[100],
          }}
          ref={otpInput}
          inputCount={6}
          inputCellLength={1}
          disabled={userBlocked}
          keyboardType="email-address"
          autoCapitalize="characters"
          offTintColor={theme.colors.white[1000]}
          tintColor={theme.colors.primary[100]}
          handleTextChange={(text: string) => setOtp(text)}
        />

        {!userBlocked && wrongAttempts > 0 && (
          <DefaultText
            style={{ marginLeft: 16, paddingTop: -3, marginBottom: 16 }}
            fontSize="lg"
            color="red.default"
          >
            {`${t("Remaining attempts")}: ${
              wrongAttempts < 3
                ? 3 - wrongAttempts
                : wrongAttempts < 5
                ? 5 - wrongAttempts
                : 10 - wrongAttempts
            }`}
          </DefaultText>
        )}

        {userBlocked && (
          <DefaultText
            style={{ textAlign: "center", paddingVertical: hp("2.5%") }}
            fontSize="lg"
          >
            {`${"Device is blocked for"} ${format(
              new Date(blockedUntil - new Date().getTime()),
              "mm"
            )} ${"minutes"}`}
          </DefaultText>
        )}

        <PrimaryButton
          style={{
            marginTop: hp("5%"),
            paddingVertical: hp("1.8%"),
            marginHorizontal: twoPaneView ? wp("8%") : wp("0%"),
          }}
          loading={loading}
          onPress={handleNext}
          title={t("Next")}
          rightIcon={<ICONS.ArrowRightIcon />}
          disabled={userBlocked}
        />

        <Spacer space={hp("12%")} />
      </ScrollView>

      <FloatingLangView isFromDevice={true} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ConnectDevice;
