import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { checkInternet } from "../../../../hooks/check-internet";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import useCartStore from "../../../../store/cart-item-dinein";
import calculateCartDinein from "../../../../utils/calculate-cart-dinein";
import ICONS from "../../../../utils/icons";
import ActionSheetHeader from "../../../action-sheet/action-sheet-header";
import Spacer from "../../../spacer";
import DefaultText from "../../../text/Text";
import showToast from "../../../toast";
import { useCurrency } from "../../../../store/get-currency";

const cardName: any = {
  Mada: "Mada",
  Visa: "Visa",
  "Master Card": "Master Card",
  "american-express": "American Express",
  sadad: "Sadad",
  ensan: "Ensan",
  tasawaq: "Tasawaq",
  classic: "Classic",
  platinum: "Platinum",
};

export default function DineinPaymentStatusModal({
  visible = false,
  total,
  onChange,
  totalPaidAmount = 0,
  billingSettings,
  businessDetails,
  close = false,
  handleClose,
}: {
  visible: boolean;
  total: any;
  onChange: any;
  totalPaidAmount: any;
  billingSettings: any;
  businessDetails: any;
  close: boolean;
  handleClose: any;
}) {
  const theme = useTheme();
  const isConnected = checkInternet();
  const { hp, twoPaneView } = useResponsive();
  const { currency } = useCurrency();
  const [selectedPayment, setSelectedPayment] = useState("");
  const [loading, setLoading] = useState(false);
  const { order } = useCartStore() as any;

  useEffect(() => {
    if (visible) {
      calculateCartDinein();
      setSelectedPayment("");
    }
  }, [visible]);

  const isSelected = (item: any) => {
    return item?.name == selectedPayment;
  };

  const getPaymentIcon = (payment: any) => {
    if (payment.name == "Cash") {
      return (
        <ICONS.CashIcon
          color={
            isSelected(payment)
              ? theme.colors.primary[1000]
              : theme.colors.text.primary
          }
        />
      );
    } else if (payment.name == "Card") {
      return (
        <ICONS.CardIcon
          color={
            isSelected(payment)
              ? theme.colors.primary[1000]
              : theme.colors.text.primary
          }
        />
      );
    } else if (payment.name == "Wallet") {
      return (
        <ICONS.WalletIcon
          color={
            isSelected(payment)
              ? theme.colors.primary[1000]
              : theme.colors.text.primary
          }
        />
      );
    } else {
      return (
        <ICONS.CreditIcon
          color={
            isSelected(payment)
              ? theme.colors.primary[1000]
              : theme.colors.text.primary
          }
        />
      );
    }
  };

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
            title={t("Payment Status")}
            isLeftBtn={close}
            handleLeftBtn={handleClose}
            isCurrency={true}
            rightBtnText={`${currency} ${total.toFixed(2)}`}
          />

          <ScrollView
            style={{
              paddingVertical: hp("3%"),
              paddingHorizontal: hp("2.5%"),
            }}
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
          >
            {/* <DefaultText
              fontSize="lg"
              fontWeight="normal"
              color={"otherGrey.100"}
            >
              {"Order ID#"}
            </DefaultText> */}

            <DefaultText
              style={{ marginTop: hp("2%") }}
              fontSize="2xl"
              fontWeight="medium"
            >
              {t("Payment Type")}
            </DefaultText>

            <View
              style={{
                marginTop: hp("3%"),
                borderRadius: 16,
                backgroundColor: theme.colors.white[1000],
              }}
            >
              {order?.payment?.breakup?.map((pbreakup: any, index: number) => {
                return (
                  <View key={index} style={styles.content_view}>
                    <View>
                      <DefaultText fontSize="xl" fontWeight="normal">
                        {Object.keys(cardName || {}).includes(pbreakup.name)
                          ? cardName[pbreakup.name]
                          : pbreakup.name}
                      </DefaultText>

                      <DefaultText
                        fontSize="md"
                        fontWeight="normal"
                        color="otherGrey.100"
                      >
                        {format(
                          new Date(pbreakup.createdAt),
                          "dd/MM/yyyy, h:mma"
                        )}
                      </DefaultText>
                    </View>

                    <DefaultText
                      fontSize="2xl"
                      fontWeight="normal"
                      color={theme.colors.otherGrey[100]}
                    >
                      {`${currency} ${Number(pbreakup.total)?.toFixed(2)}`}
                    </DefaultText>
                  </View>
                );
              })}

              {!close && (
                <View
                  style={{
                    marginLeft: 16,
                    borderBottomWidth: 0.5,
                    borderColor: theme.colors.dividerColor.main,
                  }}
                />
              )}

              <View style={styles.content_view}>
                <DefaultText fontSize="xl" fontWeight="normal">
                  {t("Balance")}
                </DefaultText>

                <DefaultText
                  fontSize="2xl"
                  fontWeight="normal"
                  color={theme.colors.otherGrey[100]}
                >
                  {`${currency} ${(total - totalPaidAmount).toFixed(2)}`}
                </DefaultText>
              </View>
            </View>

            <DefaultText
              style={{ marginTop: hp("4%"), marginBottom: hp("2.5%") }}
              fontSize="2xl"
              fontWeight="medium"
            >
              {t("Balance payment")}
            </DefaultText>

            <ScrollView
              horizontal={true}
              scrollEnabled={true}
              alwaysBounceHorizontal={false}
              showsHorizontalScrollIndicator={false}
            >
              {[
                ...billingSettings?.paymentTypes,
                ...(billingSettings && businessDetails?.company?.enableStcPay
                  ? [
                      {
                        _id: 0,
                        name: "STC Pay",
                        status: true,
                      },
                    ]
                  : []),
                ...(businessDetails?.company?.nearpay &&
                billingSettings?.terminalId
                  ? [
                      {
                        _id: 6,
                        name: "Nearpay",
                        status: true,
                      },
                    ]
                  : []),
              ]?.map((payment: any, idx: any) => {
                if (
                  payment.name === "STC Pay" &&
                  (order?.payment?.breakup || [])?.length != 0
                ) {
                  return <></>;
                }

                if (
                  payment.name === "Nearpay" &&
                  (order?.payment?.breakup || [])?.length != 0
                ) {
                  return <></>;
                }
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
                  <TouchableOpacity
                    key={idx}
                    style={{
                      marginRight: hp("2%"),
                      borderRadius: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      paddingLeft: hp("2%"),
                      paddingRight: hp("4%"),
                      paddingVertical: hp("2.25%"),
                      borderWidth: isSelected(payment) ? 2 : 1,
                      borderColor: isSelected(payment)
                        ? theme.colors.primary[1000]
                        : theme.colors.placeholder,
                    }}
                    onPress={() => {
                      if (payment.name === "Wallet" && !isConnected) {
                        showToast("error", t("Please connect with internet"));
                        return;
                      }

                      if (payment.name === "Credit" && !isConnected) {
                        showToast("error", t("Please connect with internet"));
                        return;
                      }

                      setLoading(true);
                      setSelectedPayment(payment?.name);

                      onChange({
                        method: payment?.name?.toLowerCase(),
                      });
                      setLoading(false);
                    }}
                    disabled={loading}
                  >
                    {getPaymentIcon(payment)}

                    <DefaultText
                      style={{ marginLeft: 10 }}
                      fontSize="2xl"
                      fontWeight="normal"
                      color={
                        isSelected(payment) ? "primary.1000" : "text.primary"
                      }
                    >
                      {t(payment.name)}
                    </DefaultText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Spacer space={hp("10%")} />
          </ScrollView>
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
  content_view: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
