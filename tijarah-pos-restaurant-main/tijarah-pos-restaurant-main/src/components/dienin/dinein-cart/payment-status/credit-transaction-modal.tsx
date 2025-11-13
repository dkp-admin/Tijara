import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import useCartStore from "../../../../store/cart-item-dinein";
import calculateCartDinein from "../../../../utils/calculate-cart-dinein";
import { PROVIDER_NAME } from "../../../../utils/constants";
import { ERRORS } from "../../../../utils/errors";
import ICONS from "../../../../utils/icons";
import ActionSheetHeader from "../../../action-sheet/action-sheet-header";
import ItemDivider from "../../../action-sheet/row-divider";
import CreditOTPModal from "../../../billing/right-view/modal/credit-otp-modal";
import WalletCustomerModal from "../../../billing/right-view/modal/wallet-customer-modal";
import { PrimaryButton } from "../../../buttons/primary-button";
import AmountInput from "../../../input/amount-input";
import Spacer from "../../../spacer";
import DefaultText from "../../../text/Text";
import Label from "../../../text/label";
import showToast from "../../../toast";
import { useCurrency } from "../../../../store/get-currency";

export default function DineinCreditTransactionModal({
  visible = false,
  handleClose,
  onChange,
  totalAmount = 0,
  totalPaidAmount = 0,
}: {
  visible: boolean;
  handleClose: any;
  onChange: any;
  totalAmount: any;
  totalPaidAmount: any;
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
  const [creditAmount, setCreditAmount] = useState<string>("");
  const [visibleOTPModal, setVisibleOTPModal] = useState(false);
  const [visibleCustomerModal, setVisibleCustomerModal] = useState(false);
  const [customerData, setCustomerData] = useState<any>({});

  const getTotalAmount = () => {
    let total = 0;

    if (
      Number(totalAmount - totalPaidAmount) >
      Number(customerData?.availableCredit)
    ) {
      total = Number(customerData?.availableCredit);
    } else {
      total = Number(totalAmount - totalPaidAmount);
    }

    return total?.toFixed(2);
  };

  const creditData = useMemo(() => {
    const data = [
      {
        _id: 0,
        text: t("Total bill/Maximum in credit"),
      },
    ];

    data.push({ _id: 1, text: t("Custom") });

    return data;
  }, [totalAmount, totalPaidAmount, customer]);

  const getNameInitials = () => {
    const firstNameInitial = customer.firstName?.charAt(0)?.toUpperCase() + "";

    return `${firstNameInitial || ""}`;
  };

  const sendOTPForCredit = async () => {
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
      calculateCartDinein();
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
          const res = await serviceCaller(`/customer/${customer._id}`, {
            method: "GET",
          });

          if (res) {
            const creditBalance = order?.payment?.breakup
              ?.filter((p: any) => p.providerName === PROVIDER_NAME.CREDIT)
              ?.reduce((pv: any, cv: any) => pv + cv.total, 0);

            setCustomerData({
              allowCredit: res?.credit?.allowCredit,
              maximumCredit: res?.credit?.maximumCredit,
              usedCredit:
                Number(res?.credit?.usedCredit || 0) +
                Number(creditBalance || 0),
              availableCredit:
                res?.credit?.maximumCredit > 0
                  ? Number(res?.credit?.availableCredit || 0) -
                    Number(creditBalance || 0)
                  : Number(totalAmount - totalPaidAmount),
              blockedCredit: res?.credit?.blockedCredit,
              blacklistCredit: res?.credit?.blacklistCredit,
            });
          }
        } catch (error: any) {
          setCustomerData({
            allowCredit: false,
            maximumCredit: customer?.maximumCredit,
            usedCredit: 0,
            availableCredit: 0,
            blockedCredit: false,
            blacklistCredit: false,
          });
        } finally {
          setLoading(false);
        }
      }
    })();
  }, [customer]);

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
            title={t("Credit Transaction")}
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
                    <View style={styles.customerTotalOrdersView}>
                      <View
                        style={{
                          ...styles.customerOrdersBgView,
                          backgroundColor: customerData?.blacklistCredit
                            ? theme.colors.red.default
                            : customerData?.blockedCredit
                            ? "#FFB200"
                            : customerData?.allowCredit
                            ? theme.colors.primary[1000]
                            : "transparent",
                        }}
                      >
                        <DefaultText
                          style={{ textAlign: "center", marginHorizontal: 5 }}
                          fontSize="sm"
                          color="white.1000"
                        >
                          {customerData?.blacklistCredit
                            ? t("Blacklist")
                            : customerData?.blockedCredit
                            ? t("Blocked")
                            : customerData?.allowCredit
                            ? t("Activated")
                            : ""}
                        </DefaultText>
                      </View>
                    </View>

                    <View
                      style={{
                        width:
                          customerData?.allowCredit ||
                          customerData?.blockedCredit ||
                          customerData?.blacklistCredit
                            ? "96%"
                            : "100%",
                        marginLeft:
                          customerData?.allowCredit ||
                          customerData?.blockedCredit ||
                          customerData?.blacklistCredit
                            ? "4%"
                            : "0%",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <View
                        style={{
                          maxWidth: "50%",
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
                        style={{
                          maxWidth: "50%",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        {twoPaneView && (
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
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

                            <View style={{ marginHorizontal: 20 }}>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "baseline",
                                }}
                              >
                                {customerData ? (
                                  customerData?.maximumCredit > 0 ? (
                                    <View
                                      style={{
                                        flexDirection: "row",
                                        alignItems: "baseline",
                                      }}
                                    >
                                      <DefaultText fontSize="lg">
                                        {`${currency} `}
                                      </DefaultText>

                                      <DefaultText fontWeight="medium">
                                        {Number(
                                          customerData?.availableCredit || 0
                                        )?.toFixed(2)}
                                      </DefaultText>
                                    </View>
                                  ) : (
                                    <DefaultText fontSize="lg">
                                      {t("Unlimited")}
                                    </DefaultText>
                                  )
                                ) : (
                                  <ActivityIndicator size={"small"} />
                                )}
                              </View>

                              <View
                                style={{
                                  marginTop: 3,
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <DefaultText
                                  fontSize="md"
                                  color="otherGrey.100"
                                >
                                  {t("Available Credit")}
                                </DefaultText>
                              </View>
                            </View>
                          </View>
                        )}

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
                          {customerData ? (
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "baseline",
                              }}
                            >
                              <DefaultText fontSize="lg">
                                {`${currency} `}
                              </DefaultText>

                              <DefaultText fontWeight="medium">
                                {Number(customerData?.usedCredit)?.toFixed(2)}
                              </DefaultText>
                            </View>
                          ) : (
                            <ActivityIndicator size={"small"} />
                          )}

                          <View
                            style={{
                              marginTop: 3,
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <ICONS.CreditMoneyIcon />
                            <DefaultText
                              style={{ marginLeft: 5 }}
                              fontSize="md"
                              color="otherGrey.100"
                            >
                              {t("Credit Due")}
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
                    {creditData.map((data: any) => {
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
                              setCreditAmount(getTotalAmount());
                            } else {
                              setCreditAmount("");
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
                          values={creditAmount}
                          handleChange={(val: any) => {
                            if (
                              Number(customerData?.availableCredit) >=
                              Number(val)
                            ) {
                              setCreditAmount(val);
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
                    title={`${currency} ${Number(creditAmount).toFixed(
                      2
                    )} \n ${t("from Credit")}`}
                    disabled={Number(creditAmount) <= 0 || loading}
                    onPress={() => {
                      if (!customerData?.allowCredit) {
                        showToast(
                          "error",
                          t("Please enabled credit for selected customer")
                        );
                        return;
                      } else if (customerData?.blockedCredit) {
                        showToast(
                          "error",
                          t("Please unblock credit for selected customer")
                        );
                        return;
                      } else if (customerData?.blacklistCredit) {
                        showToast(
                          "error",
                          t("Please disabled blacklist customer to use credit")
                        );
                        return;
                      } else if (!selected?.text) {
                        showToast("error", t("Please Select Type"));
                        return;
                      } else if (Number(creditAmount || 0) === 0) {
                        const message = t(
                          "Credit amount should be greater than 0"
                        );

                        showToast("error", message);
                        return;
                      } else if (
                        Number(creditAmount) >
                          Number(
                            Number(totalAmount - totalPaidAmount)?.toFixed(2)
                          ) ||
                        Number(creditAmount) >
                          Number(customerData?.availableCredit)
                      ) {
                        const message = `${t(
                          "Used amount upto"
                        )} ${currency} ${getTotalAmount()}`;

                        showToast("error", message);
                        return;
                      }

                      sendOTPForCredit();
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

      <CreditOTPModal
        visible={visibleOTPModal}
        data={{
          ...customer,
          creditAmount: Number(creditAmount)?.toFixed(2),
        }}
        handleClose={() => setVisibleOTPModal(false)}
        handleCreditUsed={() => {
          setLoading(true);
          onChange({
            providerName: PROVIDER_NAME.CREDIT,
            cardType: "Credit",
            transactionNumber: "Credit",
            amount: Number(creditAmount),
          });
          setVisibleOTPModal(false);
          handleClose();
          setLoading(false);
          showToast("success", t("Credit Used Successfully"));
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
