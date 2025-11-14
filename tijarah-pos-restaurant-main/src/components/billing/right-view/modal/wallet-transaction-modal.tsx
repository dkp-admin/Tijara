import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { t } from "../../../../../i18n";
import serviceCaller from "../../../../api";
import endpoint from "../../../../api/endpoints";
import { useTheme } from "../../../../context/theme-context";
import { checkDirection } from "../../../../hooks/check-direction";
import { checkInternet } from "../../../../hooks/check-internet";
import { checkKeyboardState } from "../../../../hooks/use-keyboard-state";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import useCartStore from "../../../../store/cart-item";
import calculateCart from "../../../../utils/calculate-cart";
import { PROVIDER_NAME } from "../../../../utils/constants";
import { ERRORS } from "../../../../utils/errors";
import ICONS from "../../../../utils/icons";
import ActionSheetHeader from "../../../action-sheet/action-sheet-header";
import ItemDivider from "../../../action-sheet/row-divider";
import { PrimaryButton } from "../../../buttons/primary-button";
import AmountInput from "../../../input/amount-input";
import Spacer from "../../../spacer";
import DefaultText from "../../../text/Text";
import Label from "../../../text/label";
import showToast from "../../../toast";
import WalletCustomerModal from "./wallet-customer-modal";
import WalletRedeemOTPModal from "./wallet-otp-modal";
import { useCurrency } from "../../../../store/get-currency";

