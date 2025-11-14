import {
  default as React,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Alert, ScrollView, TouchableOpacity, View } from "react-native";
import { t } from "../../../../i18n";
import AuthContext from "../../../context/auth-context";
import { useTheme } from "../../../context/theme-context";
import { checkDirection } from "../../../hooks/check-direction";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { AuthType } from "../../../types/auth-types";
import cart from "../../../utils/cart";
import ICONS from "../../../utils/icons";
import { debugLog } from "../../../utils/log-patch";
import ItemDivider from "../../action-sheet/row-divider";
import CurrencyView from "../../modal/currency-view-modal";
import DefaultText from "../../text/Text";
import showToast from "../../toast";
import CompleteOptionsMenu from "./complete-menu-options";
import { PaymentTypeView } from "./payment-type-view";

const checkOutOfStock = () => {
  const cartItems = cart.cartItems.filter(
    (item: any) =>
      item.tracking && item.stockCount - item.qty * item.noOfUnits < 0
  );

  return cartItems?.length > 0;
};

export default function BillingPaymentCompleteView({
  billingSettings,
  handlePrint,
  handlePreview,
  handleComplete,
  totalAmount,
  totalItem,
  totalQty,
  items,
  // channel,
  totalVatAmount,
  loading,
  businessDetails,
}: any) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { wp, hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);

  const [selectedPayment, setSelectedPayment] = useState("");
  // const [addedToCart, setAddedToCart] = useState<string>("");

  // const handleAddCart = (value: string) => {
  //   const timer = setTimeout(() => {
  //     if (value === "show") {
  //       setAddedToCart("hide");
  //     }
  //   }, 500);

  //   return () => {
  //     clearTimeout(timer);
  //   };
  // };

  // useEffect(() => {
  //   setAddedToCart("show");
  //   handleAddCart("show");
  // }, [totalQty]);

  // const checkProductSameChannel = () => {
  //   let sameChannel = false;

  //   for (let index = 0; index < items.length; index++) {
  //     if (
  //       items[index]?.channels?.length === 0 ||
  //       items[index]?.channels?.includes(channel)
  //     ) {
  //       sameChannel = true;
  //     } else {
  //       sameChannel = false;
  //       return false;
  //     }
  //   }

  //   return sameChannel;
  // };

  const handleOutOfStock = useCallback(
    (completeBtnTap: boolean, val?: any) => {
      debugLog(
        "Cart contains out of stock product for billing alert",
        {},
        "cart-billing-screen",
        "handleOutOfStockFunction"
      );

      Alert.alert(
        t("Confirmation"),
        `${t("Some products are out of stock")}. ${t(
          "Do you want to continue?"
        )}`,
        [
          {
            text: t("No"),
            onPress: () => {},
            style: "destructive",
          },
          {
            text: t("Yes"),
            onPress: async () => {
              if (completeBtnTap) {
                handleComplete(selectedPayment);
              } else {
                handlePrint(val, selectedPayment);
              }
            },
          },
        ]
      );
    },
    [selectedPayment]
  );

  useEffect(() => {
    if (billingSettings?.paymentTypes?.length > 0) {
      if (
        businessDetails?.company?.wallet ||
        businessDetails?.company?.enableCredit
      ) {
        let payment = billingSettings.paymentTypes?.find(
          (type: any) => type.status
        );

        if (businessDetails?.company?.wallet) {
          payment = billingSettings.paymentTypes?.find(
            (type: any) => type.status && type.name !== "Credit"
          );
        } else if (businessDetails?.company?.enableCredit) {
          payment = billingSettings.paymentTypes?.find(
            (type: any) => type.status && type.name !== "Wallet"
          );
        }
        debugLog(
          "Selected payment type",
          payment,
          "cart-billing-screen",
          "handleSelectedPaymentrFunction"
        );
        setSelectedPayment(payment?.name);
      } else {
        const payment = billingSettings.paymentTypes?.find(
          (type: any) =>
            type.status && type.name !== "Wallet" && type.name !== "Credit"
        );
        debugLog(
          "Selected payment type",
          payment,
          "cart-billing-screen",
          "handleSelectedPaymentrFunction"
        );
        setSelectedPayment(payment?.name);
      }
    }
  }, [billingSettings]);

  return (
    <>
      <View
        style={{
          paddingTop: 8,
          paddingBottom: 14,
          paddingHorizontal: hp("2%"),
          flexDirection: "row",
        }}
      >
        <View
          style={{
            width: twoPaneView ? "68%" : "55%",
            paddingRight: "4%",
          }}
        >
          <View
            style={{
              marginBottom: 3,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View>
              <DefaultText style={{ fontSize: 10 }} fontWeight="medium">
                {`${t("Items")}/${t("QTY")}.`}
              </DefaultText>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <DefaultText fontSize="lg" fontWeight="normal">
                  {`${totalItem}/${totalQty}`}
                </DefaultText>

                {/* {addedToCart === "show" && (
                  <DefaultText
                    style={{ marginLeft: 5 }}
                    fontSize="sm"
                    fontWeight="medium"
                    color="primary.1000"
                  >
                    {t("ADDED")}
                  </DefaultText>
                )} */}
              </View>
            </View>

            <View>
              <DefaultText style={{ fontSize: 10 }} fontWeight="medium">
                {t("Total VAT")}
              </DefaultText>

              <CurrencyView
                amount={(totalVatAmount || 0)?.toFixed(2)}
                symbolFontsize={12}
                amountFontsize={18}
                decimalFontsize={18}
                symbolFontweight="normal"
                amountFontweight="normal"
                decimalFontweight="normal"
              />
            </View>
          </View>

          <ItemDivider
            style={{
              margin: 0,
              borderWidth: 0,
              borderBottomWidth: 1.5,
              borderColor: "#E5E9EC",
            }}
          />

          <ScrollView
            contentContainerStyle={{
              marginVertical: 10,
              flexDirection: isRTL ? "row-reverse" : "row",
              justifyContent: isRTL ? "flex-end" : "flex-start",
            }}
            horizontal={true}
            alwaysBounceHorizontal={false}
            showsHorizontalScrollIndicator={false}
          >
            {billingSettings?.paymentTypes?.map((payment: any, idx: number) => {
              if (
                payment.name === "Wallet" &&
                !businessDetails?.company?.wallet
              ) {
                return <></>;
              }

              if (
                payment.name === "Credit" &&
                !businessDetails?.company?.enableCredit
              ) {
                return <></>;
              }

              if (!payment.status) {
                return <></>;
              }

              return (
                <PaymentTypeView
                  key={idx}
                  data={payment}
                  selected={selectedPayment}
                  handleSelected={(data: any) => {
                    debugLog(
                      "Selected payment type",
                      data,
                      "cart-billing-screen",
                      "handleSelectedPaymentrFunction"
                    );
                    setSelectedPayment(data?.name);
                  }}
                />
              );
            })}
          </ScrollView>
        </View>

        <View style={{ width: twoPaneView ? "32%" : "45%" }}>
          <View style={{ marginBottom: 15, alignSelf: "flex-end" }}>
            <CurrencyView
              amount={totalAmount.toFixed(2)}
              symbolFontsize={14}
              amountFontsize={22}
              decimalFontsize={22}
              symbolFontweight="normal"
            />
          </View>

          <View
            style={{
              borderRadius: 16,
              paddingHorizontal: wp("1%"),
              flexDirection: "row",
              alignItems: "center",
              backgroundColor:
                authContext.permission["pos:order"]?.create &&
                // checkProductSameChannel() &&
                !loading
                  ? theme.colors.primary[200]
                  : theme.colors.dark[400],
            }}
          >
            <TouchableOpacity
              style={{
                flex: 0.8,
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={() => {
                if (totalAmount > 0) {
                  if (
                    businessDetails?.location?.negativeBilling &&
                    checkOutOfStock()
                  ) {
                    handleOutOfStock(true);
                  } else {
                    handleComplete(selectedPayment);
                  }
                } else {
                  showToast(
                    "error",
                    t("Billing amount must be greater than 0")
                  );
                }
              }}
              disabled={
                !authContext.permission["pos:order"]?.create ||
                // !checkProductSameChannel() ||
                loading
              }
            >
              <View style={{ paddingLeft: 5, paddingVertical: hp("2%") }}>
                {billingSettings?.defaultCompleteBtn == "with-print" ? (
                  <ICONS.PrinterIcon
                    color={
                      authContext.permission["pos:order"]?.create &&
                      // checkProductSameChannel() &&
                      !loading
                        ? theme.colors.primary[1000]
                        : theme.colors.placeholder
                    }
                  />
                ) : (
                  <ICONS.WithoutPrinterIcon
                    color={
                      authContext.permission["pos:order"]?.create &&
                      // checkProductSameChannel() &&
                      !loading
                        ? theme.colors.primary[1000]
                        : theme.colors.placeholder
                    }
                  />
                )}
              </View>

              <DefaultText
                style={{
                  marginLeft: 7,
                  paddingLeft: isRTL ? wp("2.25%") : wp("0%"),
                  paddingRight: isRTL ? wp("0%") : wp("2.25%"),
                  paddingVertical: hp("2.5%"),
                }}
                fontSize={twoPaneView ? "lg" : "md"}
                fontWeight="medium"
                color={
                  authContext.permission["pos:order"]?.create &&
                  // checkProductSameChannel() &&
                  !loading
                    ? "primary.1000"
                    : theme.colors.placeholder
                }
              >
                {t("Complete")}
              </DefaultText>
            </TouchableOpacity>

            <ItemDivider
              style={{
                margin: 0,
                borderWidth: 0,
                paddingVertical: 20,
                borderRightWidth: 1.5,
                borderColor:
                  authContext.permission["pos:order"]?.create &&
                  // checkProductSameChannel() &&
                  !loading
                    ? theme.colors.primary[300]
                    : theme.colors.placeholder,
              }}
            />

            <View style={{ flex: 0.2 }}>
              <CompleteOptionsMenu
                handlePrint={(val: any) => {
                  if (totalAmount > 0) {
                    if (
                      businessDetails?.location?.negativeBilling &&
                      checkOutOfStock()
                    ) {
                      handleOutOfStock(false, val);
                    } else {
                      handlePrint(val, selectedPayment);
                    }
                  } else {
                    showToast(
                      "error",
                      t("Billing amount must be greater than 0")
                    );
                  }
                }}
                handlePreview={handlePreview}
                loading={loading}
                // productSameChannel={checkProductSameChannel()}
                billingSettings={billingSettings}
              />
            </View>
          </View>
        </View>
      </View>
    </>
  );
}
