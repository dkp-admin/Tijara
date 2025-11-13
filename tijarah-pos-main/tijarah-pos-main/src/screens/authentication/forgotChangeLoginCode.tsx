import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import endpoint from "../../api/endpoints";
import { PrimaryButton } from "../../components/buttons/primary-button";
import FloatingBackButton from "../../components/common/floating-back-button";
import FloatingLangView from "../../components/common/floating-lang-view";
import OTPTextView from "../../components/input/otp-input";
import SelectInput from "../../components/input/select-input";
import OTPVerificationModal from "../../components/modal/otp-verification-modal";
import Spacer from "../../components/spacer";
import DefaultText from "../../components/text/Text";
import showToast from "../../components/toast";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import { useResponsive } from "../../hooks/use-responsiveness";
import { repo } from "../../utils/createDatabaseConnection";
import { ERRORS } from "../../utils/errors";
import { trimText } from "../../utils/trim-text";
import { checkKeyboardState } from "../../hooks/use-keyboard-state";
import { debugLog, errorLog, infoLog } from "../../utils/log-patch";

const ForgotChangeLoginCode = (props: any) => {
  const theme = useTheme();
  const otpInput = useRef<any>();
  const isConnected = checkInternet();
  const isKeyboardVisible = checkKeyboardState();
  const { wp, hp, twoPaneView } = useResponsive();
  const navigation = useNavigation<any>();
  const { title, userData, isFromProfile } = props.route.params;
  const [user, setUser] = useState<any>(null);
  const [otp, setOtp] = useState("");
  const [visible, setVisible] = useState(false);
  const [usersList, setUsersList] = useState([]) as any;
  const [loading, setLoading] = useState(false);

  const sendOTPForChangePin = async () => {
    if (user?.key == null) {
      debugLog(
        "User not selected",
        user,
        "forgot-login-code-screen",
        "sendOTPFunction"
      );
      showToast("error", t("Invalid user or password"));
      return;
    }

    if (otp.length == 0) {
      debugLog(
        "OTP length is 0",
        { otp: otp },
        "forgot-login-code-screen",
        "sendOTPFunction"
      );
      showToast("error", t("Invalid user or password"));
      return;
    }

    if (otp.length != 4) {
      debugLog(
        "OTP length not equal to 4",
        { otp: otp },
        "forgot-login-code-screen",
        "sendOTPFunction"
      );
      showToast("error", t("Invalid user or password"));
      return;
    }

    if (!isConnected) {
      infoLog(
        "Internet not connected",
        { otp: otp },
        "forgot-login-code-screen",
        "sendOTPFunction"
      );
      showToast("info", t("Please connect with the internet"));
      return;
    }

    setLoading(true);

    try {
      const res = await serviceCaller(endpoint.sendOTP.path, {
        method: endpoint.sendOTP.method,
        body: {
          phone: user.phone,
        },
      });

      if (res.code === "otp_sent") {
        debugLog(
          "OTP sent",
          res,
          "forgot-login-code-screen",
          "sendOTPFunction"
        );
        setVisible(true);
      }
    } catch (error: any) {
      errorLog(
        error?.code,
        { phone: user.phone },
        "forgot-login-code-screen",
        "sendOTPFunction",
        error
      );
      showToast("error", t("Invalid user or password"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData != null) {
      setUser(userData);
    }
  }, [userData]);

  useEffect(() => {
    repo.user
      .find({})
      .then((user) => {
        debugLog(
          "User fetched successful",
          user,
          "forgot-login-code-screen",
          "getUsersFromDB"
        );
        setUsersList(user);
      })
      .catch((err) =>
        errorLog(
          "User fetch failed",
          {},
          "forgot-login-code-screen",
          "getUsersFromDB",
          err
        )
      );
  }, []);

  return (
    <View
      style={{
        ...styles.container,
        backgroundColor: theme.colors.bgColor,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          marginTop: isKeyboardVisible ? "-7%" : "0%",
        }}
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
      >
        <FloatingBackButton />
        {!isFromProfile && <FloatingLangView />}

        <View
          style={{
            marginTop: hp("15%"),
            paddingHorizontal: twoPaneView ? wp("30%") : wp("7.5%"),
          }}
        >
          <DefaultText
            style={{
              textAlign: "center",
              fontSize: hp("3.25%"),
              letterSpacing: 0.35,
            }}
            fontWeight="medium"
          >
            {title}
          </DefaultText>

          <View
            style={{
              marginTop: hp("3%"),
            }}
          >
            <SelectInput
              marginHorizontal="0%"
              isTwoText={true}
              leftText={t("Login ID")}
              placeholderText={t("Select User")}
              searchText={t("Search User")}
              options={usersList}
              values={user}
              showInputValue={trimText(user?.name, 30)}
              handleChange={(val: any) => {
                if (val.key && val.value) {
                  setUser(val);
                  setOtp("");
                }
              }}
              containerStyle={{ marginTop: hp("3%"), borderWidth: 0 }}
              disabled={isFromProfile}
            />

            {user != null && (
              <View style={{ marginTop: hp("3.5%") }}>
                <DefaultText
                  style={{
                    textAlign: "center",
                    marginHorizontal: hp("2%"),
                  }}
                  color="otherGrey.100"
                >
                  {t("Please enter new login pin")}
                </DefaultText>

                <View style={{ alignItems: "center" }}>
                  <OTPTextView
                    //@ts-ignore
                    textInputStyle={{
                      marginTop: hp("2.5%"),
                      marginHorizontal: hp("1%"),
                      height: twoPaneView ? wp("5.5%") : hp("6%"),
                      width: twoPaneView ? wp("5.5%") : hp("6%"),
                      flexDirection: "row",
                      fontSize: hp("4%"),
                      fontWeight: theme.fontWeights.medium,
                      backgroundColor: theme.colors.primary[100],
                    }}
                    ref={otpInput}
                    inputCount={4}
                    inputCellLength={1}
                    offTintColor={theme.colors.white[1000]}
                    tintColor={theme.colors.primary[100]}
                    handleTextChange={(text: string) => setOtp(text)}
                  />
                </View>
              </View>
            )}
          </View>

          <PrimaryButton
            style={{
              marginTop: hp("8%"),
              paddingVertical: hp("2.2%"),
              marginHorizontal: twoPaneView ? wp("6%") : wp("0%"),
            }}
            loading={loading}
            onPress={() => {
              sendOTPForChangePin();
            }}
            title={t("Submit")}
          />

          {!isFromProfile && (
            <PrimaryButton
              reverse
              style={{
                marginTop: hp("3.5%"),
                paddingVertical: hp("2.2%"),
                marginHorizontal: twoPaneView ? wp("6%") : wp("0%"),
              }}
              onPress={() => navigation.goBack()}
              title={t("Login")}
            />
          )}
        </View>

        <OTPVerificationModal
          visible={visible}
          data={{
            user: user,
            userPin: otp,
          }}
          handleClose={() => setVisible(false)}
        />

        <Spacer space={hp("15%")} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ForgotChangeLoginCode;