export default function WalletTransactionModal({
  visible = false,
  handleClose,
  onChange,
  totalAmount = 0,
  totalPaidAmount = 0,
  businessDetails,
  isOnlineOrder = false,
  breakup = [],
}: {
  visible: boolean;
  handleClose: any;
  onChange: any;
  totalAmount: any;
  totalPaidAmount: any;
  businessDetails: any;
  isOnlineOrder?: boolean;
  breakup?: any[];
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const isConnected = checkInternet();
  const isKeyboardVisible = checkKeyboardState();
  const { wp, hp, twoPaneView } = useResponsive();
  const { order, customer, setCustomer } = useCartStore() as any;
  const { currency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<any>({});
  const [walletAmount, setWalletAmount] = useState<string>("");
  const [visibleOTPModal, setVisibleOTPModal] = useState(false);
  const [visibleCustomerModal, setVisibleCustomerModal] = useState(false);
  const [customerWallet, setCustomerWallet] = useState<number>(0);

  const getTotalAmount = () => {
    let total = 0;

    if (Number(totalAmount - totalPaidAmount) > customerWallet) {
      total = customerWallet;
    } else {
      total = Number(totalAmount - totalPaidAmount);
    }

    return total?.toFixed(2);
  };

  const walletData = useMemo(() => {
    const data = [
      {
        _id: 0,
        text: t("Total bill/Maximum in wallet"),
      },
    ];

    data.push({ _id: 1, text: t("Custom") });

    return data;
  }, [totalAmount, totalPaidAmount, customer]);

  const getNameInitials = () => {
    const firstNameInitial = customer.firstName?.charAt(0)?.toUpperCase() + "";

    return `${firstNameInitial || ""}`;
  };

  const sendOTPForWallet = async () => {
    if (!isConnected) {
      showToast("info", t("Please connect with the internet"));
      return;
    }

    setLoading(true);

    try {
      const res = await serviceCaller(endpoint.walletSendOTP.path, {
        method: endpoint.walletSendOTP.method,
        body: {
          customerRef: customer._id,
        },
      });

      if (res.code === "otp_sent") {
        setVisibleOTPModal(true);
      }
    } catch (error: any) {
      showToast("error", t(ERRORS.SOMETHING_WENT_WRONG));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      calculateCart(isOnlineOrder, breakup);
    }
  }, [visible]);

  useEffect(() => {
    (async () => {
      if (customer?._id) {
        if (!isConnected) {
          showToast("info", t("Please connect with the internet"));
          return;
        }

        setLoading(true);

        try {
          const res = await serviceCaller(endpoint.singleWallet.path, {
            method: endpoint.singleWallet.method,
            query: {
              customerRef: customer._id,
              companyRef: businessDetails.company._id,
            },
          });

          if (res) {
            const walletBalance = order?.payment?.breakup
              ?.filter((p: any) => p.providerName === PROVIDER_NAME.WALLET)
              ?.reduce((pv: any, cv: any) => pv + cv.total, 0);

            setCustomerWallet(
              Number(res.closingBalance || 0) - Number(walletBalance || 0)
            );
          }
        } catch (error: any) {
          setCustomerWallet(0);
        } finally {
          setLoading(false);
        }
      }
    })();
  }, [customer, businessDetails]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent={false}
      style={{ height: "100%" }}
    >
      <View
        style={{
          ...styles.container,
          backgroundColor: theme.colors.transparentBg,
        }}
      >
        <View
          style={{
            ...styles.container,
            marginHorizontal: twoPaneView ? "20%" : "0%",
            backgroundColor: theme.colors.bgColor,
          }}
        >
          <ActionSheetHeader
            title={t("Wallet Transaction")}
            handleLeftBtn={() => handleClose()}
            isCurrency
            rightBtnText={`${currency} ${(
              totalAmount - totalPaidAmount
            ).toFixed(2)}`}
            descriptionRight={""}
          />

          <KeyboardAvoidingView enabled={true}>
            <ScrollView
              alwaysBounceVertical={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingVertical: hp("3%"),
                paddingHorizontal: hp("2.5%"),
                marginTop: isKeyboardVisible ? "-7.5%" : "0%",
              }}
            >
              <DefaultText
                style={{
                  marginBottom: hp("2%"),
                }}
                fontSize="2xl"
                fontWeight="medium"
              >
                {t("Customer")}
              </DefaultText>

              {customer?._id ? (
                <View>
                  <Pressable
                    style={{
                      ...styles.customerContentView,
                      backgroundColor: theme.colors.primary[100],
                    }}
                    onPress={() => setVisibleCustomerModal(true)}
                    disabled={totalPaidAmount !== 0}
                  >
                    {customer.totalOrders != 0 && (
                      <View style={styles.customerTotalOrdersView}>
                        <View
                          style={{
                            ...styles.customerOrdersBgView,
                            backgroundColor:
                              customer?.totalOrders == 0
                                ? theme.colors.red.default
                                : theme.colors.primary[1000],
                          }}
                        >
                          <DefaultText
                            style={{ textAlign: "center", marginHorizontal: 5 }}
                            fontSize="sm"
                            color="white.1000"
                          >
                            {Number(customer?.totalOrders) == 1
                              ? t("One Timer")
                              : t("Regular")}
                          </DefaultText>
                        </View>
                      </View>
                    )}

                    <View
                      style={{
                        width: customer.totalOrders != 0 ? "96%" : "100%",
                        marginLeft: customer.totalOrders != 0 ? "4%" : "0%",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <View
                        style={{
                          paddingVertical: hp("0.75%"),
                          paddingHorizontal: 16,
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        {customer?.profilePicture ? (
                          <Image
                            key={"customer-pic"}
                            resizeMode="contain"
                            style={{ width: 42, height: 42 }}
                            borderRadius={50}
                            source={{ uri: customer.profilePicture }}
                          />
                        ) : (
                          <View
                            style={{
                              ...styles.customerNameInitialView,
                              backgroundColor: theme.colors.primary[300],
                            }}
                          >
                            <DefaultText
                              fontSize="xl"
                              fontWeight="medium"
                              color="white.1000"
                            >
                              {getNameInitials()}
                            </DefaultText>
                          </View>
                        )}

                        <View
                          style={{
                            width: "65%",
                            marginHorizontal: hp("1.25%"),
                          }}
                        >
                          <DefaultText
                            fontSize="lg"
                            fontWeight="medium"
                            noOfLines={1}
                          >
                            {`${customer.firstName} ${customer.lastName}`}
                          </DefaultText>

                          <DefaultText
                            fontSize="md"
                            fontWeight="normal"
                            color="otherGrey.100"
                          >
                            {customer.phone}
                          </DefaultText>
                        </View>
                      </View>

                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <ItemDivider
                          style={{
                            margin: 0,
                            borderWidth: 0,
                            paddingVertical: 24,
                            borderRightWidth: 1.5,
                            borderColor: theme.colors.placeholder,
                          }}
                        />

                        <View style={{ marginLeft: 20 }}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "baseline",
                            }}
                          >
                            <DefaultText fontSize="lg">{`${currency} `}</DefaultText>

                            <DefaultText fontWeight="medium">
                              {customerWallet?.toFixed(2)}
                            </DefaultText>
                          </View>

                          <View
                            style={{
                              marginTop: 3,
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <ICONS.WalletMoneyIcon />
                            <DefaultText
                              style={{ marginLeft: 5 }}
                              fontSize="md"
                              color="otherGrey.100"
                            >
                              {t("Wallet")}
                            </DefaultText>
                          </View>
                        </View>

                        <View
                          style={{
                            marginLeft: wp("2.5%"),
                            marginRight: wp("1.75%"),
                            alignItems: isRTL ? "flex-end" : "flex-start",
                            transform: [
                              {
                                rotate: isRTL ? "180deg" : "0deg",
                              },
                            ],
                          }}
                        >
                          <ICONS.RightArrowBoldIcon />
                        </View>
                      </View>
                    </View>
                  </Pressable>

                  <Spacer space={hp("5%")} />

                  <ScrollView
                    contentContainerStyle={{ width: "100%" }}
                    horizontal={true}
                    scrollEnabled={false}
                    alwaysBounceHorizontal={false}
                    showsHorizontalScrollIndicator={false}
                  >
                    {walletData.map((data: any) => {
                      return (
                        <TouchableOpacity
                          key={data._id}
                          style={{
                            flex: 1,
                            marginRight: hp("2%"),
                            borderRadius: 12,
                            alignItems: "center",
                            justifyContent: "center",
                            paddingVertical: 12,
                            paddingHorizontal: 12,
                            borderWidth: 2,
                            borderColor:
                              selected._id === data._id
                                ? theme.colors.primary[1000]
                                : theme.colors.placeholder,
                          }}
                          onPress={() => {
                            setSelected(data);

                            if (data._id === 0) {
                              setWalletAmount(getTotalAmount());
                            } else {
                              setWalletAmount("");
                            }
                          }}
                        >
                          <DefaultText
                            style={{ textAlign: "center" }}
                            fontWeight="normal"
                            color={
                              selected._id === data._id
                                ? "primary.1000"
                                : "text.primary"
                            }
                          >
                            {data.text}
                          </DefaultText>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {selected?.text && (
                    <>
                      <Spacer space={hp("5%")} />

                      <Label>{t("TRANSACTION DETAILS")}</Label>
                      <View
                        style={{
                          borderRadius: 16,
                          paddingHorizontal: 16,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          backgroundColor: theme.colors.white[1000],
                        }}
                      >
                        <DefaultText fontWeight={"normal"}>
                          {`${t("Amount")} (${t("in")} ${currency})`}
                        </DefaultText>

                        <AmountInput
                          containerStyle={{
                            flex: 1,
                            borderWidth: 0,
                            borderRadius: 0,
                          }}
                          maxLength={18}
                          style={{ width: "100%", textAlign: "right" }}
                          placeholderText={"0.00"}
                          values={walletAmount}
                          handleChange={(val: any) => {
                            if (customerWallet >= Number(val)) {
                              setWalletAmount(val);
                            }
                          }}
                          disabled={selected.text !== t("Custom")}
                        />
                      </View>
                    </>
                  )}

                  <PrimaryButton
                    style={{
                      marginTop: hp("6.5%"),
                      paddingVertical: hp("1.5%"),
                    }}
                    textStyle={{
                      fontSize: 20,
                      fontWeight: theme.fontWeights.medium,
                      fontFamily: theme.fonts.circulatStd,
                    }}
                    title={`${t("Redeem")} ${currency} ${Number(
                      walletAmount
                    ).toFixed(2)} \n ${t("from Wallet")}`}
                    disabled={Number(walletAmount) <= 0 || loading}
                    onPress={() => {
                      if (!selected?.text) {
                        showToast("error", t("Please Select Type"));
                        return;
                      } else if (
                        Number(
                          businessDetails?.company?.minimumWalletBalance || 10
                        ) > Number(customerWallet)
                      ) {
                        const message = `${t(
                          "To redeem, minimum wallet amount should be"
                        )} ${currency} ${Number(
                          businessDetails?.company?.minimumWalletBalance || 10
                        )?.toFixed(2)}`;

                        showToast("error", message);
                        return;
                      } else if (
                        Number(walletAmount) >
                          Number(
                            Number(totalAmount - totalPaidAmount)?.toFixed(2)
                          ) ||
                        Number(walletAmount) > customerWallet
                      ) {
                        const message = `${t(
                          "Redeem amount upto"
                        )} ${currency} ${getTotalAmount()}`;

                        showToast("error", message);
                        return;
                      }

                      sendOTPForWallet();
                    }}
                  />
                </View>
              ) : (
                <Pressable
                  style={{
                    borderRadius: 16,
                    paddingVertical: 10,
                    paddingLeft: hp("1.5"),
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: theme.colors.primary[100],
                  }}
                  onPress={() => setVisibleCustomerModal(true)}
                >
                  <ICONS.ProfilePlaceholderIcon
                    height={hp("5.5%")}
                    width={hp("5.5%")}
                  />

                  <DefaultText
                    style={{ marginLeft: 10 }}
                    color={theme.colors.placeholder}
                  >
                    {t("Search or add a customer with name or phone")}
                  </DefaultText>
                </Pressable>
              )}

              <Spacer space={hp("4%")} />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>

      <WalletCustomerModal
        visible={visibleCustomerModal}
        handleSelectedCustomer={(customer: any) => {
          setCustomer(customer);
          setVisibleCustomerModal(false);
        }}
        handleClose={() => {
          setVisibleCustomerModal(false);
        }}
      />

      <WalletRedeemOTPModal
        visible={visibleOTPModal}
        data={{
          ...customer,
          walletAmount: Number(walletAmount)?.toFixed(2),
        }}
        handleClose={() => setVisibleOTPModal(false)}
        handleRedeem={() => {
          setLoading(true);
          onChange({
            providerName: PROVIDER_NAME.WALLET,
            cardType: "Wallet",
            transactionNumber: "Wallet",
            amount: Number(walletAmount),
          });
          setVisibleOTPModal(false);
          handleClose();
          setLoading(false);
          showToast("success", t("Wallet Redeemed Successfully"));
        }}
      />

      <Toast />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    height: "100%",
  },
  customerContentView: {
    paddingVertical: 5,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
  },
  customerTotalOrdersView: {
    flex: 1,
    left: 0,
    top: 0,
    width: "100%",
    height: "118%",
    borderRadius: 14,
    overflow: "hidden",
    position: "absolute",
  },
  customerOrdersBgView: {
    top: "30%",
    left: "-48%",
    width: "100%",
    paddingVertical: 5,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    position: "absolute",
    transform: [{ rotate: "-90deg" }],
  },
  customerNameInitialView: {
    width: 38,
    height: 38,
    padding: 5,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});
