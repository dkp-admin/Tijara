import {
  default as React,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Alert, TouchableOpacity, View } from "react-native";
import { t } from "../../../../i18n";
import AuthContext from "../../../context/auth-context";
import { useTheme } from "../../../context/theme-context";
import { checkDirection } from "../../../hooks/check-direction";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { AuthType } from "../../../types/auth-types";
import cart from "../../../utils/cart";
import ICONS from "../../../utils/icons";
import ItemDivider from "../../action-sheet/row-divider";
import CurrencyView from "../../modal/currency-view-modal";
import DefaultText from "../../text/Text";
import showToast from "../../toast";
import CompleteOptionsMenu from "./complete-menu-options";
import SelectPaymentTypesOptions from "./select-payment-types-options";

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
  totalVatAmount,
  loading,
  businessDetails,
}: any) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { wp, hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);

  const [selectedPayment, setSelectedPayment] = useState("");

  const handleOutOfStock = useCallback(
    (completeBtnTap: boolean, val?: any) => {
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
                handleComplete(selectedPayment, val);
              } else {
                handlePrint(val, selectedPayment);
              }
            },
          },
        ]
      );
    },
    [selectedPayment, totalAmount]
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

        setSelectedPayment(payment?.name);
      } else {
        const payment = billingSettings.paymentTypes?.find(
          (type: any) =>
            type.status && type.name !== "Wallet" && type.name !== "Credit"
        );

        setSelectedPayment(payment?.name);
      }
    }
  }, [billingSettings]);

  useMemo(() => {
    if (billingSettings && businessDetails?.company?.enableStcPay) {
      billingSettings?.paymentTypes?.push({
        _id: 12,
        name: "STC Pay",
        status: true,
      });
    }

    if (businessDetails?.company?.nearpay && billingSettings?.terminalId) {
      billingSettings?.paymentTypes?.push({
        _id: 13,
        name: "Nearpay",
        status: true,
      });
    }
  }, [billingSettings, businessDetails]);

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
            width: twoPaneView ? "55%" : "55%",
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

          <View
            style={{
              flexDirection: "row",
              gap: 2,
            }}
          >
            {billingSettings?.paymentTypes
              ?.filter((p: any) => p?.status)
              ?.slice(0)
              ?.filter(
                (payment: any, index: number, self: any[]) =>
                  index === self.findIndex((p: any) => p.name === payment.name)
              )?.length > 0 && (
              <View
                style={{
                  borderRadius: 16,
                  paddingHorizontal: wp("1%"),
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderWidth: 2,
                  borderColor: billingSettings?.paymentTypes
                    ?.filter((p: any) => p?.status)
                    ?.slice(0)
                    ?.map((op: any) => op?.name)
                    ?.includes(selectedPayment)
                    ? theme.colors.primary[1000]
                    : "#ededed",
                  marginTop: 6,
                }}
              >
                {billingSettings?.paymentTypes
                  ?.filter((p: any) => p?.status)
                  ?.slice(0)
                  ?.filter(
                    (payment: any, index: number, self: any[]) =>
                      index ===
                      self.findIndex((p: any) => p.name === payment.name)
                  )?.length > 0 && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        flex: twoPaneView ? 0 : 1,
                      }}
                    >
                      <DefaultText
                        style={{
                          marginLeft: 7,
                          paddingLeft: isRTL ? wp("2.25%") : wp("0%"),

                          paddingVertical: hp("2%"),
                        }}
                        fontSize={twoPaneView ? "lg" : "md"}
                        fontWeight="medium"
                        color={"primary.1000"}
                      >
                        {[
                          ...billingSettings?.paymentTypes
                            ?.filter((p: any) => p?.status)
                            ?.slice(0)
                            ?.map((op: any) => op?.name),
                        ]?.includes(selectedPayment)
                          ? t(selectedPayment)
                          : selectedPayment.toLowerCase() === "stc pay"
                          ? t("STC Pay")
                          : selectedPayment.toLowerCase() === "nearpay"
                          ? t("Nearpay")
                          : t("Other")}
                      </DefaultText>
                    </TouchableOpacity>

                    <SelectPaymentTypesOptions
                      onChange={(val: any) => setSelectedPayment(val)}
                    />
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        <View style={{ width: twoPaneView ? "45%" : "45%" }}>
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
              // paddingHorizontal: wp("1%"),
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
                if (
                  totalAmount >
                  businessDetails?.company?.transactionVolumeCategory
                ) {
                  showToast(
                    "error",
                    `${"Billing amount must be less than or equal to "}${
                      businessDetails?.company?.transactionVolumeCategory
                    }`
                  );
                  return;
                }
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

            <View style={{ flex: 0.3 }}>
              <CompleteOptionsMenu
                handlePrint={(val: any) => {
                  console.log(val, "VALUE");
                  if (
                    totalAmount >
                    businessDetails?.company?.transactionVolumeCategory
                  ) {
                    showToast(
                      "error",
                      `${t("Billing amount must be less than or equal to ")}${
                        businessDetails?.company?.transactionVolumeCategory
                      }`
                    );
                    return;
                  }
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
