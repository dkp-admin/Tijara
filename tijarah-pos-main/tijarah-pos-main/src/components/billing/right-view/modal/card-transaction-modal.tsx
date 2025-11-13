import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import calculateCart from "../../../../utils/calculate-cart";
import { PROVIDER_NAME } from "../../../../utils/constants";
import ICONS from "../../../../utils/icons";
import { debugLog } from "../../../../utils/log-patch";
import ActionSheetHeader from "../../../action-sheet/action-sheet-header";
import { PrimaryButton } from "../../../buttons/primary-button";
import AmountInput from "../../../input/amount-input";
import Input from "../../../input/input";
import SelectInput from "../../../input/select-input";
import Spacer from "../../../spacer";
import DefaultText from "../../../text/Text";
import Label from "../../../text/label";
import showToast from "../../../toast";

const cardTypeOptions = [
  { value: "American Express", key: "amrican-express" },
  { value: "Sadad", key: "sadad" },
  { value: "Ensan", key: "ensan" },
  { value: "Tasawaq", key: "tasawaq" },
  { value: "Classic", key: "classic" },
  { value: "Platinum", key: "platinum" },
];

export default function CardTransactionModal({
  data,
  visible = false,
  handleClose,
  onChange,
  totalAmount,
  totalPaidAmount,
  billingSettings,
  handleNFCPayment,
  isOnlineOrder = false,
  breakup = [],
}: {
  data: any;
  visible: boolean;
  handleClose?: any;
  onChange?: any;
  totalAmount?: any;
  totalPaidAmount?: any;
  billingSettings: any;
  handleNFCPayment: any;
  isOnlineOrder?: boolean;
  breakup?: any[];
}) {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();

  const [selectedCard, setSelectedCard] = useState("");
  const [transactionNumber, setTransactionNumber] = useState("");
  const [amount, setAmount] = useState<string>("0");
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState({
    value: "",
    key: "",
  });

  const isSelected = (item: any) => {
    return item == selectedCard;
  };

  useEffect(() => {
    if (visible) {
      calculateCart(isOnlineOrder, breakup);
    }
  }, [visible]);

  const getCardIcon = (card: any) => {
    if (card == "Mada") {
      return (
        <ICONS.MadaIcon
          color={
            isSelected(card)
              ? theme.colors.primary[1000]
              : theme.colors.text.primary
          }
        />
      );
    } else if (card == "Visa") {
      return (
        <ICONS.VisaIcon
          color={
            isSelected(card)
              ? theme.colors.primary[1000]
              : theme.colors.text.primary
          }
        />
      );
    } else if (card == "Master Card") {
      return (
        <ICONS.MasterCardIcon
          color={
            isSelected(card)
              ? theme.colors.primary[1000]
              : theme.colors.text.primary
          }
        />
      );
    }
  };

  const getTotalAmount = () => {
    if (totalPaidAmount) {
      return `${t("SAR")} ${(totalAmount - totalPaidAmount).toFixed(2)}`;
    } else {
      return `${t("SAR")} ${totalAmount.toFixed(2)}`;
    }
  };

  useEffect(() => {
    if (visible) {
      setSelectedCard("");
      setTransactionNumber("");
      setSelectedType({
        value: "",
        key: "",
      });
      setAmount(
        totalPaidAmount
          ? `${(totalAmount - totalPaidAmount).toFixed(2) || "0"}`
          : `${totalAmount.toFixed(2) || "0"}`
      );
    }
  }, [visible, billingSettings]);

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
            title={t("Card Transaction")}
            handleLeftBtn={() => handleClose()}
            isCurrency
            rightBtnText={getTotalAmount()}
            descriptionRight={""}
          />

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
              <DefaultText
                style={{
                  marginBottom: hp("4%"),
                }}
                fontSize="2xl"
                fontWeight="medium"
              >
                {t("Capture card transaction")}
              </DefaultText>

              {billingSettings?.cardPaymentOption === "manual" ? (
                <View>
                  <ScrollView
                    contentContainerStyle={{ width: "100%" }}
                    horizontal={true}
                    scrollEnabled={false}
                    alwaysBounceHorizontal={false}
                    showsHorizontalScrollIndicator={false}
                  >
                    {["Mada", "Visa", "Master Card"].map((card: any) => {
                      return (
                        <TouchableOpacity
                          key={card}
                          style={{
                            width: "30%",
                            marginRight: hp("2%"),
                            borderRadius: 12,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            paddingVertical: 3,
                            borderWidth: 2,
                            borderColor: isSelected(card)
                              ? theme.colors.primary[1000]
                              : theme.colors.placeholder,
                          }}
                          onPress={() => {
                            setSelectedCard(card);
                            setSelectedType({ value: "", key: "" });
                          }}
                        >
                          {getCardIcon(card)}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  <SelectInput
                    allowSearch={false}
                    placeholderText={t("Select Other Card Type")}
                    options={cardTypeOptions}
                    values={selectedType}
                    clearValues={selectedType.key == ""}
                    handleChange={(val: any) => {
                      if (val.key && val.value) {
                        setSelectedCard("");
                        setSelectedType(val);
                      }
                    }}
                    containerStyle={{
                      marginTop: hp("2.5%"),
                      backgroundColor: "transparent",
                      borderWidth: selectedType?.value != "" ? 2 : 1,
                      borderColor:
                        selectedType?.value != ""
                          ? theme.colors.primary[1000]
                          : theme.colors.placeholder,
                    }}
                  />

                  <Spacer space={hp("4%")} />

                  <Label>{t("Transaction Details")}</Label>

                  <View
                    style={{
                      paddingHorizontal: 16,
                      borderTopLeftRadius: 16,
                      borderTopRightRadius: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: theme.colors.white[1000],
                    }}
                  >
                    <DefaultText fontWeight={"normal"}>{`${t("Amount")} (${t(
                      "in"
                    )} ${t("SAR")})`}</DefaultText>

                    <AmountInput
                      containerStyle={{
                        flex: 1,
                        borderWidth: 0,
                        borderRadius: 0,
                      }}
                      maxLength={18}
                      style={{ width: "100%", textAlign: "right" }}
                      placeholderText={"0.00"}
                      values={amount}
                      handleChange={(val: any) => {
                        setAmount(val);
                      }}
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
                      paddingHorizontal: 16,
                      borderBottomLeftRadius: 16,
                      borderBottomRightRadius: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: theme.colors.white[1000],
                    }}
                  >
                    <DefaultText fontWeight={"normal"}>{`${t(
                      "Transaction"
                    )} ${t("Ref")}. ${t("No")}.`}</DefaultText>

                    <Input
                      containerStyle={{
                        flex: 1,
                        borderWidth: 0,
                        borderRadius: 0,
                      }}
                      style={{ width: "100%", textAlign: "right" }}
                      placeholderText={t("Enter transaction number")}
                      values={transactionNumber}
                      keyboardType={"number-pad"}
                      handleChange={(val: any) =>
                        setTransactionNumber(val?.replace(/[^0-9]/, ""))
                      }
                    />
                  </View>

                  <PrimaryButton
                    style={{ marginTop: hp("6.5%") }}
                    textStyle={{
                      fontSize: 20,
                      fontWeight: theme.fontWeights.medium,
                      fontFamily: theme.fonts.circulatStd,
                    }}
                    title={t("Capture details")}
                    disabled={!Number(amount) || Number(amount) <= 0 || loading}
                    onPress={() => {
                      if (
                        Number(Number(amount)?.toFixed(2)) <=
                          Number(totalAmount?.toFixed(2)) &&
                        (selectedCard || selectedType?.value)
                      ) {
                        debugLog(
                          "Manual payment selected",
                          { selectedCard: "Manual" },
                          "card-transaction-modal",
                          "handleCardTxnModal"
                        );
                        setLoading(true);
                        onChange({
                          providerName: PROVIDER_NAME.CARD,
                          cardType:
                            selectedCard || selectedType?.value || "Visa",
                          transactionNumber: transactionNumber,
                          amount: Number(amount),
                        });
                        handleClose();
                        setLoading(false);
                      } else {
                        if (selectedCard == "" && selectedType?.value == "") {
                          showToast("error", t("Please Select Card Type"));
                        } else {
                          showToast(
                            "error",
                            `${t(
                              "Amount should be less than or equal to"
                            )} ${getTotalAmount()}`
                          );
                        }
                      }
                    }}
                  />
                </View>
              ) : (
                <View>
                  <Label>{t("Transaction Details")}</Label>

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
                    <DefaultText fontWeight={"normal"}>{`${t("Amount")} (${t(
                      "in"
                    )} ${t("SAR")})`}</DefaultText>

                    <AmountInput
                      containerStyle={{
                        flex: 1,
                        borderWidth: 0,
                        borderRadius: 0,
                      }}
                      maxLength={18}
                      style={{ width: "100%", textAlign: "right" }}
                      placeholderText={"0.00"}
                      values={amount}
                      handleChange={(val: any) => {
                        setAmount(val);
                      }}
                    />
                  </View>

                  <PrimaryButton
                    style={{ marginTop: hp("6.5%") }}
                    textStyle={{
                      fontSize: 20,
                      fontWeight: theme.fontWeights.medium,
                      fontFamily: theme.fonts.circulatStd,
                    }}
                    title={t("Initiate transaction")}
                    disabled={!Number(amount) || Number(amount) <= 0 || loading}
                    onPress={() => {
                      if (Number(amount) <= totalAmount) {
                        debugLog(
                          "NeoLeap payment selected",
                          { selectedCard: "NeoLeap" },
                          "card-transaction-modal",
                          "handleCardTxnModal"
                        );
                        handleNFCPayment(amount);
                        handleClose();
                      } else {
                        showToast(
                          "error",
                          `${t(
                            "Amount should be less than or equal to"
                          )} ${getTotalAmount()}`
                        );
                      }
                    }}
                  />
                </View>
              )}

              {/* <View
                style={{
                  marginTop: hp("3.75%"),
                  flexDirection: "row",
                }}
              >
                <View style={{ flex: 1 }}>
                  <PrimaryButton
                    reverse
                    textStyle={{
                      fontSize: 20,
                      marginLeft: 12,
                      fontWeight: theme.fontWeights.medium,
                      fontFamily: theme.fonts.circulatStd,
                    }}
                    leftIcon={<ICONS.SendReceiptIcon />}
                    title={t("Send Receipt")}
                    onPress={() => {}}
                  />
                </View>

                <Spacer space={wp("3%")} />

                <View style={{ flex: 1 }}>
                  <PrimaryButton
                    reverse
                    textStyle={{
                      fontSize: 20,
                      marginLeft: 12,
                      fontWeight: theme.fontWeights.medium,
                      fontFamily: theme.fonts.circulatStd,
                    }}
                    leftIcon={<ICONS.ReprintReceiptIcon />}
                    title={t("Reprint Receipt")}
                    onPress={() => {}}
                  />
                </View>
              </View> */}

              <Spacer space={hp("4%")} />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>

      <Toast />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    height: "100%",
  },
});
