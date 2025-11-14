import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import React, { useEffect, useRef, useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import endpoint from "../../api/endpoints";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import { checkKeyboardState } from "../../hooks/use-keyboard-state";
import { useResponsive } from "../../hooks/use-responsiveness";
import { queryClient } from "../../query-client";
import MMKVDB from "../../utils/DB-MMKV";
import { DBKeys } from "../../utils/DBKeys";
import { ERRORS } from "../../utils/errors";
import ICONS from "../../utils/icons";
import { PrimaryButton } from "../buttons/primary-button";
import OTPTextView from "../input/otp-input";
import DefaultText from "../text/Text";
import showToast from "../toast";
import repository from "../../db/repository";

export default function OTPVerificationModal({
  data,
  visible = false,
  handleClose,
}: {
  data: any;
  visible: boolean;
  handleClose: any;
}) {
  const theme = useTheme();
  const otpInput = useRef<any>();
  const isConnected = checkInternet();
  const navigation = useNavigation<any>();
  const isKeyboardVisible = checkKeyboardState();

  const { hp, wp, twoPaneView } = useResponsive();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);
  const [resendBtnTap, setResendBtnTap] = useState(true);
  const [timer, setTimer] = useState(60);
  const [userBlocked, setUserBlocked] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [blockedUntil, setBlockedUntil] = useState<any>("");

  const sendOTPForChangePin = async () => {
    if (!isConnected) {
      showToast("info", t("Please connect with the internet"));
      return;
    }

    setLoadingResend(true);

    try {
      const res = await serviceCaller(endpoint.sendOTP.path, {
        method: endpoint.sendOTP.method,
        body: {
          phone: data.user.phone,
        },
      });

      if (res.code === "otp_sent") {
        setResendBtnTap(true);
        setTimer(60);
      }
    } catch (error: any) {
      showToast("error", t(ERRORS.SOMETHING_WENT_WRONG));
    } finally {
      setLoadingResend(false);
    }
  };

  const verifyOTPForChangePin = async () => {
    if (otp.length == 0) {
      showToast("error", t("Invalid OTP"));
      return;
    }

    if (otp.length != 4) {
      showToast("error", t("Invalid OTP"));
      return;
    }

    if (!isConnected) {
      showToast("info", t("Please connect with the internet"));
      return;
    }

    setLoading(true);

    try {
      const res = await serviceCaller(endpoint.resetPassword.path, {
        method: endpoint.resetPassword.method,
        body: {
          phone: data.user.phone,
          otp: otp,
          newPassword: data.userPin,
          type: "pin",
        },
      });

      if (res?.code === "success") {
        await repository.userRepository.update(data.user._id, {
          _id: data.user._id,
          name: data.user.name,
          company: { name: data.user.company.name },
          companyRef: data.user.companyRef,
          location: { name: data.user.location.name },
          locationRef: data.user.locationRef,
          locationRefs: data?.user?.locationRefs || [],
          profilePicture: data.user.profilePicture,
          email: data.user.email,
          phone: data.user.phone,
          userType: data.user.userType,
          permissions: data.user.permissions,
          status: data.user.status,
          onboarded: data.user.onboarded,
          createdAt: data.user.createdAt,
          updatedAt: data.user.updatedAt,
          pin: otp,
          key: data.user.key,
          value: data.user.value,
          version: 1,
        });
        queryClient.invalidateQueries("find-device-user");

        setWrongAttempts(0);
        setBlockedUntil("");

        MMKVDB.set(DBKeys.FORGOT_OTP_WRONG_ATTEMPTS, "0");
        MMKVDB.set(DBKeys.FORGOT_OTP_BLOCKED_UNTIL, "");

        navigation.goBack();
        handleClose();
        showToast("success", t("Login code changed successfully"));
      }
    } catch (error: any) {
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
    MMKVDB.set(DBKeys.FORGOT_OTP_WRONG_ATTEMPTS, `${wrongAttempts + 1}`);

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
    MMKVDB.set(DBKeys.FORGOT_OTP_BLOCKED_UNTIL, blockedTime);
  };

  const fetchData = async () => {
    // Retrieve stored wrong attempts count and blockedUntil timestamp
    const storedWrongAttempts =
      MMKVDB.get(DBKeys.FORGOT_OTP_WRONG_ATTEMPTS) || "0";

    const storedBlockedUntil = MMKVDB.get(DBKeys.FORGOT_OTP_BLOCKED_UNTIL);

    setWrongAttempts(Number(storedWrongAttempts));
    setBlockedUntil(Number(storedBlockedUntil));
  };

  useEffect(() => {
    if (visible) {
      setOtp("");
      setLoading(false);
      setResendBtnTap(true);
      setTimer(60);
      setWrongAttempts(0);
      setBlockedUntil("");
      fetchData();
    }
  }, [visible]);

  useEffect(() => {
    let interval: any;

    if (resendBtnTap) {
      interval = setInterval(() => {
        if (timer > 0) {
          setTimer(timer - 1);
        } else {
          setResendBtnTap(false);
          clearInterval(interval);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [resendBtnTap, timer]);

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
        MMKVDB.set(DBKeys.FORGOT_OTP_BLOCKED_UNTIL, "");
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
              marginTop: hp("2%"),
              paddingHorizontal: hp("1.5%"),
            }}
            fontSize="lg"
            fontWeight="normal"
            color="otherGrey.100"
          >
            {`${t("Please enter the code sent on")} ${data?.user?.phone}`}
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

          {userBlocked ? (
            <DefaultText
              style={{ marginLeft: 16, paddingVertical: hp("1%") }}
              fontSize="lg"
            >
              {`${"User is blocked for"} ${format(
                new Date(blockedUntil - new Date().getTime()),
                "mm"
              )} ${"minutes"}`}
            </DefaultText>
          ) : (
            <View
              style={{
                marginTop: -8,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <DefaultText
                style={{ marginLeft: 16 }}
                fontSize="lg"
                fontWeight="normal"
                color="otherGrey.100"
              >
                {t("Didn't receive the code?")}
              </DefaultText>

              {resendBtnTap ? (
                <DefaultText
                  style={{ marginRight: 12, paddingVertical: hp("1%") }}
                  fontSize="lg"
                  fontWeight="normal"
                  color="otherGrey.100"
                >
                  {`(00:${timer})`}
                </DefaultText>
              ) : (
                <PrimaryButton
                  style={{
                    paddingVertical: hp("1%"),
                    backgroundColor: "transparent",
                  }}
                  textStyle={{
                    fontSize: 16,
                    fontWeight: theme.fontWeights.light,
                    color: theme.colors.primary[1000],
                    fontFamily: theme.fonts.circulatStd,
                  }}
                  title={t("Resend OTP")}
                  onPress={() => {
                    sendOTPForChangePin();
                  }}
                  loading={loadingResend}
                  disabled={resendBtnTap}
                />
              )}
            </View>
          )}

          <PrimaryButton
            style={{
              marginTop: hp("2.5%"),
              paddingVertical: hp("2.25%"),
              paddingHorizontal: wp("1.5%"),
              marginHorizontal: hp("1.5%"),
            }}
            textStyle={{
              fontSize: 16,
              fontWeight: theme.fontWeights.medium,
              fontFamily: theme.fonts.circulatStd,
            }}
            loading={loading}
            title={t("Verify")}
            onPress={() => {
              verifyOTPForChangePin();
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
