import React, { useCallback, useEffect, useRef, useState } from "react";
import { Image, Text, View } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import { HOST } from "../../../config";
import { t } from "../../../i18n";
import repository from "../../db/repository";
import { checkDirection } from "../../hooks/check-direction";
import { checkInternet } from "../../hooks/check-internet";
import { fetchPaymentQR } from "../../hooks/fetch-payment-qr";
import { fetchPaymentStatusStc } from "../../hooks/fetch-payment-status";
import useItems from "../../hooks/use-items";
import useCommonApis from "../../hooks/useCommonApis";
import useCartStore from "../../store/cart-item";
import { useCurrency } from "../../store/get-currency";
import useStcPayStore from "../../store/stcpay-store";
import generateOrderNumber from "../../utils/generate-order-number";
import { generateGreetings } from "../../utils/generateGreetings";
import AnimatedQRCode from "../animated-qr";
import DefaultText from "../text/Text";
import showToast from "../toast";
import AdCarousel from "./ad-carousel";
import CartView from "./cart-view";
import Success from "./success";

export default function Welcome() {
  const { lastOrder } = useCartStore();
  const isRTL = checkDirection();
  const { businessData } = useCommonApis() as any;
  const [pullSuccess, setPullSuccess] = useState<boolean>(true);
  const [ads, setAds] = useState([]) as any;
  const [stcData, setStcData] = useState(null) as any;
  const [qrData, setQrData] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(null) as any;
  const [refNum, setRefNum] = useState(null) as any;
  const [billNum, setBillNum] = useState(null) as any;
  const intervalRef = useRef() as any;
  const timeoutRef = useRef() as any;
  const [orderNum, setOrderNum] = useState("") as any;
  const { currency } = useCurrency();

  const handlePaymentStatus = async (pStatus: any) => {
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
  };

  const { items } = useItems();
  const isConnected = checkInternet();
  const { setData } = useStcPayStore();

  useEffect(() => {
    const listener: any = EventRegister.addEventListener(
      "initStcPay",
      (data) => {
        console.log("init request received");
        setStcData(data);
      }
    );

    return () => {
      EventRegister.removeEventListener(listener);
    };
  }, []);

  useEffect(() => {
    if (stcData) {
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

  const fetchPaymentStatus = useCallback(() => {
    if (refNum && billNum && stcData) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      fetchPaymentStatusStc(
        refNum,
        stcData,
        controller,
        (result) => {
          console.log("RECEIVED RESULT", result);
          if (result?.success) {
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
    if (qrData !== "" && refNum && stcData?.deviceCode) {
      intervalRef.current = setInterval(fetchPaymentStatus, 15000);

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
    if (refNum && billNum) {
      handlePaymentStatus(paymentStatus).then((r) => {});
    }
  }, [paymentStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      repository.adManagementRepository.findOngoingAds().then((adv) => {
        const slides = adv.flatMap((ad) =>
          ad.slidesData.map((s) => {
            return {
              ...s,
              type: ad.type,
              adId: ad._id,
              name: ad?.name,
              adType: s?.contentType,
              status: ad?.status,
              schedule: ad?.dateRange,
              daysOfWeek: ad?.daysOfWeek,
              createdByRole: ad?.createdByRole,
            };
          })
        );

        setAds([...slides]);
      });
    }, 15000);

    return () => clearTimeout(timer);
  }, [pullSuccess]);

  useEffect(() => {
    EventRegister.addEventListener("ads:pull-success", () => {
      setPullSuccess(!pullSuccess);
    });

    return () => {
      EventRegister.removeEventListener("ads:pull-success");
    };
  }, []);

  useEffect(() => {
    EventRegister.addEventListener("cancelStcPay", () => {
      setStcData(null);
      setQrData("");
      setPaymentStatus(null);
      setRefNum("");
      setBillNum("");
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    });

    return () => {
      EventRegister.removeEventListener("cancelStcPay");
    };
  }, []);

  const WelcomeComponent = () => {
    return (
      <View style={{ flex: 1, backgroundColor: "#006C35" }}>
        <View
          style={{
            width: 100,
            height: 100,
            marginRight: 50,
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "flex-end",
            backgroundColor: "#fff",
          }}
        >
          {businessData?.company?.logo ? (
            <Image
              resizeMode="contain"
              source={{ uri: businessData.company.logo }}
              style={{ width: 90, height: 90 }}
            />
          ) : (
            <Image
              resizeMode="contain"
              source={require("../../components/assets/tijarah-logo.png")}
              style={{ width: 85, height: 85 }}
            />
          )}
        </View>

        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            marginTop: -100,
          }}
        >
          <DefaultText style={{ fontSize: 32, color: "#fff" }}>
            {t(generateGreetings())}
          </DefaultText>

          {businessData?.company?.name?.en && (
            <DefaultText
              style={{
                fontSize: 32,
                color: "#fff",
                marginTop: 15,
                textAlign: "center",
              }}
            >
              {`${t("Welcome to")} ${
                isRTL
                  ? businessData.company.name.ar
                  : businessData.company.name.en
              }`}
            </DefaultText>
          )}
        </View>
      </View>
    );
  };

  if (stcData && qrData !== "") {
    return (
      <>
        <View
          style={{
            flex: 1,
            backgroundColor: "#006C35",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {!paymentStatus ? (
            <>
              <Text
                style={{
                  fontSize: 32,
                  color: "#fff",
                  fontWeight: "bold",
                  marginBottom: 20,
                }}
              >
                {t("Make the Payment through STC Pay")}
              </Text>
              <AnimatedQRCode size={300} value={qrData} />
            </>
          ) : (
            <>
              <Text
                style={{
                  fontSize: 32,
                  color: "#fff",
                  fontWeight: "bold",
                  marginBottom: 20,
                }}
              >
                {`${t("Payment of")} ${currency} ${stcData?.amount} ${t(
                  "Approved"
                )}`}
              </Text>
            </>
          )}
        </View>
      </>
    );
  }

  return (
    <>
      <>
        {ads.length > 0 && items?.length <= 0 && isConnected ? (
          <AdCarousel data={ads} />
        ) : items?.length > 0 ? (
          <CartView />
        ) : lastOrder ? (
          <Success />
        ) : (
          <WelcomeComponent />
        )}
      </>
    </>
  );
}
