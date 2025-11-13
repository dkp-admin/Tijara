import { useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import * as bcrypt from "react-native-bcrypt";
import Toast from "react-native-toast-message";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import endpoint from "../../api/endpoints";
import AuthContext from "../../context/auth-context";
import DeviceContext from "../../context/device-context";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import {
  getSubscriptionDetails,
  useBusinessDetails,
} from "../../hooks/use-business-details";
import { checkKeyboardState } from "../../hooks/use-keyboard-state";
import { useResponsive } from "../../hooks/use-responsiveness";
import MMKVDB from "../../utils/DB-MMKV";
import { DBKeys } from "../../utils/DBKeys";
import { objectId } from "../../utils/bsonObjectIdTransformer";
import {
  OtherChannels,
  PAYMENT_TYPES_LIST,
  RestaurantChannels,
} from "../../utils/constants";
import { repo } from "../../utils/createDatabaseConnection";
import ICONS from "../../utils/icons";
import { debugLog, errorLog } from "../../utils/log-patch";
import { trimText } from "../../utils/trim-text";
import { PrimaryButton } from "../buttons/primary-button";
import OTPTextView from "../input/otp-input";
import Spacer from "../spacer";
import DefaultText from "../text/Text";
import showToast from "../toast";
import DatabasePull from "../../sync/database-pull";

function TransformBusinessDetailToLocal(dataArray: any) {
  const data = dataArray[0];
  const company = {
    _id: data.company._id,
    logo: data.company.logo,
    localLogo: data.company?.logo,
    owner: { name: data.company.owner.name },
    name: { en: data.company.name.en, ar: data.company.name.ar },
    email: data.company.email,
    phone: data.company.phone,
    subscriptionType: data.company.subscriptionType,
    subscriptionStartDate: data.company?.subscriptionStartDate || "",
    subscriptionEndDate: data.company?.subscriptionEndDate || "",
    vat: {
      percentage: data.company.vat.percentage,
      docNumber: data.company.vat.docNumber,
      vatRef: data.company.vat.vatRef || "",
    },
    businessType: data.company.businessType,
    address: {
      address1: data.company.address.address1,
      address2: data.company.address.address2,
      city: data.company.address.city,
      postalCode: data.company.address.postalCode,
      country: data.company.address.country,
    },
    status: data.company.status,
    businessTypeRef: data.company.businessTypeRef,
    ownerRef: data.company.ownerRef,
    wallet: data.company?.wallet,
    minimumWalletBalance: data.company?.minimumRedeemAmount || 10,
  };

  const location = {
    _id: data.location._id,
    name: { en: data.location.name.en, ar: data.location.name.ar },
    businessType: data.location.businessType,
    address: {
      address1: data.location.address.address1,
      address2: data.location.address.address2,
      country: data.location.address.country,
      state: data.location.address.state,
      city: data.location.address.city,
      postalCode: data.location.address.postalCode,
    },
    email: data.location.email,
    phone: data.location.phone,
    vatRef: data.location.vatRef,
    vat: { percentage: data.location.vat.percentage },
    startTime: data.location?.startTime,
    endTime: data.location?.endTime,
    status: data.location.status,
    businessTypeRef: data.location.businessTypeRef,
    companyRef: data.location.companyRef,
    ownerRef: data.location.ownerRef,
    negativeBilling: data.location?.negativeBilling,
  };

  const businessDetail: any = {
    _id: data.location._id,
    company,
    location,
    source: "server",
  };

  return [businessDetail];
}

export default function VerifyOTPModal({
  data,
  visible = false,
  handleClose,
}: {
  data: any;
  visible: boolean;
  handleClose?: any;
}) {
  const theme = useTheme();
  const otpInput = useRef<any>();
  const isConnected = checkInternet();
  const navigation = useNavigation<any>();
  const isKeyboardVisible = checkKeyboardState();

  const { hp, wp, twoPaneView } = useResponsive();
  const { subscriptionDetails } = useBusinessDetails();
  const authContext = useContext(AuthContext) as any;
  const deviceContext = useContext(DeviceContext) as any;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [userBlocked, setUserBlocked] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [blockedUntil, setBlockedUntil] = useState<any>("");
  const [billingSettings, setBillingSettings] = useState<any>(null);

  const getBusinessDetail = useCallback(async () => {
    if (isConnected) {
      let lastSynced = MMKVDB.get(DBKeys.BUSINESS_DETAIL_LAST_SYNCED_AT);

      const query: any = {
        lastSyncAt: lastSynced,
        page: 0,
        limit: 1,
        sort: "asc",
        activeTab: "all",
        companyRef: deviceContext.user.companyRef,
        locationRef: deviceContext.user.locationRef,
      };

      setLoading(true);

      try {
        const res = await serviceCaller(endpoint.businessDetailPull.path, {
          method: endpoint.businessDetailPull.method,
          query: query,
        });

        if (res.results.length > 0) {
          debugLog(
            "Business details response success from api",
            {},
            "verify-otp-modal",
            "businessDetailFunction"
          );
          const data = await TransformBusinessDetailToLocal(res.results?.[0]);
          const updateRes = await repo.business.update(
            { _id: data[0]._id },
            { ...data[0] }
          );

          await new DatabasePull().fetchBusinessDetail();

          if (updateRes) {
            debugLog(
              "Business details updated to local db",
              {},
              "verify-otp-modal",
              "businessDetailFunction"
            );

            const subscrition = getSubscriptionDetails(
              data[0].company.subscriptionEndDate
            );

            gotoNextScreen(subscrition.renewIn);
          }
        } else {
          gotoNextScreen(subscriptionDetails.renewIn);
        }
      } catch (error: any) {
        errorLog(
          error?.code,
          query,
          "verify-otp-modal",
          "businessDetailFunction",
          error
        );
        gotoNextScreen(subscriptionDetails.renewIn);
      }
    } else {
      gotoNextScreen(subscriptionDetails.renewIn);
    }
  }, [deviceContext, data?.user]);

  const gotoNextScreen = async (renewIn: number) => {
    if (renewIn >= 0) {
      debugLog(
        "User Logged-in Successfully",
        data.user,
        "verify-otp-modal",
        "nextScreenFunction"
      );
      checkUpdateCashDrawer();
      MMKVDB.set(DBKeys.USER, data.user);
      MMKVDB.set(DBKeys.USERTYPE, data.user.userType);
      MMKVDB.set("blockedPromotion", "");
      authContext.login({
        ...data.user,
        profilePicture: data.user.profilePicture,
      });
    } else {
      debugLog(
        "Navigate to subscription expired screen",
        { renewIn: renewIn },
        "verify-otp-modal",
        "nextScreenFunction"
      );

      navigation.navigate("SubscriptionExpired");
    }

    setLoading(true);
    handleClose();
  };

  const checkUpdateCashDrawer = async () => {
    const businessData: any = repo.business.findOne({
      where: { _id: deviceContext.user.locationRef },
    });

    if (!billingSettings.cashManagement) {
      MMKVDB.set(DBKeys.CASH_DRAWER, "open");

      const cashDrawerData = {
        _id: objectId(),
        userRef: data.user._id,
        user: { name: data.user.name },
        location: { name: businessData.location.name.en },
        locationRef: businessData.location._id,
        company: { name: businessData.company.name.en },
        companyRef: businessData.company._id,
        openingActual: undefined,
        openingExpected: undefined,
        closingActual: undefined,
        closingExpected: undefined,
        difference: undefined,
        totalSales: undefined,
        transactionType: "open",
        description: "Cash Drawer Open",
        shiftIn: true,
        dayEnd: false,
        started: new Date(),
        ended: new Date(),
        source: "local",
      };

      repo.cashDrawerTxn
        .insert(cashDrawerData as any)
        .then(() =>
          debugLog(
            "Cash drawer inserted to local db",
            cashDrawerData,
            "verify-otp-modal",
            "updateCashDrawerFunction"
          )
        )
        .catch((err) =>
          errorLog(
            "Cash drawer insertion failed to local db",
            cashDrawerData,
            "verify-otp-modal",
            "updateCashDrawerFunction",
            err
          )
        );
    }
  };

  const handleLogin = () => {
    if (otp.length == 0) {
      debugLog(
        "OTP not entered",
        { otp: otp },
        "verify-otp-modal",
        "handleLoginFunction"
      );
      showToast("error", t("Invalid user or password"));
      return;
    }

    if (otp.length != 4) {
      debugLog(
        "OTP length not equal to 4",
        { otp: otp },
        "verify-otp-modal",
        "handleLoginFunction"
      );
      showToast("error", t("Invalid user or password"));
      return;
    }

    if (data.user.pin?.length === 4) {
      if (data.user?.pin === otp) {
        handleUserLogin();
      } else {
        handleWrongPin();
      }
    } else {
      bcrypt.compare(otp, data.user.pin, function (err: any, res: any) {
        if (res) {
          handleUserLogin();
        } else {
          handleWrongPin();
        }
      });
    }
  };

  const handleWrongPin = () => {
    debugLog(
      "Wrong Pin Code",
      { otp: otp },
      "verify-otp-modal",
      "handleLoginFunction"
    );
    showToast("error", t("Invalid user or password"));
    handleWrongAttempt();
  };

  const handleUserLogin = async () => {
    showToast("success", t("User Logged-in Successfully"));

    setWrongAttempts(0);
    setBlockedUntil("");

    MMKVDB.set(DBKeys.LOGIN_OTP_WRONG_ATTEMPTS, "0");
    MMKVDB.set(DBKeys.LOGIN_OTP_BLOCKED_UNTIL, "");

    if (billingSettings == null) {
      const billingData = {
        _id: deviceContext?.user?.locationRef,
        quickAmounts: true,
        catalogueManagement: true,
        paymentTypes: PAYMENT_TYPES_LIST.map((payment: any, index: number) => {
          return {
            _id: index,
            name: payment.name,
            status: true,
          };
        }),
        orderTypesList:
          deviceContext.user.company.industry?.toLowerCase() === "restaurant"
            ? RestaurantChannels
            : OtherChannels,
        cardPaymentOption: "manual",
        defaultCompleteBtn: "with-print",
        defaultCash: 0,
        noOfReceiptPrint: "1",
        cashManagement: false,
        orderTypes: "walk-in",
        keypad: true,
        discounts: true,
        promotions: true,
        customCharges: true,
      };

      repo.billingSettings
        .insert(billingData)
        .then(async () => {
          debugLog(
            "Billing settings inserted to local db",
            billingData,
            "verify-otp-modal",
            "handleLoginFunction"
          );
          MMKVDB.set(DBKeys.CASH_DRAWER, "open");

          debugLog(
            "Navigate to sync fetch data progress bar screen",
            data.user,
            "verify-otp-modal",
            "handleLoginFunction"
          );

          handleClose();

          navigation.navigate("SyncFetchData", {
            user: data.user,
          });
        })
        .catch((err) =>
          errorLog(
            "Billing settings insertion failed to local db",
            { locationRef: deviceContext?.user?.locationRef },
            "verify-otp-modal",
            "handleLoginFunction",
            err
          )
        );
    } else {
      let payments = billingSettings.paymentTypes;

      if (billingSettings.paymentTypes?.length === 2) {
        payments.push({
          _id: 2,
          name: "Wallet",
          status: true,
        });

        await repo.billingSettings.update(
          { _id: billingSettings?._id },
          {
            ...billingSettings,
            paymentTypes: payments,
          }
        );

        debugLog(
          "Billing settings updated to local db",
          {
            ...billingSettings,
            paymentTypes: payments,
          },
          "verify-otp-modal",
          "handleLoginFunction"
        );
      }

      if (billingSettings.paymentTypes?.length === 3) {
        payments.push({
          _id: 3,
          name: "Credit",
          status: false,
        });

        await repo.billingSettings.update(
          { _id: billingSettings?._id },
          {
            ...billingSettings,
            paymentTypes: payments,
          }
        );

        debugLog(
          "Billing settings updated to local db",
          {
            ...billingSettings,
            paymentTypes: payments,
          },
          "verify-otp-modal",
          "handleLoginFunction"
        );
      }

      if (billingSettings.orderTypesList?.length === 0) {
        const orderTypeList =
          deviceContext.user.company.industry?.toLowerCase() === "restaurant"
            ? RestaurantChannels
            : OtherChannels;

        await repo.billingSettings.update(
          { _id: billingSettings?._id },
          {
            ...billingSettings,
            paymentTypes: payments,
            orderTypesList: orderTypeList,
          }
        );

        debugLog(
          "Billing settings updated to local db",
          {
            ...billingSettings,
            paymentTypes: payments,
            orderTypesList: orderTypeList,
          },
          "verify-otp-modal",
          "handleLoginFunction"
        );
      }

      const syncAll = MMKVDB.get(DBKeys.FIRST_TIME_SYNC_ALL) || "";

      if (syncAll === "success") {
        getBusinessDetail();
      } else {
        debugLog(
          "Navigate to sync fetch data progress bar screen",
          data.user,
          "verify-otp-modal",
          "handleLoginFunction"
        );
        navigation.navigate("SyncFetchData", {
          user: data.user,
        });
      }
    }
  };

  const handleWrongAttempt = () => {
    // Increment the wrong attempts count
    setWrongAttempts((prevAttempts) => prevAttempts + 1);

    // Store wrong attempts count
    MMKVDB.set(DBKeys.LOGIN_OTP_WRONG_ATTEMPTS, `${wrongAttempts + 1}`);

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
    MMKVDB.set(DBKeys.LOGIN_OTP_BLOCKED_UNTIL, blockedTime);
  };

  const fetchData = async () => {
    // Retrieve stored wrong attempts count and blockedUntil timestamp
    const storedWrongAttempts =
      MMKVDB.get(DBKeys.LOGIN_OTP_WRONG_ATTEMPTS) || "0";

    const storedBlockedUntil = MMKVDB.get(DBKeys.LOGIN_OTP_BLOCKED_UNTIL);

    setWrongAttempts(Number(storedWrongAttempts));
    setBlockedUntil(Number(storedBlockedUntil));
  };

  useEffect(() => {
    setOtp("");
    setLoading(false);
    setWrongAttempts(0);
    setBlockedUntil("");
    fetchData();

    repo.billingSettings
      .findOne({ where: { _id: deviceContext?.user?.locationRef } })
      .then((data: any) => {
        debugLog(
          "Billing settings fetched from local db",
          data,
          "verify-otp-modal",
          "billingSettingsFromDB"
        );
        setBillingSettings(data);
      })
      .catch((err) =>
        errorLog(
          "Billing settings fetch failed from local db",
          { locationRef: deviceContext?.user?.locationRef },
          "verify-otp-modal",
          "billingSettingsFromDB",
          err
        )
      );
  }, [visible, deviceContext]);

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
        MMKVDB.set(DBKeys.LOGIN_OTP_BLOCKED_UNTIL, "");
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
              {t("Login Pin")}
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
            {`${trimText(data?.user?.name, 20)},`}
          </DefaultText>

          <DefaultText
            style={{
              marginTop: 2,
              paddingHorizontal: hp("1.5%"),
            }}
            fontSize="lg"
            color="otherGrey.100"
          >
            {`${t("Please enter your login pin")}.`}
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

          <View
            style={{
              marginTop: hp("1%"),
              paddingHorizontal: hp("1.5%"),
              flexDirection: "row",
            }}
          >
            <View style={{ flex: 1 }}>
              <PrimaryButton
                style={{
                  paddingVertical: hp("2.25%"),
                  paddingHorizontal: wp("1.5%"),
                  backgroundColor: theme.colors.otherGrey[100],
                }}
                textStyle={{
                  fontSize: 16,
                  fontWeight: theme.fontWeights.medium,
                  color: theme.colors.white[1000],
                  fontFamily: theme.fonts.circulatStd,
                }}
                title={t("Reset Pin")}
                onPress={() => {
                  handleClose();
                  debugLog(
                    "navigate to reset pin code",
                    data?.user,
                    "verify-otp-modal",
                    "handleResetPinButton"
                  );
                  navigation.navigate("ForgotChangeLoginCode", {
                    title: t("Reset login code"),
                    userData: data?.user,
                  });
                }}
                disabled={userBlocked}
              />
            </View>

            <Spacer space={hp("2%")} />

            <View style={{ flex: 1 }}>
              <PrimaryButton
                style={{
                  paddingVertical: hp("2.25%"),
                  paddingHorizontal: wp("1.5%"),
                }}
                textStyle={{
                  fontSize: 16,
                  fontWeight: theme.fontWeights.medium,
                  fontFamily: theme.fonts.circulatStd,
                }}
                loading={loading}
                title={t("Login")}
                onPress={() => {
                  handleLogin();
                }}
                disabled={userBlocked}
              />
            </View>
          </View>
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
