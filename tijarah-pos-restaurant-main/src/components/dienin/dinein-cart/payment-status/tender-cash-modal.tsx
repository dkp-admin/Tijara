import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import useCartStore from "../../../../store/cart-item-dinein";
import calculateCartDinein from "../../../../utils/calculate-cart-dinein";
import { PROVIDER_NAME } from "../../../../utils/constants";
import getNearbyAmountOptions from "../../../../utils/tender-cash-option";
import ActionSheetHeader from "../../../action-sheet/action-sheet-header";
import AmountInput from "../../../input/amount-input";
import DefaultText from "../../../text/Text";
import showToast from "../../../toast";
import { useCurrency } from "../../../../store/get-currency";

export default function DineinTenderCashModal({
  visible = false,
  handleClose,
  onChange,
  totalAmount,
  totalDiscount,
}: {
  visible: boolean;
  handleClose: any;
  onChange: any;
  totalAmount: any;
  totalDiscount: any;
}) {
  const theme = useTheme();
  const { totalPaidAmount } = useCartStore();
  const { wp, hp, twoPaneView } = useResponsive();
  const { currency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [otherPrice, setOtherPrice] = useState("");
  const [selectedCash, setSelectedCash] = useState("");

  useEffect(() => {
    if (visible) {
      calculateCartDinein();
    }
  }, [visible]);

  const isSelected = (item: any) => {
    return item == selectedCash;
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
            title={t("Tender Cash")}
            handleLeftBtn={() => handleClose()}
            isCurrency={true}
            rightBtnText={
              totalPaidAmount
                ? `${currency} ${(totalAmount - totalPaidAmount)?.toFixed(2)}`
                : `${currency} ${totalAmount?.toFixed(2)}`
            }
          />

          <View
            style={{
              paddingVertical: hp("3%"),
              paddingHorizontal: hp("2.5%"),
            }}
          >
            {/* <DefaultText
              fontSize="lg"
              fontWeight="normal"
              color={"otherGrey.100"}
            >
              {"Order ID#"}
            </DefaultText> */}

            <DefaultText
              style={{ marginBottom: hp("5%") }}
              fontSize="2xl"
              fontWeight="medium"
            >
              {t("Select the tender amount below")}
            </DefaultText>

            <FlatList
              keyExtractor={(_, index) => index.toString()}
              onEndReached={() => {}}
              onEndReachedThreshold={0.01}
              numColumns={twoPaneView ? 3 : 2}
              bounces={false}
              alwaysBounceVertical={false}
              showsVerticalScrollIndicator={false}
              data={
                [
                  ...getNearbyAmountOptions(
                    totalPaidAmount
                      ? (totalAmount - totalPaidAmount).toFixed(2)
                      : totalAmount.toFixed(2)
                  ),
                  "Other",
                ] || []
              }
              renderItem={({ item }: any) => {
                return selectedCash == "Other" && item == "Other" ? (
                  <View
                    style={{
                      borderRadius: 12,
                      width: twoPaneView ? "64%" : "97%",
                      height: hp("8.4%"),
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 2,
                      borderColor: theme.colors.primary[1000],
                    }}
                  >
                    <AmountInput
                      autoFocus={true}
                      containerStyle={{
                        flex: 1,
                        borderWidth: 0,
                        backgroundColor: "transparent",
                      }}
                      maxLength={18}
                      style={{ width: "95%" }}
                      placeholderText={`${currency} 0.00`}
                      values={otherPrice}
                      handleChange={(val: any) => setOtherPrice(val)}
                    />

                    <TouchableOpacity
                      style={{
                        flex: 1.15,
                        height: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                        borderTopRightRadius: 10,
                        borderBottomRightRadius: 10,
                        backgroundColor: theme.colors.primary[1000],
                      }}
                      onPress={() => {
                        if (Number(otherPrice) > 0) {
                          setLoading(true);
                          onChange({
                            providerName: PROVIDER_NAME.CASH,
                            cardType: "Cash",
                            transactionNumber: "Cash",
                            amount: Number(otherPrice),
                            change:
                              Number(otherPrice) -
                              (Number(totalAmount - (totalPaidAmount || 0)) ||
                                0),
                          });
                          handleClose();
                          setLoading(false);
                        } else {
                          showToast(
                            "error",
                            t("Amount should be greater than 0")
                          );
                        }
                      }}
                      disabled={loading}
                    >
                      <DefaultText
                        style={{ textAlign: "center" }}
                        fontSize="2xl"
                        fontWeight="medium"
                        color={"#F2F2F2"}
                      >
                        {`${t("Tender Cash")} (${t("in")} ${currency})`}
                      </DefaultText>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={{
                      width: twoPaneView ? "31%" : "46%",
                      marginBottom: hp("3%"),
                      marginRight: hp("2%"),
                      borderRadius: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingVertical: hp("2%"),
                      paddingHorizontal: hp("1.5%"),
                      borderWidth: isSelected(item) ? 2 : 1,
                      borderColor: isSelected(item)
                        ? theme.colors.primary[1000]
                        : theme.colors.placeholder,
                    }}
                    onPress={() => {
                      setOtherPrice("");
                      setSelectedCash(item);
                      if (item !== "Other") {
                        setLoading(true);
                        onChange({
                          providerName: PROVIDER_NAME.CASH,
                          cardType: "Cash",
                          transactionNumber: "Cash",
                          amount: Number(item),
                          change:
                            Number(item) -
                            (Number(totalAmount - (totalPaidAmount || 0)) || 0),
                        });
                        handleClose();
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                  >
                    <DefaultText
                      style={{
                        maxWidth: twoPaneView ? wp("10.5%") : hp("20%"),
                        textAlign: "center",
                      }}
                      fontSize="2xl"
                      fontWeight="normal"
                      color={isSelected(item) ? "primary.1000" : "text.primary"}
                    >
                      {item == "Other"
                        ? t("Other")
                        : `${currency} ${item}` || ""}
                    </DefaultText>
                  </TouchableOpacity>
                );
              }}
            />
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
    height: "100%",
  },
});
