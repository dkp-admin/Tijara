import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { EventRegister } from "react-native-event-listeners";
import Toast from "react-native-toast-message";
import { HOST } from "../../../../../config";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { fetchPaymentQR } from "../../../../hooks/fetch-payment-qr";
import { fetchPaymentStatusStc } from "../../../../hooks/fetch-payment-status";
import { checkKeyboardState } from "../../../../hooks/use-keyboard-state";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import { useCurrency } from "../../../../store/get-currency";
import useStcPayStore from "../../../../store/stcpay-store";
import generateOrderNumber from "../../../../utils/generate-order-number";
import AnimatedQRCode from "../../../animated-qr";
import { PrimaryButton } from "../../../buttons/primary-button";
import CurrencyView from "../../../modal/currency-view-modal";
import DefaultText from "../../../text/Text";
import showToast from "../../../toast";

const STCPayModal = ({
  visible = false,
  connected = true,
  handleCancel,
}: {
  visible: boolean;
  connected: boolean;
  handleCancel: () => void;
}) => {
  const { currency } = useCurrency();
  const theme = useTheme();
  const isKeyboardVisible = checkKeyboardState();
  const { hp, wp, twoPaneView } = useResponsive();
  const [stcData, setStcData] = useState(null) as any;
  const [qrData, setQrData] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(null) as any;
  const [refNum, setRefNum] = useState(null) as any;
  const [billNum, setBillNum] = useState(null) as any;
  const [orderNum, setOrderNum] = useState("") as any;

  const intervalRef = useRef() as any;
  const timeoutRef = useRef() as any;

  const { setData } = useStcPayStore();

  useEffect(() => {
    if (!twoPaneView) {
      const listener: any = EventRegister.addEventListener(
        "initStcPay",
        (data) => {
          setStcData(data);
        }
      );

      return () => {
        EventRegister.removeEventListener(listener);
      };
    }
  }, []);

  const clearAllStates = useCallback(() => {
    setStcData(null);
    setQrData("");
    setPaymentStatus(null);
    setRefNum(null);
    setBillNum(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (stcData && !twoPaneView && visible) {
      generateOrderNumber()
        .then((res) => setOrderNum(res))
        .catch((err) => showToast("error", "Error generating order number"));

      const data = {
        ...stcData,
        refNum: orderNum,
        billNum: orderNum,
      };
      setRefNum(data?.refNum);
      setBillNum(data?.billNum);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

      console.log(
        "QR URL",
        `${HOST}/order/qr?refNum=${data?.refNum}&amt=${Number(
          data?.amount?.toFixed(2)
        )}&refNum=${data?.refNum}&billNum=${data?.billNum}&locationId=${
          data?.deviceCode
        }&deviceCode=${data?.deviceCode}`
      );

      fetchPaymentQR(
        data,
        controller,
        (result: any) => {
          clearTimeout(timeoutId);
          console.log("STC RESULT", result);
          if (result.qr) {
            setQrData(result.qr);
          } else {
            throw new Error("QR code not received in response");
          }
        },
        (error: any) => {
          if (error.name === "AbortError") {
            console.error("QR code generation request timed out");
            showToast(
              "error",
              "QR code generation timed out. Please try again."
            );
          } else {
            console.error("Error generating QR code:", error);
            showToast("error", "Error generating QR code. Please try again.");
          }
          // Reset relevant state variables
          setRefNum(null);
          setBillNum(null);
          setQrData("");
        },
        () => {
          clearTimeout(timeoutId);
        }
      );

      // Cleanup function
      return () => {
        clearTimeout(timeoutId);
        controller.abort();
      };
    }
  }, [stcData]);

  const handlePaymentStatus = async (pStatus: any) => {
    if (!twoPaneView && visible) {
      if (pStatus || pStatus === false) {
        const d = {
          status: pStatus,
          refNum: refNum,
          amount: stcData?.amount,
          billNum: billNum,
        };

        if (refNum && billNum) {
          setData(d);
        }

        setStcData(null);
        setQrData("");
        clearInterval(intervalRef.current);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        intervalRef.current = null;
        console.log("Current Interval", intervalRef.current);
        console.log("Current Timeout", timeoutRef.current);
        setRefNum(null);
        setBillNum(null);

        if (pStatus === false) {
          showToast("error", "Payment Failed");
        }
        setPaymentStatus(null);
      }
    }
  };

  const fetchPaymentStatus = useCallback(() => {
    if (refNum && billNum && stcData && !twoPaneView && visible) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

      fetchPaymentStatusStc(
        refNum,
        stcData,
        controller,
        (result) => {
          console.log("RECEIVED RESULT", result);
          if (result?.success) {
            console.log("CLOSING STC PAY");
            clearTimeout(timeoutId);
            setPaymentStatus(result?.success);
          }
        },
        (error) => {
          if (error.name === "AbortError") {
            console.error("Request timed out");
            showToast(
              "error",
              "Payment status check timed out. Please try again."
            );
            // You might want to handle the timeout scenario here (e.g., retry logic or reset payment flow)
          } else {
            console.error("Error fetching payment status:", error);
            showToast(
              "error",
              "Error checking payment status. Please try again."
            );
          }
        },
        () => {
          clearTimeout(timeoutId);
        }
      );
    }
  }, [refNum, billNum, stcData]);

  useEffect(() => {
    // console.log("LISTENER", qrData !== "" && refNum && stcData?.deviceCode);
    if (qrData !== "" && refNum && stcData?.deviceCode && visible) {
      intervalRef.current = setInterval(fetchPaymentStatus, 10000);

      timeoutRef.current = setTimeout(() => {
        clearInterval(intervalRef.curren);
        setStcData(null);
        setQrData("");
        console.log("Interval cleared after 5 minutes of no response.");
      }, 300000);
    }

    return () => {
      if (intervalRef.curren) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [qrData, stcData]);

  useEffect(() => {
    if (refNum && billNum && !twoPaneView && visible) {
      console.log("MEDONA", refNum, billNum);
      handlePaymentStatus(paymentStatus).then((r) => {});
    }
  }, [paymentStatus]);

  const showCancelConfirmation = () => {
    Alert.alert(
      t("Cancel Payment"),
      `${t("payment_cancel")}?`,
      [
        {
          text: t("No"),
          style: "cancel",
        },
        {
          text: t("Yes"),
          onPress: () => handleCancel(),
        },
      ],
      { cancelable: false }
    );
  };

  useEffect(() => {
    if (!visible) {
      clearAllStates();
    }
  }, [visible, clearAllStates]);

  if (!visible) return <></>;

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
          marginTop: isKeyboardVisible ? "-12%" : "0%",
          backgroundColor: theme.colors.transparentBg,
        }}
      >
        <View
          style={{
            overflow: "hidden",
            width: twoPaneView ? hp("60%") : hp("45%"),
            borderRadius: 16,
            paddingVertical: hp("2%"),
            backgroundColor: theme.colors.white[1000],
          }}
        >
          <View
            style={{
              paddingHorizontal: hp("2%"),
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <DefaultText style={{ fontSize: 20 }} fontWeight="medium">
              {t("Payment")}
            </DefaultText>
          </View>

          <View
            style={{
              marginTop: hp("1.25%"),
              marginBottom: hp("2%"),
              height: 1,
              backgroundColor: theme.colors.dividerColor.main,
            }}
          />

          <View style={{ paddingHorizontal: hp("2%") }}>
            <KeyboardAvoidingView
              enabled={true}
              behavior={"height"}
              keyboardVerticalOffset={Platform.OS == "ios" ? 50 : 20}
            >
              <ScrollView
                alwaysBounceVertical={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
              >
                {connected ? (
                  <>
                    <View
                      style={{
                        flex: 1,

                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {stcData && qrData !== "" && !twoPaneView && (
                        <>
                          {!paymentStatus ? (
                            <>
                              <DefaultText
                                style={{
                                  fontSize: 18,
                                  color: "#000",
                                  fontWeight: "bold",
                                  marginBottom: 20,
                                  textAlign: "center",
                                }}
                              >
                                {t("Make the Payment through STC Pay")}
                              </DefaultText>
                              <CurrencyView
                                amount={stcData?.amount?.toFixed(2)}
                                amountFontsize={32}
                                decimalFontsize={28}
                                symbolFontsize={28}
                              ></CurrencyView>
                              <View style={{ padding: 20 }}>
                                <AnimatedQRCode size={200} value={qrData} />
                              </View>
                            </>
                          ) : (
                            <>
                              <DefaultText
                                style={{
                                  fontSize: 32,
                                  color: "#fff",
                                  fontWeight: "bold",
                                  marginBottom: 20,
                                }}
                              >
                                {`${t("Payment of")} ${currency} 10 ${t(
                                  "Approved"
                                )}`}
                              </DefaultText>
                            </>
                          )}
                        </>
                      )}
                    </View>
                    <DefaultText style={{ marginTop: hp("2%") }}>
                      {t("waiting_payment")}
                    </DefaultText>
                    <ActivityIndicator
                      size="large"
                      color={theme.colors.primary[1000]}
                      style={styles.activityIndicator}
                    />
                  </>
                ) : (
                  <DefaultText style={styles.centeredText}>
                    {t(
                      "No internet connection, Please check your connection and try again"
                    )}
                  </DefaultText>
                )}
              </ScrollView>
            </KeyboardAvoidingView>

            <View
              style={{
                marginTop: hp("2.5%"),
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <PrimaryButton
                style={{
                  flex: 1,
                  paddingVertical: hp("2%"),
                  paddingHorizontal: wp("1.8%"),
                  backgroundColor: "#F0443833",
                }}
                textStyle={{
                  fontSize: 16,
                  color: theme.colors.red.default,
                  fontWeight: theme.fontWeights.medium,
                  fontFamily: theme.fonts.circulatStd,
                }}
                title={t("Cancel")}
                onPress={showCancelConfirmation}
              />
            </View>
          </View>
        </View>
      </View>

      <Toast />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollViewContent: {
    alignItems: "center",
  },
  centeredText: {
    textAlign: "center",
    marginTop: 10,
  },
  activityIndicator: {
    marginTop: 20,
  },
});

export default STCPayModal;
