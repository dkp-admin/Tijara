import { format } from "date-fns";
import React, { useEffect, useRef, useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { t } from "../../../../../i18n";
import serviceCaller from "../../../../api";
import endpoint from "../../../../api/endpoints";
import { useTheme } from "../../../../context/theme-context";
import { checkInternet } from "../../../../hooks/check-internet";
import { checkKeyboardState } from "../../../../hooks/use-keyboard-state";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import MMKVDB from "../../../../utils/DB-MMKV";
import { DBKeys } from "../../../../utils/DBKeys";
import ICONS from "../../../../utils/icons";
import { debugLog, errorLog, infoLog } from "../../../../utils/log-patch";
import { PrimaryButton } from "../../../buttons/primary-button";
import OTPTextView from "../../../input/otp-input";
import DefaultText from "../../../text/Text";
import showToast from "../../../toast";

export default function CreditOTPModal({
  data,
  visible = false,
  handleClose,
  handleCreditUsed,
}: {
  data: any;
  visible: boolean;
  handleClose: any;
  handleCreditUsed: any;
}) {
  const theme = useTheme();
  const otpInput = useRef<any>();
  const isConnected = checkInternet();
  const isKeyboardVisible = checkKeyboardState();

  const { hp, wp, twoPaneView } = useResponsive();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [userBlocked, setUserBlocked] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [blockedUntil, setBlockedUntil] = useState<any>("");

  const handleCredit = async () => {
    if (otp.length == 0) {
      debugLog(
        "OTP not entered",
        { otp: otp },
        "credit-otp-modal",
        "handleCreditFunction"
      );
      showToast("error", t("Invalid OTP"));
      return;
    }

    if (otp.length != 4) {
      debugLog(
        "OTP length not equal to 4",
        { otp: otp },
        "credit-otp-modal",
        "handleCreditFunction"
      );
      showToast("error", t("Invalid OTP"));
      return;
    }

    if (!isConnected) {
      infoLog(
        "Internet not connected",
        { phone: data.phone, otp: otp },
        "credit-otp-modal",
        "handleCreditFunction"
      );
      showToast("info", t("Please connect with the internet"));
      return;
    }

    setLoading(true);

    try {
      const res = await serviceCaller(endpoint.walletVerifyOTP.path, {
        method: endpoint.walletVerifyOTP.method,
        body: {
          phone: data.phone,
          otp: otp,
        },
      });

      if (res.code == "success") {
        debugLog(
          "OTP verified for available credit limit",
          res,
          "credit-otp-modal",
          "handleCreditFunction"
        );

        setWrongAttempts(0);
        setBlockedUntil("");

        MMKVDB.set(DBKeys.CREDIT_OTP_WRONG_ATTEMPTS, "0");
        MMKVDB.set(DBKeys.CREDIT_OTP_BLOCKED_UNTIL, "");

        handleCreditUsed();
      }
    } catch (error: any) {
      errorLog(
        error?.message,
        { phone: data.phone, otp: otp },
        "credit-otp-modal",
        "handleCreditFunction",
        error
      );
      if (error.code === "wrong_otp") {
        handleWrongAttempt();
      }
      showToast("error", t("Invalid OTP"));
    } finally {
      setLoading(false);
    }
  };

  const handleWrongAttempt = () => {
    // Increment the wrong attempts count
    setWrongAttempts((prevAttempts) => prevAttempts + 1);

    // Store wrong attempts count
    MMKVDB.set(DBKeys.CREDIT_OTP_WRONG_ATTEMPTS, `${wrongAttempts + 1}`);

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
    MMKVDB.set(DBKeys.CREDIT_OTP_BLOCKED_UNTIL, blockedTime);
  };

  const fetchData = async () => {
    // Retrieve stored wrong attempts count and blockedUntil timestamp
    const storedWrongAttempts =
      MMKVDB.get(DBKeys.CREDIT_OTP_WRONG_ATTEMPTS) || "0";

    const storedBlockedUntil = MMKVDB.get(DBKeys.CREDIT_OTP_BLOCKED_UNTIL);

    setWrongAttempts(Number(storedWrongAttempts));
    setBlockedUntil(Number(storedBlockedUntil));
  };

  useEffect(() => {
    setOtp("");
    setLoading(false);
    setWrongAttempts(0);
    setBlockedUntil("");
    fetchData();
  }, [visible]);

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
        MMKVDB.set(DBKeys.CREDIT_OTP_BLOCKED_UNTIL, "");

        // Reset wrong attempts after unblocking
        setWrongAttempts(0);
        MMKVDB.set(DBKeys.CREDIT_OTP_WRONG_ATTEMPTS, "0");
      }
    }
  }, [blockedUntil]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent={true}
      style={{ height: "100%" }}
    >
      <View
        style={{
          ...styles.container,
          marginTop: isKeyboardVisible ? "-7.5%" : "0%",
          backgroundColor: theme.colors.transparentBg,
        }}
      >
        <View
          style={{
            borderRadius: 16,
            paddingVertical: hp("2%"),
            backgroundColor: theme.colors.white[1000],
          }}
        >
          <View
            style={{
              paddingHorizontal: hp("1.5%"),
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <DefaultText style={{ fontSize: 20 }} fontWeight="medium">
              {t("OTP Verification")}
            </DefaultText>

            <TouchableOpacity onPress={() => handleClose()}>
              <ICONS.ClosedFilledIcon />
            </TouchableOpacity>
          </View>

          <View
            style={{
              marginTop: hp("1.5%"),
              height: 1,
              backgroundColor: theme.colors.dividerColor.main,
            }}
          />

          <DefaultText
            style={{
              marginTop: hp("1.75%"),
              paddingHorizontal: hp("1.5%"),
              fontSize: 20,
            }}
            fontWeight="medium"
          >
            {`${t("Using")} ${t("SAR")} ${data?.creditAmount}`}
          </DefaultText>

          <DefaultText
            style={{
              marginTop: 2,
              paddingHorizontal: hp("1.5%"),
            }}
            fontSize="lg"
            color="otherGrey.100"
          >
            {`${t("Please enter customer’s OTP to use credit")}.`}
          </DefaultText>

          <View style={{ paddingHorizontal: hp("1.5%") }}>
            <OTPTextView
              //@ts-ignore
              textInputStyle={{
                marginVertical: hp("2%"),
                marginHorizontal: hp("0.6%"),
                height: twoPaneView ? wp("5.5%") : hp("7.5%"),
                width: twoPaneView ? wp("5.5%") : hp("7.5%"),
                flexDirection: "row",
                fontSize: hp("4%"),
                fontWeight: theme.fontWeights.medium,
                backgroundColor: theme.colors.primary[100],
              }}
              ref={otpInput}
              inputCount={4}
              inputCellLength={1}
              disabled={userBlocked}
              offTintColor={theme.colors.dark[200]}
              tintColor={theme.colors.primary[100]}
              handleTextChange={(text: string) => setOtp(text)}
            />
          </View>

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
              style={{ marginLeft: 16, paddingVertical: hp("1%") }}
              fontSize="lg"
            >
              {`${"User is blocked for"} ${format(
                new Date(blockedUntil - new Date().getTime()),
                "mm"
              )} ${"minutes"}`}
            </DefaultText>
          )}

          <PrimaryButton
            style={{
              marginTop: hp("1%"),
              paddingVertical: hp("2.25%"),
              paddingHorizontal: wp("1.8%"),
              marginHorizontal: hp("2%"),
            }}
            textStyle={{
              fontSize: 16,
              fontWeight: theme.fontWeights.medium,
              fontFamily: theme.fonts.circulatStd,
            }}
            loading={loading}
            title={t("Verify")}
            onPress={() => {
              handleCredit();
            }}
            disabled={userBlocked}
          />
        </View>
      </View>

      <Toast />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
});
