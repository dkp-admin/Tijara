import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { t } from "../../../i18n";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/check-direction";
import { useResponsive } from "../../hooks/use-responsiveness";
import { queryClient } from "../../query-client";
import { AuthType } from "../../types/auth-types";
import { getErrorMsg } from "../../utils/common-error-msg";
import {
  CARD_OPTIONS_LIST,
  COMPLETE_BTN_OPTIONS,
  NO_OF_RECEIPT_PRINT_OPTIONS,
} from "../../utils/constants";
import { repo } from "../../utils/createDatabaseConnection";
import ICONS from "../../utils/icons";
import { debugLog, errorLog } from "../../utils/log-patch";
import SelectInput from "../input/select-input";
import Loader from "../loader";
import NoDataPlaceholder from "../no-data-placeholder/no-data-placeholder";
import Spacer from "../spacer";
import DefaultText from "../text/Text";
import showToast from "../toast";
import ToolTip from "../tool-tip";
import OrderTypeListModal from "./order-types/order-type-list";
import PaymentTypeListModal from "./payment-types/payment-type-list";

export default function Billing() {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);
  const [keypad, setKeypad] = useState(false);
  const [discounts, setDiscounts] = useState(false);
  const [promotions, setPromotions] = useState(false);
  const [customCharges, setCustomCharges] = useState(false);
  const [quickAmounts, setQuickAmounts] = useState(false);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [openOrderTypeModal, setOpenOrderTypeModal] = useState(false);
  const [billingData, setBillingData] = useState(null) as any;
  const [businessDetails, setBusinessDetails] = useState(null) as any;
  const [seed, setSeed] = useState(false);
  const [catalogueManagement, setCatalogueManagement] = useState(true);

  const getActivePayment = () => {
    if (businessDetails?.company?.wallet) {
      return (
        billingSettings?.paymentTypes?.filter((payment: any) => payment.status)
          ?.length || 0
      );
    }

    return (
      billingSettings?.paymentTypes?.filter(
        (payment: any) => payment.name !== "Wallet" && payment.status
      )?.length || 0
    );
  };

  const getCardPaymentOption = () => {
    if (billingSettings?.cardPaymentOption == "manual") {
      return { value: t("Manual"), key: "manual" };
    } else if (billingSettings?.cardPaymentOption == "inbuilt-nfc") {
      return { value: t("Inbuilt NFC"), key: "inbuilt-nfc" };
    }
  };

  const getDefaultCompleteBtn = () => {
    if (billingSettings?.defaultCompleteBtn == "with-print") {
      return { value: t("Complete with print"), key: "with-print" };
    } else if (billingSettings?.defaultCompleteBtn == "without-print") {
      return { value: t("Complete without print"), key: "without-print" };
    }
  };

  const getActiveOrderType = () => {
    return (
      billingSettings?.orderTypesList?.filter((type: any) => type.status)
        ?.length || 0
    );
  };

  const billingSettings: any = useMemo(() => {
    if (billingData) {
      setKeypad(billingData.keypad);
      setDiscounts(billingData.discounts);
      setPromotions(billingData.promotions);
      setCustomCharges(billingData.customCharges);
      setQuickAmounts(billingData.quickAmounts);
      setCatalogueManagement(billingData.catalogueManagement);
      return billingData;
    } else {
      return null;
    }
  }, [billingData, seed]);

  const updateBillingSettings = useCallback(
    async (data: any) => {
      if (data != null) {
        try {
          await repo.billingSettings.update(
            { _id: billingSettings._id },
            {
              ...billingSettings,
              ...data,
            }
          );
          debugLog(
            "Billing settings updated to db",
            {
              ...billingSettings,
              ...data,
            },
            "setting-billing-screen",
            "updateBillingSettings"
          );
          await queryClient.invalidateQueries("find-billing-settings");
          setSeed(!seed);
        } catch (err: any) {
          errorLog(
            err?.message,
            data,
            "setting-billing-screen",
            "updateBillingSettings",
            err
          );
          showToast("error", getErrorMsg("billing-settings", "update"));
        }
      }
    },
    [billingSettings]
  );

  useEffect(() => {
    if (billingSettings?._id && billingSettings?.keypad !== keypad) {
      updateBillingSettings({ keypad: keypad });
    }
  }, [keypad]);

  useEffect(() => {
    if (billingSettings?._id && billingSettings?.discounts !== discounts) {
      updateBillingSettings({ discounts: discounts });
    }
  }, [discounts]);

  useEffect(() => {
    if (billingSettings?._id && billingSettings?.promotions !== promotions) {
      updateBillingSettings({ promotions: promotions });
    }
  }, [promotions]);

  useEffect(() => {
    if (
      billingSettings?._id &&
      billingSettings?.customCharges !== customCharges
    ) {
      updateBillingSettings({ customCharges: customCharges });
    }
  }, [customCharges]);

  useEffect(() => {
    if (
      billingSettings?._id &&
      billingSettings?.quickAmounts !== quickAmounts
    ) {
      updateBillingSettings({ quickAmounts: quickAmounts });
    }
  }, [quickAmounts]);

  useEffect(() => {
    if (
      billingSettings?._id &&
      billingSettings?.catalogueManagement !== catalogueManagement
    ) {
      updateBillingSettings({ catalogueManagement: catalogueManagement });
    }
  }, [catalogueManagement]);

  useEffect(() => {
    repo.billingSettings
      .findOne({ where: { _id: authContext.user.locationRef } })
      .then((billingSettings) => {
        debugLog(
          "Billing settings fetched from db",
          billingSettings,
          "setting-billing-screen",
          "fetchBillingSettings"
        );
        setBillingData(billingSettings);
      });
  }, [seed]);

  useEffect(() => {
    repo.business
      .findOne({ where: { _id: authContext.user.locationRef } })
      .then((businessData) => {
        debugLog(
          "Business details fetched from db",
          businessData,
          "setting-billing-screen",
          "fetchBusinessDetails"
        );
        setBusinessDetails(businessData);
      });
  }, []);

  if (!billingSettings) {
    return <Loader marginTop={hp("30%")} />;
  }

  if (!authContext.permission["pos:billing-settings"]?.read) {
    debugLog(
      "Permission denied for this screen",
      {},
      "setting-billing-screen",
      "handlePermission"
    );
    return (
      <View style={{ marginHorizontal: 16 }}>
        <NoDataPlaceholder
          title={t("You don't have permissions to view this screen")}
          marginTop={hp("35%")}
        />
      </View>
    );
  }

  return (
    <View
      style={{ ...styles.container, backgroundColor: theme.colors.bgColor }}
    >
      <KeyboardAvoidingView
        enabled={true}
        behavior={"height"}
        keyboardVerticalOffset={Platform.OS == "ios" ? 50 : 20}
      >
        <ScrollView
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingVertical: hp("3%"),
            paddingHorizontal: hp("2.5%"),
          }}
        >
          <View
            style={{
              borderRadius: 16,
              backgroundColor: theme.colors.white[1000],
            }}
          >
            <View style={styles.content_view}>
              <DefaultText>{t("Quick amounts")}</DefaultText>

              <Switch
                style={{
                  marginRight: 8,
                  transform:
                    Platform.OS == "ios"
                      ? [{ scaleX: 0.9 }, { scaleY: 0.9 }]
                      : [{ scaleX: 1.5 }, { scaleY: 1.5 }],
                  height: hp("5%"),
                  opacity: authContext.permission["pos:billing-settings"]
                    ?.update
                    ? 1
                    : 0.5,
                }}
                trackColor={{
                  false: "rgba(120, 120, 128, 0.16)",
                  true: "#34C759",
                }}
                thumbColor={theme.colors.white[1000]}
                onValueChange={(val: any) => {
                  setQuickAmounts(val);
                }}
                value={quickAmounts}
                disabled={
                  !authContext.permission["pos:billing-settings"]?.update
                }
              />
            </View>

            <View
              style={{
                marginLeft: 16,
                borderBottomWidth: 0.5,
                borderColor: theme.colors.dividerColor.main,
              }}
            />

            <View style={styles.content_view}>
              <DefaultText>{t("Catalogue management")}</DefaultText>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <DefaultText color="otherGrey.100">
                  {catalogueManagement ? t("Products") : t("Categories")}
                </DefaultText>

                <Switch
                  style={{
                    marginLeft: 20,
                    marginRight: 8,
                    transform:
                      Platform.OS == "ios"
                        ? [{ scaleX: 0.9 }, { scaleY: 0.9 }]
                        : [{ scaleX: 1.5 }, { scaleY: 1.5 }],
                    height: hp("5%"),
                  }}
                  trackColor={{
                    false: "rgba(120, 120, 128, 0.16)",
                    true: "#34C759",
                  }}
                  thumbColor={theme.colors.white[1000]}
                  onValueChange={(val: any) => {
                    setCatalogueManagement(val);
                  }}
                  value={catalogueManagement}
                />
              </View>
            </View>

            <View
              style={{
                marginLeft: 16,
                borderBottomWidth: 0.5,
                borderColor: theme.colors.dividerColor.main,
              }}
            />

            <View style={{ ...styles.content_view, paddingVertical: 16 }}>
              <DefaultText>{t("Payment types")}</DefaultText>

              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  opacity: authContext.permission["pos:billing-settings"]
                    ?.update
                    ? 1
                    : 0.5,
                }}
                onPress={() => {
                  setOpenPaymentModal(true);
                }}
                disabled={
                  !authContext.permission["pos:billing-settings"]?.update
                }
              >
                <DefaultText
                  style={{ marginRight: 12 }}
                  fontSize={twoPaneView ? "2xl" : "lg"}
                  color="otherGrey.200"
                >
                  {`${getActivePayment()} ${t("Active")}`}
                </DefaultText>

                <View
                  style={{
                    transform: [
                      {
                        rotate: isRTL ? "180deg" : "0deg",
                      },
                    ],
                  }}
                >
                  <ICONS.RightContentIcon />
                </View>
              </TouchableOpacity>
            </View>

            <View
              style={{
                marginLeft: 16,
                borderBottomWidth: 0.5,
                borderColor: theme.colors.dividerColor.main,
              }}
            />

            <SelectInput
              containerStyle={{
                opacity: 1,
                borderWidth: 0,
                borderRadius: 0,
                marginVertical: 4,
              }}
              style={{
                fontSize: twoPaneView ? 20 : 18,
                fontWeight: theme.fontWeights.medium,
              }}
              marginHorizontal="0%"
              isTwoText={true}
              isRightArrow={true}
              allowSearch={false}
              leftText={t("Card Payment Options")}
              placeholderText={t("Select card payment option")}
              options={CARD_OPTIONS_LIST}
              values={getCardPaymentOption()}
              handleChange={async (val: any) => {
                if (val.key && val.value) {
                  updateBillingSettings({ cardPaymentOption: val.key });
                }
              }}
              disabled={!authContext.permission["pos:billing-settings"]?.update}
            />

            <View
              style={{
                marginLeft: 16,
                borderBottomWidth: 0.5,
                borderColor: theme.colors.dividerColor.main,
              }}
            />

            <View style={styles.content_view}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <DefaultText>{t("Cash management")}</DefaultText>

                <View style={{ marginTop: 4, marginLeft: 8 }}>
                  <ToolTip
                    infoMsg={t("Cash management can be accessed from web")}
                  />
                </View>
              </View>

              <Switch
                style={{
                  marginRight: 8,
                  transform:
                    Platform.OS == "ios"
                      ? [{ scaleX: 0.9 }, { scaleY: 0.9 }]
                      : [{ scaleX: 1.5 }, { scaleY: 1.5 }],
                  height: hp("5%"),
                  opacity: 0.5,
                }}
                trackColor={{
                  false: "rgba(120, 120, 128, 0.16)",
                  true: "#34C759",
                }}
                thumbColor={theme.colors.white[1000]}
                value={billingSettings?.cashManagement}
                disabled
              />
            </View>

            {billingSettings?.cashManagement && (
              <>
                <View
                  style={{
                    marginLeft: 16,
                    borderBottomWidth: 0.5,
                    borderColor: theme.colors.dividerColor.main,
                  }}
                />

                <View style={{ ...styles.content_view, paddingVertical: 17 }}>
                  <DefaultText>{t("Starting Cash")}</DefaultText>

                  <DefaultText
                    style={{ marginRight: 12 }}
                    fontSize={twoPaneView ? "2xl" : "lg"}
                    color="otherGrey.200"
                  >
                    {`${t("SAR")} ${Number(
                      billingSettings.defaultCash
                    )?.toFixed(2)}`}
                  </DefaultText>
                </View>
              </>
            )}
          </View>

          <View
            style={{
              borderRadius: 16,
              marginTop: hp("4%"),
              backgroundColor: theme.colors.white[1000],
            }}
          >
            <SelectInput
              containerStyle={{
                opacity: 1,
                borderWidth: 0,
                borderRadius: 16,
                marginVertical: 4,
              }}
              style={{
                fontSize: twoPaneView ? 20 : 18,
                fontWeight: theme.fontWeights.medium,
              }}
              marginHorizontal="0%"
              isTwoText={true}
              isRightArrow={true}
              allowSearch={false}
              leftText={t("Default complete button")}
              placeholderText={t("Select default complete")}
              options={COMPLETE_BTN_OPTIONS}
              values={getDefaultCompleteBtn()}
              handleChange={async (val: any) => {
                if (val.key && val.value) {
                  updateBillingSettings({ defaultCompleteBtn: val.key });
                }
              }}
              disabled={!authContext.permission["pos:billing-settings"]?.update}
            />

            <View
              style={{
                marginLeft: 16,
                borderBottomWidth: 0.5,
                borderColor: theme.colors.dividerColor.main,
              }}
            />

            <SelectInput
              containerStyle={{
                opacity: 1,
                borderWidth: 0,
                borderRadius: 0,
                marginVertical: 4,
              }}
              style={{
                fontSize: twoPaneView ? 20 : 18,
                fontWeight: theme.fontWeights.medium,
              }}
              marginHorizontal="0%"
              isTwoText={true}
              isRightArrow={true}
              allowSearch={false}
              leftText={t("Number of receipt prints")}
              placeholderText={t("Select no of receipt")}
              options={NO_OF_RECEIPT_PRINT_OPTIONS}
              values={{
                value: billingSettings?.noOfReceiptPrint,
                key: billingSettings?.noOfReceiptPrint,
              }}
              handleChange={async (val: any) => {
                if (val.key && val.value) {
                  updateBillingSettings({ noOfReceiptPrint: val.key });
                }
              }}
              disabled={!authContext.permission["pos:billing-settings"]?.update}
            />

            <View
              style={{
                marginLeft: 16,
                borderBottomWidth: 0.5,
                borderColor: theme.colors.dividerColor.main,
              }}
            />

            <View style={{ ...styles.content_view, paddingVertical: 16 }}>
              <DefaultText>{t("Order types")}</DefaultText>

              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  opacity: authContext.permission["pos:billing-settings"]
                    ?.update
                    ? 1
                    : 0.5,
                }}
                onPress={() => {
                  setOpenOrderTypeModal(true);
                }}
                disabled={
                  !authContext.permission["pos:billing-settings"]?.update
                }
              >
                <DefaultText
                  style={{ marginRight: 12 }}
                  fontSize={twoPaneView ? "2xl" : "lg"}
                  color="otherGrey.200"
                >
                  {`${getActiveOrderType()} ${t("Active")}`}
                </DefaultText>

                <View
                  style={{
                    transform: [
                      {
                        rotate: isRTL ? "180deg" : "0deg",
                      },
                    ],
                  }}
                >
                  <ICONS.RightContentIcon />
                </View>
              </TouchableOpacity>
            </View>

            <View
              style={{
                marginLeft: 16,
                borderBottomWidth: 0.5,
                borderColor: theme.colors.dividerColor.main,
              }}
            />

            <View style={styles.content_view}>
              <DefaultText>{t("Keypad")}</DefaultText>

              <Switch
                style={{
                  marginRight: 8,
                  transform:
                    Platform.OS == "ios"
                      ? [{ scaleX: 0.9 }, { scaleY: 0.9 }]
                      : [{ scaleX: 1.5 }, { scaleY: 1.5 }],
                  height: hp("5%"),
                  opacity: authContext.permission["pos:billing-settings"]
                    ?.keypad
                    ? 1
                    : 0.5,
                }}
                trackColor={{
                  false: "rgba(120, 120, 128, 0.16)",
                  true: "#34C759",
                }}
                thumbColor={theme.colors.white[1000]}
                onValueChange={(val: any) => {
                  setKeypad(val);
                }}
                value={keypad}
                disabled={
                  !authContext.permission["pos:billing-settings"]?.keypad
                }
              />
            </View>

            <View
              style={{
                marginLeft: 16,
                borderBottomWidth: 0.5,
                borderColor: theme.colors.dividerColor.main,
              }}
            />

            <View style={styles.content_view}>
              <DefaultText>{t("Discounts")}</DefaultText>

              <Switch
                style={{
                  marginRight: 8,
                  transform:
                    Platform.OS == "ios"
                      ? [{ scaleX: 0.9 }, { scaleY: 0.9 }]
                      : [{ scaleX: 1.5 }, { scaleY: 1.5 }],
                  height: hp("5%"),
                  opacity: authContext.permission["pos:billing-settings"]
                    ?.discount
                    ? 1
                    : 0.5,
                }}
                trackColor={{
                  false: "rgba(120, 120, 128, 0.16)",
                  true: "#34C759",
                }}
                thumbColor={theme.colors.white[1000]}
                onValueChange={(val: any) => {
                  setDiscounts(val);
                }}
                value={discounts}
                disabled={
                  !authContext.permission["pos:billing-settings"]?.discount
                }
              />
            </View>

            <View
              style={{
                marginLeft: 16,
                borderBottomWidth: 0.5,
                borderColor: theme.colors.dividerColor.main,
              }}
            />

            <View style={styles.content_view}>
              <DefaultText>{t("Promotions")}</DefaultText>

              <Switch
                style={{
                  marginRight: 8,
                  transform:
                    Platform.OS == "ios"
                      ? [{ scaleX: 0.9 }, { scaleY: 0.9 }]
                      : [{ scaleX: 1.5 }, { scaleY: 1.5 }],
                  height: hp("5%"),
                  opacity: authContext.permission["pos:billing-settings"]
                    ?.promotions
                    ? 1
                    : 0.5,
                }}
                trackColor={{
                  false: "rgba(120, 120, 128, 0.16)",
                  true: "#34C759",
                }}
                thumbColor={theme.colors.white[1000]}
                onValueChange={(val: any) => {
                  setPromotions(val);
                }}
                value={promotions}
                disabled={
                  !authContext.permission["pos:billing-settings"]?.promotions
                }
              />
            </View>

            <View
              style={{
                marginLeft: 16,
                borderBottomWidth: 0.5,
                borderColor: theme.colors.dividerColor.main,
              }}
            />

            <View
              style={{
                ...styles.content_view,
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
              }}
            >
              <DefaultText>{t("Custom Charges")}</DefaultText>

              <Switch
                style={{
                  marginRight: 8,
                  transform:
                    Platform.OS == "ios"
                      ? [{ scaleX: 0.9 }, { scaleY: 0.9 }]
                      : [{ scaleX: 1.5 }, { scaleY: 1.5 }],
                  height: hp("5%"),
                  opacity: authContext.permission["pos:billing-settings"]?.[
                    "custom-charges"
                  ]
                    ? 1
                    : 0.5,
                }}
                trackColor={{
                  false: "rgba(120, 120, 128, 0.16)",
                  true: "#34C759",
                }}
                thumbColor={theme.colors.white[1000]}
                onValueChange={(val: any) => {
                  setCustomCharges(val);
                }}
                value={customCharges}
                disabled={
                  !authContext.permission["pos:billing-settings"]?.[
                    "custom-charges"
                  ]
                }
              />
            </View>
          </View>

          <Spacer space={hp("10%")} />
        </ScrollView>
      </KeyboardAvoidingView>

      <PaymentTypeListModal
        data={billingSettings}
        visible={openPaymentModal}
        setSeed={setSeed}
        walletEnabled={businessDetails?.company?.wallet}
        creditEnabled={businessDetails?.company?.enableCredit}
        seed={seed}
        handleClose={() => {
          setOpenPaymentModal(false);
        }}
      />

      <OrderTypeListModal
        data={billingSettings}
        visible={openOrderTypeModal}
        setSeed={setSeed}
        seed={seed}
        handleClose={() => {
          setOpenOrderTypeModal(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content_view: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input_content_view: {
    opacity: 1,
    borderWidth: 0,
    borderRadius: 0,
    marginVertical: 4,
  },
});
